import { z } from 'zod';

/**
 * Schema for public student registration.
 * Restricts roles: only STUDENT is permitted for public signups.
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Invalid email address format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z
    .string()
    .optional()
    .refine((val) => !val || val === 'STUDENT', {
      message: 'Public registration is restricted to STUDENT accounts only',
    }),
});

/**
 * Schema for user login credentials.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Invalid email address format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

/**
 * Middleware factory to validate request bodies against Zod schemas.
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errorMessages = issues.map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: errorMessages[0] || 'Validation failed',
      errors: errorMessages,
    });
  }
  req.body = result.data;
  next();
};
