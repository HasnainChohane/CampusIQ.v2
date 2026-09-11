import express from 'express';
import { getReports, generateReport, getReportById } from '../controllers/reportController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getReports);
router.post('/generate', requireRole('admin', 'officer', 'faculty'), generateReport);
router.get('/:id', getReportById);

export default router;
