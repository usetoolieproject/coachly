import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Monitor, Camera, Mic, Square, Download, X, Trash2,
  Play, Pause, Circle, RectangleHorizontal, Volume2, Eye
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenRecorderProps {
  onUploadComplete?: (url: string) => void;
  maxDurationSeconds?: number;
}

/**
 * ScreenRecorder Component
 * 
 * A Loom-style screen recorder that captures:
 * - Screen content via getDisplayMedia
 * - Webcam feed via getUserMedia (overlaid in corner)
 * - Microphone audio
 * 
 * Features:
 * - Real-time preview during recording
 * - Video playback after recording
 * - Download recorded video
 * - Upload to backend API
 */
export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ 
  onUploadComplete,
  maxDurationSeconds = 600 // 10 minutes default
}) => {
  const { isDarkMode } = useTheme();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  // Recording mode: 'screen+camera', 'screen', 'camera'
  const [recordingMode, setRecordingMode] = useState<'screen+camera' | 'screen' | 'camera'>('screen+camera');
  
  // Camera settings
  const [cameraSize, setCameraSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [cameraPosition, setCameraPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [cameraShape, setCameraShape] = useState<'circle' | 'square'>('circle');
  
  // Audio toggles
  const [includeMicrophone, setIncludeMicrophone] = useState(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);

  // Refs for media elements and streams
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const previewScreenVideoRef = useRef<HTMLVideoElement>(null); // Hidden video for compositing
  const previewWebcamVideoRef = useRef<HTMLVideoElement>(null); // Hidden video for compositing
  const previewDisplayVideoRef = useRef<HTMLVideoElement>(null); // Visible preview video for screen/camera only modes
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previewAnimationFrameRef = useRef<number | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const isPreviewDrawingRef = useRef<boolean>(false);
  
  // Refs for camera settings to access current values in animation loop
  const cameraSizeRef = useRef(cameraSize);
  const cameraPositionRef = useRef(cameraPosition);
  const cameraShapeRef = useRef(cameraShape);

  // Cleanup function to stop all streams
  const stopAllStreams = () => {
    // Stop preview if active
    if (isPreviewActive) {
      stopPreview();
    }

    [screenStreamRef.current, webcamStreamRef.current, audioStreamRef.current].forEach(stream => {
      stream?.getTracks().forEach(track => track.stop());
    });
    screenStreamRef.current = null;
    webcamStreamRef.current = null;
    audioStreamRef.current = null;
    
    // Stop canvas animation
    isDrawingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Attach streams to video elements when recording starts
  useEffect(() => {
    if (isRecording) {
      // Attach screen stream to preview
      if (previewVideoRef.current && screenStreamRef.current) {
        previewVideoRef.current.srcObject = screenStreamRef.current;
        previewVideoRef.current.play().catch(err => console.warn('Preview play failed:', err));
      }

      // Attach webcam stream to webcam preview
      if (webcamVideoRef.current && webcamStreamRef.current) {
        webcamVideoRef.current.srcObject = webcamStreamRef.current;
        webcamVideoRef.current.play().catch(err => console.warn('Webcam play failed:', err));
      }
    }
  }, [isRecording]);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSeconds) {
            handleStopRecording();
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Update refs when camera settings change
  useEffect(() => {
    cameraSizeRef.current = cameraSize;
    cameraPositionRef.current = cameraPosition;
    cameraShapeRef.current = cameraShape;
  }, [cameraSize, cameraPosition, cameraShape]);

  /**
   * Start Live Preview
   */
  const handleStartPreview = async () => {
    try {
      console.log('🎬 Starting preview, mode:', recordingMode);
      setError(null);
      setIsPreviewActive(true);

      // Capture streams based on recording mode
      let screenStream: MediaStream | null = null;
      let webcamStream: MediaStream | null = null;

      if (recordingMode !== 'camera') {
        console.log('📺 Requesting screen capture...');
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } } as MediaTrackConstraints,
          audio: false
        });
        screenStreamRef.current = screenStream;
        console.log('✅ Screen stream captured:', screenStream.getVideoTracks().length, 'video tracks');
      }

      if (recordingMode !== 'screen') {
        console.log('📷 Requesting webcam...');
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        webcamStreamRef.current = webcamStream;
        console.log('✅ Webcam stream captured:', webcamStream.getVideoTracks().length, 'video tracks');
      }

      // Show preview container first so elements are mounted
      setShowPreview(true);
      
      // Wait for elements to mount
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('⏳ Waited for elements to mount');
      console.log('🎨 Canvas ref exists:', !!previewCanvasRef.current);
      console.log('📺 Screen video ref exists:', !!previewScreenVideoRef.current);
      console.log('📷 Webcam video ref exists:', !!previewWebcamVideoRef.current);
      console.log('📺 Display video ref exists:', !!previewDisplayVideoRef.current);

      // Setup preview based on mode
      if (recordingMode === 'screen+camera' && screenStream && webcamStream && previewCanvasRef.current) {
        console.log('🎨 Setting up canvas compositing preview');
        // Canvas compositing preview
        const canvas = previewCanvasRef.current;
        console.log('🎨 Canvas element:', canvas);
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          console.error('❌ Failed to get canvas context');
          return;
        }

        const videoTrack = screenStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        canvas.width = settings.width || 1920;
        canvas.height = settings.height || 1080;
        console.log('🎨 Canvas dimensions:', canvas.width, 'x', canvas.height);

        // Attach streams to video elements
        console.log('🎨 Attaching streams to hidden video elements');
        if (previewScreenVideoRef.current) {
          previewScreenVideoRef.current.srcObject = screenStream;
          await previewScreenVideoRef.current.play();
          console.log('✅ Screen video playing, readyState:', previewScreenVideoRef.current.readyState);
        }
        if (previewWebcamVideoRef.current) {
          previewWebcamVideoRef.current.srcObject = webcamStream;
          await previewWebcamVideoRef.current.play();
          console.log('✅ Webcam video playing, readyState:', previewWebcamVideoRef.current.readyState);
        }

        // Wait a bit more for videos to be ready
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('🎨 Starting animation loop');

        // Animation loop
        isPreviewDrawingRef.current = true;
        let frameCount = 0;
        const drawPreviewFrame = () => {
          if (!isPreviewDrawingRef.current) {
            console.log('⏹️ Animation loop stopped');
            return;
          }

          // Recalculate camera overlay size and position on every frame (for real-time updates)
          // Use refs to get current values from state
          const currentSize = cameraSizeRef.current;
          const currentPosition = cameraPositionRef.current;
          const currentShape = cameraShapeRef.current;
          
          const sizeMultiplier = currentSize === 'small' ? 0.12 : currentSize === 'large' ? 0.20 : 0.15;
          const webcamWidth = Math.floor(canvas.width * sizeMultiplier);
          const webcamHeight = currentShape === 'circle' ? webcamWidth : Math.floor(webcamWidth * 0.75);
          const padding = 20;
          let webcamX: number, webcamY: number;
          
          switch (currentPosition) {
            case 'top-left': webcamX = padding; webcamY = padding; break;
            case 'top-right': webcamX = canvas.width - webcamWidth - padding; webcamY = padding; break;
            case 'bottom-left': webcamX = padding; webcamY = canvas.height - webcamHeight - padding; break;
            case 'bottom-right':
            default: webcamX = canvas.width - webcamWidth - padding; webcamY = canvas.height - webcamHeight - padding;
          }

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw screen
          if (previewScreenVideoRef.current && previewScreenVideoRef.current.readyState >= 2) {
            ctx.drawImage(previewScreenVideoRef.current, 0, 0, canvas.width, canvas.height);
            if (frameCount === 0) {
              console.log('🎨 First frame drawn from screen');
            }
          } else if (frameCount === 0) {
            console.warn('⚠️ Screen video not ready, readyState:', previewScreenVideoRef.current?.readyState);
          }

          // Draw camera overlay
          if (previewWebcamVideoRef.current && previewWebcamVideoRef.current.readyState >= 2) {
            if (frameCount === 0) {
              console.log('🎨 Drawing webcam overlay');
            }
            ctx.save();
            if (currentShape === 'circle') {
              const radius = webcamWidth / 2;
              const centerX = webcamX + radius;
              const centerY = webcamY + radius;
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(previewWebcamVideoRef.current, webcamX, webcamY, webcamWidth, webcamWidth);
              ctx.restore();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              const borderRadius = 12;
              ctx.beginPath();
              ctx.moveTo(webcamX + borderRadius, webcamY);
              ctx.lineTo(webcamX + webcamWidth - borderRadius, webcamY);
              ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY, webcamX + webcamWidth, webcamY + borderRadius);
              ctx.lineTo(webcamX + webcamWidth, webcamY + webcamHeight - borderRadius);
              ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY + webcamHeight, webcamX + webcamWidth - borderRadius, webcamY + webcamHeight);
              ctx.lineTo(webcamX + borderRadius, webcamY + webcamHeight);
              ctx.quadraticCurveTo(webcamX, webcamY + webcamHeight, webcamX, webcamY + webcamHeight - borderRadius);
              ctx.lineTo(webcamX, webcamY + borderRadius);
              ctx.quadraticCurveTo(webcamX, webcamY, webcamX + borderRadius, webcamY);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(previewWebcamVideoRef.current, webcamX, webcamY, webcamWidth, webcamHeight);
              ctx.restore();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(webcamX + borderRadius, webcamY);
              ctx.lineTo(webcamX + webcamWidth - borderRadius, webcamY);
              ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY, webcamX + webcamWidth, webcamY + borderRadius);
              ctx.lineTo(webcamX + webcamWidth, webcamY + webcamHeight - borderRadius);
              ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY + webcamHeight, webcamX + webcamWidth - borderRadius, webcamY + webcamHeight);
              ctx.lineTo(webcamX + borderRadius, webcamY + webcamHeight);
              ctx.quadraticCurveTo(webcamX, webcamY + webcamHeight, webcamX, webcamY + webcamHeight - borderRadius);
              ctx.lineTo(webcamX, webcamY + borderRadius);
              ctx.quadraticCurveTo(webcamX, webcamY, webcamX + borderRadius, webcamY);
              ctx.stroke();
            }
          }

          frameCount++;
          previewAnimationFrameRef.current = requestAnimationFrame(drawPreviewFrame);
        };
        drawPreviewFrame();
        console.log('🎨 Canvas compositing started');
      } else if (recordingMode === 'screen' && screenStream) {
        // For screen only, show it directly in the preview display
        console.log('📺 Setting up screen preview, video element exists:', !!previewDisplayVideoRef.current);
        if (previewDisplayVideoRef.current) {
          previewDisplayVideoRef.current.srcObject = screenStream;
          console.log('📺 Attached stream to video element');
          await previewDisplayVideoRef.current.play();
          console.log('✅ Screen preview playing');
        } else {
          console.error('❌ previewDisplayVideoRef.current is null');
        }
      } else if (recordingMode === 'camera' && webcamStream) {
        // For camera only, show it directly in the preview display
        console.log('📷 Setting up camera preview, video element exists:', !!previewDisplayVideoRef.current);
        if (previewDisplayVideoRef.current) {
          previewDisplayVideoRef.current.srcObject = webcamStream;
          console.log('📷 Attached stream to video element');
          await previewDisplayVideoRef.current.play();
          console.log('✅ Camera preview playing');
        } else {
          console.error('❌ previewDisplayVideoRef.current is null');
        }
      }

      console.log('✅ Preview setup complete');
    } catch (err: any) {
      console.error('Preview error:', err);
      setError('Failed to start preview. Please check permissions.');
      stopPreview();
    }
  };

  /**
   * Stop Live Preview
   */
  const stopPreview = () => {
    isPreviewDrawingRef.current = false;
    if (previewAnimationFrameRef.current) {
      cancelAnimationFrame(previewAnimationFrameRef.current);
    }
    
    // Stop streams
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }

    // Clear video elements
    if (previewScreenVideoRef.current) previewScreenVideoRef.current.srcObject = null;
    if (previewWebcamVideoRef.current) previewWebcamVideoRef.current.srcObject = null;
    if (previewDisplayVideoRef.current) previewDisplayVideoRef.current.srcObject = null;

    setShowPreview(false);
    setIsPreviewActive(false);
  };

  /**
   * Start Recording with Countdown
   */
  const handleStartRecording = async () => {
    // Stop preview if active
    if (isPreviewActive) {
      stopPreview();
    }
    // 3-second countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(null);
    
    // Start actual recording
    await startRecording();
  };

  /**
   * Start Recording
   * Captures screen, webcam (optional), and audio (optional)
   */
  const startRecording = async () => {
    try {
      setError(null);
      recordedChunksRef.current = [];
      setRecordingTime(0);

      console.log('🎬 Starting recording with options:', { 
        recordingMode, 
        includeMicrophone, 
        includeSystemAudio,
        cameraSize,
        cameraPosition,
        cameraShape
      });

      // 1. Capture screen (if needed)
      let screenStream: MediaStream | null = null;
      if (recordingMode !== 'camera') {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          } as MediaTrackConstraints,
          audio: includeSystemAudio
        });
        screenStreamRef.current = screenStream;
        console.log('✅ Screen stream captured:', screenStream.getVideoTracks().length, 'video tracks');
      }

      // 2. Capture webcam (if needed)
      let webcamStream: MediaStream | null = null;
      if (recordingMode !== 'screen') {
        try {
          webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 320 },
              height: { ideal: 240 },
              facingMode: 'user'
            },
            audio: false // Audio handled separately
          });
          webcamStreamRef.current = webcamStream;
          console.log('✅ Webcam stream captured');
        } catch (err) {
          console.warn('Webcam not available:', err);
          // If webcam fails and we're in screen+camera mode, fall back to screen only
          if (recordingMode === 'screen+camera') {
            setRecordingMode('screen');
          }
        }
      }

      // 3. Capture microphone audio (optional, if not already in screen stream)
      let audioStream: MediaStream | null = null;
      if (includeMicrophone && (!screenStream || !screenStream.getAudioTracks().length)) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          audioStreamRef.current = audioStream;
          console.log('🎤 Microphone captured');
        } catch (err) {
          console.warn('Microphone not available:', err);
        }
      }

      // 4. Set recording state FIRST (this will render video elements and trigger useEffect)
      setIsRecording(true);

      // Wait for video elements to render and load metadata
      await new Promise(resolve => setTimeout(resolve, 200));

      // 5. Setup canvas compositing if needed
      let recordStream: MediaStream;
      
      if (recordingMode === 'screen+camera' && webcamStream && screenStream) {
        console.log('🎨 Setting up canvas compositing for webcam overlay');
        
        // Wait for video elements to be ready
        const waitForVideo = async (video: HTMLVideoElement | null, name: string) => {
          if (!video) throw new Error(`${name} video element not found`);
          
          if (video.readyState < 2) {
            console.log(`⏳ Waiting for ${name} to load...`);
            await new Promise((resolve) => {
              const handler = () => {
                video.removeEventListener('loadeddata', handler);
                resolve(null);
              };
              video.addEventListener('loadeddata', handler);
              // Timeout after 3 seconds
              setTimeout(() => {
                video.removeEventListener('loadeddata', handler);
                resolve(null);
              }, 3000);
            });
          }
          console.log(`✅ ${name} ready, readyState: ${video.readyState}`);
        };

        await waitForVideo(previewVideoRef.current, 'Screen');
        await waitForVideo(webcamVideoRef.current, 'Webcam');

        if (!canvasRef.current) {
          throw new Error('Canvas not found');
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Set canvas size to match screen stream
        const videoTrack = screenStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        canvas.width = settings.width || 1920;
        canvas.height = settings.height || 1080;

        console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`);

        // Webcam overlay size based on user preference
        const sizeMultiplier = cameraSize === 'small' ? 0.12 : cameraSize === 'large' ? 0.20 : 0.15;
        const webcamWidth = Math.floor(canvas.width * sizeMultiplier);
        const webcamHeight = cameraShape === 'circle' 
          ? webcamWidth // Make it square for circle
          : Math.floor(webcamWidth * 0.75); // 4:3 aspect ratio for square
        
        // Position based on user preference
        const padding = 20;
        let webcamX: number, webcamY: number;
        switch (cameraPosition) {
          case 'top-left':
            webcamX = padding;
            webcamY = padding;
            break;
          case 'top-right':
            webcamX = canvas.width - webcamWidth - padding;
            webcamY = padding;
            break;
          case 'bottom-left':
            webcamX = padding;
            webcamY = canvas.height - webcamHeight - padding;
            break;
          case 'bottom-right':
          default:
            webcamX = canvas.width - webcamWidth - padding;
            webcamY = canvas.height - webcamHeight - padding;
        }

        let frameCount = 0;
        isDrawingRef.current = true;

        // Animation loop to composite streams
        const drawFrame = () => {
          if (!isDrawingRef.current) {
            console.log('⏹️ Stopping canvas animation');
            return;
          }

          try {
            // Clear canvas with black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw screen video
            if (previewVideoRef.current && previewVideoRef.current.readyState >= 2) {
              ctx.drawImage(previewVideoRef.current, 0, 0, canvas.width, canvas.height);
              
              if (frameCount === 0) {
                console.log('🎬 First frame drawn from screen');
              }
            }

            // Draw webcam overlay with border
            if (webcamVideoRef.current && webcamVideoRef.current.readyState >= 2) {
              ctx.save();
              
              if (cameraShape === 'circle') {
                // Draw circular webcam
                const radius = webcamWidth / 2;
                const centerX = webcamX + radius;
                const centerY = webcamY + radius;
                
                // Create circular clipping path
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                
                // Draw webcam video
                ctx.drawImage(webcamVideoRef.current, webcamX, webcamY, webcamWidth, webcamWidth);
                
                // Draw border
                ctx.restore();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
              } else {
                // Draw square webcam with rounded corners
                const borderRadius = 12;
                
                // Create rounded rectangle clipping path
                ctx.beginPath();
                ctx.moveTo(webcamX + borderRadius, webcamY);
                ctx.lineTo(webcamX + webcamWidth - borderRadius, webcamY);
                ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY, webcamX + webcamWidth, webcamY + borderRadius);
                ctx.lineTo(webcamX + webcamWidth, webcamY + webcamHeight - borderRadius);
                ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY + webcamHeight, webcamX + webcamWidth - borderRadius, webcamY + webcamHeight);
                ctx.lineTo(webcamX + borderRadius, webcamY + webcamHeight);
                ctx.quadraticCurveTo(webcamX, webcamY + webcamHeight, webcamX, webcamY + webcamHeight - borderRadius);
                ctx.lineTo(webcamX, webcamY + borderRadius);
                ctx.quadraticCurveTo(webcamX, webcamY, webcamX + borderRadius, webcamY);
                ctx.closePath();
                ctx.clip();
                
                // Draw webcam video
                ctx.drawImage(webcamVideoRef.current, webcamX, webcamY, webcamWidth, webcamHeight);
                
                // Draw border
                ctx.restore();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(webcamX + borderRadius, webcamY);
                ctx.lineTo(webcamX + webcamWidth - borderRadius, webcamY);
                ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY, webcamX + webcamWidth, webcamY + borderRadius);
                ctx.lineTo(webcamX + webcamWidth, webcamY + webcamHeight - borderRadius);
                ctx.quadraticCurveTo(webcamX + webcamWidth, webcamY + webcamHeight, webcamX + webcamWidth - borderRadius, webcamY + webcamHeight);
                ctx.lineTo(webcamX + borderRadius, webcamY + webcamHeight);
                ctx.quadraticCurveTo(webcamX, webcamY + webcamHeight, webcamX, webcamY + webcamHeight - borderRadius);
                ctx.lineTo(webcamX, webcamY + borderRadius);
                ctx.quadraticCurveTo(webcamX, webcamY, webcamX + borderRadius, webcamY);
                ctx.stroke();
              }
              
              if (frameCount === 0) {
                console.log('📷 First frame drawn from webcam');
              }
            }

            frameCount++;
          } catch (err) {
            console.error('Canvas draw error:', err);
          }

          animationFrameRef.current = requestAnimationFrame(drawFrame);
        };

        // Start animation loop
        drawFrame();
        console.log('🎞️ Canvas animation loop started');

        // Get stream from canvas
        recordStream = canvas.captureStream(30); // 30 fps
        console.log('🎥 Canvas stream created:', recordStream.getVideoTracks().length, 'video tracks');

        // Add audio tracks
        screenStream.getAudioTracks().forEach(track => {
          recordStream.addTrack(track);
          console.log('🔊 Added screen audio track');
        });
        if (audioStream) {
          audioStream.getAudioTracks().forEach(track => {
            recordStream.addTrack(track);
            console.log('🎤 Added microphone audio track');
          });
        }

        console.log('✅ Canvas compositing setup complete');
      } else if (recordingMode === 'screen' && screenStream) {
        // Screen only mode
        console.log('📹 Recording screen only');
        recordStream = new MediaStream([...screenStream.getVideoTracks()]);

        // Add audio tracks
        if (screenStream) {
          screenStream.getAudioTracks().forEach(track => recordStream.addTrack(track));
        }
        if (audioStream) {
          audioStream.getAudioTracks().forEach(track => recordStream.addTrack(track));
        }
      } else if (recordingMode === 'camera' && webcamStream) {
        // Camera only mode
        console.log('📷 Recording camera only');
        recordStream = new MediaStream([...webcamStream.getVideoTracks()]);

        if (audioStream) {
          audioStream.getAudioTracks().forEach(track => recordStream.addTrack(track));
        }
      } else {
        throw new Error('Invalid recording configuration');
      }

      // 6. Start recording with MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      
      // Fallback to vp8 if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }

      const mediaRecorder = new MediaRecorder(recordStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        stopAllStreams();
      };

      mediaRecorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        stopAllStreams();
      };

      // Handle screen share stop (user clicks "Stop sharing" in browser)
      if (screenStream && screenStream.getVideoTracks().length > 0) {
        screenStream.getVideoTracks()[0].onended = () => {
          handleStopRecording();
        };
      }

      mediaRecorder.start(100); // Collect data every 100ms
      console.log('✅ Recording started successfully');

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(
        err.name === 'NotAllowedError' 
          ? 'Permission denied. Please allow screen recording.'
          : err.name === 'NotFoundError'
          ? 'No screen to capture. Make sure you have a display connected.'
          : 'Failed to start recording. Please check your browser permissions.'
      );
      stopAllStreams();
    }
  };

  /**
   * Stop Recording
   */
  const handlePauseResume = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      // Resume recording
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      console.log('▶️ Recording resumed');
    } else {
      // Pause recording
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      console.log('⏸️ Recording paused');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop preview
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = null;
      }
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
      }
    }
  };

  /**
   * Download recorded video
   */
  const handleDownload = () => {
    if (!recordedVideoUrl) return;

    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Upload video to backend
   */
  const handleUpload = async () => {
    if (!recordedVideoUrl) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Convert blob URL back to blob
      const response = await fetch(recordedVideoUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('video', blob, `recording-${Date.now()}.webm`);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setIsUploading(false);
          setUploadProgress(100);
          
          if (onUploadComplete && result.url) {
            onUploadComplete(result.url);
          }
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.open('POST', '/api/upload-video');
      xhr.send(formData);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
      setIsUploading(false);
    }
  };

  /**
   * Delete recorded video
   */
  const handleDelete = () => {
    if (recordedVideoUrl) {
      // Revoke the blob URL to free memory
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
      setRecordingTime(0);
      console.log('🗑️ Recording deleted');
    }
  };

  /**
   * Reset and start new recording
   */
  const handleNewRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordingTime(0);
    setError(null);
    setUploadProgress(0);
  };

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full rounded-xl border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      {recordedVideoUrl && (
        <div className={`flex items-center justify-end p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={handleNewRecording}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <X className="w-4 h-4" />
            New Recording
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`m-6 p-4 rounded-lg border ${
          isDarkMode
            ? 'border-red-800 bg-red-900/20'
            : 'border-red-200 bg-red-50'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      {/* Countdown Overlay - Modern Animated */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            <div className="text-9xl font-black text-transparent bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text animate-pulse">
              {countdown}
            </div>
            <div className="text-2xl font-semibold text-white/90">
              Get ready to record...
            </div>
          </div>
        </div>
      )}

      {/* Live Preview */}
      {showPreview && !isRecording && !recordedVideoUrl && (
        <div className="p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
          <div className={`relative bg-black rounded-lg overflow-hidden aspect-video ${
            isDarkMode ? 'border border-gray-700' : 'border border-gray-200'
          }`}>
            {recordingMode === 'screen+camera' && (
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full object-contain"
              />
            )}
            {(recordingMode === 'screen' || recordingMode === 'camera') && (
              <video
                ref={previewDisplayVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            )}

            {/* Preview Badge */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-white">PREVIEW</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recording Setup / Controls */}
      {!isRecording && !recordedVideoUrl && (
        <div className="p-6 space-y-6">
          {/* Recording Mode Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <label className={`text-base font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Recording Mode
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setRecordingMode('screen+camera')}
                className={`p-6 rounded-xl border-2 transition text-center ${
                  recordingMode === 'screen+camera'
                    ? 'border-blue-400 bg-blue-50'
                    : isDarkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-3 mx-auto ${
                  recordingMode === 'screen+camera'
                    ? 'bg-blue-500'
                    : isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                }`}>
                  <Monitor className={`w-7 h-7 ${recordingMode === 'screen+camera' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <span className={`text-sm font-medium block ${
                  recordingMode === 'screen+camera'
                    ? 'text-blue-600'
                    : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Screen + Camera
                </span>
              </button>

              <button
                onClick={() => setRecordingMode('screen')}
                className={`p-6 rounded-xl border-2 transition text-center ${
                  recordingMode === 'screen'
                    ? 'border-blue-400 bg-blue-50'
                    : isDarkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-3 mx-auto ${
                  recordingMode === 'screen'
                    ? 'bg-blue-500'
                    : isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                }`}>
                  <Monitor className={`w-7 h-7 ${recordingMode === 'screen' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <span className={`text-sm font-medium block ${
                  recordingMode === 'screen'
                    ? 'text-blue-600'
                    : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Screen Only
                </span>
              </button>

              <button
                onClick={() => setRecordingMode('camera')}
                className={`p-6 rounded-xl border-2 transition text-center ${
                  recordingMode === 'camera'
                    ? 'border-blue-400 bg-blue-50'
                    : isDarkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-3 mx-auto ${
                  recordingMode === 'camera'
                    ? 'bg-blue-500'
                    : isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                }`}>
                  <Camera className={`w-7 h-7 ${recordingMode === 'camera' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <span className={`text-sm font-medium block ${
                  recordingMode === 'camera'
                    ? 'text-blue-600'
                    : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Camera Only
                </span>
              </button>
            </div>
          </div>

          {/* Settings Grid - Camera and Audio Side by Side */}
          <div className={`grid gap-6 ${recordingMode !== 'screen' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Camera Settings */}
            {recordingMode !== 'screen' && (
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className={`text-base font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Camera Settings
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Camera Size */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Size
                    </label>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setCameraSize(size)}
                          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                            cameraSize === size
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Shape */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Shape
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCameraShape('circle')}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                          cameraShape === 'circle'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Circle className="w-4 h-4" />
                        Circle
                      </button>
                      <button
                        onClick={() => setCameraShape('square')}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                          cameraShape === 'square'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <RectangleHorizontal className="w-4 h-4" />
                        Square
                      </button>
                    </div>
                  </div>

                  {/* Camera Position (only for screen+camera mode) */}
                  {recordingMode === 'screen+camera' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          ['top-left', 'Top Left'],
                          ['top-right', 'Top Right'],
                          ['bottom-left', 'Bottom Left'],
                          ['bottom-right', 'Bottom Right']
                        ] as const).map(([pos, label]) => (
                          <button
                            key={pos}
                            onClick={() => setCameraPosition(pos)}
                            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                              cameraPosition === pos
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                                : isDarkMode
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audio Settings */}
            <div className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                <h3 className={`text-base font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Audio Settings
                </h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mic className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Microphone
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeMicrophone}
                    onChange={(e) => setIncludeMicrophone(e.target.checked)}
                    className="w-5 h-5 rounded-full text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Volume2 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      System Audio
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSystemAudio}
                    onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                    className="w-5 h-5 rounded-full text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={showPreview ? stopPreview : handleStartPreview}
              disabled={isPreviewActive && !showPreview}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-medium rounded-xl transition border-2 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>

            {/* Start Recording Button */}
            <button
              onClick={handleStartRecording}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-medium text-white rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Recording</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for recording compositing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden video elements for recording compositing (used by canvas) */}
      <video ref={previewVideoRef} style={{ display: 'none' }} autoPlay muted playsInline />
      <video ref={webcamVideoRef} style={{ display: 'none' }} autoPlay muted playsInline />

      {/* Hidden video elements for preview compositing (screen+camera mode) */}
      <video ref={previewScreenVideoRef} style={{ display: 'none' }} autoPlay muted playsInline />
      <video ref={previewWebcamVideoRef} style={{ display: 'none' }} autoPlay muted playsInline />

      {/* Recording Preview */}
      {isRecording && (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {recordingMode === 'screen+camera' && canvasRef.current && (
              <canvas
                ref={(el) => {
                  if (el && canvasRef.current) {
                    const ctx = el.getContext('2d');
                    const srcCtx = canvasRef.current.getContext('2d');
                    if (ctx && srcCtx) {
                      el.width = canvasRef.current.width;
                      el.height = canvasRef.current.height;
                      
                      const copyFrame = () => {
                        if (!isRecording) return;
                        ctx.drawImage(canvasRef.current!, 0, 0);
                        requestAnimationFrame(copyFrame);
                      };
                      copyFrame();
                    }
                  }
                }}
                className="w-full h-full object-contain"
              />
            )}
            {recordingMode === 'screen' && (
              <video
                ref={previewVideoRef}
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            )}
            {recordingMode === 'camera' && (
              <video
                ref={webcamVideoRef}
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            )}

            {/* Recording Indicator */}
            <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-2 text-white rounded-full font-medium text-sm ${
              isPaused ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              <div className={`w-3 h-3 bg-white rounded-full ${!isPaused && 'animate-pulse'}`} />
              {isPaused ? 'Paused' : 'Recording'}: {formatTime(recordingTime)}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePauseResume}
              className={`flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-4 ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300'
                  : isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500/50'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              )}
            </button>

            <button
              onClick={handleStopRecording}
              className="flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Recorded Video Playback */}
      {recordedVideoUrl && !isRecording && (
        <div className="space-y-4">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={recordedVideoRef}
              src={recordedVideoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleDownload}
              className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-purple-400 bg-purple-900/20 hover:bg-purple-900/30' 
                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <Download className="w-5 h-5" />
              Download
            </button>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Save to Library
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>

          {/* Recording Info */}
          <div className={`text-sm text-center ${isDarkMode ? 'text-muted' : 'text-gray-600'}`}>
            Duration: {formatTime(recordingTime)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
