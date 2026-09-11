import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Calendar, 
  MapPin, 
  Layers, 
  Award, 
  Laptop, 
  Clock, 
  UserCheck,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AcademicPage() {
  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'officer';

  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);

  // Filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentProgram, setStudentProgram] = useState('all');
  const [studentSemester, setStudentSemester] = useState('all');
  const [studentStatus, setStudentStatus] = useState('all');

  const [facultySearch, setFacultySearch] = useState('');
  const [facultyDesignation, setFacultyDesignation] = useState('all');

  const [courseSearch, setCourseSearch] = useState('');
  const [courseSemester, setCourseSemester] = useState('all');

  // Modal / Detail states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [enrollModalCourse, setEnrollModalCourse] = useState(null);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');

  // Form states
  const [studentForm, setStudentForm] = useState({
    student_id: '',
    name: '',
    email: '',
    program: 'BS Computer Science',
    semester: 1,
    gpa: '3.50',
    status: 'active',
    phone: ''
  });

  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    designation: 'Assistant Professor',
    office: 'Room B-300',
    max_workload: 12,
    current_workload: 0
  });

  const [courseForm, setCourseForm] = useState({
    course_code: '',
    name: '',
    credit_hours: 3,
    instructor_id: '',
    semester: 'Fall 2026',
    room: 'Hall B-201',
    schedule: 'Mon/Wed 10:00 - 11:30',
    max_enrollment: 40
  });

  // Load students
  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search: studentSearch,
        program: studentProgram,
        semester: studentSemester,
        status: studentStatus
      });
      if (res.success) setStudents(res.data.students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load faculty
  const loadFaculty = async () => {
    setLoading(true);
    try {
      const res = await api.getFaculty({
        search: facultySearch,
        designation: facultyDesignation
      });
      if (res.success) setFaculty(res.data.faculty);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load courses
  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getCourses({
        search: courseSearch,
        semester: courseSemester
      });
      if (res.success) setCourses(res.data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') loadStudents();
    else if (activeTab === 'faculty') loadFaculty();
    else if (activeTab === 'courses') loadCourses();
  }, [activeTab, studentSearch, studentProgram, studentSemester, studentStatus, facultySearch, facultyDesignation, courseSearch, courseSemester]);

  // View Student details
  const handleViewStudent = async (id) => {
    try {
      const res = await api.getStudentById(id);
      if (res.success) setSelectedStudent(res.data.student);
    } catch (err) {
      alert(err.message);
    }
  };

  // View Faculty details
  const handleViewFaculty = async (id) => {
    try {
      const res = await api.getFacultyById(id);
      if (res.success) setSelectedFaculty(res.data.faculty);
    } catch (err) {
      alert(err.message);
    }
  };

  // View Course details
  const handleViewCourse = async (id) => {
    try {
      const res = await api.getCourseById(id);
      if (res.success) setSelectedCourse(res.data.course);
    } catch (err) {
      alert(err.message);
    }
  };

  // Save student
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, studentForm);
      } else {
        await api.createStudent(studentForm);
      }
      setStudentModalOpen(false);
      setEditingStudent(null);
      loadStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await api.deleteStudent(id);
        loadStudents();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Save faculty
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await api.updateFaculty(editingFaculty.id, facultyForm);
      } else {
        await api.createFaculty(facultyForm);
      }
      setFacultyModalOpen(false);
      setEditingFaculty(null);
      loadFaculty();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete faculty
  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.deleteFaculty(id);
        loadFaculty();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Save course
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, courseForm);
      } else {
        await api.createCourse(courseForm);
      }
      setCourseModalOpen(false);
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.deleteCourse(id);
        loadCourses();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Quick enroll student
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentToEnroll || !enrollModalCourse) return;
    try {
      await api.enrollStudent(enrollModalCourse.id, { student_id: selectedStudentToEnroll });
      alert('Student successfully enrolled!');
      setEnrollModalCourse(null);
      setSelectedStudentToEnroll('');
      loadCourses();
      if (selectedCourse?.id === enrollModalCourse.id) {
        handleViewCourse(enrollModalCourse.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Academic Module
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Centralized registry for students, faculty workload management, and course enrollments.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'students' ? '#ffffff' : 'transparent',
              color: activeTab === 'students' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'students' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <GraduationCap size={15} />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('faculty')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'faculty' ? '#ffffff' : 'transparent',
              color: activeTab === 'faculty' ? '#6366f1' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'faculty' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Users size={15} />
            <span>Faculty ({faculty.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'courses' ? '#ffffff' : 'transparent',
              color: activeTab === 'courses' ? '#8b5cf6' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'courses' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <BookOpen size={15} />
            <span>Courses ({courses.length})</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. STUDENTS TAB */}
      {/* =================================================================== */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action & Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search by name, ID or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <select
                  value={studentProgram}
                  onChange={(e) => setStudentProgram(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  <option value="all">All Programs</option>
                  <option value="BS Computer Science">BS Computer Science</option>
                  <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                  <option value="BS Software Engineering">BS Software Engineering</option>
                </select>

                <select
                  value={studentSemester}
                  onChange={(e) => setStudentSemester(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  <option value="all">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>

                <select
                  value={studentStatus}
                  onChange={(e) => setStudentStatus(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({
                      student_id: `STU-2024-${String(students.length + 1).padStart(3, '0')}`,
                      name: '',
                      email: '',
                      program: 'BS Computer Science',
                      semester: 1,
                      gpa: '3.50',
                      status: 'active',
                      phone: ''
                    });
                    setStudentModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add Student</span>
                </button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Program</th>
                    <th>Semester</th>
                    <th>GPA</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--primary)' }}>
                          {st.student_id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{st.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{st.program}</span>
                      </td>
                      <td>Sem {st.semester}</td>
                      <td>
                        <span className={`badge ${
                          parseFloat(st.gpa) >= 3.5 ? 'badge-success' :
                          parseFloat(st.gpa) >= 3.0 ? 'badge-primary' : 'badge-warning'
                        }`} style={{ fontFamily: 'var(--font-mono)' }}>
                          {parseFloat(st.gpa).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          st.status === 'active' ? 'badge-success' :
                          st.status === 'graduated' ? 'badge-primary' : 'badge-danger'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {st.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleViewStudent(st.id)}
                            title="View Enrolled Courses"
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Eye size={14} />
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingStudent(st);
                                  setStudentForm({
                                    student_id: st.student_id,
                                    name: st.name,
                                    email: st.email,
                                    program: st.program,
                                    semester: st.semester,
                                    gpa: st.gpa,
                                    status: st.status,
                                    phone: st.phone || ''
                                  });
                                  setStudentModalOpen(true);
                                }}
                                title="Edit Student"
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st.id)}
                                title="Delete Student"
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No students found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. FACULTY TAB */}
      {/* =================================================================== */}
      {activeTab === 'faculty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action & Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search faculty by name, office or email..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <select
                  value={facultyDesignation}
                  onChange={(e) => setFacultyDesignation(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  <option value="all">All Designations</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingFaculty(null);
                    setFacultyForm({
                      name: '',
                      email: '',
                      designation: 'Assistant Professor',
                      office: 'Room B-300',
                      max_workload: 12,
                      current_workload: 0
                    });
                    setFacultyModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add Faculty Member</span>
                </button>
              )}
            </div>
          </div>

          {/* Faculty Grid Cards */}
          <div className="grid-2">
            {faculty.map((f) => {
              const workloadPct = Math.round((f.current_workload / f.max_workload) * 100);
              const isOverloaded = f.current_workload >= f.max_workload;

              return (
                <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                          {f.name}
                        </h3>
                        <span className="badge badge-primary" style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>
                          {f.designation}
                        </span>
                      </div>

                      {isOverloaded ? (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                          <AlertTriangle size={12} /> Workload Cap Reached
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> Available Capacity
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Office:</span> <strong style={{ color: 'var(--text-main)' }}>{f.office}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Email:</span> <span style={{ color: 'var(--primary)' }}>{f.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Assigned Courses:</span> <strong style={{ color: 'var(--text-main)' }}>{f.assigned_courses_count} courses</strong>
                      </div>
                    </div>

                    {/* Workload Meter */}
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        <span>Teaching Workload</span>
                        <span style={{ color: isOverloaded ? 'var(--danger)' : 'var(--text-main)' }}>
                          {f.current_workload} / {f.max_workload} Credit Hours ({workloadPct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, workloadPct)}%`,
                          height: '100%',
                          background: isOverloaded ? '#ef4444' : workloadPct > 70 ? '#f59e0b' : '#3b82f6',
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => handleViewFaculty(f.id)}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} />
                      <span>View Courses & Assets</span>
                    </button>

                    {canManage && (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setEditingFaculty(f);
                            setFacultyForm({
                              name: f.name,
                              email: f.email,
                              designation: f.designation,
                              office: f.office,
                              max_workload: f.max_workload,
                              current_workload: f.current_workload
                            });
                            setFacultyModalOpen(true);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(f.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. COURSES TAB */}
      {/* =================================================================== */}
      {activeTab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action & Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search by code, title or room..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <select
                  value={courseSemester}
                  onChange={(e) => setCourseSemester(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  <option value="all">All Semesters</option>
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Spring 2026">Spring 2026</option>
                </select>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({
                      course_code: '',
                      name: '',
                      credit_hours: 3,
                      instructor_id: faculty[0]?.id || '',
                      semester: 'Fall 2026',
                      room: 'Hall B-201',
                      schedule: 'Mon/Wed 10:00 - 11:30',
                      max_enrollment: 40
                    });
                    setCourseModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add New Course</span>
                </button>
              )}
            </div>
          </div>

          {/* Courses Catalog Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Title</th>
                    <th>Instructor</th>
                    <th>Credits</th>
                    <th>Schedule & Room</th>
                    <th>Capacity / Enrolled</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => {
                    const fillPct = Math.round((c.enrollment_count / c.max_enrollment) * 100);
                    const isNearFull = fillPct >= 90;

                    return (
                      <tr key={c.id}>
                        <td>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontWeight: 700, 
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            {c.course_code}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.semester}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.instructor_name || 'Unassigned'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.instructor_designation}</div>
                        </td>
                        <td>{c.credit_hours} Cr.</td>
                        <td>
                          <div style={{ fontSize: '0.825rem' }}>{c.schedule}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.room}</div>
                        </td>
                        <td style={{ minWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span>{c.enrollment_count} / {c.max_enrollment}</span>
                            <span style={{ fontWeight: 600, color: isNearFull ? 'var(--danger)' : 'var(--text-muted)' }}>{fillPct}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, fillPct)}%`,
                              height: '100%',
                              background: isNearFull ? '#ef4444' : '#6366f1',
                              borderRadius: 'var(--radius-full)'
                            }} />
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleViewCourse(c.id)}
                              title="View Enrolled Roster"
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Eye size={14} />
                            </button>

                            {canManage && (
                              <>
                                <button
                                  onClick={() => {
                                    setEnrollModalCourse(c);
                                  }}
                                  title="Enroll Student"
                                  className="btn btn-outline"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)' }}
                                >
                                  <UserCheck size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCourse(c);
                                    setCourseForm({
                                      course_code: c.course_code,
                                      name: c.name,
                                      credit_hours: c.credit_hours,
                                      instructor_id: c.instructor_id || '',
                                      semester: c.semester,
                                      room: c.room,
                                      schedule: c.schedule,
                                      max_enrollment: c.max_enrollment
                                    });
                                    setCourseModalOpen(true);
                                  }}
                                  title="Edit Course"
                                  className="btn btn-outline"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(c.id)}
                                  title="Delete Course"
                                  className="btn btn-outline"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALS & DRAWERS */}
      {/* =================================================================== */}

      {/* 1. Student Detail Modal */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div>
                <span className="badge badge-primary">{selectedStudent.student_id}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.25rem' }}>{selectedStudent.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedStudent.email} • {selectedStudent.program}</div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Enrolled Courses ({selectedStudent.enrollments?.length || 0})</h4>
              {selectedStudent.enrollments?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedStudent.enrollments.map((enr) => (
                    <div key={enr.enrollment_id} style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{enr.course_code}</strong>: {enr.course_name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Instructor: {enr.instructor_name || 'N/A'} • {enr.schedule} • {enr.room}
                        </div>
                      </div>
                      <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        Grade: {enr.grade || 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', background: '#f8fafc', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                  Student is not currently enrolled in any courses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Faculty Detail Modal */}
      {selectedFaculty && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div>
                <span className="badge badge-primary">{selectedFaculty.designation}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.25rem' }}>{selectedFaculty.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Office: {selectedFaculty.office} • {selectedFaculty.email}</div>
              </div>
              <button onClick={() => setSelectedFaculty(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Assigned Teaching Courses</h4>
                {selectedFaculty.courses?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedFaculty.courses.map(c => (
                      <div key={c.id} style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{c.course_code}: {c.name}</strong> ({c.credit_hours} Cr.)
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.schedule} • {c.room}</div>
                        </div>
                        <span className="badge badge-primary">{c.enrollment_count} Students</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No courses assigned for this semester.</div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Assigned Hardware & Assets</h4>
                {selectedFaculty.assignedAssets?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedFaculty.assignedAssets.map(a => (
                      <div key={a.assignment_id} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{a.item_name}</strong> (Qty: {a.quantity})
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {a.category} • Location: {a.location}</div>
                        </div>
                        <span className="badge badge-success">Active Assignment</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No specific physical assets assigned.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Course Roster Detail Modal */}
      {selectedCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div>
                <span className="badge badge-primary">{selectedCourse.course_code}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.25rem' }}>{selectedCourse.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Instructor: {selectedCourse.instructor_name || 'Unassigned'} • Room: {selectedCourse.room} • {selectedCourse.schedule}
                </div>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  Enrolled Students ({selectedCourse.enrolledStudents?.length || 0} / {selectedCourse.max_enrollment})
                </h4>
                {canManage && (
                  <button
                    onClick={() => {
                      setEnrollModalCourse(selectedCourse);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={14} />
                    <span>Enroll Student</span>
                  </button>
                )}
              </div>

              {selectedCourse.enrolledStudents?.length > 0 ? (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Program</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourse.enrolledStudents.map(st => (
                        <tr key={st.enrollment_id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{st.student_id}</td>
                          <td><strong>{st.name}</strong></td>
                          <td>{st.program}</td>
                          <td><span className="badge badge-success">{st.grade || 'In Progress'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                  No students currently enrolled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Student Create / Edit Modal Form */}
      {studentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingStudent ? 'Edit Student Record' : 'Add New Student'}</h3>
              <button onClick={() => setStudentModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Student ID</label>
                <input
                  type="text"
                  required
                  value={studentForm.student_id}
                  onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Program</label>
                  <select
                    value={studentForm.program}
                    onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                    <option value="BS Software Engineering">BS Software Engineering</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    value={studentForm.gpa}
                    onChange={(e) => setStudentForm({ ...studentForm, gpa: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Status</label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStudentModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingStudent ? 'Save Changes' : 'Create Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Faculty Create / Edit Modal Form */}
      {facultyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingFaculty ? 'Edit Faculty Record' : 'Add Faculty Member'}</h3>
              <button onClick={() => setFacultyModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Name</label>
                <input
                  type="text"
                  required
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email</label>
                <input
                  type="email"
                  required
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Designation</label>
                  <select
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="Professor & Chair">Professor & Chair</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Office Room</label>
                  <input
                    type="text"
                    required
                    value={facultyForm.office}
                    onChange={(e) => setFacultyForm({ ...facultyForm, office: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Max Workload (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={facultyForm.max_workload}
                    onChange={(e) => setFacultyForm({ ...facultyForm, max_workload: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Current Workload</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={facultyForm.current_workload}
                    onChange={(e) => setFacultyForm({ ...facultyForm, current_workload: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setFacultyModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingFaculty ? 'Save Changes' : 'Create Faculty'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Course Create / Edit Modal Form */}
      {courseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingCourse ? 'Edit Course Details' : 'Add New Course'}</h3>
              <button onClick={() => setCourseModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseForm.course_code}
                    onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                    placeholder="CS501"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Instructor</label>
                  <select
                    value={courseForm.instructor_id}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="">Unassigned</option>
                    {faculty.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credit_hours}
                    onChange={(e) => setCourseForm({ ...courseForm, credit_hours: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Room</label>
                  <input
                    type="text"
                    required
                    value={courseForm.room}
                    onChange={(e) => setCourseForm({ ...courseForm, room: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Max Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={courseForm.max_enrollment}
                    onChange={(e) => setCourseForm({ ...courseForm, max_enrollment: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Schedule</label>
                <input
                  type="text"
                  required
                  value={courseForm.schedule}
                  onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
                  placeholder="Mon/Wed 14:00 - 15:30"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setCourseModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCourse ? 'Save Changes' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Enroll Student Quick Modal */}
      {enrollModalCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Enroll Student</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course: {enrollModalCourse.course_code} - {enrollModalCourse.name}</div>
              </div>
              <button onClick={() => setEnrollModalCourse(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select Student</label>
                <select
                  required
                  value={selectedStudentToEnroll}
                  onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  <option value="">-- Choose a student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.student_id} - {s.name} ({s.program})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEnrollModalCourse(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
