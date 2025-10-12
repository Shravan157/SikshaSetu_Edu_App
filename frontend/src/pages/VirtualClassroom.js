import React, { useState, useEffect } from 'react';
import { videoSessionAPI } from '../utils/api';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  ClockIcon,
  UsersIcon,
  LinkIcon,
  QrCodeIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800';
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'ENDED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString();
};

const generateInviteLink = (roomId) => {
  return `${window.location.origin}/join/${roomId}`;
};

const VirtualClassroom = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // Since the backend uses email, we can pass a dummy teacherId
      // The controller will use the authenticated user's email
      const response = await videoSessionAPI.getTeacherSessions(1);
      setSessions(response.data);
    } catch (error) {
      toast.error('Failed to fetch sessions');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  const handleSaveSession = async (sessionData) => {
    try {
      await videoSessionAPI.createSession(sessionData);
      toast.success('Session scheduled successfully');
      fetchSessions(); // Refresh the list
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to schedule session';
      toast.error(msg);
      console.error('Error creating session:', error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const generateInviteLink = (roomId) => {
    return `${window.location.origin}/join/${roomId}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading virtual classroom..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Virtual Classroom</h1>
        <button onClick={handleScheduleSession} className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Schedule Session
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{session.subject}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                {formatDateTime(session.scheduledTime)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="w-4 h-4 mr-2" />
                {session.participantIds ? session.participantIds.length : 0} participants
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(session)}
                className="flex-1 btn-secondary text-sm"
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Details
              </button>
              {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
                <button
                  onClick={async () => {
                    try {
                      await videoSessionAPI.startSession(session.roomId);
                      toast.success('Session started');
                      // navigate to video call page
                      window.location.href = `/video-call/${session.roomId}`;
                    } catch (e) {
                      toast.error('Failed to start session');
                    }
                  }}
                  className="flex-1 btn-primary text-sm"
                >
                  Start Now
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No sessions scheduled yet</p>
            <p className="text-sm">Click "Schedule Session" to create your first virtual classroom</p>
          </div>
        )}
      </div>

      {/* Schedule Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Virtual Session"
      >
        <SessionForm
          session={selectedSession}
          onSave={handleSaveSession}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Session Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Session Details"
      >
        {selectedSession && (
          <SessionDetails
            session={selectedSession}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const SessionForm = ({ session, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    subject: session?.subject || '',
    scheduledTime: session?.scheduledTime ? new Date(session.scheduledTime).toISOString().slice(0, 16) : '',
    durationMinutes: session?.durationMinutes || 60,
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    } else {
      const scheduledDate = new Date(formData.scheduledTime);
      if (scheduledDate <= new Date()) {
        newErrors.scheduledTime = 'Scheduled time must be in the future';
      }
    }

    if (!formData.durationMinutes || formData.durationMinutes < 30 || formData.durationMinutes > 480) {
      newErrors.durationMinutes = 'Duration must be between 30 and 480 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toLocalDateTime = (value) => {
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const HH = pad(d.getHours());
    const MM = pad(d.getMinutes());
    const SS = pad(d.getSeconds());
    // Local date-time string expected by Spring for java.time.LocalDateTime
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        scheduledTime: toLocalDateTime(formData.scheduledTime),
        durationMinutes: parseInt(formData.durationMinutes, 10),
      };
      onSave(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject *</label>
        <input
          type="text"
          className={`mt-1 input-field ${errors.subject ? 'border-red-500' : ''}`}
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Enter session subject"
        />
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Scheduled Time *</label>
        <input
          type="datetime-local"
          className={`mt-1 input-field ${errors.scheduledTime ? 'border-red-500' : ''}`}
          value={formData.scheduledTime}
          onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
        />
        {errors.scheduledTime && <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (minutes) *</label>
        <input
          type="number"
          min="30"
          max="480"
          className={`mt-1 input-field ${errors.durationMinutes ? 'border-red-500' : ''}`}
          value={formData.durationMinutes}
          onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
        />
        {errors.durationMinutes && <p className="mt-1 text-sm text-red-600">{errors.durationMinutes}</p>}
        <p className="mt-1 text-xs text-gray-500">Duration must be between 30 and 480 minutes (8 hours)</p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Schedule Session
        </button>
      </div>
    </form>
  );
};

const SessionDetails = ({ session, onClose }) => {
  const inviteLink = generateInviteLink(session.roomId);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900">Subject</h4>
          <p className="text-gray-600">{session.subject}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Status</h4>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Scheduled Time</h4>
          <p className="text-gray-600">{formatDateTime(session.scheduledTime)}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Duration</h4>
          <p className="text-gray-600">{session.durationMinutes || 60} minutes</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Room ID</h4>
          <p className="text-gray-600 font-mono">{session.roomId}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Participants</h4>
          <p className="text-gray-600">{session.participantIds ? session.participantIds.length : 0}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Invite Link</h4>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="flex-1 input-field bg-gray-50"
          />
          <button
            onClick={() => copyToClipboard(inviteLink)}
            className="btn-secondary"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Share this link with students to join the session
        </p>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
        <div className="text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-lg">
            <QrCodeIcon className="w-24 h-24 text-gray-400" />
            <p className="text-xs text-gray-500 mt-2">QR Code placeholder</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div className="space-x-2">
          {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
            <button
              onClick={async () => {
                try {
                  await videoSessionAPI.startSession(session.roomId);
                  toast.success('Session started');
                  window.location.href = `/video-call/${session.roomId}`;
                } catch (e) {
                  toast.error('Failed to start session');
                }
              }}
              className="btn-primary"
            >
              Start Now
            </button>
          )}
          {session.status === 'ACTIVE' && (
            <button
              onClick={async () => {
                try {
                  await videoSessionAPI.endSession(session.roomId);
                  toast.success('Session ended');
                  onClose();
                  // Refresh page
                  window.location.reload();
                } catch (e) {
                  toast.error('Failed to end session');
                }
              }}
              className="btn-danger"
            >
              End Session
            </button>
          )}
        </div>
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
};

export default VirtualClassroom;