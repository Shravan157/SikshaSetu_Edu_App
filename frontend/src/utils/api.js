import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password?token=${token}&newPassword=${newPassword}`),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (userData) => api.put('/users/me', userData),
  changePassword: (oldPassword, newPassword) => api.post(`/users/change-password?oldPassword=${oldPassword}&newPassword=${newPassword}`),
  changeUserRole: (userId, role) => api.put(`/users/${userId}/role?role=${role}`),
};

// Student API
export const studentAPI = {
  getAllStudents: (params = {}) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

// Faculty API
export const facultyAPI = {
  getAllFaculties: () => api.get('/faculties'),
  getFacultyById: (id) => api.get(`/faculties/${id}`),
  createFaculty: (facultyData) => api.post('/faculties', facultyData),
  updateFaculty: (id, facultyData) => api.put(`/faculties/${id}`, facultyData),
  deleteFaculty: (id) => api.delete(`/faculties/${id}`),
};

// Branch API
export const branchAPI = {
  getAllBranches: () => api.get('/branches'),
  getBranchById: (id) => api.get(`/branches/${id}`),
  createBranch: (branchData) => api.post('/branches', branchData),
  updateBranch: (id, branchData) => api.put(`/branches/${id}`, branchData),
  deleteBranch: (id) => api.delete(`/branches/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getAllAttendance: (params = {}) => api.get('/attendance', { params }),
  getAttendanceById: (id) => api.get(`/attendance/${id}`),
  getMyAttendance: () => api.get('/attendance/my'),
  getAttendanceByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  createAttendance: (attendanceData) => api.post('/attendance', attendanceData),
  updateAttendance: (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
  markBulkAttendance: (attendanceList) => api.post('/attendance/mark', attendanceList),
};

// Notification API
export const notificationAPI = {
  getAllNotifications: () => api.get('/notifications'),
  getNotificationById: (id) => api.get(`/notifications/${id}`),
  getMyNotifications: (params = {}) => api.get('/notifications/my', { params }),
  createNotification: (notificationData) => api.post('/notifications', notificationData),
  updateNotification: (id, notificationData) => api.put(`/notifications/${id}`, notificationData),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/mark-read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

// Event API
export const eventAPI = {
  getAllEvents: (params = {}) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });
    return api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateEvent: (id, eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });
    return api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteEvent: (id) => api.delete(`/events/${id}`),
  downloadAttachment: (id) => api.get(`/events/attachment/${id}`, { responseType: 'blob' }),
};

// Note API
export const noteAPI = {
  getAllNotes: () => api.get('/notes'),
  getNoteById: (id) => api.get(`/notes/${id}`),
  createNote: (noteData) => {
    const formData = new FormData();
    Object.keys(noteData).forEach(key => {
      if (noteData[key] !== null && noteData[key] !== undefined) {
        formData.append(key, noteData[key]);
      }
    });
    return api.post('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateNote: (id, noteData) => {
    const formData = new FormData();
    Object.keys(noteData).forEach(key => {
      if (noteData[key] !== null && noteData[key] !== undefined) {
        formData.append(key, noteData[key]);
      }
    });
    return api.put(`/notes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteNote: (id) => api.delete(`/notes/${id}`),
  downloadAttachment: (id) => api.get(`/notes/attachment/${id}`, { responseType: 'blob' }),
};

// Result API
export const resultAPI = {
  getAllResults: () => api.get('/results'),
  getResultById: (id) => api.get(`/results/${id}`),
  getResultsByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  createResult: (resultData) => api.post('/results', resultData),
  updateResult: (id, resultData) => api.put(`/results/${id}`, resultData),
  deleteResult: (id) => api.delete(`/results/${id}`),
};

// Chatbot API
export const chatbotAPI = {
  askQuestion: (message) => api.post('/chatbot/ask', { message }),
  clearChat: () => api.post('/chatbot/clear'),
};

// File Upload API
export const fileAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Video Session API
export const videoSessionAPI = {
  createSession: (sessionData) => api.post('/video-sessions', sessionData),
  getTeacherSessions: (teacherId) => api.get(`/video-sessions/teacher/${teacherId}`),
  getSessionDetails: (roomId) => api.get(`/video-sessions/${roomId}`),
  joinSession: (roomId) => api.post(`/video-sessions/${roomId}/join`),
  startSession: (roomId) => api.post(`/video-sessions/${roomId}/start`),
  endSession: (roomId) => api.post(`/video-sessions/${roomId}/end`),
  generateZegoToken: (tokenRequest) => api.post('/video-sessions/zego/token', tokenRequest),
};

// PDF Export API
export const pdfAPI = {
  exportStudents: () => api.get('/pdf/students', { responseType: 'blob' }),
};

export default api;