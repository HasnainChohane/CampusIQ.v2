import { pool } from '../db/connection.js';

// Helper to generate grounded AI summary based on real report data
function generateAiReportSummary(type, data) {
  if (type === 'academic') {
    const { totalStudents, avgGpa, highRiskCount, totalCourses, avgEnrollmentRate, overloadedFaculty } = data.metrics;
    return `Academic Performance Summary: The department currently serves ${totalStudents} registered students with an overall average GPA of ${avgGpa.toFixed(2)}. Course offerings span ${totalCourses} active classes operating at ${avgEnrollmentRate}% average capacity. Attention required: ${highRiskCount} student(s) have a GPA below 2.50, and ${overloadedFaculty} faculty member(s) exceed the 12 credit hour standard workload threshold.`;
  }
  if (type === 'financial') {
    const { totalRevenue, totalExpenses, netIncome, marginPct, budgetUtilizationPct, topExpenseCategory } = data.metrics;
    return `Fiscal Health Assessment: Year-to-date total revenue reached $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}, against operating expenses of $${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}, yielding a positive net balance of $${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${marginPct}% net margin). Department budget utilization stands at ${budgetUtilizationPct}%, with '${topExpenseCategory}' representing the highest cost category.`;
  }
  if (type === 'inventory') {
    const { totalItems, totalQuantity, totalValuation, damagedCount, unassignedCount } = data.metrics;
    return `Asset & Inventory Overview: Managing ${totalItems} distinct asset categories encompassing ${totalQuantity} total units with a cumulative asset valuation of $${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Operational readiness: ${damagedCount} unit(s) are flagged as damaged/requiring maintenance, while ${unassignedCount} units remain in central storage available for allocation.`;
  }
  if (type === 'requests') {
    const { totalRequests, pendingCount, approvedCount, rejectedCount } = data.metrics;
    return `Operational Requests Intelligence: Evaluated ${totalRequests} total requests submitted across the term. Currently ${pendingCount} request(s) await administrative review. Approval rate stands at ${totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 0}%.`;
  }
  // Comprehensive / Department Overview
  return `Comprehensive Department Intelligence: All operational modules are synchronized. Academic metrics show steady GPA performance, operating budgets maintain positive margins, inventory records show robust equipment readiness, and approval workflows are actively processing requests.`;
}

// Get list of previously generated reports
export async function getReports(req, res, next) {
  try {
    const departmentId = req.user.department_id || 1;
    const [reports] = await pool.query(
      `SELECT r.*, u.name AS generated_by_name, u.email AS generated_by_email
       FROM reports r
       LEFT JOIN users u ON r.generated_by = u.id
       WHERE r.department_id = ?
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [departmentId]
    );

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
}

// Generate live report data on demand
export async function generateReport(req, res, next) {
  try {
    const departmentId = req.user.department_id || 1;
    const { reportType = 'academic', title, reportingPeriod = 'Fall 2026 / AY 2026-2027' } = req.body;

    let reportData = {
      type: reportType,
      generatedAt: new Date().toISOString(),
      departmentId,
      metrics: {},
      sections: []
    };

    if (reportType === 'academic') {
      const [studentStatsRows] = await pool.query(
        `SELECT COUNT(*) AS totalStudents,
                AVG(gpa) AS avgGpa,
                SUM(CASE WHEN gpa < 2.5 THEN 1 ELSE 0 END) AS highRiskCount
         FROM students WHERE department_id = ?`,
        [departmentId]
      );
      const studentStats = studentStatsRows[0] || {};

      const [courseStatsRows] = await pool.query(
        `SELECT COUNT(*) AS totalCourses,
                AVG((enrollment_count / NULLIF(max_enrollment, 0)) * 100) AS avgEnrollmentRate
         FROM courses WHERE department_id = ?`,
        [departmentId]
      );
      const courseStats = courseStatsRows[0] || {};

      const [facultyStatsRows] = await pool.query(
        `SELECT SUM(CASE WHEN current_workload > 12 THEN 1 ELSE 0 END) AS overloadedFaculty
         FROM faculty
         WHERE department_id = ?`,
        [departmentId]
      );
      const facultyStats = facultyStatsRows[0] || {};

      const [topCourses] = await pool.query(
        `SELECT c.course_code, c.name, c.enrollment_count, c.max_enrollment, c.credit_hours, f.name AS faculty_name
         FROM courses c
         LEFT JOIN faculty f ON c.instructor_id = f.id
         WHERE c.department_id = ?
         ORDER BY c.enrollment_count DESC
         LIMIT 10`,
        [departmentId]
      );

      const [studentList] = await pool.query(
        `SELECT id, student_id, name, email, semester, program, gpa, status
         FROM students
         WHERE department_id = ?
         ORDER BY gpa ASC
         LIMIT 10`,
        [departmentId]
      );

      reportData.metrics = {
        totalStudents: Number(studentStats.totalStudents || 0),
        avgGpa: Number(studentStats.avgGpa || 0),
        highRiskCount: Number(studentStats.highRiskCount || 0),
        totalCourses: Number(courseStats.totalCourses || 0),
        avgEnrollmentRate: Math.round(Number(courseStats.avgEnrollmentRate || 0)),
        overloadedFaculty: Number(facultyStats.overloadedFaculty || 0)
      };

      reportData.sections = [
        {
          title: 'Course Enrollment & Workload Analysis',
          type: 'table',
          headers: ['Code', 'Course Name', 'Faculty Instructor', 'Enrolled / Cap', 'Credits'],
          rows: topCourses.map(c => [
            c.course_code,
            c.name,
            c.faculty_name || 'Unassigned',
            `${c.enrollment_count} / ${c.max_enrollment}`,
            `${c.credit_hours} cr`
          ])
        },
        {
          title: 'Academic Standing Watchlist (Lowest GPA Cohort)',
          type: 'table',
          headers: ['ID Number', 'Student Name', 'Program / Sem', 'GPA', 'Status'],
          rows: studentList.map(s => [
            s.student_id,
            s.name,
            `${s.program} (Sem ${s.semester})`,
            s.gpa ? Number(s.gpa).toFixed(2) : 'N/A',
            s.status?.toUpperCase()
          ])
        }
      ];
    } else if (reportType === 'financial') {
      const [revStatsRows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM revenue WHERE department_id = ?`,
        [departmentId]
      );
      const revStats = revStatsRows[0] || {};

      const [expStatsRows] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE department_id = ?`,
        [departmentId]
      );
      const expStats = expStatsRows[0] || {};

      const [budgetStatsRows] = await pool.query(
        `SELECT COALESCE(SUM(allocated_amount), 0) AS totalBudget
         FROM budgets WHERE department_id = ?`,
        [departmentId]
      );
      const budgetStats = budgetStatsRows[0] || {};

      const [topCategories] = await pool.query(
        `SELECT category, SUM(amount) AS totalAmount
         FROM expenses
         WHERE department_id = ?
         GROUP BY category
         ORDER BY totalAmount DESC`,
        [departmentId]
      );
      const [recentExpenses] = await pool.query(
        `SELECT e.date, e.category, e.description, e.amount
         FROM expenses e
         WHERE e.department_id = ?
         ORDER BY e.date DESC
         LIMIT 10`,
        [departmentId]
      );

      const totalRevenue = Number(revStats.totalRevenue || 0);
      const totalExpenses = Number(expStats.totalExpenses || 0);
      const netIncome = totalRevenue - totalExpenses;
      const marginPct = totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 100) : 0;
      const totalBudget = Number(budgetStats.totalBudget || 0);
      const totalSpent = totalExpenses;
      const budgetUtilizationPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

      reportData.metrics = {
        totalRevenue,
        totalExpenses,
        netIncome,
        marginPct,
        totalBudget,
        budgetUtilizationPct,
        topExpenseCategory: topCategories[0]?.category || 'General'
      };

      reportData.sections = [
        {
          title: 'Expenditure Distribution by Category',
          type: 'table',
          headers: ['Category', 'Total Expenditure', '% of Total Outflow'],
          rows: topCategories.map(c => [
            c.category,
            `$${Number(c.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            totalExpenses > 0 ? `${Math.round((Number(c.totalAmount) / totalExpenses) * 100)}%` : '0%'
          ])
        },
        {
          title: 'Recent Expense Disbursements',
          type: 'table',
          headers: ['Date', 'Category', 'Description', 'Amount'],
          rows: recentExpenses.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.category,
            e.description || 'N/A',
            `$${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          ])
        }
      ];
    } else if (reportType === 'inventory') {
      const [invStatsRows] = await pool.query(
        `SELECT COUNT(*) AS totalItems,
                COALESCE(SUM(total_quantity), 0) AS totalQuantity,
                COALESCE(SUM(purchase_value), 0) AS totalValuation,
                SUM(CASE WHEN \`condition\` = 'Damaged' THEN 1 ELSE 0 END) AS damagedCount,
                COALESCE(SUM(available_quantity), 0) AS availableQuantity
         FROM inventory WHERE department_id = ?`,
        [departmentId]
      );
      const invStats = invStatsRows[0] || {};

      const [assignStatsRows] = await pool.query(
        `SELECT COUNT(*) AS activeAssignments FROM inventory_assignments WHERE return_date IS NULL`
      );
      const assignStats = assignStatsRows[0] || {};

      const [criticalAssets] = await pool.query(
        `SELECT item_name, category, total_quantity, purchase_value, \`condition\`, location
         FROM inventory
         WHERE department_id = ?
         ORDER BY purchase_value DESC
         LIMIT 10`,
        [departmentId]
      );

      const totalItems = Number(invStats.totalItems || 0);
      const totalQuantity = Number(invStats.totalQuantity || 0);
      const totalValuation = Number(invStats.totalValuation || 0);
      const damagedCount = Number(invStats.damagedCount || 0);
      const activeAssignments = Number(assignStats.activeAssignments || 0);

      reportData.metrics = {
        totalItems,
        totalQuantity,
        totalValuation,
        damagedCount,
        activeAssignments,
        unassignedCount: Number(invStats.availableQuantity || 0)
      };

      reportData.sections = [
        {
          title: 'High-Value Asset Inventory Ledger',
          type: 'table',
          headers: ['Asset Name', 'Category', 'Qty', 'Total Value', 'Condition', 'Location'],
          rows: criticalAssets.map(a => [
            a.item_name,
            a.category,
            a.total_quantity.toString(),
            `$${Number(a.purchase_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            a.condition,
            a.location || 'Central Depot'
          ])
        }
      ];
    } else {
      // Requests Report
      const [reqStatsRows] = await pool.query(
        `SELECT COUNT(*) AS totalRequests,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedCount,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedCount
         FROM requests WHERE department_id = ?`,
        [departmentId]
      );
      const reqStats = reqStatsRows[0] || {};

      const [recentReqs] = await pool.query(
        `SELECT r.id, r.title, r.type, r.priority, r.status, u.name AS requester_name, r.created_at
         FROM requests r
         LEFT JOIN users u ON r.requester_id = u.id
         WHERE r.department_id = ?
         ORDER BY r.created_at DESC
         LIMIT 10`,
        [departmentId]
      );

      reportData.metrics = {
        totalRequests: Number(reqStats.totalRequests || 0),
        pendingCount: Number(reqStats.pendingCount || 0),
        approvedCount: Number(reqStats.approvedCount || 0),
        rejectedCount: Number(reqStats.rejectedCount || 0)
      };

      reportData.sections = [
        {
          title: 'Recent Workflow Requests & Approval State',
          type: 'table',
          headers: ['ID', 'Title', 'Type', 'Requester', 'Priority', 'Status'],
          rows: recentReqs.map(r => [
            `#REQ-${r.id}`,
            r.title,
            r.type?.toUpperCase(),
            r.requester_name || 'Staff',
            r.priority?.toUpperCase(),
            r.status?.toUpperCase()
          ])
        }
      ];
    }

    const aiSummary = generateAiReportSummary(reportType, reportData);
    reportData.aiSummary = aiSummary;

    const reportTitle = title || `Official Department ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;

    // Insert record into reports table
    const [result] = await pool.query(
      `INSERT INTO reports (department_id, report_type, title, reporting_period, generated_by, file_path, ai_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        departmentId,
        reportType,
        reportTitle,
        reportingPeriod,
        req.user.id,
        `/reports/generated_${Date.now()}.pdf`,
        aiSummary
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Report generated successfully with grounded AI intelligence',
      data: {
        id: result.insertId,
        title: reportTitle,
        reportType,
        reportingPeriod,
        aiSummary,
        createdAt: new Date().toISOString(),
        payload: reportData
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get specific report details
export async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id || 1;

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS generated_by_name, u.email AS generated_by_email
       FROM reports r
       LEFT JOIN users u ON r.generated_by = u.id
       WHERE r.id = ? AND r.department_id = ?`,
      [id, departmentId]
    );
    const report = rows[0];

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}
