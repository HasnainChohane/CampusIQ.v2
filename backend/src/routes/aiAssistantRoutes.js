import express from 'express';
import { getSuggestions, processAiQuery } from '../controllers/aiAssistantController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/suggestions', getSuggestions);
router.post('/query', processAiQuery);

export default router;
