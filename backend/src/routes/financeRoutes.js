import { Router } from 'express';
import {
  getFinanceOverview,
  getRevenues,
  createRevenue,
  updateRevenue,
  deleteRevenue,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getBudgets,
  createBudget,
  getRevenueGoals,
  createRevenueGoal
} from '../controllers/financeController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all finance routes with JWT authentication
router.use(authenticateToken);

// Overview
router.get('/overview', getFinanceOverview);

// Revenue CRUD
router.get('/revenue', getRevenues);
router.post('/revenue', requireRole('admin', 'officer'), createRevenue);
router.put('/revenue/:id', requireRole('admin', 'officer'), updateRevenue);
router.delete('/revenue/:id', requireRole('admin', 'officer'), deleteRevenue);

// Expenses CRUD
router.get('/expenses', getExpenses);
router.post('/expenses', requireRole('admin', 'officer'), createExpense);
router.put('/expenses/:id', requireRole('admin', 'officer'), updateExpense);
router.delete('/expenses/:id', requireRole('admin', 'officer'), deleteExpense);

// Budgets & Goals
router.get('/budgets', getBudgets);
router.post('/budgets', requireRole('admin', 'officer'), createBudget);
router.get('/goals', getRevenueGoals);
router.post('/goals', requireRole('admin', 'officer'), createRevenueGoal);

export default router;
