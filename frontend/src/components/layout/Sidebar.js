import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserIcon,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Students',
      href: '/students',
      icon: AcademicCapIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY],
    },
    {
      name: 'Faculty',
      href: '/faculty',
      icon: UserGroupIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY],
    },
    {
      name: 'Branches',
      href: '/branches',
      icon: BuildingOfficeIcon,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: ClipboardDocumentListIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Results',
      href: '/results',
      icon: ChartBarIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Events',
      href: '/events',
      icon: CalendarDaysIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Notes',
      href: '/notes',
      icon: DocumentTextIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Chatbot',
      href: '/chatbot',
      icon: ChatBubbleLeftRightIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
    },
    {
      name: 'Virtual Classroom',
      href: '/virtual-classroom',
      icon: ComputerDesktopIcon,
      roles: [ROLES.FACULTY],
    },
    {
      name: 'Join Virtual Classroom',
      href: '/join',
      icon: ComputerDesktopIcon,
      roles: [ROLES.STUDENT, ROLES.FACULTY],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasAnyRole(item.roles)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">Siksha_Setu</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {user?.roles?.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="sidebar-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;