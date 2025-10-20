import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { videoSessionAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef(null);
  const zpRef = useRef(null);
  const destroyedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!user || !roomId) {
      setError('User not authenticated or room ID missing');
      setLoading(false);
      return;
    }

    const initializeVideoCall = async () => {
      try {
        let kitToken = null;
        // Zego constraints: userID <= 36 chars, letters/digits/_ only
        const makeUserID = (val) => (val || 'user').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 36);
        const userIDSafe = makeUserID(user?.email);
        const userName = user?.email || userIDSafe;

        // Primary: generate kit token on client using env vars
        const appIdEnv = process.env.REACT_APP_ZEGO_APP_ID || localStorage.getItem('ZEGO_APP_ID');
        // For Zego UI Kit Prebuilt, ServerSecret is required for client-side kit token generation
        const secretEnv = process.env.REACT_APP_ZEGO_SERVER_SECRET || process.env.REACT_APP_ZEGO_APP_SIGN || localStorage.getItem('ZEGO_SERVER_SECRET') || localStorage.getItem('ZEGO_APP_SIGN');
        const appIdNum = appIdEnv ? Number(appIdEnv) : undefined;

        console.log('Environment check:', { appIdEnv: appIdEnv ? 'present' : undefined, secretEnv: secretEnv ? 'present' : undefined, appIdNum });

        if (appIdNum && secretEnv) {
          // Prefer client-side kit token when env is present (most reliable in dev)
          // NOTE: generateKitTokenForTest requires AppSign (not serverSecret)
          kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appIdNum,
            secretEnv,
            roomId,
            userIDSafe,
            userName
          );
          console.info('Using client-side Zego kit token via env');
        } else {
          // Fallback: try server-issued token
          try {
            const tokenResponse = await videoSessionAPI.generateZegoToken({
              roomId,
              userId: userIDSafe,
            });
            kitToken = tokenResponse?.data?.token || null;
          } catch (e) {
            console.warn('Server token failed:', e);
          }

          if (!kitToken) {
            throw new Error('Unable to generate Zego kit token. Please ensure REACT_APP_ZEGO_APP_ID and REACT_APP_ZEGO_APP_SIGN are set in frontend/.env with values from your Zego console.');
          }
        }

        // Initialize ZegoUIKitPrebuilt
        console.log('Creating ZegoUIKitPrebuilt with token:', kitToken ? 'token present' : 'no token');
        console.log('App ID:', appIdNum, 'Room ID:', roomId, 'User ID:', userIDSafe);

        if (!kitToken || kitToken.length < 10) {
          throw new Error('Invalid kit token generated');
        }

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        if (!zp) {
          throw new Error('Failed to create ZegoUIKitPrebuilt instance - token may be invalid');
        }
        zpRef.current = zp;

        // Join the room
        await zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          userID: userIDSafe,
          userName: userName,
          roomID: roomId,
          // Reduce device errors on machines without camera/mic
          turnOnMicrophoneWhenJoining: false,
          turnOnCameraWhenJoining: false,
          showPreJoinView: true,
          // Optional: add share link for convenience
          sharedLinks: [
            {
              name: 'Invite Link',
              url: `${window.location.origin}/join/${roomId}`,
            },
          ],
          onLeaveRoom: () => {
            handleLeaveRoom();
          },
          onJoinRoom: () => {
            setJoined(true);
            setLoading(false);
          },
          onError: (error) => {
            console.error('Zego error:', error);
            setError('Failed to join video call. Please try again.');
            setLoading(false);
          },
        });

      } catch (err) {
        console.error('Error initializing video call:', err);
        if (String(err.message || '').includes('kitToken')) {
          setError('Invalid Zego kit token. Ensure backend token is valid or set REACT_APP_ZEGO_APP_ID and REACT_APP_ZEGO_APP_SIGN in frontend/.env.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to join this room.');
        } else if (err.response?.status === 404) {
          setError('Room not found.');
        } else {
          setError('Failed to generate video call token. Please try again.');
        }
        setLoading(false);
      }
    };

    initializeVideoCall();

    // Cleanup on unmount
    return () => {
      safeDestroy();
    };
  }, [roomId, user]);

  const safeDestroy = () => {
    if (destroyedRef.current) return;
    try {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    } catch (e) {
      console.warn('Zego destroy error (ignored):', e);
    } finally {
      destroyedRef.current = true;
      zpRef.current = null;
    }
  };

  const handleLeaveRoom = () => {
    safeDestroy();
    toast.info('Left the video call');
    // Defer navigation to avoid unmount/destroy race inside the SDK
    setTimeout(() => navigate('/dashboard'), 0);
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    window.location.reload(); // Simple retry by reloading
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <VideoCameraIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <LoadingSpinner text="Connecting to video call..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2 inline" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with leave button */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveRoom}
              className="btn-secondary"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Leave Call
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Video Call</h1>
              <p className="text-sm text-gray-600">Room ID: {roomId}</p>
            </div>
          </div>
          {joined && (
            <div className="flex items-center text-green-600">
              <VideoCameraIcon className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Video container */}
      <div
        ref={containerRef}
        className="w-full h-screen"
        style={{ height: 'calc(100vh - 73px)' }}
      />
    </div>
  );
};

export default VideoCall;