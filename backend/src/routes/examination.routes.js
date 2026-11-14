import { Router } from 'express';
import * as examController from '../controllers/examination.controller.js';
import * as studentExamController from '../controllers/studentExam.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../utils/validation.js';
import { examinationInputSchema, submitAnswersSchema } from '../utils/examValidation.js';

const router = Router();

// ==========================================
// Student-Facing Endpoints (STUDENT role)
// ==========================================

// List published examinations available in the current active window
router.get(
  '/available',
  authenticate,
  authorize('STUDENT'),
  examController.getAvailable
);

// Start or resume an examination attempt
router.get(
  '/:id/start',
  authenticate,
  authorize('STUDENT'),
  studentExamController.startOrResume
);

// Retrieve active attempt details and server-authoritative countdown
router.get(
  '/:id/attempt',
  authenticate,
  authorize('STUDENT'),
  studentExamController.getAttempt
);

// Auto-save in-progress answers persistently
router.patch(
  '/:id/progress',
  authenticate,
  authorize('STUDENT'),
  validateBody(submitAnswersSchema),
  studentExamController.saveProgress
);

// Submit final examination answers and trigger server-side grading
router.post(
  '/:id/submit',
  authenticate,
  authorize('STUDENT'),
  validateBody(submitAnswersSchema),
  studentExamController.submit
);

// ==========================================
// Instructor-Only Endpoints (INSTRUCTOR role)
// ==========================================

router.get(
  '/my',
  authenticate,
  authorize('INSTRUCTOR'),
  examController.getMyExaminations
);

router.post(
  '/',
  authenticate,
  authorize('INSTRUCTOR'),
  validateBody(examinationInputSchema),
  examController.create
);

router.get(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR'),
  examController.getById
);

router.put(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR'),
  validateBody(examinationInputSchema),
  examController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR'),
  examController.deleteExam
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize('INSTRUCTOR'),
  examController.publish
);

export default router;

