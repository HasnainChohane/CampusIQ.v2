import { Router } from 'express';
import {
  getRequests,
  getRequestStats,
  getRequestById,
  createRequest,
  updateRequestStatus,
  addRequestComment,
  analyzeRequestEndpoint
} from '../controllers/requestController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all request routes with JWT authentication
router.use(authenticateToken);

// Read & Stats
router.get('/', getRequests);
router.get('/stats', getRequestStats);
router.get('/:id', getRequestById);

// Submit & Analyze
router.post('/', createRequest);
router.post('/analyze', analyzeRequestEndpoint);

// Status Action & Comments
router.post('/:id/status', requireRole('admin', 'officer'), updateRequestStatus);
router.post('/:id/comments', addRequestComment);

export default router;
