import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';
import { VideoPlayer } from '../../../../../../../src/features/instructor/websitev2/components/VideoPlayer';

interface VideoProps {
  title?: string;
  videoUrl?: string;
  layout?: string;
  alignment?: string;
  padding?: number;
  allSectionData?: any;
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // If it's already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return url;
};

export const Video: React.FC<VideoProps> = ({
  title = "Video",
  videoUrl = '',
  alignment = 'center',
  allSectionData
}) => {
  const { darkMode } = useDesignColors({ allSectionData });
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const posterUrl = (allSectionData?.video?.posterUrl as string) || '';
  
  return (
    <div className="my-2 sm:my-3 md:my-4">
      <div className={`rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg p-3 md:p-4 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 
          className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-2.5 md:mb-3 px-2 sm:px-3 md:px-0 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
          style={{ textAlign: alignment as any }}
        >
          {title}
        </h2>
        <VideoPlayer embedUrl={embedUrl} posterUrl={posterUrl} title={title} />
      </div>
    </div>
  );
};
