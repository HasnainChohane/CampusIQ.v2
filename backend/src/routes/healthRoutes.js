import { Router } from 'express';
import { getSystemHealth, getDatabaseHealth } from '../controllers/healthController.js';

const router = Router();

router.get('/', getSystemHealth);
router.get('/db', getDatabaseHealth);

export default router;
