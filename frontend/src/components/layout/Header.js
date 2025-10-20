import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../utils/api';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Header = ({ onMenuClick }) => {
  const { user, logout, hasRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-dropdown')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getMyNotifications({ 
        page: 0, 
        size: 5, 
        unread: true 
      });
      setNotifications(response.data.content || []);
      setUnreadCount(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getUserRole = () => {
    if (hasRole(ROLES.ADMIN)) return ROLE_LABELS[ROLES.ADMIN];
    if (hasRole(ROLES.FACULTY)) return ROLE_LABELS[ROLES.FACULTY];
    if (hasRole(ROLES.STUDENT)) return ROLE_LABELS[ROLES.STUDENT];
    return 'User';
  };

  return (
    <header className="fixed top-0 right-0 left-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-secondary-200 lg:pl-72 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: menu + search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-secondary-100 text-secondary-600 relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 left-2 sm:left-auto w-[calc(100vw-1rem)] sm:w-80 bg-white rounded-xl shadow-xl border border-secondary-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-secondary-200 bg-secondary-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-secondary-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-secondary-100 hover:bg-secondary-50">
                        <h4 className="text-sm font-medium text-secondary-900">{notification.title}</h4>
                        <p className="text-sm text-secondary-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-secondary-400 mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-secondary-500 text-sm">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={showUserMenu}
            >
              <UserCircleIcon className="w-8 h-8 text-secondary-400" />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-secondary-900">{user?.email}</div>
                <div className="text-xs text-secondary-500">{getUserRole()}</div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-secondary-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-secondary-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-secondary-200">
                  <div className="text-sm font-semibold text-secondary-900">{user?.email}</div>
                  <div className="text-xs text-secondary-500">{getUserRole()}</div>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
