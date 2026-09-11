const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Standard fetch helper with JSON response and Bearer token handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('dphub_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // System Health
  getSystemHealth: () => request('/health'),
  getDatabaseHealth: () => request('/health/db'),

  // Authentication
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),

  // Dashboard Metrics & Charts
  getDashboardStats: () => request('/dashboard/stats'),

  // Academic Module - Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/academic/students${query ? `?${query}` : ''}`);
  },
  getStudentById: (id) => request(`/academic/students/${id}`),
  createStudent: (data) => request('/academic/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/academic/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => request(`/academic/students/${id}`, { method: 'DELETE' }),

  // Academic Module - Faculty
  getFaculty: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/academic/faculty${query ? `?${query}` : ''}`);
  },
  getFacultyById: (id) => request(`/academic/faculty/${id}`),
  createFaculty: (data) => request('/academic/faculty', { method: 'POST', body: JSON.stringify(data) }),
  updateFaculty: (id, data) => request(`/academic/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFaculty: (id) => request(`/academic/faculty/${id}`, { method: 'DELETE' }),

  // Academic Module - Courses & Enrollments
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/academic/courses${query ? `?${query}` : ''}`);
  },
  getCourseById: (id) => request(`/academic/courses/${id}`),
  createCourse: (data) => request('/academic/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data) => request(`/academic/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id) => request(`/academic/courses/${id}`, { method: 'DELETE' }),
  enrollStudent: (courseId, data) => request(`/academic/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify(data) }),

  // Operations & Inventory Module
  getInventory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory${query ? `?${query}` : ''}`);
  },
  getInventoryStats: () => request('/inventory/stats'),
  getInventoryById: (id) => request(`/inventory/${id}`),
  createInventoryItem: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryItem: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInventoryItem: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
  assignInventoryItem: (id, data) => request(`/inventory/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  returnInventoryAssignment: (assignmentId) => request(`/inventory/assignments/${assignmentId}/return`, { method: 'PUT' }),

  // Requests & Approval Workflow
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/requests${query ? `?${query}` : ''}`);
  },
  getRequestStats: () => request('/requests/stats'),
  getRequestById: (id) => request(`/requests/${id}`),
  createRequest: (data) => request('/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequestStatus: (id, data) => request(`/requests/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),
  addRequestComment: (id, data) => request(`/requests/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  analyzeRequest: (data) => request('/requests/analyze', { method: 'POST', body: JSON.stringify(data) }),

  // Finance & Budget Module
  getFinanceOverview: () => request('/finance/overview'),
  getRevenues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/finance/revenue${query ? `?${query}` : ''}`);
  },
  createRevenue: (data) => request('/finance/revenue', { method: 'POST', body: JSON.stringify(data) }),
  updateRevenue: (id, data) => request(`/finance/revenue/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRevenue: (id) => request(`/finance/revenue/${id}`, { method: 'DELETE' }),
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/finance/expenses${query ? `?${query}` : ''}`);
  },
  createExpense: (data) => request('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/finance/expenses/${id}`, { method: 'DELETE' }),
  getBudgets: () => request('/finance/budgets'),
  createBudget: (data) => request('/finance/budgets', { method: 'POST', body: JSON.stringify(data) }),
  getRevenueGoals: () => request('/finance/goals'),
  createRevenueGoal: (data) => request('/finance/goals', { method: 'POST', body: JSON.stringify(data) }),

  // Reports & PDF Module
  getReports: () => request('/reports'),
  getReportById: (id) => request(`/reports/${id}`),
  generateReport: (data) => request('/reports/generate', { method: 'POST', body: JSON.stringify(data) }),

  // AI Assistant & Grounded Q&A
  getAiSuggestions: () => request('/ai/suggestions'),
  queryAi: (data) => request('/ai/query', { method: 'POST', body: JSON.stringify(data) })
};

export default api;

