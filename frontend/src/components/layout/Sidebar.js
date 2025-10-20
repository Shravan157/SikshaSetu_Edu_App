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
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Users', href: '/users', icon: UserIcon, roles: [ROLES.ADMIN] },
    { name: 'Students', href: '/students', icon: AcademicCapIcon, roles: [ROLES.ADMIN, ROLES.FACULTY] },
    { name: 'Faculty', href: '/faculty', icon: UserGroupIcon, roles: [ROLES.ADMIN, ROLES.FACULTY] },
    { name: 'Branches', href: '/branches', icon: BuildingOfficeIcon, roles: [ROLES.ADMIN] },
    { name: 'Attendance', href: '/attendance', icon: ClipboardDocumentListIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Results', href: '/results', icon: ChartBarIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Events', href: '/events', icon: CalendarDaysIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Notes', href: '/notes', icon: DocumentTextIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Chatbot', href: '/chatbot', icon: ChatBubbleLeftRightIcon, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
    { name: 'Virtual Classroom', href: '/virtual-classroom', icon: ComputerDesktopIcon, roles: [ROLES.FACULTY] },
    { name: 'Join Virtual Classroom', href: '/join', icon: ComputerDesktopIcon, roles: [ROLES.STUDENT, ROLES.FACULTY] },
  ];

  const filteredMenuItems = menuItems.filter((item) => hasAnyRole(item.roles));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-r border-secondary-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-secondary-200">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SikshaSetu logo" className="h-8 w-auto" loading="eager" />
              <h1 className="text-lg font-bold tracking-tight text-secondary-900">SikshaSetu</h1>
            </div>
          </div>

          {/* User */}
          <div className="px-6 py-4 border-b border-secondary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary-900 truncate">{user?.email}</p>
                <p className="text-xs text-secondary-500 truncate">{user?.roles?.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors select-none ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`
                    }
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="mt-auto px-4 py-4 border-t border-secondary-200">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
