import { Router } from 'express';
import {
  getInventory,
  getInventoryStats,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  assignInventoryItem,
  returnInventoryAssignment
} from '../controllers/inventoryController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all inventory routes with JWT
router.use(authenticateToken);

// Read endpoints
router.get('/', getInventory);
router.get('/stats', getInventoryStats);
router.get('/:id', getInventoryById);

// Management endpoints (Admin, Officer)
router.post('/', requireRole('admin', 'officer'), createInventoryItem);
router.put('/:id', requireRole('admin', 'officer'), updateInventoryItem);
router.delete('/:id', requireRole('admin', 'officer'), deleteInventoryItem);

// Asset Assignment & Return endpoints
router.post('/:id/assign', requireRole('admin', 'officer'), assignInventoryItem);
router.put('/assignments/:assignmentId/return', requireRole('admin', 'officer'), returnInventoryAssignment);

export default router;
