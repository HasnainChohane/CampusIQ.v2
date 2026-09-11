import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all dashboard endpoints with JWT auth
router.use(authenticateToken);

router.get('/stats', getDashboardStats);

export default router;
