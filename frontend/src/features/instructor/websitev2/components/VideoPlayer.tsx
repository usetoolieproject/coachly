import React, { useRef } from 'react';

interface VideoPlayerProps {
  embedUrl?: string; // final embed URL (YouTube/Vimeo) if available
  posterUrl?: string; // optional poster image
  title?: string; // accessible title
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ embedUrl = '', posterUrl = '', title = 'Intro video' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '56.25%' }}>
      {embedUrl ? (
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}enablejsapi=1&origin=*&controls=1`}
          title={title}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Video URL</span>
        </div>
      )}
      {/* Optional: If you want to show poster image behind the iframe before load (not recommended for iframes), you could potentially use this: */}
      {/*posterUrl && (
        <img
          src={posterUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-2xl"
        />
      )*/}
    </div>
  );
};


