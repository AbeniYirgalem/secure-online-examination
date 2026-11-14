import { z } from 'zod';

/**
 * Question Zod schema enforcing exactly 4 options and valid correct answer.
 */
export const questionInputSchema = z
  .object({
    _id: z.string().optional(),
    questionText: z
      .string({ required_error: 'Question text is required' })
      .trim()
      .min(3, 'Question text must be at least 3 characters'),
    options: z
      .array(z.string().trim().min(1, 'Option cannot be empty'))
      .length(4, 'Each question must have exactly four options'),
    correctAnswer: z
      .string({ required_error: 'Correct answer is required' })
      .trim()
      .min(1, 'Correct answer is required'),
    marks: z
      .number({ required_error: 'Marks are required' })
      .positive('Marks must be greater than zero')
      .int('Marks must be an integer')
      .default(1),
  })
  .refine(
    (data) => data.options.includes(data.correctAnswer),
    {
      message: 'Correct answer must exactly match one of the four options',
      path: ['correctAnswer'],
    }
  );

/**
 * Examination creation / update schema.
 */
export const examinationInputSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z.string().trim().optional().default(''),
    duration: z
      .number({ required_error: 'Duration in minutes is required' })
      .positive('Duration must be greater than zero')
      .int('Duration must be an integer'),
    startTime: z.string({ required_error: 'Start time is required' }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid start time format' }
    ),
    endTime: z.string({ required_error: 'End time is required' }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid end time format' }
    ),
    passingMarks: z
      .number({ required_error: 'Passing marks are required' })
      .min(0, 'Passing marks cannot be negative'),
    questions: z.array(questionInputSchema).optional().default([]),
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: 'End time must be later than start time',
      path: ['endTime'],
    }
  );

/**
 * Helper to validate MongoDB ObjectId format.
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

