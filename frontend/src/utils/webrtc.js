/**
 * WebRTC Utility Module
 * 
 * Handles WebRTC peer connections for video/audio communication.
 * 
 * Key Concepts:
 * - RTCPeerConnection: Represents a connection between local and remote peer
 * - MediaStream: Contains audio/video tracks from camera/microphone
 * - ICE Candidate: Network address information for establishing connections
 * - SDP (Session Description Protocol): Describes media capabilities and settings
 * 
 * Architecture:
 * - Each remote participant gets their own RTCPeerConnection
 * - Local media stream is added to all peer connections
 * - Signaling (offer/answer/ICE) is handled via Socket.IO
 * - Actual media flows peer-to-peer (not through server)
 */

/**
 * WebRTC Configuration
 * STUN servers help with NAT traversal (discovering public IP)
 * TURN servers relay traffic when direct connection fails (not included here)
 */
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

/**
 * WebRTC Manager Class
 * Manages all peer connections and media streams for a meeting
 */
export class WebRTCManager {
  constructor(socket, roomId) {
    this.socket = socket;
    this.roomId = roomId;
    
    // Store peer connections: { socketId: RTCPeerConnection }
    this.peerConnections = new Map();
    
    // Local media streams
    this.localStream = null;
    this.screenStream = null;
    
    // Callbacks for UI updates
    this.onRemoteStream = null; // (socketId, stream) => void
    this.onRemoteStreamRemoved = null; // (socketId) => void
    this.onConnectionStateChange = null; // (socketId, state) => void
    
    // Setup Socket.IO event listeners
    this.setupSocketListeners();
  }

  /**
   * Initialize local media (camera + microphone)
   * @param {Object} constraints - Media constraints (audio, video)
   * @returns {Promise<MediaStream>} Local media stream
   */
  async initializeLocalMedia(constraints = { audio: true, video: true }) {
    try {
      console.log('🎥 Requesting camera and microphone access...');
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Local media initialized:', {
        audioTracks: this.localStream.getAudioTracks().length,
        videoTracks: this.localStream.getVideoTracks().length
      });
      
      return this.localStream;
    } catch (error) {
      console.error('❌ Failed to get local media:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera/microphone access denied. Please allow access and try again.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera or microphone found. Please connect a device and try again.');
      } else {
        throw new Error('Failed to access camera/microphone: ' + error.message);
      }
    }
  }

  /**
   * Start screen sharing
   * @returns {Promise<MediaStream>} Screen share stream
   */
  async startScreenShare() {
    try {
      console.log('🖥️  Requesting screen share...');
      
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always' // Show mouse cursor in screen share
        },
        audio: false // Screen audio not supported in most browsers
      });

      // Handle user stopping screen share via browser button
      this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('🖥️  Screen share stopped by user');
        this.stopScreenShare();
      });

      // Replace video track in all peer connections
      for (const [socketId, pc] of this.peerConnections.entries()) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(this.screenStream.getVideoTracks()[0]);
        }
      }

      // Notify server
      this.socket.emit('start-screen-share', { roomId: this.roomId });
      
      console.log('✅ Screen sharing started');
      return this.screenStream;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing and switch back to camera
   */
  async stopScreenShare() {
    if (!this.screenStream) return;

    // Stop screen share tracks
    this.screenStream.getTracks().forEach(track => track.stop());
    this.screenStream = null;

    // Switch back to camera in all peer connections
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      for (const [socketId, pc] of this.peerConnections.entries()) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }

    // Notify server
    this.socket.emit('stop-screen-share', { roomId: this.roomId });
    
    console.log('✅ Screen sharing stopped');
  }

  /**
   * Toggle microphone on/off
   * @param {boolean} enabled - True to enable, false to mute
   */
  toggleAudio(enabled) {
    if (!this.localStream) return;

    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });

    // Notify server for UI updates
    this.socket.emit('toggle-audio', { roomId: this.roomId, enabled });
    
    console.log(`🎤 Audio ${enabled ? 'enabled' : 'muted'}`);
  }

  /**
   * Toggle camera on/off
   * @param {boolean} enabled - True to enable, false to disable
   */
  toggleVideo(enabled) {
    if (!this.localStream) return;

    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });

    // Notify server for UI updates
    this.socket.emit('toggle-video', { roomId: this.roomId, enabled });
    
    console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Create a peer connection for a remote participant
   * @param {string} socketId - Remote participant's socket ID
   * @returns {RTCPeerConnection} New peer connection
   */
  createPeerConnection(socketId) {
    console.log(`🔗 Creating peer connection for ${socketId}`);

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log(`📥 Received remote track from ${socketId}:`, event.track.kind);
      
      if (this.onRemoteStream) {
        this.onRemoteStream(socketId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`🧊 Sending ICE candidate to ${socketId}`);
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: socketId
        });
      }
    };

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${socketId}: ${pc.connectionState}`);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(socketId, pc.connectionState);
      }

      // Clean up if connection fails or closes
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.removePeerConnection(socketId);
      }
    };

    // Handle negotiation needed (when tracks added/removed)
    pc.onnegotiationneeded = async () => {
      try {
        console.log(`🤝 Negotiation needed with ${socketId}`);
        await this.createAndSendOffer(socketId);
      } catch (error) {
        console.error('Negotiation error:', error);
      }
    };

    this.peerConnections.set(socketId, pc);
    return pc;
  }

  /**
   * Create and send WebRTC offer to remote peer
   * @param {string} socketId - Remote participant's socket ID
   */
  async createAndSendOffer(socketId) {
    const pc = this.peerConnections.get(socketId);
    if (!pc) return;

    try {
      console.log(`📤 Creating offer for ${socketId}`);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('webrtc-offer', {
        offer: offer,
        to: socketId
      });

      console.log(`✅ Offer sent to ${socketId}`);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  /**
   * Handle incoming WebRTC offer from remote peer
   * @param {string} socketId - Remote participant's socket ID
   * @param {RTCSessionDescriptionInit} offer - WebRTC offer
   */
  async handleOffer(socketId, offer) {
    console.log(`📥 Received offer from ${socketId}`);

    let pc = this.peerConnections.get(socketId);
    if (!pc) {
      pc = this.createPeerConnection(socketId);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket.emit('webrtc-answer', {
        answer: answer,
        to: socketId
      });

      console.log(`✅ Answer sent to ${socketId}`);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle incoming WebRTC answer from remote peer
   * @param {string} socketId - Remote participant's socket ID
   * @param {RTCSessionDescriptionInit} answer - WebRTC answer
   */
  async handleAnswer(socketId, answer) {
    console.log(`📥 Received answer from ${socketId}`);

    const pc = this.peerConnections.get(socketId);
    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`✅ Answer processed from ${socketId}`);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Handle incoming ICE candidate from remote peer
   * @param {string} socketId - Remote participant's socket ID
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   */
  async handleIceCandidate(socketId, candidate) {
    const pc = this.peerConnections.get(socketId);
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`🧊 Added ICE candidate from ${socketId}`);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Setup Socket.IO event listeners for signaling
   */
  setupSocketListeners() {
    // Handle incoming WebRTC offer
    this.socket.on('webrtc-offer', async ({ offer, from }) => {
      await this.handleOffer(from, offer);
    });

    // Handle incoming WebRTC answer
    this.socket.on('webrtc-answer', async ({ answer, from }) => {
      await this.handleAnswer(from, answer);
    });

    // Handle incoming ICE candidate
    this.socket.on('ice-candidate', async ({ candidate, from }) => {
      await this.handleIceCandidate(from, candidate);
    });
  }

  /**
   * Remove peer connection and clean up
   * @param {string} socketId - Remote participant's socket ID
   */
  removePeerConnection(socketId) {
    const pc = this.peerConnections.get(socketId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(socketId);
      
      if (this.onRemoteStreamRemoved) {
        this.onRemoteStreamRemoved(socketId);
      }
      
      console.log(`🗑️  Removed peer connection for ${socketId}`);
    }
  }

  /**
   * Clean up all connections and streams
   * Call this when leaving the meeting
   */
  cleanup() {
    console.log('🧹 Cleaning up WebRTC manager...');

    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Close all peer connections
    for (const [socketId, pc] of this.peerConnections.entries()) {
      pc.close();
    }
    this.peerConnections.clear();

    console.log('✅ WebRTC cleanup complete');
  }
}

/**
 * Get available media devices
 * Useful for device selection UI
 */
export async function getMediaDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    return {
      audioInputs: devices.filter(d => d.kind === 'audioinput'),
      videoInputs: devices.filter(d => d.kind === 'videoinput'),
      audioOutputs: devices.filter(d => d.kind === 'audiooutput')
    };
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }
}

/**
 * Check if browser supports required WebRTC features
 */
export function checkWebRTCSupport() {
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasRTCPeerConnection = !!window.RTCPeerConnection;
  
  return {
    supported: hasGetUserMedia && hasRTCPeerConnection,
    getUserMedia: hasGetUserMedia,
    peerConnection: hasRTCPeerConnection
  };
}
