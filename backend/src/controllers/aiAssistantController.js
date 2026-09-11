import { pool } from '../db/connection.js';

// Predefined high-value suggestions for 1-click execution
export const SUGGESTED_QUERIES = [
  {
    id: 'courses_capacity',
    category: 'Academic',
    query: 'Which courses are currently exceeding 85% capacity or full?',
    description: 'Find enrollment bottlenecks needing section expansion.'
  },
  {
    id: 'faculty_workload',
    category: 'Academic',
    query: 'Which faculty members are teaching more than 12 credit hours?',
    description: 'Detect faculty overload beyond standard policy.'
  },
  {
    id: 'students_risk',
    category: 'Academic',
    query: 'How many students are at academic risk with GPA below 2.5?',
    description: 'Identify students requiring immediate academic advising.'
  },
  {
    id: 'financial_health',
    category: 'Finance',
    query: 'What is our current net financial balance and top expense category?',
    description: 'Fiscal summary of revenue, expenditures, and margins.'
  },
  {
    id: 'pending_purchases',
    category: 'Operations',
    query: 'List all pending purchase requests and their status.',
    description: 'Summary of unapproved procurement tickets.'
  },
  {
    id: 'damaged_inventory',
    category: 'Operations',
    query: 'How many hardware assets in inventory are currently damaged?',
    description: 'Identify equipment needing repair or replacement.'
  },
  {
    id: 'budget_utilization',
    category: 'Finance',
    query: 'What is our budget utilization percentage across current programs?',
    description: 'Compare allocated budgets against actual expenditures.'
  }
];

export async function getSuggestions(req, res, next) {
  try {
    res.json({
      success: true,
      data: SUGGESTED_QUERIES
    });
  } catch (error) {
    next(error);
  }
}

export async function processAiQuery(req, res, next) {
  try {
    const departmentId = req.user.department_id || 1;
    const { query = '' } = req.body;
    const cleanQuery = query.toLowerCase().trim();

    if (!cleanQuery) {
      return res.status(400).json({ success: false, message: 'Query string is required' });
    }

    let responsePayload = {
      query,
      timestamp: new Date().toISOString(),
      confidence: '100% Deterministic Grounding',
      source: 'DepartmentHub Live MySQL Database',
      answer: '',
      metrics: [],
      data: [],
      columns: [],
      actionSuggestion: null
    };

    // Intent 1: Courses capacity / enrollment overload
    if (cleanQuery.includes('capacit') || cleanQuery.includes('enroll') || cleanQuery.includes('full course') || cleanQuery.includes('course over')) {
      const [courses] = await pool.query(
        `SELECT c.course_code, c.name, c.enrollment_count, c.max_enrollment,
                ROUND((c.enrollment_count / NULLIF(c.max_enrollment, 0)) * 100) AS fill_pct,
                f.name AS faculty_name, c.room
         FROM courses c
         LEFT JOIN faculty f ON c.instructor_id = f.id
         WHERE c.department_id = ?
         ORDER BY fill_pct DESC, c.enrollment_count DESC`,
        [departmentId]
      );

      const highCapacity = courses.filter(c => Number(c.fill_pct) >= 85);

      responsePayload.answer = `Found **${highCapacity.length} course(s)** exceeding **85% capacity** out of ${courses.length} total active departmental offerings. The most saturated course is **${courses[0]?.course_code} - ${courses[0]?.name}** currently running at **${courses[0]?.fill_pct}% capacity** (${courses[0]?.enrollment_count}/${courses[0]?.max_enrollment} enrolled).`;
      responsePayload.metrics = [
        { label: 'High Capacity Courses', value: highCapacity.length, color: highCapacity.length > 0 ? 'amber' : 'emerald' },
        { label: 'Total Course Offerings', value: courses.length, color: 'blue' },
        { label: 'Peak Capacity', value: `${courses[0]?.fill_pct || 0}%`, color: 'purple' }
      ];
      responsePayload.columns = ['Code', 'Course Title', 'Instructor', 'Enrolled / Cap', 'Fill Rate', 'Room'];
      responsePayload.data = courses.map(c => [
        c.course_code,
        c.name,
        c.faculty_name || 'Unassigned',
        `${c.enrollment_count} / ${c.max_enrollment}`,
        `${c.fill_pct}%`,
        c.room || 'TBD'
      ]);
      responsePayload.actionSuggestion = {
        label: 'Open Academic Course Roster',
        path: '/academic'
      };
    }
    // Intent 2: Faculty workload / overload (> 12 credit hours)
    else if (cleanQuery.includes('faculty') || cleanQuery.includes('workload') || cleanQuery.includes('professor') || cleanQuery.includes('teacher') || cleanQuery.includes('teaching hour')) {
      const [faculty] = await pool.query(
        `SELECT f.name, f.designation, f.email, f.current_workload, f.max_workload,
                COUNT(c.id) AS course_count,
                COALESCE(SUM(c.enrollment_count), 0) AS total_students_taught
         FROM faculty f
         LEFT JOIN courses c ON f.id = c.instructor_id
         WHERE f.department_id = ?
         GROUP BY f.id
         ORDER BY f.current_workload DESC`,
        [departmentId]
      );

      const overloaded = faculty.filter(f => Number(f.current_workload) > 12);

      responsePayload.answer = `The department has **${faculty.length} faculty members**. **${overloaded.length} instructor(s)** currently exceed the **12 credit hour standard threshold**: ${overloaded.map(o => `**${o.name}** (${o.current_workload} hrs across ${o.course_count} courses)`).join(', ') || 'None'}.`;
      responsePayload.metrics = [
        { label: 'Total Faculty', value: faculty.length, color: 'blue' },
        { label: 'Overloaded (>12h)', value: overloaded.length, color: overloaded.length > 0 ? 'rose' : 'emerald' },
        { label: 'Avg Workload', value: `${(faculty.reduce((acc, f) => acc + Number(f.current_workload), 0) / (faculty.length || 1)).toFixed(1)} hrs`, color: 'indigo' }
      ];
      responsePayload.columns = ['Faculty Name', 'Designation', 'Current Load', 'Max Policy', 'Courses Assigned', 'Students Taught', 'Status'];
      responsePayload.data = faculty.map(f => [
        f.name,
        f.designation,
        `${f.current_workload} cr hrs`,
        `${f.max_workload} cr hrs`,
        f.course_count.toString(),
        f.total_students_taught.toString(),
        Number(f.current_workload) > 12 ? 'Overloaded ⚠️' : 'Normal Load'
      ]);
      responsePayload.actionSuggestion = {
        label: 'Manage Faculty Workload',
        path: '/academic'
      };
    }
    // Intent 3: Students risk / GPA / standing
    else if (cleanQuery.includes('student') || cleanQuery.includes('gpa') || cleanQuery.includes('risk') || cleanQuery.includes('standing') || cleanQuery.includes('honor')) {
      const [students] = await pool.query(
        `SELECT student_id, name, email, semester, program, gpa, status
         FROM students
         WHERE department_id = ?
         ORDER BY gpa ASC`,
        [departmentId]
      );

      const atRisk = students.filter(s => Number(s.gpa) < 2.5);
      const honors = students.filter(s => Number(s.gpa) >= 3.5);
      const avgGpa = (students.reduce((acc, s) => acc + Number(s.gpa || 0), 0) / (students.length || 1)).toFixed(2);

      responsePayload.answer = `There are **${students.length} active students** with a department average GPA of **${avgGpa}**. **${atRisk.length} student(s)** are currently on the **At-Risk Watchlist (GPA < 2.50)**, while **${honors.length} student(s)** hold Dean's Honor distinction (GPA ≥ 3.50).`;
      responsePayload.metrics = [
        { label: 'Department Avg GPA', value: avgGpa, color: 'blue' },
        { label: 'At-Risk (GPA < 2.5)', value: atRisk.length, color: atRisk.length > 0 ? 'rose' : 'emerald' },
        { label: "Dean's Honors (≥ 3.5)", value: honors.length, color: 'emerald' }
      ];
      responsePayload.columns = ['Student ID', 'Student Name', 'Program / Sem', 'GPA', 'Status'];
      responsePayload.data = students.map(s => [
        s.student_id,
        s.name,
        `${s.program} (Sem ${s.semester})`,
        s.gpa ? Number(s.gpa).toFixed(2) : 'N/A',
        s.status?.toUpperCase()
      ]);
      responsePayload.actionSuggestion = {
        label: 'View Students Directory',
        path: '/academic'
      };
    }
    // Intent 4: Financial health / Revenue vs Expenses / Net Balance
    else if (cleanQuery.includes('financ') || cleanQuery.includes('revenue') || cleanQuery.includes('expense') || cleanQuery.includes('net') || cleanQuery.includes('margin') || cleanQuery.includes('money') || cleanQuery.includes('cost') || cleanQuery.includes('budget')) {
      const [revRows] = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS totalRev FROM revenue WHERE department_id = ?`, [departmentId]);
      const rev = revRows[0] || {};
      const [expRows] = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS totalExp FROM expenses WHERE department_id = ?`, [departmentId]);
      const exp = expRows[0] || {};
      const [byCat] = await pool.query(
        `SELECT category, SUM(amount) AS total FROM expenses WHERE department_id = ? GROUP BY category ORDER BY total DESC`,
        [departmentId]
      );

      const totalRevenue = Number(rev.totalRev || 0);
      const totalExpenses = Number(exp.totalExp || 0);
      const netBalance = totalRevenue - totalExpenses;
      const margin = totalRevenue > 0 ? Math.round((netBalance / totalRevenue) * 100) : 0;

      responsePayload.answer = `Current fiscal standing shows **Rs. ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}** in total revenue against **Rs. ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0 })}** in operational expenses, generating a **net positive surplus of Rs. ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}** (${margin}% profit margin). The largest expense category is **'${byCat[0]?.category || 'General'}'** (Rs. ${Number(byCat[0]?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}).`;
      responsePayload.metrics = [
        { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: 'emerald' },
        { label: 'Total Expenses', value: `Rs. ${totalExpenses.toLocaleString()}`, color: 'rose' },
        { label: 'Net Surplus', value: `Rs. ${netBalance.toLocaleString()}`, color: netBalance >= 0 ? 'emerald' : 'rose' }
      ];
      responsePayload.columns = ['Expense Category', 'Total Amount (PKR)', '% Share'];
      responsePayload.data = byCat.map(c => [
        c.category,
        `Rs. ${Number(c.total).toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
        totalExpenses > 0 ? `${Math.round((Number(c.total) / totalExpenses) * 100)}%` : '0%'
      ]);
      responsePayload.actionSuggestion = {
        label: 'Open Finance & Budget Dashboard',
        path: '/finance'
      };
    }
    // Intent 5: Pending purchase requests
    else if (cleanQuery.includes('request') || cleanQuery.includes('purchas') || cleanQuery.includes('pend') || cleanQuery.includes('approv') || cleanQuery.includes('ticket')) {
      const [reqs] = await pool.query(
        `SELECT r.id, r.title, r.type, r.priority, r.status, u.name AS requester_name, r.created_at
         FROM requests r
         LEFT JOIN users u ON r.requester_id = u.id
         WHERE r.department_id = ?
         ORDER BY r.created_at DESC`,
        [departmentId]
      );

      const pending = reqs.filter(r => r.status === 'pending');

      responsePayload.answer = `There are **${pending.length} pending request(s)** awaiting administrative review. Across the department, ${reqs.length} total workflow tickets have been logged.`;
      responsePayload.metrics = [
        { label: 'Pending Review', value: pending.length, color: pending.length > 0 ? 'amber' : 'emerald' },
        { label: 'Total Logged Tickets', value: reqs.length, color: 'purple' }
      ];
      responsePayload.columns = ['Ticket ID', 'Title', 'Type', 'Requester', 'Priority', 'Status'];
      responsePayload.data = reqs.map(r => [
        `#REQ-${r.id}`,
        r.title,
        r.type?.toUpperCase(),
        r.requester_name || 'Staff',
        r.priority?.toUpperCase(),
        r.status?.toUpperCase()
      ]);
      responsePayload.actionSuggestion = {
        label: 'Review Approval Queue in Requests',
        path: '/requests'
      };
    }
    // Intent 6: Inventory & Damaged assets
    else if (cleanQuery.includes('inventor') || cleanQuery.includes('asset') || cleanQuery.includes('damage') || cleanQuery.includes('equip') || cleanQuery.includes('laptop') || cleanQuery.includes('hardwar')) {
      const [inventory] = await pool.query(
        `SELECT item_name, category, total_quantity, purchase_value, \`condition\`, location
         FROM inventory
         WHERE department_id = ?
         ORDER BY \`condition\` = 'Damaged' DESC, purchase_value DESC`,
        [departmentId]
      );

      const damaged = inventory.filter(i => i.condition === 'Damaged');
      const totalQty = inventory.reduce((acc, i) => acc + Number(i.total_quantity), 0);
      const totalVal = inventory.reduce((acc, i) => acc + Number(i.purchase_value), 0);

      responsePayload.answer = `Department inventory tracks **${inventory.length} asset items** (${totalQty} total units) valued at **Rs. ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 0 })}**. Currently, **${damaged.length} asset line(s)** (${damaged.reduce((a, d) => a + Number(d.total_quantity), 0)} units) are tagged as **Damaged** and require maintenance or replacement.`;
      responsePayload.metrics = [
        { label: 'Total Asset Valuation', value: `Rs. ${totalVal.toLocaleString()}`, color: 'emerald' },
        { label: 'Total Hardware Units', value: totalQty, color: 'blue' },
        { label: 'Damaged Units', value: damaged.reduce((a, d) => a + Number(d.total_quantity), 0), color: damaged.length > 0 ? 'rose' : 'emerald' }
      ];
      responsePayload.columns = ['Item Name', 'Category', 'Qty', 'Total Value (PKR)', 'Condition', 'Location'];
      responsePayload.data = inventory.map(i => [
        i.item_name,
        i.category,
        i.total_quantity.toString(),
        `Rs. ${Number(i.purchase_value).toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
        i.condition,
        i.location || 'Central Depot'
      ]);
      responsePayload.actionSuggestion = {
        label: 'Inspect Hardware Inventory',
        path: '/inventory'
      };
    }
    // General fallback: comprehensive pulse
    else {
      const [studentCountRows] = await pool.query(`SELECT COUNT(*) AS total FROM students WHERE department_id = ?`, [departmentId]);
      const studentCount = studentCountRows[0] || {};
      const [facultyCountRows] = await pool.query(`SELECT COUNT(*) AS total FROM faculty WHERE department_id = ?`, [departmentId]);
      const facultyCount = facultyCountRows[0] || {};
      const [revRows] = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM revenue WHERE department_id = ?`, [departmentId]);
      const rev = revRows[0] || {};
      const [expRows] = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE department_id = ?`, [departmentId]);
      const exp = expRows[0] || {};

      responsePayload.answer = `Department Intelligence Overview: The department is actively managing **${studentCount.total || 0} students**, **${facultyCount.total || 0} faculty members**, **Rs. ${Number(rev.total || 0).toLocaleString()} in revenue**, and **Rs. ${Number(exp.total || 0).toLocaleString()} in operating expenses**. Try asking a specific question about course capacity, faculty workloads, pending purchases, or damaged inventory!`;
      responsePayload.metrics = [
        { label: 'Enrolled Students', value: studentCount.total || 0, color: 'blue' },
        { label: 'Faculty Members', value: facultyCount.total || 0, color: 'purple' },
        { label: 'Net Fiscal Balance', value: `Rs. ${(Number(rev.total || 0) - Number(exp.total || 0)).toLocaleString()}`, color: 'emerald' }
      ];
      responsePayload.columns = ['Department Metric', 'Current Live Value', 'Status'];
      responsePayload.data = [
        ['Registered Students', (studentCount.total || 0).toString(), 'Active'],
        ['Teaching Faculty', (facultyCount.total || 0).toString(), 'Active'],
        ['Total Revenue', `Rs. ${Number(rev.total || 0).toLocaleString()}`, 'Recorded'],
        ['Total Expenses', `Rs. ${Number(exp.total || 0).toLocaleString()}`, 'Recorded']
      ];
    }


    res.json({
      success: true,
      data: responsePayload
    });
  } catch (error) {
    next(error);
  }
}
