import { Router } from 'express';
import { login, getCurrentUser, getDemoAccounts } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.get('/demo-accounts', getDemoAccounts);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

export default router;
