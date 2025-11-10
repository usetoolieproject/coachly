/**
 * Video Meeting Service - WebRTC Signaling Server
 * 
 * This service handles real-time signaling for WebRTC video meetings using Socket.IO.
 * It manages room creation, peer connections, and communication between participants.
 * 
 * Key Concepts:
 * - Signaling: Exchange of connection info (SDP offers/answers, ICE candidates) between peers
 * - Room: A virtual meeting space identified by a unique ID
 * - Peer: A participant in a meeting with their own media streams
 * 
 * Flow:
 * 1. User joins room → server assigns them a socket ID
 * 2. Server broadcasts "user-joined" to existing participants
 * 3. Participants exchange WebRTC offers/answers through the server
 * 4. ICE candidates are exchanged to establish peer-to-peer connections
 * 5. Media streams flow directly between peers (not through server)
 */

import { Server as SocketServer } from 'socket.io';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

/**
 * Active meetings store - tracks participants in real-time
 * Structure: { roomId: { participants: Map<socketId, userData>, startedAt: timestamp } }
 */
const activeMeetings = new Map();

/**
 * Initialize Socket.IO server for WebRTC signaling
 * @param {HttpServer} httpServer - Express HTTP server instance
 */
export function initializeVideoMeetingSocket(httpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  });

  console.log('🎥 Video Meeting Socket.IO server initialized');

  // Authentication middleware - verify user before allowing socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;
      const userName = socket.handshake.auth.userName;

      // TODO: Add proper JWT token verification here
      // For now, we trust the client-provided userId
      if (!userId || !userName) {
        return next(new Error('Authentication required'));
      }

      socket.userId = userId;
      socket.userName = userName;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    /**
     * JOIN ROOM
     * When a user joins a meeting room
     * Emits: user-joined (to all other participants)
     * Returns: existing-participants (to the new joiner)
     */
    socket.on('join-room', async ({ roomId, isHost = false }) => {
      try {
        console.log(`🚪 ${socket.userName} joining room: ${roomId}`);

        // Note: For local MongoDB, we'll skip database verification for now
        // In production with Supabase, you would verify the meeting exists
        // For now, we'll allow any room to be created dynamically
        
        console.log(`✅ Room ${roomId} - allowing join (MongoDB mode)`);
        
        // TODO: Add MongoDB meeting verification when needed
        // const Meeting = mongoose.model('Meeting');
        // const meeting = await Meeting.findOne({ meeting_id: roomId });
        // if (!meeting) { socket.emit('error', { message: 'Meeting not found' }); return; }

        // TODO: Verify user has permission to join this meeting
        // Check if user is the host or an invited participant

        // Join the socket room
        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.isHost = isHost;

        // Initialize room in active meetings if not exists
        if (!activeMeetings.has(roomId)) {
          activeMeetings.set(roomId, {
            participants: new Map(),
            startedAt: Date.now(),
            meetingId: roomId
          });
        }

        const room = activeMeetings.get(roomId);

        // Get list of existing participants before adding new one
        const existingParticipants = Array.from(room.participants.entries()).map(([id, data]) => ({
          socketId: id,
          userId: data.userId,
          userName: data.userName,
          isHost: data.isHost,
          audio: data.audio,
          video: data.video
        }));

        // Add new participant to room
        room.participants.set(socket.id, {
          userId: socket.userId,
          userName: socket.userName,
          isHost: isHost,
          audio: true,
          video: true,
          joinedAt: Date.now()
        });

        // Send existing participants to the new joiner
        socket.emit('existing-participants', existingParticipants);

        // Notify all other participants about new user
        socket.to(roomId).emit('user-joined', {
          socketId: socket.id,
          userId: socket.userId,
          userName: socket.userName,
          isHost: isHost
        });

        // Update meeting status to 'in-progress' if host joins
        if (isHost) {
          // TODO: Update MongoDB meeting status
          console.log(`📝 Meeting ${roomId} started by host - would update MongoDB here`);
        }

        console.log(`✅ ${socket.userName} joined room ${roomId}. Total participants: ${room.participants.size}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    /**
     * WEBRTC SIGNALING - OFFER
     * Participant A wants to connect to Participant B
     * Forwards the SDP offer to the target peer
     */
    socket.on('webrtc-offer', ({ offer, to }) => {
      console.log(`📤 Forwarding WebRTC offer from ${socket.id} to ${to}`);
      io.to(to).emit('webrtc-offer', {
        offer,
        from: socket.id,
        fromUser: {
          userId: socket.userId,
          userName: socket.userName
        }
      });
    });

    /**
     * WEBRTC SIGNALING - ANSWER
     * Participant B responds to Participant A's offer
     * Forwards the SDP answer back to the original peer
     */
    socket.on('webrtc-answer', ({ answer, to }) => {
      console.log(`📤 Forwarding WebRTC answer from ${socket.id} to ${to}`);
      io.to(to).emit('webrtc-answer', {
        answer,
        from: socket.id
      });
    });

    /**
     * WEBRTC SIGNALING - ICE CANDIDATE
     * Exchange ICE candidates for NAT traversal
     * Allows peers to find the best path to connect
     */
    socket.on('ice-candidate', ({ candidate, to }) => {
      io.to(to).emit('ice-candidate', {
        candidate,
        from: socket.id
      });
    });

    /**
     * MEDIA CONTROL - TOGGLE AUDIO
     * Participant mutes/unmutes their microphone
     * Broadcasts state to all participants in the room
     */
    socket.on('toggle-audio', ({ roomId, enabled }) => {
      if (!activeMeetings.has(roomId)) return;

      const room = activeMeetings.get(roomId);
      const participant = room.participants.get(socket.id);
      
      if (participant) {
        participant.audio = enabled;
        socket.to(roomId).emit('participant-audio-changed', {
          socketId: socket.id,
          audio: enabled
        });
        console.log(`🎤 ${socket.userName} ${enabled ? 'unmuted' : 'muted'} audio`);
      }
    });

    /**
     * MEDIA CONTROL - TOGGLE VIDEO
     * Participant enables/disables their camera
     * Broadcasts state to all participants in the room
     */
    socket.on('toggle-video', ({ roomId, enabled }) => {
      if (!activeMeetings.has(roomId)) return;

      const room = activeMeetings.get(roomId);
      const participant = room.participants.get(socket.id);
      
      if (participant) {
        participant.video = enabled;
        socket.to(roomId).emit('participant-video-changed', {
          socketId: socket.id,
          video: enabled
        });
        console.log(`📹 ${socket.userName} ${enabled ? 'enabled' : 'disabled'} video`);
      }
    });

    /**
     * CHAT MESSAGE
     * Send text message to all participants in the room
     * TODO: Save messages to database for chat history
     */
    socket.on('chat-message', ({ roomId, message }) => {
      if (!socket.currentRoom || socket.currentRoom !== roomId) return;

      const chatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: socket.userId,
        userName: socket.userName,
        message: message,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all participants including sender
      io.to(roomId).emit('chat-message', chatMessage);

      console.log(`💬 Chat message in ${roomId}: ${socket.userName}: ${message}`);

      // TODO: Save to database
      // await supabase.from('meeting_messages').insert(chatMessage);
    });

    /**
     * SCREEN SHARE START
     * Participant starts sharing their screen
     * Notifies all other participants
     */
    socket.on('start-screen-share', ({ roomId }) => {
      socket.to(roomId).emit('screen-share-started', {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.userName
      });
      console.log(`🖥️  ${socket.userName} started screen sharing`);
    });

    /**
     * SCREEN SHARE STOP
     * Participant stops sharing their screen
     * Notifies all other participants
     */
    socket.on('stop-screen-share', ({ roomId }) => {
      socket.to(roomId).emit('screen-share-stopped', {
        socketId: socket.id
      });
      console.log(`🖥️  ${socket.userName} stopped screen sharing`);
    });

    /**
     * LEAVE ROOM
     * Participant intentionally leaves the meeting
     * Clean up and notify others
     */
    socket.on('leave-room', async ({ roomId }) => {
      await handleUserLeaving(socket, roomId);
    });

    /**
     * DISCONNECT
     * Socket connection lost (network issue, browser closed, etc.)
     * Clean up and notify others
     */
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userName}`);
      
      if (socket.currentRoom) {
        await handleUserLeaving(socket, socket.currentRoom);
      }
    });

    /**
     * END MEETING
     * Host ends the meeting for everyone
     * Only the host can end the meeting
     */
    socket.on('end-meeting', async ({ roomId }) => {
      if (!socket.isHost) {
        socket.emit('error', { message: 'Only host can end meeting' });
        return;
      }

      console.log(`🛑 Host ${socket.userName} ending meeting ${roomId}`);

      // Notify all participants
      io.to(roomId).emit('meeting-ended', {
        endedBy: socket.userName,
        message: 'The meeting has been ended by the host'
      });

      // Update meeting status in database (MongoDB)
      // TODO: Update MongoDB meeting status
      console.log(`📝 Meeting ${roomId} ended - would update MongoDB here`);

      // Clean up active meeting
      if (activeMeetings.has(roomId)) {
        activeMeetings.delete(roomId);
      }

      // Disconnect all sockets in this room
      const sockets = await io.in(roomId).fetchSockets();
      for (const s of sockets) {
        s.leave(roomId);
      }
    });
  });

  /**
   * Helper function to handle user leaving a room
   * Cleans up participant data and notifies others
   */
  async function handleUserLeaving(socket, roomId) {
    if (!activeMeetings.has(roomId)) return;

    const room = activeMeetings.get(roomId);
    room.participants.delete(socket.id);

    // Notify others that user left
    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName
    });

    socket.leave(roomId);
    console.log(`👋 ${socket.userName} left room ${roomId}. Remaining: ${room.participants.size}`);

    // If room is empty, clean it up
    if (room.participants.size === 0) {
      console.log(`🧹 Cleaning up empty room: ${roomId}`);
      activeMeetings.delete(roomId);

      // Update meeting status in database if it was in progress
      // TODO: Update MongoDB meeting status when room becomes empty
      console.log(`📝 Room ${roomId} empty - would update MongoDB status to ended`);
    }
  }

  return io;
}

/**
 * Get active meetings statistics
 * Useful for monitoring and analytics
 */
export function getActiveMeetingsStats() {
  const stats = [];
  
  for (const [roomId, room] of activeMeetings.entries()) {
    stats.push({
      roomId,
      participantCount: room.participants.size,
      startedAt: room.startedAt,
      duration: Date.now() - room.startedAt,
      participants: Array.from(room.participants.values()).map(p => ({
        userId: p.userId,
        userName: p.userName,
        isHost: p.isHost,
        audio: p.audio,
        video: p.video
      }))
    });
  }

  return {
    totalMeetings: activeMeetings.size,
    totalParticipants: stats.reduce((sum, m) => sum + m.participantCount, 0),
    meetings: stats
  };
}
