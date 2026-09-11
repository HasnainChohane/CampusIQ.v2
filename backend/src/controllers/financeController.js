import { pool } from '../db/connection.js';

// ===================================================================
// OVERVIEW & ANALYTICS
// ===================================================================

/**
 * GET /api/finance/overview
 * Financial health metrics, budget utilization, targets, and chart data
 */
export async function getFinanceOverview(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;

    // 1. Totals
    const [[[revStats]], [[expStats]], [budgets], [goals]] = await Promise.all([
      pool.query(`SELECT SUM(amount) as total_revenue, COUNT(*) as count FROM revenue WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT SUM(amount) as total_expenses, COUNT(*) as count FROM expenses WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT * FROM budgets WHERE department_id = ? ORDER BY id DESC LIMIT 1`, [departmentId]),
      pool.query(`SELECT * FROM revenue_goals WHERE department_id = ? ORDER BY id DESC LIMIT 1`, [departmentId])
    ]);

    const totalRevenue = parseFloat(revStats.total_revenue || 0);
    const totalExpenses = parseFloat(expStats.total_expenses || 0);
    const activeBudget = budgets.length > 0 ? budgets[0] : null;
    const activeGoal = goals.length > 0 ? goals[0] : null;

    const allocatedBudget = activeBudget ? parseFloat(activeBudget.allocated_amount) : 0;
    const remainingBudget = Math.max(0, allocatedBudget - totalExpenses);
    const budgetUtilizationPct = allocatedBudget > 0 ? Math.min(100, Math.round((totalExpenses / allocatedBudget) * 100)) : 0;

    const targetRevenue = activeGoal ? parseFloat(activeGoal.target_amount) : 0;
    const goalProgressPct = targetRevenue > 0 ? Math.min(100, Math.round((totalRevenue / targetRevenue) * 100)) : 0;

    // 2. Monthly Trend Chart
    const [monthlyExp] = await pool.query(
      `SELECT DATE_FORMAT(date, '%b %Y') as month, DATE_FORMAT(date, '%Y-%m') as sort_key, SUM(amount) as amount
       FROM expenses
       WHERE department_id = ?
       GROUP BY sort_key, month
       ORDER BY sort_key ASC
       LIMIT 8`,
      [departmentId]
    );

    const [monthlyRev] = await pool.query(
      `SELECT DATE_FORMAT(date, '%b %Y') as month, DATE_FORMAT(date, '%Y-%m') as sort_key, SUM(amount) as amount
       FROM revenue
       WHERE department_id = ?
       GROUP BY sort_key, month
       ORDER BY sort_key ASC
       LIMIT 8`,
      [departmentId]
    );

    const trendMap = {};
    monthlyRev.forEach(r => {
      trendMap[r.month] = { month: r.month, revenue: parseFloat(r.amount), expenses: 0 };
    });
    monthlyExp.forEach(e => {
      if (!trendMap[e.month]) {
        trendMap[e.month] = { month: e.month, revenue: 0, expenses: parseFloat(e.amount) };
      } else {
        trendMap[e.month].expenses = parseFloat(e.amount);
      }
    });
    const monthlyTrends = Object.values(trendMap);

    // 3. Category Breakdown
    const [categories] = await pool.query(
      `SELECT category as name, SUM(amount) as value, COUNT(*) as count
       FROM expenses
       WHERE department_id = ?
       GROUP BY category
       ORDER BY value DESC`,
      [departmentId]
    );

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalRevenue,
          totalExpenses,
          netBalance: totalRevenue - totalExpenses,
          allocatedBudget,
          remainingBudget,
          budgetUtilizationPct,
          targetRevenue,
          goalProgressPct
        },
        activeBudget,
        activeGoal,
        charts: {
          monthlyTrends,
          categories: categories.map(c => ({ ...c, value: parseFloat(c.value) }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// ===================================================================
// REVENUE CRUD
// ===================================================================

export async function getRevenues(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search } = req.query;

    let query = `SELECT * FROM revenue WHERE department_id = ?`;
    const params = [departmentId];

    if (search) {
      query += ` AND (source LIKE ? OR description LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` ORDER BY date DESC`;
    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        revenue: rows.map(r => ({ ...r, amount: parseFloat(r.amount) })),
        total: rows.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createRevenue(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { source, amount, date, description } = req.body;

    if (!source || !amount || !date) {
      return res.status(400).json({ success: false, error: { message: 'Source, Amount, and Date are required.' } });
    }

    const [result] = await pool.query(
      `INSERT INTO revenue (department_id, source, amount, date, description) VALUES (?, ?, ?, ?, ?)`,
      [departmentId, source.trim(), parseFloat(amount), date, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Revenue record created successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRevenue(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const { source, amount, date, description } = req.body;

    const [result] = await pool.query(
      `UPDATE revenue 
       SET source = COALESCE(?, source),
           amount = COALESCE(?, amount),
           date = COALESCE(?, date),
           description = COALESCE(?, description)
       WHERE id = ? AND department_id = ?`,
      [source, amount ? parseFloat(amount) : undefined, date, description, id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: { message: 'Revenue record not found.' } });
    }

    res.status(200).json({ success: true, message: 'Revenue record updated.' });
  } catch (error) {
    next(error);
  }
}

export async function deleteRevenue(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [result] = await pool.query(`DELETE FROM revenue WHERE id = ? AND department_id = ?`, [id, departmentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: { message: 'Revenue record not found.' } });
    }

    res.status(200).json({ success: true, message: 'Revenue record deleted.' });
  } catch (error) {
    next(error);
  }
}

// ===================================================================
// EXPENSES CRUD
// ===================================================================

export async function getExpenses(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search, category } = req.query;

    let query = `SELECT e.*, i.item_name as inventory_item_name, r.title as request_title
                 FROM expenses e
                 LEFT JOIN inventory i ON e.inventory_id = i.id
                 LEFT JOIN requests r ON e.related_request_id = r.id
                 WHERE e.department_id = ?`;
    const params = [departmentId];

    if (search) {
      query += ` AND (e.category LIKE ? OR e.description LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (category && category !== 'all') {
      query += ` AND e.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY e.date DESC`;
    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        expenses: rows.map(e => ({ ...e, amount: parseFloat(e.amount) })),
        total: rows.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createExpense(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { category, amount, date, description, related_request_id, inventory_id } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ success: false, error: { message: 'Category, Amount, and Date are required.' } });
    }

    const [result] = await pool.query(
      `INSERT INTO expenses (department_id, category, amount, date, description, related_request_id, inventory_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        departmentId,
        category.trim(),
        parseFloat(amount),
        date,
        description || null,
        related_request_id || null,
        inventory_id || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Expense transaction recorded.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const { category, amount, date, description } = req.body;

    const [result] = await pool.query(
      `UPDATE expenses 
       SET category = COALESCE(?, category),
           amount = COALESCE(?, amount),
           date = COALESCE(?, date),
           description = COALESCE(?, description)
       WHERE id = ? AND department_id = ?`,
      [category, amount ? parseFloat(amount) : undefined, date, description, id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: { message: 'Expense not found.' } });
    }

    res.status(200).json({ success: true, message: 'Expense updated.' });
  } catch (error) {
    next(error);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [result] = await pool.query(`DELETE FROM expenses WHERE id = ? AND department_id = ?`, [id, departmentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: { message: 'Expense not found.' } });
    }

    res.status(200).json({ success: true, message: 'Expense record deleted.' });
  } catch (error) {
    next(error);
  }
}

// ===================================================================
// BUDGETS & GOALS CRUD
// ===================================================================

export async function getBudgets(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const [rows] = await pool.query(`SELECT * FROM budgets WHERE department_id = ? ORDER BY start_date DESC`, [departmentId]);
    res.status(200).json({
      success: true,
      data: { budgets: rows.map(b => ({ ...b, allocated_amount: parseFloat(b.allocated_amount) })) }
    });
  } catch (error) {
    next(error);
  }
}

export async function createBudget(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { period_name, allocated_amount, start_date, end_date } = req.body;

    const [result] = await pool.query(
      `INSERT INTO budgets (department_id, period_name, allocated_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
      [departmentId, period_name, parseFloat(allocated_amount), start_date, end_date]
    );

    res.status(201).json({ success: true, message: 'Budget created.', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
}

export async function getRevenueGoals(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const [rows] = await pool.query(`SELECT * FROM revenue_goals WHERE department_id = ? ORDER BY start_date DESC`, [departmentId]);
    res.status(200).json({
      success: true,
      data: { goals: rows.map(g => ({ ...g, target_amount: parseFloat(g.target_amount) })) }
    });
  } catch (error) {
    next(error);
  }
}

export async function createRevenueGoal(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { period_name, target_amount, start_date, end_date } = req.body;

    const [result] = await pool.query(
      `INSERT INTO revenue_goals (department_id, period_name, target_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
      [departmentId, period_name, parseFloat(target_amount), start_date, end_date]
    );

    res.status(201).json({ success: true, message: 'Revenue goal created.', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
}
