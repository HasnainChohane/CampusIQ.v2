import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent
} from '../controllers/academicController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all academic routes with JWT authentication
router.use(authenticateToken);

// Students Endpoints
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students', requireRole('admin', 'officer'), createStudent);
router.put('/students/:id', requireRole('admin', 'officer'), updateStudent);
router.delete('/students/:id', requireRole('admin', 'officer'), deleteStudent);

// Faculty Endpoints
router.get('/faculty', getFaculty);
router.get('/faculty/:id', getFacultyById);
router.post('/faculty', requireRole('admin', 'officer'), createFaculty);
router.put('/faculty/:id', requireRole('admin', 'officer'), updateFaculty);
router.delete('/faculty/:id', requireRole('admin', 'officer'), deleteFaculty);

// Courses Endpoints
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.post('/courses', requireRole('admin', 'officer'), createCourse);
router.put('/courses/:id', requireRole('admin', 'officer'), updateCourse);
router.delete('/courses/:id', requireRole('admin', 'officer'), deleteCourse);
router.post('/courses/:id/enroll', requireRole('admin', 'officer'), enrollStudent);

export default router;
