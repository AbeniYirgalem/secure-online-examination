import Examination from '../models/Examination.js';
import ExaminationAttempt from '../models/ExaminationAttempt.js';
import { isValidObjectId } from '../utils/examValidation.js';

/**
 * Initiates or resumes an examination attempt for an authenticated student.
 * Server strictly calculates authoritative start time and deadline.
 */
export const startOrResumeAttempt = async (studentId, examId) => {
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

  if (exam.status !== 'PUBLISHED') {
    const error = new Error('This examination is not open for student taking');
    error.status = 400;
    throw error;
  }

  const now = new Date();
  if (now < new Date(exam.startTime)) {
    const error = new Error(`Examination has not opened yet. Starts at: ${exam.startTime.toISOString()}`);
    error.status = 400;
    throw error;
  }

  if (now > new Date(exam.endTime)) {
    const error = new Error('Examination scheduled window has closed');
    error.status = 400;
    throw error;
  }

  // Check for existing attempt
  let attempt = await ExaminationAttempt.findOne({
    student: studentId,
    examination: examId,
  });

  if (attempt) {
    if (attempt.status === 'SUBMITTED') {
      const error = new Error('You have already submitted this examination');
      error.status = 400;
      throw error;
    }

    if (attempt.status === 'EXPIRED') {
      const error = new Error('Your examination attempt duration has expired');
      error.status = 400;
      throw error;
    }

    // Check if deadline passed while in progress
    if (now > new Date(attempt.deadline)) {
      attempt.status = 'EXPIRED';
      await attempt.save();
      const error = new Error('Your examination attempt duration has expired');
      error.status = 400;
      throw error;
    }
  } else {
    // Calculate authoritative attempt deadline
    const durationMs = exam.duration * 60 * 1000;
    const examEndMs = new Date(exam.endTime).getTime();
    const calculatedDeadlineMs = Math.min(now.getTime() + durationMs, examEndMs);

    try {
      attempt = await ExaminationAttempt.create({
        student: studentId,
        examination: examId,
        startedAt: now,
        deadline: new Date(calculatedDeadlineMs),
        status: 'IN_PROGRESS',
        answers: [],
      });
    } catch (dbErr) {
      // Catch race condition (unique index violation)
      if (dbErr.code === 11000) {
        attempt = await ExaminationAttempt.findOne({
          student: studentId,
          examination: examId,
        });
      } else {
        throw dbErr;
      }
    }
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(attempt.deadline).getTime() - now.getTime()) / 1000)
  );

  // Mask correct answers from questions for student security
  const sanitizedQuestions = exam.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    marks: q.marks,
  }));

  return {
    examination: {
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      startTime: exam.startTime,
      endTime: exam.endTime,
      questions: sanitizedQuestions,
    },
    attempt: {
      _id: attempt._id,
      startedAt: attempt.startedAt,
      deadline: attempt.deadline,
      status: attempt.status,
      answers: attempt.answers,
    },
    remainingSeconds,
    serverTime: now.toISOString(),
  };
};

/**
 * Retrieve active student attempt progress and remaining time.
 */
export const getStudentAttempt = async (studentId, examId) => {
  if (!isValidObjectId(examId)) {
    const error = new Error('Invalid examination ID format');
    error.status = 400;
    throw error;
  }

  const attempt = await ExaminationAttempt.findOne({
    student: studentId,
    examination: examId,
  });

  if (!attempt) {
    const error = new Error('No examination attempt found for this student');
    error.status = 404;
    throw error;
  }

  const exam = await Examination.findById(examId);
  if (!exam) {
    const error = new Error('Associated examination not found');
    error.status = 404;
    throw error;
  }

  const now = new Date();
  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(attempt.deadline).getTime() - now.getTime()) / 1000)
  );

  if (remainingSeconds === 0 && attempt.status === 'IN_PROGRESS') {
    attempt.status = 'EXPIRED';
    await attempt.save();
  }

  const sanitizedQuestions = exam.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    marks: q.marks,
  }));

  return {
    examination: {
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      startTime: exam.startTime,
      endTime: exam.endTime,
      questions: sanitizedQuestions,
    },
    attempt: {
      _id: attempt._id,
      startedAt: attempt.startedAt,
      deadline: attempt.deadline,
      status: attempt.status,
      answers: attempt.answers,
      score: attempt.status === 'SUBMITTED' ? attempt.score : undefined,
      passed: attempt.status === 'SUBMITTED' ? attempt.passed : undefined,
      submittedAt: attempt.submittedAt,
    },
    remainingSeconds,
    serverTime: now.toISOString(),
  };
};

/**
 * Saves in-progress student answers persistently during an active assessment.
 */
export const saveAttemptProgress = async (studentId, examId, answers = []) => {
  if (!isValidObjectId(examId)) {
    const error = new Error('Invalid examination ID format');
    error.status = 400;
    throw error;
  }

  const exam = await Examination.findById(examId);
  if (!exam) {
    const error = new Error('Associated examination not found');
    error.status = 404;
    throw error;
  }

  const attempt = await ExaminationAttempt.findOne({
    student: studentId,
    examination: examId,
  });

  if (!attempt) {
    const error = new Error('No attempt found to update');
    error.status = 404;
    throw error;
  }

  if (attempt.status !== 'IN_PROGRESS') {
    const error = new Error(`Cannot update answers: attempt is ${attempt.status}`);
    error.status = 400;
    throw error;
  }

  const now = new Date();
  if (now > new Date(attempt.deadline)) {
    attempt.status = 'EXPIRED';
    await attempt.save();
    const error = new Error('Attempt deadline has expired');
    error.status = 400;
    throw error;
  }

  // Validate that all question IDs belong to this examination
  const questionMap = new Map(exam.questions.map((q) => [q._id.toString(), q]));
  for (const ans of answers) {
    const q = questionMap.get(ans.questionId.toString());
    if (!q) {
      const error = new Error(`Question ${ans.questionId} does not belong to this examination`);
      error.status = 400;
      throw error;
    }
  }

  attempt.answers = answers;
  await attempt.save();

  return {
    success: true,
    savedCount: attempt.answers.length,
  };
};

/**
 * Authoritative examination submission.
 * Enforces deadline, verifies answers, and calculates score server-side.
 */
export const submitAttempt = async (studentId, examId, answers = []) => {
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

  const attempt = await ExaminationAttempt.findOne({
    student: studentId,
    examination: examId,
  });

  if (!attempt) {
    const error = new Error('No active examination attempt found');
    error.status = 404;
    throw error;
  }

  if (attempt.status === 'SUBMITTED') {
    const error = new Error('Examination has already been submitted');
    error.status = 400;
    throw error;
  }

  const now = new Date();
  // Allow an 8-second network latency buffer beyond the strict deadline
  const gracePeriodMs = 8 * 1000;
  if (now.getTime() > new Date(attempt.deadline).getTime() + gracePeriodMs) {
    attempt.status = 'EXPIRED';
    await attempt.save();
    const error = new Error('Submission rejected: examination deadline has expired');
    error.status = 400;
    throw error;
  }

  // Validate that submitted question IDs belong to the examination
  const questionMap = new Map(exam.questions.map((q) => [q._id.toString(), q]));
  for (const ans of answers) {
    const q = questionMap.get(ans.questionId.toString());
    if (!q) {
      const error = new Error(`Question ${ans.questionId} does not belong to this examination`);
      error.status = 400;
      throw error;
    }
  }

  // Update answers with final submission payload if supplied
  if (Array.isArray(answers) && answers.length > 0) {
    attempt.answers = answers;
  }

  // Authoritative server-side grading
  let score = 0;
  const answerMap = new Map();
  for (const ans of attempt.answers) {
    answerMap.set(ans.questionId.toString(), ans.selectedAnswer);
  }

  for (const question of exam.questions) {
    const studentSelected = answerMap.get(question._id.toString());
    if (
      studentSelected &&
      studentSelected.trim() === question.correctAnswer.trim()
    ) {
      score += question.marks;
    }
  }

  attempt.score = score;
  attempt.totalMarks = exam.totalMarks;
  attempt.passed = score >= exam.passingMarks;
  attempt.status = 'SUBMITTED';
  attempt.submittedAt = now;

  await attempt.save();

  return {
    _id: attempt._id,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    passingMarks: exam.passingMarks,
    passed: attempt.passed,
    submittedAt: attempt.submittedAt,
  };
};
