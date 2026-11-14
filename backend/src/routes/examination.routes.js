import { Router } from 'express';
import * as examController from '../controllers/examination.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../utils/validation.js';
import { examinationInputSchema } from '../utils/examValidation.js';

const router = Router();

// Student-Facing Endpoint (Public to authenticated students/users)
router.get(
  '/available',
  authenticate,
  examController.getAvailable
);

// Instructor-Only Endpoints
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

