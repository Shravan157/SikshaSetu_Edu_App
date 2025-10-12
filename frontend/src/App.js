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