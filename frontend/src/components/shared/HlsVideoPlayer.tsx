import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export const HlsVideoPlayer = ({ 
  src, 
  autoPlay = false, 
  controls = true,
  className = ''
}: HlsVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('📹 HLS manifest loaded');
        if (autoPlay) {
          video.play().catch(err => console.error('Autoplay failed:', err));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error, trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    }
    // HLS.js is not supported on platforms that natively support HLS (like Safari)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (autoPlay) {
        video.play().catch(err => console.error('Autoplay failed:', err));
      }
    } else {
      console.error('HLS is not supported in this browser');
    }
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls={controls}
      className={className}
    >
      Your browser does not support the video tag.
    </video>
  );
};
