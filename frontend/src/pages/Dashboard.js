import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { studentAPI, facultyAPI, branchAPI, attendanceAPI, notificationAPI, eventAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, hasRole, getRoleBasedDashboardRoute } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Get the role from URL params or determine from user
  const roleParam = searchParams.get('role');
  const currentRole = roleParam || (user?.roles?.[0]?.toLowerCase());

  useEffect(() => {
    // Redirect to appropriate dashboard if no role specified or invalid role
    if (!roleParam && user?.roles?.length > 0) {
      const correctRoute = getRoleBasedDashboardRoute();
      navigate(correctRoute, { replace: true });
      return;
    }
    
    fetchDashboardData();
  }, [roleParam, user, navigate, getRoleBasedDashboardRoute]);

  const fetchDashboardData = async () => {
    try {
      const promises = [];

      // Fetch stats based on role
      if (hasRole(ROLES.ADMIN)) {
        promises.push(
          studentAPI.getAllStudents().then(res => ({ students: res.data.length })),
          facultyAPI.getAllFaculties().then(res => ({ faculties: res.data.length })),
          branchAPI.getAllBranches().then(res => ({ branches: res.data.length })),
          attendanceAPI.getAllAttendance().then(res => ({ attendance: res.data.length }))
        );
      } else if (hasRole(ROLES.FACULTY)) {
        promises.push(
          studentAPI.getAllStudents().then(res => ({ students: res.data.length })),
          attendanceAPI.getAllAttendance().then(res => ({ attendance: res.data.length }))
        );
      } else if (hasRole(ROLES.STUDENT)) {
        promises.push(
          attendanceAPI.getMyAttendance().then(res => ({ myAttendance: res.data.length }))
        );
      }

      // Fetch notifications and events for all users
      promises.push(
        notificationAPI.getMyNotifications({ page: 0, size: 5 }).then(res => ({ notifications: res.data.content || [] })),
        eventAPI.getAllEvents().then(res => ({ events: res.data.slice(0, 5) }))
      );

      const results = await Promise.all(promises);
      const combinedStats = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      setStats(combinedStats);
      setRecentNotifications(combinedStats.notifications || []);
      setUpcomingEvents(combinedStats.events || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const getStatsCards = () => {
    if (hasRole(ROLES.ADMIN)) {
      return [
        {
          name: 'Total Students',
          value: stats.students || 0,
          icon: AcademicCapIcon,
          color: 'bg-blue-500',
        },
        {
          name: 'Total Faculty',
          value: stats.faculties || 0,
          icon: UserGroupIcon,
          color: 'bg-green-500',
        },
        {
          name: 'Total Branches',
          value: stats.branches || 0,
          icon: BuildingOfficeIcon,
          color: 'bg-purple-500',
        },
        {
          name: 'Attendance Records',
          value: stats.attendance || 0,
          icon: ClipboardDocumentListIcon,
          color: 'bg-yellow-500',
        },
      ];
    } else if (hasRole(ROLES.FACULTY)) {
      return [
        {
          name: 'My Students',
          value: stats.students || 0,
          icon: AcademicCapIcon,
          color: 'bg-blue-500',
        },
        {
          name: 'Attendance Records',
          value: stats.attendance || 0,
          icon: ClipboardDocumentListIcon,
          color: 'bg-yellow-500',
        },
      ];
    } else {
      return [
        {
          name: 'My Attendance',
          value: stats.myAttendance || 0,
          icon: ClipboardDocumentListIcon,
          color: 'bg-blue-500',
        },
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.email}!
        </h1>
        <p className="mt-2 opacity-90">
          {hasRole(ROLES.ADMIN) && "You have full administrative access to the college portal."}
          {hasRole(ROLES.FACULTY) && "Manage your students, attendance, and academic activities."}
          {hasRole(ROLES.STUDENT) && "Access your academic information, attendance, and results."}
        </p>
        <div className="mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
            {hasRole(ROLES.ADMIN) && "Administrator Dashboard"}
            {hasRole(ROLES.FACULTY) && "Faculty Dashboard"}
            {hasRole(ROLES.STUDENT) && "Student Dashboard"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BellIcon className="w-5 h-5 mr-2" />
              Recent Notifications
            </h2>
          </div>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent notifications</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              Upcoming Events
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hasRole(ROLES.ADMIN) && (
            <>
              <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">Manage Users</span>
              </button>
              <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <AcademicCapIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">Manage Students</span>
              </button>
            </>
          )}
          {hasRole(ROLES.FACULTY) && (
            <button className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <ClipboardDocumentListIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-yellow-900">Mark Attendance</span>
            </button>
          )}
          <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <BellIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-900">View Notifications</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;