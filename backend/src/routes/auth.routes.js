import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody, registerSchema, loginSchema } from '../utils/validation.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected Authentication Endpoints
router.get('/me', authenticate, authController.me);

// RBAC Protected Test Endpoint (Admin verification)
router.get('/admin-check', authenticate, authorize('ADMIN'), authController.adminOnlyEndpoint);

export default router;
