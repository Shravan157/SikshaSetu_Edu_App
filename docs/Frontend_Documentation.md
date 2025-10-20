# SikshaSetu Frontend – Detailed, Line-by-Line Documentation (Part 1)

This document explains the frontend codebase line-by-line for the core architecture. It covers the app shell, routing, authentication context, HTTP client, and core guards. Subsequent parts will document layout components and every page in similar depth.

Contents
- public/index.html
- src/index.js
- src/App.js
- src/contexts/AuthContext.js
- src/utils/api.js
- src/components/common/ProtectedRoute.js
- src/components/common/DashboardRedirect.js

Tip: When reading, keep the file open side-by-side so you can cross-check line numbers.


---

## public/index.html

```html path=C:\Users\Shravan\Desktop\CollegePortal\frontend\public\index.html start=1
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/logo.png" type="image/png" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#2563eb" />
    <meta
      name="description"
      content="SikshaSetu - Comprehensive student management system"
    />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>SikshaSetu</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

Explanation
- 1: Declares HTML5 document type.
- 2: Opens HTML with English language attribute.
- 4: Sets UTF-8 character encoding so text renders correctly.
- 5–6: Favicon and Apple touch icon references. %PUBLIC_URL% is replaced by CRA during build.
- 7: Responsive viewport meta for mobile scaling.
- 8: Theme color for PWA-like UI (affects Android status bar tint).
- 9–12: SEO description meta tag.
- 13: Manifest file for PWA capabilities (name, icons, etc.).
- 14–16: Preconnect to Google Fonts servers and load the Inter font family.
- 17: Document title.
- 20: noscript fallback message.
- 21: The React app mounts into this div via ReactDOM.createRoot(..., 'root').

Why
- Single-page app root container; all React-rendered UI attaches to #root.
- Progressive enhancement via manifest and theme color; font loading performance via preconnect.

---

## src/index.js

```js path=C:\Users\Shravan\Desktop\CollegePortal\frontend\src\index.js start=1
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

Explanation
- 1–2: Import React core and the concurrent-compatible ReactDOM client entry.
- 3: Global CSS (Tailwind directives + custom styles) is applied.
- 4: App root component.
- 5: BrowserRouter provides client-side routing using History API.
- 6: AuthProvider makes auth state/hooks available across the app via React Context.
- 7–8: ToastContainer and CSS for toast notifications (react-toastify).
- 10: Mount React onto the #root element from index.html.
- 12: StrictMode enables extra checks in development.
- 13–18: BrowserRouter with future flags for React Router v7 migration behavior.
- 19–21: Render App within AuthProvider so routing and pages can access auth.
- 22–32: Configure toast notifications: UX placement, timings, interactions.

Why
- Central composition root that wires routing, auth context, and notifications once.

---

## src/App.js

```js path=C:\Users\Shravan\Desktop\CollegePortal\frontend\src\App.js start=1
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import DashboardRedirect from './components/common/DashboardRedirect';
import { ROLES } from './constants/roles';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Branches from './pages/Branches';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Events from './pages/Events';
import Notes from './pages/Notes';
import Notifications from './pages/Notifications';
import Chatbot from './pages/Chatbot';
import VirtualClassroom from './pages/VirtualClassroom';
import JoinVirtualClassroom from './pages/JoinVirtualClassroom';
import VideoCall from './pages/VideoCall';

// Error pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';



function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading application..." />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated() ? <Login /> : <DashboardRedirect />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated() ? <Register /> : <DashboardRedirect />} 
      />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardRedirect />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="users" element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="students" element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.FACULTY]}>
            <Students />
          </ProtectedRoute>
        } />
        
        <Route path="faculty" element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.FACULTY]}>
            <Faculty />
          </ProtectedRoute>
        } />
        
        <Route path="branches" element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <Branches />
          </ProtectedRoute>
        } />
        
        <Route path="attendance" element={<Attendance />} />
        <Route path="results" element={<Results />} />
        <Route path="events" element={<Events />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="virtual-classroom" element={
          <ProtectedRoute roles={[ROLES.FACULTY]}>
            <VirtualClassroom />
          </ProtectedRoute>
        } />
        <Route path="join" element={
          <ProtectedRoute roles={[ROLES.STUDENT, ROLES.FACULTY]}>
            <JoinVirtualClassroom />
          </ProtectedRoute>
        } />
        <Route path="join/:roomId" element={
          <ProtectedRoute roles={[ROLES.STUDENT, ROLES.FACULTY]}>
            <JoinVirtualClassroom />
          </ProtectedRoute>
        } />
        <Route path="video-call/:roomId" element={
          <ProtectedRoute roles={[ROLES.STUDENT, ROLES.FACULTY]}>
            <VideoCall />
          </ProtectedRoute>
        } />

        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
```

Explanation
- 1–8: Imports React, router primitives, auth hook, layout, guards, and roles.
- 10–12: Public auth pages.
- 14–28: Business pages for dashboard, entities, and video features.
- 30–32: Error and fallback pages.
- 36: App component; consumes auth state via useAuth.
- 38–41: While auth initializes (e.g., reading localStorage), show a spinner.
- 44: Start React Router route definitions.
- 46–53: Public routes; if already authenticated, redirect to role-aware dashboard via DashboardRedirect.
- 56–60: Protect the main layout under “/” so all nested routes require auth.
- 61: Index route under “/” immediately redirects to a role-based dashboard.
- 63–114: Feature routes; wrap role-limited routes with ProtectedRoute roles=[...].
  - Example: only ADMINs can access /users and /branches.
  - FACULTY- or STUDENT-only routes are enforced similarly.
- 116–117: Explicit Unauthorized route (used by guard) and a nested 404.
- 121: A top-level catch-all 404 for anything outside the layout tree.

Why
- Centralized routing + role-based access control keeps authorization logic consistent.
- Nested routing inside Layout ensures header/sidebar persist while content switches.

---

## src/contexts/AuthContext.js

```js path=C:\Users\Shravan\Desktop\CollegePortal\frontend\src\contexts\AuthContext.js start=1
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { ROLES } from '../constants/roles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token } = response.data;
      
      // Decode JWT to get user info (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userData = {
        email: payload.sub,
        roles: payload.roles || [],
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    // Log the outgoing payload for debugging
    console.log('Register payload:', userData);
    try {
      const response = await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      // Log the error response for debugging
      console.error('Register error:', error.response);
      let message = 'Registration failed';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const getRoleBasedDashboardRoute = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return '/dashboard';
    }

    // Priority order: Admin > Faculty > Student
    if (user.roles.includes(ROLES.ADMIN)) {
      return '/dashboard?role=admin';
    } else if (user.roles.includes(ROLES.FACULTY)) {
      return '/dashboard?role=faculty';
    } else if (user.roles.includes(ROLES.STUDENT)) {
      return '/dashboard?role=student';
    }

    return '/dashboard';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    getRoleBasedDashboardRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

Explanation
- 1–4: Imports context APIs, auth API client, toast notifications, and role constants.
- 6: Create a Context object to share auth state throughout the app.
- 8–14: Custom hook useAuth to consume context safely; throws if used outside provider.
- 16–20: Provider state: user object, loading gate, and token from localStorage.
- 22–30: On mount, hydrate state from localStorage if present; then stop loading.
- 32–58: login(credentials)
  - 35–36: Call backend auth; get JWT.
  - 39: Decode JWT payload using atob. Note: simplistic and not validated; okay for trusted backend.
  - 41–44: Build a minimal user object from payload (email in sub, roles array).
  - 46–53: Persist token and user; update state; success toast and return.
  - 54–57: On error, read server message if available; toast and return structured failure.
- 60–81: register(userData)
  - 62: Console log payload for debugging integrations.
  - 64–66: Call backend; toast success and ask user to login.
  - 68–79: Robust error message derivation; toast error.
- 83–89: logout() clears storage and state; info toast.
- 91–97: Role checks: hasRole and hasAnyRole power route guards and UI visibility.
- 99–101: isAuthenticated gates protected app areas.
- 103–118: getRoleBasedDashboardRoute maps role priority to a dashboard URL (used after login/refresh).
- 120–131: Expose all auth APIs and state to children components via Context.

Why
- Centralized auth state and helpers remove duplication across pages and guards.
- LocalStorage persistence provides session continuity across reloads.

Security Considerations
- JWT decoding here is non-verifying; trust is placed in backend issue/validation.
- Interceptor in api.js handles 401s by clearing storage and redirecting to login.

---

## src/utils/api.js

```js path=C:\Users\Shravan\Desktop\CollegePortal\frontend\src\utils\api.js start=1
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
```

Explanation
- 1: axios powers HTTP requests and interceptors.
- 3: Base URL for backend endpoints; CRA dev server proxy also exists in package.json.
- 6–11: Shared axios instance with JSON header.
- 14–25: Request interceptor attaches Bearer token from localStorage for authenticated endpoints.
- 28–38: Response interceptor: on 401 (expired/invalid token), clear storage and hard-redirect to /login.
- 41–213: Grouped API clients by resource; each maps directly to REST endpoints.
  - Note: multipart/form-data is used for events/notes that upload files; uses FormData and sets headers per request.
  - Blob responseType is used for downloads.

Why
- Centralized API client reduces repetition and keeps error handling consistent (e.g., unauthorized flow).

---

## src/components/common/ProtectedRoute.js

```js path=C:\Users\Shravan\Desktop\CollegePortal\frontend\src\components\common\ProtectedRoute.js start=1
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasAnyRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

Explanation
- 1–3: Imports React, navigation helpers, and auth context hook.
- 5: Accepts children (the page) and optional roles array.
- 6–7: Read auth state and current location (for redirect-after-login).
- 9–14: While auth is bootstrapping, show a centered spinner.
- 16–18: If not logged in, redirect to /login and store origin location in state.
- 20–22: If roles are specified and the user lacks any, redirect to /unauthorized.
- 24: Otherwise render the protected children.

Why
- Encapsulates access control logic at route level; pages remain focused on UI/business logic.

---

## src/components/common/DashboardRedirect.js

```js path=C:\Users\Shravan\Desktop\CollegePortal\frontend\src\components\common\DashboardRedirect.js start=1
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardRedirect = () => {
  const { getRoleBasedDashboardRoute, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const dashboardRoute = getRoleBasedDashboardRoute();
      navigate(dashboardRoute, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, getRoleBasedDashboardRoute, isAuthenticated]);

  return null; // This component doesn't render anything
};

export default DashboardRedirect;
```

Explanation
- 1–3: Import hooks for lifecycle, navigation, and auth.
- 5–7: Grab helpers from auth and the navigate function.
- 9–16: On mount, if authenticated, compute the role-appropriate dashboard URL and navigate there; otherwise go to /login. replace avoids back-button loops.
- 18: Returns null because it only performs a side effect.

Why
- Provides a single place to define “where should this user land?” so both public and protected flows are consistent.

---

## Part 2 — Layout, Reusable Components, Styling, and Pages

This part documents the layout shell, common UI components, key styling, and walks through each page’s logic with line references and rationale.

---

### Layout components

#### src/components/layout/Layout.js
Explanation (lines refer to the file):
- 1–4: Import React state, Outlet placeholder, and the two shell parts: Sidebar and Header.
- 6–8: Local UI state `sidebarOpen` to control the mobile sidebar.
- 10–15: Gradient background with decorative blurred blobs to give subtle depth without heavy images.
- 17–18: Sidebar and Header are always mounted; Header receives a callback to open the sidebar on small screens.
- 20–24: Main content area. `lg:pl-72` reserves space for the sidebar on large screens; `pt-20` reserves space for the fixed header. `<Outlet />` renders the active child route.

Why: This keeps a clean, responsive shell that persists across all protected routes.

#### src/components/layout/Header.js
Key flows:
- Imports (1–13): pulls auth, notifications API, role labels, icons, and toast.
- State (15–20): user menu and notifications dropdown state; tracks unread count.
- Effects (21–38): fetch notifications on mount; global mousedown listener closes dropdowns when clicking outside.
- fetchNotifications (40–52): calls `notificationAPI.getMyNotifications({ unread: true, size: 5 })`; stores items and unread count.
- markAllAsRead (54–63): calls bulk mark endpoint; updates local state and toasts.
- handleLogout (65–68): calls `logout()` from AuthContext and closes menu.
- getUserRole (70–75): resolves the label from the current roles (ADMIN > FACULTY > STUDENT).
- Render (77–178):
  - Left (81–88): mobile-only menu button for opening sidebar.
  - Right (92–139): bell with unread badge, dropdown listing notifications (title, message, date), and a “mark all read”.
  - User menu (142–174): shows email + role, and provides logout.

Why: A single place to surface ephemeral info (notifications) and account actions.

#### src/components/layout/Sidebar.js
Highlights:
- Auth and roles (1–4, 21–24): read `hasAnyRole` and `logout()` to drive menu visibility and session exit.
- Menu model (30–44): declarative array with `name`, `href`, `icon`, and `roles` required.
- Filtering (46): `filteredMenuItems = menuItems.filter(item => hasAnyRole(item.roles))` ensures only allowed links show.
- Responsive behavior (51–56, 59–63): mobile backdrop and transform-based slide-in; desktop always visible.
- User chip (73–83): shows initial + email and raw roles.
- Nav list (86–108): `NavLink` adds active styles and auto-closes sidebar on mobile after navigation.
- Footer (110–119): logout button triggers `logout()` then navigates to login (25–28).

Why: Centralized navigation with role-based visibility keeps the UI self-explanatory per user.

---

### Reusable UI components

#### src/components/common/LoadingSpinner.js
- Props (3): `size` and `text` allow reuse in many contexts.
- `sizeClasses` (4–8): maps logical sizes to Tailwind sizes.
- Render (11–14): shows a CSS-driven spinner (from `index.css`) and optional caption.

#### src/components/common/Modal.js
- Early return (5): don’t render when `isOpen` is false.
- Sizes (7–12): constrained widths to avoid overly wide modals.
- Overlay (15–21): full-screen backdrop; clicking it closes (`onClose`).
- Panel (24–47): header with title and close button; slot `children` for content.

Accessibility: Panel is centered; backdrop click-to-close complements the header close button.

#### src/components/common/ConfirmDialog.js
- Type presets (16–29): color tints per dialog type: danger, warning, info.
- Layout (34–75): alert icon, title, message, and action buttons. `onConfirm` triggers the caller’s destructive action.

Pattern: This is a specialized modal for dangerous or important confirmations.

#### src/components/common/SimplePagination.js
- Props (4–10): current page, total pages, `onPageChange`, and counters for display.
- Derived (13–15): compute item range shown.
- getPageNumbers (16–33): windowed pagination (max 5 visible), with ellipses at edges.
- Render (35–142): mobile-friendly Previous/Next; desktop shows counts, windowed page buttons, and edge shortcuts.

Why: Lightweight, dependency-free pagination with a11y-friendly controls.

---

### Styling (deeper dive)
File: `frontend/src/index.css`
- 1–3: Tailwind layers; enables utility-first styling.
- 5–6: Import Inter font and GitHub Dark highlight theme.
- 8–12: Global reset and border-box.
- 14–21: Body typography and neutral background.
- 28–44: Custom thin scrollbar for WebKit browsers.
- 46–98 (@layer components): Project-level utility recipes:
  - `.btn-primary`, `.btn-secondary`, `.btn-danger`: semantic button variants.
  - `.input-field`, `.card`, `.glass-card`: consistent forms and surfaces.
  - `.table-*` utils, `.sidebar-item` active/hover states.
  - Markdown code block theming under `.prose` for chatbot answers.
- 100–113: Keyframed spinner used by LoadingSpinner.
- 115–135: Toastify theme overrides for coherent brand colors.

Why: Tailwind + small component classes yields consistent visuals with minimal CSS.

---

### Pages (logic and key lines)
This section explains the important flows in each page. Open the file alongside to see exact lines.

#### Dashboard.js
- Imports (1–16): pulls auth, role constants, icons, and data APIs.
- Role routing (26–39): reads `role` from URL or first user role; ensures you land on the correct dashboard via `getRoleBasedDashboardRoute()`.
- Data fetch (41–81): builds a `promises` array depending on role; fetches counts and recent notifications/events; reduces into `combinedStats`.
- Loading (83–85): uses `LoadingSpinner`.
- Cards (87–140): `getStatsCards()` maps role to cards displayed.
- Sections (180–238): recent notifications and upcoming events; each gracefully handles empty lists.
- Quick actions (240–267): contextual shortcuts for role.

Why: Same screen adapts per role; avoids separate dashboards.

#### Users.js
- Fetch (28–38): `userAPI.getAllUsers()` populates table; toasts on error.
- Edit/Delete (40–61): opens modal or confirm dialog; delete calls `userAPI.deleteUser` and updates local state.
- Save (63–76): update flow calls `userAPI.updateUser`; optimistic update pattern.
- Role change (78–93): `userAPI.changeUserRole` then updates the user item locally (single-role model in UI).
- Search (95–99): simple client-side filter on name/email.
- Modal form (218–263): controlled inputs for name; email is immutable for security.

Why: Minimal admin tool for user management with immediate feedback.

#### Students.js
- Bootstrap (36–57): fetches students, (optionally) users for ADMIN, and branches in parallel.
- Search + filters (106–118): matches on user/branch and optional branch/year/semester filters.
- Pagination (120–123): `useSimplePagination(filteredStudents, 10)` slices for display; shows `SimplePagination` (256–263).
- Table (195–247): shows key student fields; ADMIN-only actions for edit/delete.
- Forms (299–391): controlled selects for linking user/branch and setting year/semester.

Why: Faculty/Admin can manage student records with quick filtering and paging.

#### Attendance.js
- Role-aware fetch (33–48): students see only their attendance; admin/faculty see all and can load students/faculties for marking.
- Stats (81–90): derived totals and percentage.
- Marking single/bulk (57–79, 342–445): two modals — one for a single mark, one for bulk per date/faculty; both update local list and toast.

#### Results.js
- Mode (34–46): students fetch personal results; others fetch all + students to filter.
- GPA (59–63): compute simple 4.0-scale GPA from marks.
- Add result (73–110): validates inputs and posts via `resultAPI.createResult`, then refreshes data.
- Summary/cards (164–209): total subjects, average marks, GPA.

#### Events.js
- CRUD (44–92): create/update via multipart `FormData` (supports attachments); robust error messaging.
- Download (94–107): fetches blob and downloads with an anchor element.
- Grid (136–186): shows date/location; actions gated by role.
- Pagination (207–214): uses `useSimplePagination` (6 per page).

#### Notes.js
- CRUD (82–104): multipart for attachments; robust error handling and logs.
- Download (106–158): parses `Content-Disposition` for filename, falls back to content-type-based extensions.
- View modal (296–337): quick in-app preview of note content; download button if available.

#### Notifications.js
- Fetch (27–42): supports `filter` with `unread` flag; paginates server-side (size 50).
- Mark read (49–59, 61–69): single and bulk; updates local state and toasts.
- Create/edit (71–90): simple modal form updates or prepends to list.

#### Chatbot.js
- Formatting prompt (71–90): instructs the model to reply in structured, friendly Markdown.
- CodeBlock (19–69): custom renderer with syntax highlighting and copy-to-clipboard.
- Flow (113–156): append user message, call `chatbotAPI.askQuestion`, render bot markdown with `react-markdown` + GFM.

#### VirtualClassroom.js
- Fetch sessions (50–62): loads instructor sessions; uses email on backend side.
- Schedule (64–86, 214–320): validates inputs, converts datetime to Spring-friendly local datetime, posts via API.
- Details (197–211, 322–439): status badge, invite link generator, QR placeholder, start/end controls (server actions).

#### JoinVirtualClassroom.js
- Room lookup (45–73): fetches details by roomId; shows readable errors per status.
- Join (82–103): calls `videoSessionAPI.joinSession` then navigates to `/video-call/:roomId`.

#### VideoCall.js
- Zego token (41–75): prefers env-provided AppID + AppSign for client-side kit-token; falls back to server token via API.
- Join (92–123): configures pre-join behavior and shared links; tracks `joined` state.
- Cleanup (142–160): destroys SDK instance on unmount or when leaving; navigates back safely.
- Errors (186–213): user-friendly error screen with retry/back actions.

#### Auth pages
- Login.js: on success, returns to the originally requested route (via `location.state.from`) or role-based dashboard.
- Register.js: validates fields, including password confirmation and role, then calls backend registration.

#### Utilities
- constants/roles.js: centralized enum + human labels and color classes.
- hooks/useSimplePagination.js: memoized slice window with helpers (first/last/next/prev), exposing `totalItems` for UI.

---

## Part 3 — Detailed Per-Page Explanations and Diagrams

This section goes deeper into each remaining page and component, including data shapes, handler flows, and tips for presenting to faculty.

---

### Faculty.js (Manage Faculty)
- State (18–26): faculties/users/branches arrays, UI flags, and selection targets.
- Data fetch (32–49): parallel load via Promise.all; users are loaded only for ADMIN (36) to keep requests minimal for faculty users.
- Add/Edit/Delete handlers (51–77): open modal with selected record, confirm destructive actions via ConfirmDialog.
- Save (79–96): create vs update branching; merges updated record into array for instant UI reflection.
- Filtering (98–102): client-side search across name/email/branch.
- Table + actions (133–176): Admin-only actions column guarded by role.
- FacultyForm (220–277): controlled selects for mapping an existing user (with FACULTY role) to a branch.

Data contract
- Faculty item fields used in UI: { id, userId, userName, userEmail, branchId, branchName }.
- Create/Update payload: { userId, branchId }.

Why: Separation of Users and Faculty lets you assign roles and link user accounts to faculty profile records.

---

### Branches.js (Manage Branches)
- State (15–21): branches list and modal/confirm states.
- Fetch (26–36): load all branches once.
- Save (66–83): create or update name only; merges item into list.
- BranchForm (187–221): single field form with basic required validation via HTML5.

Data contract
- Branch item fields used: { id, name }.
- Payload: { name }.

Why: Branches are referenced by Students/Faculty/Notes; keeping this CRUD simple reduces admin friction.

---

### Attendance.js (Mark and View Attendance)
- Role-aware fetch (33–48): students call getMyAttendance; admin/faculty call getAllAttendance and also load Students/Faculties for forms.
- Stats (81–90): derive present/absent/percentage once for summary cards.
- Single mark (244–340): AttendanceForm posts { studentId, facultyId, date, present }.
- Bulk mark (342–445): initializes every student to present; toggles per-student; posts an array of the single-mark shape.
- Table (166–203): shows student/faculty/date/status with readable formatting.

Data contract
- Attendance record fields used: { id, studentName, facultyName, date, present }.

Why: Bulk operations speed up daily workflows, while single mark handles corrections.

---

### Results.js (Academic Results)
- Mode (34–46): students see their results; admin/faculty see all and filter by student.
- GPA and aggregates (59–63, 164–209): per-list computations for dashboards.
- Add result (73–110): validates required fields and bounds for marks; converts to { studentId:number, subject:string, marks:number }.

Data contract
- Result item fields: { id, studentId, studentName, subject, marks }.
- Payload: { studentId, subject, marks }.

Why: Keeping validation in the UI improves UX; server should still validate.

---

### Events.js (Events with Attachments)
- CRUD (72–92): Uses FormData to support optional file in both create and update.
- Download (94–107): Initiates a Blob download for attachments.
- Grid (136–186) + Pagination (207–214): compact card layout; 6 per page.

Data contract
- Event fields: { id, title, description, eventDate, location, hasAttachment }.
- Payload: { title, description, eventDate: 'YYYY-MM-DDTHH:mm:ss', location?, attachment? }.

Why: FormData avoids content-type confusion; date normalized to backend LocalDateTime.

---

### Notes.js (Study Notes with Attachments)
- CRUD (82–104): same FormData pattern as Events.
- Download (106–158): robust filename extraction from Content-Disposition; adds extension from content-type when missing.
- View modal (296–337): read-only presentation; uses same downloader for attachments.
- NoteForm (352–505): loads branches to help classify notes by branch/year/semester.

Data contract
- Note fields: { id, title, content, subject, branchName, year, semester, hasAttachment, createdAt }.
- Payload: { title, content, subject, branchName, year, semester, attachment? }.

Why: Clear classification makes discovery easier for students; attachments standardized.

---

### Notifications.js (In-app Notifications)
- Fetch with filter (27–42): supports all/unread/read via unread flag.
- Mark-as-read (49–69): single and bulk actions mutate list locally for responsiveness.
- Create/Edit (71–90): simple modal; prepends new notifications.

Data contract
- Notification fields: { id, title, message, read, createdAt, type?, recipientUserId? }.
- Payload: { title, message, type, recipientUserId? }.

Why: High-visibility communication channel integrated into the header and dedicated page.

---

### Chatbot.js (AI Assistant with Markdown + Code)
- CodeBlock (19–69):
  - Inline code: small styled code element.
  - Block code: highlight.js detection; copy-to-clipboard with visual feedback.
- Formatting prompt (71–90): Prepend user query with structured instructions for consistent markdown output.
- Flow (113–156): optimistic append of user message; then bot response rendered via react-markdown + GFM with custom renderers.

Why: Ensures readable, consistent AI answers, and developer-friendly code blocks.

---

### Virtual Classroom suite

#### VirtualClassroom.js (Faculty schedules and controls sessions)
- Fetch (50–62): lists teacher’s sessions.
- Schedule (214–320): validates, converts datetime to `YYYY-MM-DDTHH:mm:ss` local format for Spring, posts to server.
- Details (197–211, 322–439): shows invite link, QR placeholder, start/end session actions that call server.

Contracts
- Session fields: { id, subject, roomId, status: 'SCHEDULED' | 'ACTIVE' | 'ENDED', scheduledTime, endTime?, participantIds?[] }.
- Create payload: { subject, scheduledTime: 'YYYY-MM-DDTHH:mm:ss', durationMinutes }.

#### JoinVirtualClassroom.js (Students/Faculty join by Room ID)
- Lookup (55–73): fetch details by roomId; friendly errors for 404/403.
- Join (82–103): POST join; on success, navigate to `/video-call/:roomId`.

#### VideoCall.js (Zego UI Kit integration)
- Token strategy (41–75): prefers env (REACT_APP_ZEGO_APP_ID + REACT_APP_ZEGO_APP_SIGN); else requests server token via API.
- Join (92–123): configures pre-join; ensures mic/cam off by default to reduce errors; adds share links.
- Cleanup (142–160): safe destroy on leave/unmount.
- Errors (186–213): clear retry/back UI.

Env variables (frontend/.env)
- REACT_APP_ZEGO_APP_ID=YOUR_APP_ID (number)
- REACT_APP_ZEGO_APP_SIGN=YOUR_APP_SIGN (string)

Server token (fallback)
- Request: POST /api/video-sessions/zego/token { roomId, userId }
- Response: { token: string }

Why: Dual path ensures dev convenience (env) and production security (server-issued tokens).

---

### Diagrams

Component tree (protected area)
```text path=null start=null
<App>
  <Routes>
    "/" -> <ProtectedRoute>
             <Layout>
               <Header />
               <Sidebar />
               <Outlet>
                 /dashboard | /users | /students | ...
               </Outlet>
             </Layout>
           </ProtectedRoute>
  </Routes>
```

Routing map (simplified)
```text path=null start=null
Public:  /login, /register
Protected: /
  - /dashboard
  - /users (ADMIN)
  - /students (ADMIN,FACULTY)
  - /faculty (ADMIN,FACULTY)
  - /branches (ADMIN)
  - /attendance, /results, /events, /notes, /notifications, /chatbot
  - /virtual-classroom (FACULTY)
  - /join, /join/:roomId (STUDENT,FACULTY)
  - /video-call/:roomId (STUDENT,FACULTY)
  - /unauthorized, 404
```

Data flow
```text path=null start=null
[UI Component] --calls--> [api.js axios instance]
  --attaches--> Authorization: Bearer <token>
  <--401--  Interceptor clears localStorage, redirects to /login
[AuthContext]
  - login(): set token+user in localStorage
  - logout(): clear storage, update context
  - hasRole()/hasAnyRole(): guards & menu
```

---

### Presentation tips (faculty/demo)
- Start at Login; show role-based redirect.
- As ADMIN: navigate sidebar; demonstrate Users (change role), Students (filters+pagination), Branches, Events (attachment upload), Notes (download filename parsing), Notifications (mark all read).
- As FACULTY: show Attendance (bulk), Results (add), Virtual Classroom (schedule, invite link, start).
- As STUDENT: show My Attendance, Results view, Join Virtual Classroom (enter room ID).
- Show Chatbot and code highlighting/copied snippets.

---

End of Part 3.
