import { pool } from '../db/connection.js';

/**
 * GET /api/dashboard/stats
 * Aggregates all KPI metrics, financial benchmarks, chart datasets, and AI insights from live DB records
 */
export async function getDashboardStats(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;

    // 1. Basic Counts
    const [[[studentStats]], [[facultyStats]], [[courseStats]], [[inventoryStats]], [[requestStats]]] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total_students, AVG(gpa) as avg_gpa FROM students WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT COUNT(*) as total_faculty, AVG(current_workload) as avg_workload FROM faculty WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT COUNT(*) as total_courses, SUM(enrollment_count) as total_enrollments FROM courses WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT COUNT(*) as total_items, SUM(total_quantity) as total_units, SUM(available_quantity) as available_units, SUM(purchase_value) as total_value FROM inventory WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT 
                    COUNT(*) as total_requests,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
                    SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review_requests,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_requests,
                    SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_requests
                  FROM requests WHERE department_id = ?`, [departmentId])
    ]);

    // 2. Financial Metrics (Revenue, Expenses, Budget, Goal)
    const [[[revenueStats]], [[expenseStats]], [budgetRows], [goalRows]] = await Promise.all([
      pool.query(`SELECT SUM(amount) as total_revenue, COUNT(*) as count FROM revenue WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT SUM(amount) as total_expenses, COUNT(*) as count FROM expenses WHERE department_id = ?`, [departmentId]),
      pool.query(`SELECT allocated_amount, period_name FROM budgets WHERE department_id = ? ORDER BY id DESC LIMIT 1`, [departmentId]),
      pool.query(`SELECT target_amount, period_name FROM revenue_goals WHERE department_id = ? ORDER BY id DESC LIMIT 1`, [departmentId])
    ]);

    const totalRevenue = parseFloat(revenueStats.total_revenue || 0);
    const totalExpenses = parseFloat(expenseStats.total_expenses || 0);
    const budgetAllocated = budgetRows.length > 0 ? parseFloat(budgetRows[0].allocated_amount) : 0;
    const revenueGoal = goalRows.length > 0 ? parseFloat(goalRows[0].target_amount) : 0;

    const budgetRemaining = Math.max(0, budgetAllocated - totalExpenses);
    const budgetUtilizationPct = budgetAllocated > 0 ? Math.min(100, Math.round((totalExpenses / budgetAllocated) * 100)) : 0;
    const revenueGoalProgressPct = revenueGoal > 0 ? Math.min(100, Math.round((totalRevenue / revenueGoal) * 100)) : 0;

    // 3. Monthly Financial Trends (Expenses and Revenue by month)
    const [monthlyExpenses] = await pool.query(
      `SELECT DATE_FORMAT(date, '%b %Y') as month_label, DATE_FORMAT(date, '%Y-%m') as month_sort, SUM(amount) as amount 
       FROM expenses 
       WHERE department_id = ? 
       GROUP BY month_sort, month_label 
       ORDER BY month_sort ASC 
       LIMIT 8`,
      [departmentId]
    );

    const [monthlyRevenue] = await pool.query(
      `SELECT DATE_FORMAT(date, '%b %Y') as month_label, DATE_FORMAT(date, '%Y-%m') as month_sort, SUM(amount) as amount 
       FROM revenue 
       WHERE department_id = ? 
       GROUP BY month_sort, month_label 
       ORDER BY month_sort ASC 
       LIMIT 8`,
      [departmentId]
    );

    // Merge monthly trends
    const monthMap = {};
    monthlyExpenses.forEach(e => {
      monthMap[e.month_label] = { month: e.month_label, expenses: parseFloat(e.amount), revenue: 0 };
    });
    monthlyRevenue.forEach(r => {
      if (!monthMap[r.month_label]) {
        monthMap[r.month_label] = { month: r.month_label, expenses: 0, revenue: parseFloat(r.amount) };
      } else {
        monthMap[r.month_label].revenue = parseFloat(r.amount);
      }
    });
    const financialTrends = Object.values(monthMap);

    // 4. Expense Categories Breakdown
    const [expenseCategories] = await pool.query(
      `SELECT category as name, SUM(amount) as value, COUNT(*) as count 
       FROM expenses 
       WHERE department_id = ? 
       GROUP BY category 
       ORDER BY value DESC`,
      [departmentId]
    );

    // 5. Enrollment Distribution & High Capacity Courses
    const [topCourses] = await pool.query(
      `SELECT course_code, name, enrollment_count, max_enrollment,
              ROUND((enrollment_count / max_enrollment) * 100) as fill_rate
       FROM courses 
       WHERE department_id = ? 
       ORDER BY enrollment_count DESC 
       LIMIT 6`,
      [departmentId]
    );

    // 6. Student Program Breakdown
    const [studentPrograms] = await pool.query(
      `SELECT program as name, COUNT(*) as count 
       FROM students 
       WHERE department_id = ? 
       GROUP BY program`,
      [departmentId]
    );

    // 7. Request Status Distribution
    const [requestDistribution] = await pool.query(
      `SELECT status as name, COUNT(*) as count 
       FROM requests 
       WHERE department_id = ? 
       GROUP BY status`,
      [departmentId]
    );

    // 8. Recent Request Activity Feed
    const [recentRequests] = await pool.query(
      `SELECT r.id, r.title, r.type, r.status, r.priority, r.created_at, u.name as requester_name 
       FROM requests r 
       JOIN users u ON r.requester_id = u.id 
       WHERE r.department_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT 5`,
      [departmentId]
    );

    // 9. Data-Grounded AI Insights
    // Extract real data points to formulate grounded insights
    const [overloadedFaculty] = await pool.query(
      `SELECT name, designation, current_workload, max_workload 
       FROM faculty 
       WHERE department_id = ? AND current_workload >= max_workload 
       LIMIT 2`,
      [departmentId]
    );

    const [damagedInventory] = await pool.query(
      `SELECT item_name, location 
       FROM inventory 
       WHERE department_id = ? AND \`condition\` = 'Damaged'`,
      [departmentId]
    );

    const aiInsights = [];

    // Capacity insight
    if (topCourses.length > 0 && topCourses[0].fill_rate >= 90) {
      aiInsights.push({
        type: 'warning',
        category: 'Course Enrollment',
        title: `High Demand in ${topCourses[0].course_code}`,
        description: `${topCourses[0].course_code} (${topCourses[0].name}) is currently at ${topCourses[0].fill_rate}% capacity (${topCourses[0].enrollment_count}/${topCourses[0].max_enrollment} students enrolled). Consider opening an additional lab section.`
      });
    }

    // Workload insight
    if (overloadedFaculty.length > 0) {
      aiInsights.push({
        type: 'alert',
        category: 'Faculty Workload',
        title: `Teaching Workload Cap Reached`,
        description: `${overloadedFaculty[0].name} has reached the maximum workload limit (${overloadedFaculty[0].current_workload}/${overloadedFaculty[0].max_workload} credit hours) for this semester.`
      });
    }

    // Budget insight
    aiInsights.push({
      type: 'info',
      category: 'Fiscal Health',
      title: 'Budget Utilization on Target',
      description: `Department has utilized $${totalExpenses.toLocaleString()} (${budgetUtilizationPct}%) of its $${budgetAllocated.toLocaleString()} annual operating budget. External revenue stands at $${totalRevenue.toLocaleString()} (${revenueGoalProgressPct}% of annual target).`
    });

    // Inventory alert
    if (damagedInventory.length > 0) {
      aiInsights.push({
        type: 'warning',
        category: 'Inventory',
        title: `Equipment Maintenance Needed`,
        description: `${damagedInventory.length} item(s) flagged as Damaged: ${damagedInventory.map(i => i.item_name).join(', ')}. Routine maintenance or warranty replacement recommended.`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          students: {
            total: studentStats.total_students || 0,
            avgGpa: parseFloat(studentStats.avg_gpa || 0).toFixed(2)
          },
          faculty: {
            total: facultyStats.total_faculty || 0,
            avgWorkload: parseFloat(facultyStats.avg_workload || 0).toFixed(1)
          },
          courses: {
            total: courseStats.total_courses || 0,
            totalEnrollments: courseStats.total_enrollments || 0
          },
          inventory: {
            totalItems: inventoryStats.total_items || 0,
            totalUnits: inventoryStats.total_units || 0,
            availableUnits: inventoryStats.available_units || 0,
            totalValue: parseFloat(inventoryStats.total_value || 0)
          },
          requests: {
            total: requestStats.total_requests || 0,
            pending: requestStats.pending_requests || 0,
            underReview: requestStats.under_review_requests || 0,
            approved: requestStats.approved_requests || 0,
            rejected: requestStats.rejected_requests || 0,
            returned: requestStats.returned_requests || 0
          },
          finance: {
            totalRevenue,
            totalExpenses,
            budgetAllocated,
            budgetRemaining,
            budgetUtilizationPct,
            revenueGoal,
            revenueGoalProgressPct
          }
        },
        charts: {
          financialTrends,
          expenseCategories: expenseCategories.map(c => ({ ...c, value: parseFloat(c.value) })),
          topCourses,
          studentPrograms,
          requestDistribution
        },
        recentRequests,
        aiInsights
      }
    });
  } catch (error) {
    next(error);
  }
}
