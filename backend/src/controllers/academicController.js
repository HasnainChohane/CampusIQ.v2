import { pool } from '../db/connection.js';

// ===================================================================
// STUDENTS CONTROLLERS
// ===================================================================

/**
 * GET /api/academic/students
 * List students with search, program, semester, and status filtering
 */
export async function getStudents(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search, program, semester, status } = req.query;

    let query = `SELECT id, student_id, name, email, program, semester, gpa, status, phone, created_at 
                 FROM students 
                 WHERE department_id = ?`;
    const params = [departmentId];

    if (search) {
      query += ` AND (name LIKE ? OR student_id LIKE ? OR email LIKE ?)`;
      const searchWild = `%${search.trim()}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (program && program !== 'all') {
      query += ` AND program = ?`;
      params.push(program);
    }

    if (semester && semester !== 'all') {
      query += ` AND semester = ?`;
      params.push(parseInt(semester, 10));
    }

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY student_id ASC`;

    const [students] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        students,
        total: students.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/academic/students/:id
 * Retrieve single student details and list of enrolled courses
 */
export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [students] = await pool.query(
      `SELECT * FROM students WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Student not found.' }
      });
    }

    const student = students[0];

    // Fetch enrolled courses
    const [enrollments] = await pool.query(
      `SELECT e.id as enrollment_id, e.grade, e.semester, e.enrolled_at,
              c.id as course_id, c.course_code, c.name as course_name, c.credit_hours, c.room, c.schedule,
              f.name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN faculty f ON c.instructor_id = f.id
       WHERE e.student_id = ?
       ORDER BY c.course_code ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        student: {
          ...student,
          enrollments
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/academic/students
 * Create a new student record
 */
export async function createStudent(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { student_id, name, email, program, semester, gpa, status, phone } = req.body;

    if (!student_id || !name || !email || !program) {
      return res.status(400).json({
        success: false,
        error: { message: 'Student ID, Name, Email, and Program are required fields.' }
      });
    }

    // Check duplicate student_id or email
    const [existing] = await pool.query(
      `SELECT id FROM students WHERE student_id = ? OR email = ?`,
      [student_id.trim(), email.trim().toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'A student with this Student ID or Email already exists.' }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO students (department_id, student_id, name, email, program, semester, gpa, status, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        departmentId,
        student_id.trim().toUpperCase(),
        name.trim(),
        email.trim().toLowerCase(),
        program,
        parseInt(semester || 1, 10),
        parseFloat(gpa || 0.00),
        status || 'active',
        phone || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/academic/students/:id
 * Update student record
 */
export async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const { name, email, program, semester, gpa, status, phone } = req.body;

    const [result] = await pool.query(
      `UPDATE students 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           program = COALESCE(?, program),
           semester = COALESCE(?, semester),
           gpa = COALESCE(?, gpa),
           status = COALESCE(?, status),
           phone = COALESCE(?, phone)
       WHERE id = ? AND department_id = ?`,
      [name, email, program, semester, gpa, status, phone, id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Student not found or no changes applied.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/academic/students/:id
 * Delete student record
 */
export async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [result] = await pool.query(
      `DELETE FROM students WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Student not found.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// ===================================================================
// FACULTY CONTROLLERS
// ===================================================================

/**
 * GET /api/academic/faculty
 * List faculty with search and designation filter
 */
export async function getFaculty(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search, designation } = req.query;

    let query = `SELECT f.id, f.name, f.email, f.designation, f.office, f.max_workload, f.current_workload, f.created_at,
                        COUNT(c.id) as assigned_courses_count
                 FROM faculty f
                 LEFT JOIN courses c ON f.id = c.instructor_id
                 WHERE f.department_id = ?`;
    const params = [departmentId];

    if (search) {
      query += ` AND (f.name LIKE ? OR f.email LIKE ? OR f.office LIKE ?)`;
      const searchWild = `%${search.trim()}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (designation && designation !== 'all') {
      query += ` AND f.designation = ?`;
      params.push(designation);
    }

    query += ` GROUP BY f.id ORDER BY f.name ASC`;

    const [facultyList] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        faculty: facultyList,
        total: facultyList.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/academic/faculty/:id
 * Faculty detail with assigned courses, assigned inventory assets, and requests
 */
export async function getFacultyById(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [facultyRows] = await pool.query(
      `SELECT * FROM faculty WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (facultyRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Faculty member not found.' }
      });
    }

    const facultyMember = facultyRows[0];

    // Assigned courses
    const [courses] = await pool.query(
      `SELECT id, course_code, name, credit_hours, semester, room, schedule, enrollment_count, max_enrollment 
       FROM courses 
       WHERE instructor_id = ? 
       ORDER BY course_code ASC`,
      [id]
    );

    // Assigned inventory (if user_id linked)
    let assignedAssets = [];
    if (facultyMember.user_id) {
      const [assets] = await pool.query(
        `SELECT ia.id as assignment_id, ia.quantity, ia.assigned_date, ia.status,
                i.item_name, i.category, i.condition, i.location
         FROM inventory_assignments ia
         JOIN inventory i ON ia.inventory_id = i.id
         WHERE ia.assigned_to_user_id = ? AND ia.status = 'active'`,
        [facultyMember.user_id]
      );
      assignedAssets = assets;
    }

    res.status(200).json({
      success: true,
      data: {
        faculty: {
          ...facultyMember,
          courses,
          assignedAssets
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/academic/faculty
 * Create a new faculty member
 */
export async function createFaculty(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { name, email, designation, office, max_workload, current_workload } = req.body;

    if (!name || !email || !designation || !office) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name, Email, Designation, and Office are required.' }
      });
    }

    const [existing] = await pool.query(`SELECT id FROM faculty WHERE email = ?`, [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'A faculty member with this email already exists.' }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO faculty (department_id, name, email, designation, office, max_workload, current_workload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        departmentId,
        name.trim(),
        email.trim().toLowerCase(),
        designation,
        office.trim(),
        parseInt(max_workload || 12, 10),
        parseInt(current_workload || 0, 10)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/academic/faculty/:id
 */
export async function updateFaculty(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const { name, email, designation, office, max_workload, current_workload } = req.body;

    const [result] = await pool.query(
      `UPDATE faculty 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           designation = COALESCE(?, designation),
           office = COALESCE(?, office),
           max_workload = COALESCE(?, max_workload),
           current_workload = COALESCE(?, current_workload)
       WHERE id = ? AND department_id = ?`,
      [name, email, designation, office, max_workload, current_workload, id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Faculty not found or no changes made.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty member updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/academic/faculty/:id
 */
export async function deleteFaculty(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [result] = await pool.query(
      `DELETE FROM faculty WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Faculty member not found.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty member deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// ===================================================================
// COURSES CONTROLLERS
// ===================================================================

/**
 * GET /api/academic/courses
 * List courses with instructor info, enrollments, and filters
 */
export async function getCourses(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { search, semester, instructor_id } = req.query;

    let query = `SELECT c.id, c.course_code, c.name, c.credit_hours, c.instructor_id, c.semester, c.room, c.schedule,
                        c.max_enrollment, c.enrollment_count,
                        f.name as instructor_name, f.email as instructor_email, f.designation as instructor_designation
                 FROM courses c
                 LEFT JOIN faculty f ON c.instructor_id = f.id
                 WHERE c.department_id = ?`;
    const params = [departmentId];

    if (search) {
      query += ` AND (c.course_code LIKE ? OR c.name LIKE ? OR c.room LIKE ?)`;
      const searchWild = `%${search.trim()}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (semester && semester !== 'all') {
      query += ` AND c.semester = ?`;
      params.push(semester);
    }

    if (instructor_id && instructor_id !== 'all') {
      query += ` AND c.instructor_id = ?`;
      params.push(parseInt(instructor_id, 10));
    }

    query += ` ORDER BY c.course_code ASC`;

    const [courses] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        courses,
        total: courses.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/academic/courses/:id
 * Course details with instructor and enrolled student roster
 */
export async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [courseRows] = await pool.query(
      `SELECT c.*, f.name as instructor_name, f.email as instructor_email, f.designation as instructor_designation, f.office as instructor_office
       FROM courses c
       LEFT JOIN faculty f ON c.instructor_id = f.id
       WHERE c.id = ? AND c.department_id = ?`,
      [id, departmentId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found.' }
      });
    }

    const course = courseRows[0];

    // Enrolled students roster
    const [enrolledStudents] = await pool.query(
      `SELECT e.id as enrollment_id, e.grade, e.enrolled_at,
              s.id as student_id_pk, s.student_id, s.name, s.email, s.program, s.semester, s.gpa
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.course_id = ?
       ORDER BY s.name ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        course: {
          ...course,
          enrolledStudents
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/academic/courses
 * Create course
 */
export async function createCourse(req, res, next) {
  try {
    const departmentId = req.user?.department_id || 1;
    const { course_code, name, credit_hours, instructor_id, semester, room, schedule, max_enrollment } = req.body;

    if (!course_code || !name || !semester || !room || !schedule) {
      return res.status(400).json({
        success: false,
        error: { message: 'Course Code, Name, Semester, Room, and Schedule are required.' }
      });
    }

    const [existing] = await pool.query(`SELECT id FROM courses WHERE course_code = ?`, [course_code.trim().toUpperCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'A course with this course code already exists.' }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (department_id, course_code, name, credit_hours, instructor_id, semester, room, schedule, max_enrollment, enrollment_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        departmentId,
        course_code.trim().toUpperCase(),
        name.trim(),
        parseInt(credit_hours || 3, 10),
        instructor_id || null,
        semester.trim(),
        room.trim(),
        schedule.trim(),
        parseInt(max_enrollment || 40, 10)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/academic/courses/:id
 */
export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;
    const { name, credit_hours, instructor_id, semester, room, schedule, max_enrollment } = req.body;

    const [result] = await pool.query(
      `UPDATE courses 
       SET name = COALESCE(?, name),
           credit_hours = COALESCE(?, credit_hours),
           instructor_id = ?,
           semester = COALESCE(?, semester),
           room = COALESCE(?, room),
           schedule = COALESCE(?, schedule),
           max_enrollment = COALESCE(?, max_enrollment)
       WHERE id = ? AND department_id = ?`,
      [name, credit_hours, instructor_id, semester, room, schedule, max_enrollment, id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found or no changes made.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/academic/courses/:id
 */
export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const departmentId = req.user?.department_id || 1;

    const [result] = await pool.query(
      `DELETE FROM courses WHERE id = ? AND department_id = ?`,
      [id, departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found.' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/academic/courses/:id/enroll
 * Enroll student into course and update enrollment_count
 */
export async function enrollStudent(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const courseId = req.params.id;
    const { student_id, semester } = req.body;

    if (!student_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: { message: 'student_id is required for enrollment.' }
      });
    }

    // Check course capacity
    const [[course]] = await connection.query(`SELECT enrollment_count, max_enrollment, semester FROM courses WHERE id = ? FOR UPDATE`, [courseId]);
    if (!course) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: { message: 'Course not found.' } });
    }

    if (course.enrollment_count >= course.max_enrollment) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: { message: 'Course has reached maximum enrollment capacity.' } });
    }

    // Insert enrollment
    await connection.query(
      `INSERT INTO enrollments (student_id, course_id, semester) VALUES (?, ?, ?)`,
      [student_id, courseId, semester || course.semester]
    );

    // Increment count
    await connection.query(`UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?`, [courseId]);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully.'
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: { message: 'Student is already enrolled in this course.' } });
    }
    next(error);
  } finally {
    connection.release();
  }
}
