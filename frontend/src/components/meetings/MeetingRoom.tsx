import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, Monitor,
  PhoneOff, MessageSquare, Users, Settings,
  X, Send
} from 'lucide-react';
// @ts-ignore - webrtc.js is a JS file
import { WebRTCManager, checkWebRTCSupport } from '../../utils/webrtc';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch, getAuthHeaders } from '../../services/api';

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // WebRTC and Socket refs
  const socketRef = useRef<any>(null);
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Meeting state
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [meetingExpired, setMeetingExpired] = useState(false);

  // Media controls state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Participants state
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Screen sharing state
  const [screenSharingUser, setScreenSharingUser] = useState<string | null>(null); // socketId or 'local'

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs for remote videos
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  /**
   * Validate meeting before joining
   */
  const validateMeeting = async () => {
    try {
      const response = await apiFetch(`/meetings/${roomId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.success) {
        if (response.expired) {
          setMeetingExpired(true);
          setError('This meeting has expired and can no longer be joined.');
        } else {
          setError(response.message || 'Failed to load meeting');
        }
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error validating meeting:', err);
      if (err.status === 410 || err.response?.expired) {
        setMeetingExpired(true);
        setError('This meeting has expired and can no longer be joined.');
      } else {
        setError(err.message || 'Failed to validate meeting');
      }
      return false;
    }
  };

  /**
   * Initialize meeting on component mount
   */
  useEffect(() => {
    if (!roomId || !user) {
      setError('Invalid meeting or user not authenticated');
      return;
    }

    // Check WebRTC support
    const support = checkWebRTCSupport();
    if (!support.supported) {
      setError('Your browser does not support video calling. Please use Chrome, Firefox, or Safari.');
      return;
    }

    // Validate meeting before initializing
    validateMeeting().then(isValid => {
      if (isValid) {
        initializeMeeting();
      } else {
        setIsConnecting(false);
      }
    });

    return () => {
      cleanup();
    };
  }, [roomId, user]);

  /**
   * Initialize Socket.IO connection and WebRTC
   */
  const initializeMeeting = async () => {
    try {
      setIsConnecting(true);

      // Connect to Socket.IO server
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
        auth: {
          token: 'placeholder', // TODO: Pass real JWT token
          userId: user?.id || 'unknown',
          userName: `${user?.firstName || 'User'} ${user?.lastName || ''}`
        },
        transports: ['websocket', 'polling']
      });

      socketRef.current = socket;

      // Setup socket event listeners
      setupSocketListeners(socket);

      // Initialize WebRTC manager
      const webrtcManager = new WebRTCManager(socket, roomId!);
      webrtcManagerRef.current = webrtcManager;

      // Get local media
      const localStream = await webrtcManager.initializeLocalMedia({
        audio: true,
        video: true
      });

      console.log('📹 Local stream obtained:', localStream);
      console.log('📹 Video tracks:', localStream.getVideoTracks());
      console.log('📹 Audio tracks:', localStream.getAudioTracks());

      // Display local video - wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (localVideoRef.current) {
        console.log('📹 Setting srcObject on localVideoRef');
        localVideoRef.current.srcObject = localStream;
        // Explicitly play the video
        try {
          await localVideoRef.current.play();
          console.log('✅ Local video playing successfully');
        } catch (playError) {
          console.error('❌ Error playing local video:', playError);
        }
      } else {
        console.error('❌ localVideoRef.current is null!');
      }

      // Setup WebRTC callbacks
      webrtcManager.onRemoteStream = (socketId: string, stream: MediaStream) => {
        console.log('🎬 Got remote stream from:', socketId);
        console.log('🎬 Stream details:', {
          id: stream.id,
          active: stream.active,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          videoTrackEnabled: stream.getVideoTracks()[0]?.enabled,
          audioTrackEnabled: stream.getAudioTracks()[0]?.enabled
        });
        setRemoteStreams(prev => new Map(prev).set(socketId, stream));
      };

      webrtcManager.onRemoteStreamRemoved = (socketId: string) => {
        console.log('Remote stream removed:', socketId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
      };

      // Join the room
      // TODO: Check if user is host from database
      const hostCheck = false; // Placeholder
      setIsHost(hostCheck);
      socket.emit('join-room', { roomId, isHost: hostCheck });

      setIsConnecting(false);
    } catch (err: any) {
      console.error('Failed to initialize meeting:', err);
      setError(err.message || 'Failed to join meeting');
      setIsConnecting(false);
    }
  };

  /**
   * Setup Socket.IO event listeners
   */
  const setupSocketListeners = (socket: any) => {
    // Existing participants in room
    socket.on('existing-participants', (participants: any[]) => {
      console.log('Existing participants:', participants);
      participants.forEach(p => {
        setParticipants(prev => new Map(prev).set(p.socketId, p));
        
        // Create peer connection for each existing participant
        if (webrtcManagerRef.current) {
          webrtcManagerRef.current.createPeerConnection(p.socketId);
          webrtcManagerRef.current.createAndSendOffer(p.socketId);
        }
      });
    });

    // New user joined
    socket.on('user-joined', (data: any) => {
      console.log('User joined:', data);
      setParticipants(prev => new Map(prev).set(data.socketId, data));
      
      // Peer connection will be created when we receive their offer
    });

    // User left
    socket.on('user-left', (data: any) => {
      console.log('User left:', data);
      setParticipants(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.socketId);
        return newMap;
      });
      
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.removePeerConnection(data.socketId);
      }
    });

    // Media state changes
    socket.on('participant-audio-changed', ({ socketId, audio }: any) => {
      setParticipants(prev => {
        const newMap = new Map(prev);
        const participant = newMap.get(socketId);
        if (participant) {
          newMap.set(socketId, { ...participant, audio });
        }
        return newMap;
      });
    });

    socket.on('participant-video-changed', ({ socketId, video }: any) => {
      setParticipants(prev => {
        const newMap = new Map(prev);
        const participant = newMap.get(socketId);
        if (participant) {
          newMap.set(socketId, { ...participant, video });
        }
        return newMap;
      });
    });

    // Chat messages
    socket.on('chat-message', (message: any) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Screen sharing
    socket.on('screen-share-started', (data: any) => {
      console.log('Screen share started:', data);
      setScreenSharingUser(data.socketId);
    });

    socket.on('screen-share-stopped', (data: any) => {
      console.log('Screen share stopped:', data);
      setScreenSharingUser(null);
    });

    // Meeting ended by host
    socket.on('meeting-ended', (data: any) => {
      alert(data.message);
      leaveMeeting();
    });

    // Errors
    socket.on('error', (data: any) => {
      setError(data.message);
    });
  };

  /**
   * Ensure local video stream is attached to video element
   */
  useEffect(() => {
    const attachLocalVideo = async () => {
      if (localVideoRef.current && webrtcManagerRef.current?.localStream) {
        const currentStream = localVideoRef.current.srcObject as MediaStream;
        const localStream = webrtcManagerRef.current.localStream;
        
        // Only update if stream is different or not set
        if (currentStream !== localStream && !isScreenSharing) {
          console.log('📹 Attaching local video stream to element');
          localVideoRef.current.srcObject = localStream;
          try {
            await localVideoRef.current.play();
            console.log('✅ Local video element playing');
          } catch (error) {
            console.error('❌ Error playing local video element:', error);
          }
        }
      }
    };

    attachLocalVideo();
  }, [localVideoRef.current, webrtcManagerRef.current?.localStream, isScreenSharing]);

  /**
   * Attach remote stream to video element
   */
  useEffect(() => {
    console.log('🔄 useEffect triggered - remoteStreams count:', remoteStreams.size);
    console.log('🔄 Available video elements:', remoteVideosRef.current.size);
    
    remoteStreams.forEach(async (stream, socketId) => {
      const videoElement = remoteVideosRef.current.get(socketId);
      console.log(`📺 Processing stream for ${socketId}:`, {
        hasVideoElement: !!videoElement,
        currentSrcObject: videoElement?.srcObject,
        newStream: stream,
        needsUpdate: videoElement && videoElement.srcObject !== stream
      });
      
      if (videoElement && videoElement.srcObject !== stream) {
        console.log('📺 Setting remote stream for:', socketId);
        videoElement.srcObject = stream;
        // Explicitly play remote video
        try {
          await videoElement.play();
          console.log('✅ Remote video playing for:', socketId);
        } catch (playError) {
          console.error('❌ Error playing remote video:', playError);
        }
      } else if (!videoElement) {
        console.warn('⚠️ No video element found for socketId:', socketId);
      }
    });
  }, [remoteStreams]);

  /**
   * Toggle microphone
   */
  const toggleAudio = () => {
    if (webrtcManagerRef.current) {
      const newState = !audioEnabled;
      webrtcManagerRef.current.toggleAudio(newState);
      setAudioEnabled(newState);
    }
  };

  /**
   * Toggle camera
   */
  const toggleVideo = () => {
    if (webrtcManagerRef.current) {
      const newState = !videoEnabled;
      webrtcManagerRef.current.toggleVideo(newState);
      setVideoEnabled(newState);
    }
  };

  /**
   * Toggle screen sharing
   */
  const toggleScreenShare = async () => {
    if (!webrtcManagerRef.current) return;

    try {
      if (isScreenSharing) {
        console.log('🖥️ Stopping screen share...');
        await webrtcManagerRef.current.stopScreenShare();
        
        // Restore camera view
        if (localVideoRef.current && webrtcManagerRef.current.localStream) {
          localVideoRef.current.srcObject = webrtcManagerRef.current.localStream;
          await localVideoRef.current.play();
        }
        
        setIsScreenSharing(false);
        setScreenSharingUser(null);
        console.log('✅ Screen share stopped, camera restored');
      } else {
        console.log('🖥️ Starting screen share...');
        const screenStream = await webrtcManagerRef.current.startScreenShare();
        console.log('✅ Screen share started:', screenStream);
        
        // Update local video to show screen share
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
          await localVideoRef.current.play();
        }
        
        setIsScreenSharing(true);
        setScreenSharingUser('local');
      }
    } catch (error: any) {
      console.error('❌ Screen share error:', error);
      alert('Failed to share screen: ' + error.message);
    }
  };

  /**
   * Send chat message
   */
  const sendChatMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;

    socketRef.current.emit('chat-message', {
      roomId,
      message: chatInput.trim()
    });

    setChatInput('');
  };

  /**
   * Leave meeting
   */
  const leaveMeeting = () => {
    cleanup();
    navigate('/coach/meetings');
  };

  /**
   * End meeting (host only)
   */
  const endMeeting = () => {
    if (!isHost) return;

    if (confirm('Are you sure you want to end this meeting for everyone?')) {
      socketRef.current?.emit('end-meeting', { roomId });
      cleanup();
      navigate('/coach/meetings');
    }
  };

  /**
   * Cleanup resources
   */
  const cleanup = () => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.cleanup();
    }

    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
      socketRef.current.disconnect();
    }
  };

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Loading state
  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining meeting...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md">
          {meetingExpired ? (
            <>
              <div className="text-orange-500 text-6xl mb-4">🕐</div>
              <h2 className="text-white text-2xl font-bold mb-2">Meeting Expired</h2>
              <p className="text-gray-400 mb-6">
                This meeting has passed its scheduled time and can no longer be joined.
              </p>
            </>
          ) : (
            <>
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-white text-2xl font-bold mb-2">Unable to Join Meeting</h2>
              <p className="text-gray-400 mb-6">{error}</p>
            </>
          )}
          <button
            onClick={() => navigate(user?.role === 'instructor' ? '/coach/meetings' : '/student/meetings')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  const participantArray = Array.from(participants.values());
  const totalParticipants = participantArray.length + 1; // +1 for local user
  const isSomeoneScreenSharing = screenSharingUser !== null;

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {isSomeoneScreenSharing ? (
        /* Google Meet Style: Screen Share Layout */
        <div className="absolute inset-0 flex">
          {/* Main Screen Share Area */}
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {screenSharingUser === 'local' ? (
                /* Local user is sharing */
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-red-600 px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    You are presenting
                  </div>
                </>
              ) : (
                /* Remote user is sharing */
                <>
                  <video
                    ref={(el) => {
                      if (el && screenSharingUser) {
                        console.log('🎥 Screen share video element mounted for socketId:', screenSharingUser);
                        remoteVideosRef.current.set(screenSharingUser, el);
                        // Attach stream immediately if available
                        const stream = remoteStreams.get(screenSharingUser);
                        if (stream && el.srcObject !== stream) {
                          console.log('🎥 Setting screen share stream immediately for:', screenSharingUser);
                          el.srcObject = stream;
                          el.play().catch(err => console.error('Error playing screen share:', err));
                        } else {
                          console.warn('⚠️ No stream available yet for screen share:', screenSharingUser);
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {participants.get(screenSharingUser)?.userName || 'Someone'} is presenting
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar with Participant Thumbnails */}
          <div className="w-80 p-4 flex flex-col gap-2 overflow-y-auto">
            {/* Local Video Thumbnail */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex-shrink-0">
              {screenSharingUser === 'local' ? (
                /* Show camera when sharing screen */
                webrtcManagerRef.current?.localStream && (
                  <video
                    ref={(el) => {
                      if (el && webrtcManagerRef.current?.localStream) {
                        el.srcObject = webrtcManagerRef.current.localStream;
                        el.play().catch(console.error);
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                /* Show local video normally */
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
                You {isHost && '(Host)'}
              </div>
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Participant Thumbnails */}
            {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
              const participant = participants.get(socketId);
              const isSharing = socketId === screenSharingUser;
              
              if (isSharing) return null; // Don't show thumbnail for the one sharing

              return (
                <div key={`thumbnail-${socketId}`} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex-shrink-0">
                  <video
                    ref={(el) => {
                      if (el) {
                        console.log('🎥 Thumbnail video element mounted for socketId:', socketId);
                        // Don't store in remoteVideosRef to avoid conflicts with main display
                        // Just set the stream directly
                        if (stream && el.srcObject !== stream) {
                          console.log('🎥 Setting stream immediately on thumbnail mount for:', socketId);
                          el.srcObject = stream;
                          el.play().catch(err => console.error('Error playing thumbnail on mount:', err));
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    {participant?.userName || 'Unknown'}
                    {!participant?.audio && <MicOff className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Normal Grid Layout */
        <div className="absolute inset-0 p-4">
          <div className={`grid gap-2 h-full w-full ${
            totalParticipants === 1 ? 'grid-cols-1' :
            totalParticipants === 2 ? 'grid-cols-2' :
            totalParticipants <= 4 ? 'grid-cols-2 grid-rows-2' :
            totalParticipants <= 6 ? 'grid-cols-3 grid-rows-2' :
            'grid-cols-4 grid-rows-2'
          }`}>
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={(el) => {
                  if (el) {
                    localVideoRef.current = el;
                    // Attach stream if available
                    if (webrtcManagerRef.current?.localStream && !isScreenSharing) {
                      el.srcObject = webrtcManagerRef.current.localStream;
                      el.play().catch(err => console.error('Error playing local video:', err));
                    }
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                You {isHost && '(Host)'}
              </div>
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <p className="text-sm">Camera Off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
              const participant = participants.get(socketId);
              return (
                <div key={socketId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) {
                        console.log('🎥 Video element mounted for socketId:', socketId);
                        remoteVideosRef.current.set(socketId, el);
                        // Try to set stream immediately if available
                        if (stream && el.srcObject !== stream) {
                          console.log('🎥 Setting stream immediately on mount for:', socketId);
                          el.srcObject = stream;
                          el.play().catch(err => console.error('Error playing on mount:', err));
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                    {participant?.userName || 'Unknown'}
                    {!participant?.audio && <MicOff className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          {/* Left: Meeting Info */}
          <div className="flex items-center gap-4">
            <div className="text-white">
              <p className="text-sm text-gray-300">Meeting Room</p>
              <p className="font-semibold">{roomId}</p>
            </div>
          </div>

          {/* Center: Main Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition ${
                audioEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition ${
                videoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={videoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {videoEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition ${
                isScreenSharing 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            >
              <MonitorUp className="w-6 h-6" />
            </button>

            <button
              onClick={isHost ? endMeeting : leaveMeeting}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
              title={isHost ? 'End Meeting' : 'Leave Meeting'}
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Right: Secondary Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition relative"
              title="Participants"
            >
              <Users className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalParticipants}
              </span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition relative"
              title="Chat"
            >
              <MessageSquare className="w-6 h-6" />
              {chatMessages.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Participants ({totalParticipants})</h3>
            <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Local User */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-700">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">You {isHost && '(Host)'}</p>
              </div>
              <div className="flex gap-1">
                {audioEnabled && <Mic className="w-4 h-4 text-green-500" />}
                {videoEnabled && <VideoIcon className="w-4 h-4 text-green-500" />}
              </div>
            </div>

            {/* Remote Participants */}
            {participantArray.map(p => (
              <div key={p.socketId} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {p.userName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{p.userName} {p.isHost && '(Host)'}</p>
                </div>
                <div className="flex gap-1">
                  {p.audio && <Mic className="w-4 h-4 text-green-500" />}
                  {p.video && <VideoIcon className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute top-0 right-0 w-96 h-full bg-gray-800 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Chat</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">No messages yet</p>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                  <p className="text-white font-medium text-sm">{msg.userName}</p>
                  <p className="text-gray-300 text-sm mt-1">{msg.message}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendChatMessage}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
