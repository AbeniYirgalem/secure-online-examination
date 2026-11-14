import Examination from '../models/Examination.js';
import { isValidObjectId } from '../utils/examValidation.js';

/**
 * Service to handle instructor examination creation.
 * Newly created examinations always begin in DRAFT status.
 */
export const createExamination = async (instructorId, examData) => {
  const exam = new Examination({
    ...examData,
    instructor: instructorId,
    status: 'DRAFT', // Always enforce DRAFT status on creation
  });

  await exam.save();
  return exam;
};

/**
 * List all examinations created by the authenticated instructor.
 */
export const getInstructorExaminations = async (instructorId) => {
  return Examination.find({ instructor: instructorId }).sort({ createdAt: -1 });
};

/**
 * Retrieve a specific examination owned by the instructor.
 */
export const getInstructorExaminationById = async (instructorId, examId) => {
  if (!isValidObjectId(examId)) {
    const error = new Error('Invalid examination ID format');
    error.status = 400;
    throw error;
  }

  const exam = await Examination.findById(examId);
  if (!exam) {
    const error = new Error('Examination not found');
    error.status = 404;
    throw error;
  }

  if (exam.instructor.toString() !== instructorId.toString()) {
    const error = new Error('Forbidden. You do not have ownership of this examination');
    error.status = 403;
    throw error;
  }

  return exam;
};

/**
 * Update an existing examination owned by the instructor.
 */
export const updateExamination = async (instructorId, examId, updateData) => {
  if (!isValidObjectId(examId)) {
    const error = new Error('Invalid examination ID format');
    error.status = 400;
    throw error;
  }

  const exam = await Examination.findById(examId);
  if (!exam) {
    const error = new Error('Examination not found');
    error.status = 404;
    throw error;
  }

  if (exam.instructor.toString() !== instructorId.toString()) {
    const error = new Error('Forbidden. You do not have ownership of this examination');
    error.status = 403;
    throw error;
  }

  if (exam.status === 'CLOSED') {
    const error = new Error('Closed examinations cannot be modified');
    error.status = 400;
    throw error;
  }

  // Update allowed fields
  if (updateData.title !== undefined) exam.title = updateData.title;
  if (updateData.description !== undefined) exam.description = updateData.description;
  if (updateData.duration !== undefined) exam.duration = updateData.duration;
  if (updateData.startTime !== undefined) exam.startTime = updateData.startTime;
  if (updateData.endTime !== undefined) exam.endTime = updateData.endTime;
  if (updateData.passingMarks !== undefined) exam.passingMarks = updateData.passingMarks;
  if (updateData.questions !== undefined) exam.questions = updateData.questions;

  await exam.save();
  return exam;
};

/**
 * Delete an examination owned by the instructor.
 */
export const deleteExamination = async (instructorId, examId) => {
  if (!isValidObjectId(examId)) {
    const error = new Error('Invalid examination ID format');
    error.status = 400;
    throw error;
  }

  const exam = await Examination.findById(examId);
  if (!exam) {
    const error = new Error('Examination not found');
    error.status = 404;
    throw error;
  }

  if (exam.instructor.toString() !== instructorId.toString()) {
    const error = new Error('Forbidden. You do not have ownership of this examination');
    error.status = 403;
    throw error;
  }

  await Examination.findByIdAndDelete(examId);
  return { message: 'Examination deleted successfully' };
};

/**
 * Publish an examination.
 * Verifies that the examination is complete with questions and valid timeline.
 */
export const publishExamination = async (instructorId, examId) => {
  if (!isValidObjectId(examId)) {
    const error = new Error('Invalid examination ID format');
    error.status = 400;
    throw error;
  }

  const exam = await Examination.findById(examId);
  if (!exam) {
    const error = new Error('Examination not found');
    error.status = 404;
    throw error;
  }

  if (exam.instructor.toString() !== instructorId.toString()) {
    const error = new Error('Forbidden. You do not have ownership of this examination');
    error.status = 403;
    throw error;
  }

  // Validation before publishing
  if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
    const error = new Error('An examination must have at least one question before it can be published');
    error.status = 400;
    throw error;
  }

  const now = new Date();
  if (new Date(exam.endTime) <= now) {
    const error = new Error('Cannot publish an examination whose end time has already elapsed');
    error.status = 400;
    throw error;
  }

  exam.status = 'PUBLISHED';
  await exam.save();
  return exam;
};

/**
 * Student-facing query: List available published examinations.
 * CRITICAL SECURITY: Strips correct answers from all questions!
 */
export const getAvailableExaminationsForStudents = async () => {
  const now = new Date();

  return Examination.find({
    status: 'PUBLISHED',
    startTime: { $lte: now },
    endTime: { $gte: now },
  })
    .select('-questions.correctAnswer') // Never expose correct answers to students
    .populate('instructor', 'name email')
    .sort({ startTime: 1 });
};

