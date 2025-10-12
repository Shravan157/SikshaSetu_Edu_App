import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  PlusIcon,
  BellIcon,
  CheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Notifications = () => {
  const { hasAnyRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const unreadFilter = filter === 'unread' ? true : filter === 'read' ? false : undefined;
      const response = await notificationAPI.getMyNotifications({
        page: 0,
        size: 50,
        unread: unreadFilter,
      });
      setNotifications(response.data.content || []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedNotification(null);
    setIsModalOpen(true);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleSave = async (notificationData) => {
    try {
      if (selectedNotification) {
        const response = await notificationAPI.updateNotification(selectedNotification.id, notificationData);
        setNotifications(notifications.map(n => 
          n.id === selectedNotification.id ? response.data : n
        ));
        toast.success('Notification updated successfully');
      } else {
        const response = await notificationAPI.createNotification(notificationData);
        setNotifications([response.data, ...notifications]);
        toast.success('Notification created successfully');
      }
    } catch (error) {
      toast.error('Failed to save notification');
    } finally {
      setIsModalOpen(false);
      setSelectedNotification(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <BellIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary">
              <CheckIcon className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          )}
          {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
            <button onClick={handleAdd} className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Notification
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: notifications.length - unreadCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card hover:shadow-md transition-shadow cursor-pointer ${
                !notification.read ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600">{notification.message}</p>
                  <p className="mt-2 text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Mark as read"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "No notifications to display."}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        title={selectedNotification ? 'Edit Notification' : 'Create Notification'}
      >
        <NotificationForm
          notification={selectedNotification}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedNotification(null);
          }}
        />
      </Modal>
    </div>
  );
};

const NotificationForm = ({ notification, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    message: notification?.message || '',
    type: notification?.type || 'GENERAL',
    recipientUserId: notification?.recipientUserId || null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          className="mt-1 input-field"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          rows={4}
          className="mt-1 input-field"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          className="mt-1 input-field"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="GENERAL">General</option>
          <option value="URGENT">Urgent</option>
          <option value="ACADEMIC">Academic</option>
          <option value="EVENT">Event</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {notification ? 'Update' : 'Create'} Notification
        </button>
      </div>
    </form>
  );
};

export default Notifications;