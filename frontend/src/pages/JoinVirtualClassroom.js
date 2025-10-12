import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoSessionAPI } from '../utils/api';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

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

const JoinVirtualClassroom = () => {
  const { roomId: paramRoomId } = useParams();
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState(paramRoomId || '');
  const [session, setSession] = useState(null);
  const [fetchingSession, setFetchingSession] = useState(false);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);

  // Fetch session details when roomId changes
  useEffect(() => {
    if (roomId && roomId.trim()) {
      fetchSessionDetails(roomId.trim());
    } else {
      setSession(null);
      setError('');
    }
  }, [roomId]);

  const fetchSessionDetails = async (id) => {
    setFetchingSession(true);
    setError('');
    try {
      const response = await videoSessionAPI.getSessionDetails(id);
      setSession(response.data);
    } catch (err) {
      setSession(null);
      if (err.response?.status === 404) {
        setError('Session not found. Please check the room ID.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access this session.');
      } else {
        setError('Failed to fetch session details. Please try again.');
      }
    } finally {
      setFetchingSession(false);
    }
  };

  const handleRoomIdSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      fetchSessionDetails(roomId.trim());
    }
  };

  const handleJoinSession = async () => {
    if (!session) return;

    setJoining(true);
    try {
      await videoSessionAPI.joinSession(session.roomId);
      toast.success('Successfully joined the session!');
      // Navigate to video call component (placeholder for now)
      navigate(`/video-call/${session.roomId}`);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error('Session is not active or has ended.');
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to join this session.');
      } else {
        toast.error('Failed to join session. Please try again.');
      }
    } finally {
      setJoining(false);
      setShowJoinModal(false);
    }
  };

  const canJoinSession = () => {
    if (!session) return false;
    return session.status === 'ACTIVE' || session.status === 'SCHEDULED';
  };

  const getJoinButtonText = () => {
    if (!session) return 'Join Session';
    switch (session.status) {
      case 'ACTIVE':
        return 'Join Now';
      case 'SCHEDULED':
        return 'Join Session';
      case 'ENDED':
        return 'Session Ended';
      default:
        return 'Join Session';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Join Virtual Classroom</h1>
      </div>

      {/* Room ID Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Room ID</h2>
        <form onSubmit={handleRoomIdSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room ID *
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="input-field"
              placeholder="Enter the room ID to join"
              required
            />
          </div>
          <button
            type="submit"
            disabled={fetchingSession || !roomId.trim()}
            className="btn-primary"
          >
            {fetchingSession ? 'Searching...' : 'Find Session'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Session Details */}
      {session && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(session.status)}`}>
              {session.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Subject</h3>
              <p className="text-gray-600">{session.subject}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Teacher</h3>
              <p className="text-gray-600">{session.teacherName}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Scheduled Time</h3>
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                {formatDateTime(session.scheduledTime)}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Participants</h3>
              <div className="flex items-center text-gray-600">
                <UserIcon className="w-4 h-4 mr-2" />
                {session.participantIds ? session.participantIds.length : 0} joined
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Room ID</h3>
              <p className="text-gray-600 font-mono">{session.roomId}</p>
            </div>
            {session.endTime && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">End Time</h3>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {formatDateTime(session.endTime)}
                </div>
              </div>
            )}
          </div>

          {/* Join Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowJoinModal(true)}
              disabled={!canJoinSession() || joining}
              className={`btn-primary flex items-center ${
                !canJoinSession() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <VideoCameraIcon className="w-5 h-5 mr-2" />
              {joining ? 'Joining...' : getJoinButtonText()}
            </button>
          </div>

          {!canJoinSession() && session.status === 'ENDED' && (
            <p className="text-center text-gray-500 mt-4">
              This session has ended and cannot be joined.
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {fetchingSession && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <LoadingSpinner text="Fetching session details..." />
        </div>
      )}

      {/* Join Confirmation Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Confirm Join Session"
      >
        {session && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to join "{session.subject}"?
              </h3>
              <p className="text-gray-600 mb-4">
                You are about to join the virtual classroom session taught by {session.teacherName}.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium">{session.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatDateTime(session.scheduledTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room ID:</span>
                    <span className="font-medium font-mono">{session.roomId}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="btn-secondary"
                disabled={joining}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinSession}
                disabled={joining}
                className="btn-primary"
              >
                {joining ? 'Joining...' : 'Join Session'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JoinVirtualClassroom;