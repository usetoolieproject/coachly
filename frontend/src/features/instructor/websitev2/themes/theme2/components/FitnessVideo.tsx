import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface FitnessVideoProps {
  title?: string;
  videoUrl?: string;
  alignment?: 'left' | 'center' | 'right';
  showOverlay?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  allSectionData?: any;
}

export const FitnessVideo: React.FC<FitnessVideoProps> = ({
  title = 'Watch Our Training',
  videoUrl = '',
  alignment = 'center',
  showOverlay = true,
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) return '';
    // Handle various YouTube URL formats
    const patterns = [
      /youtube\.com\/watch\?v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return '';
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return '';
    // Try maxresdefault first (highest quality), fallback to hqdefault
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const videoId = getYouTubeVideoId(videoUrl);
  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoUrl) : '';

  return (
    <div
      id="video-section"
      className={`py-16 ${isSelected && isEditable ? 'ring-4' : ''}`}
      style={isSelected && isEditable ? { 
        outline: `4px solid ${primaryColor}`,
        outlineOffset: '-4px'
      } : undefined}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-5 md:px-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 sm:p-6 md:p-8 lg:p-12`}>
        {title && (
          <h2 
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ textAlign: alignment as any }}
          >
            {title}
          </h2>
        )}
        
        <div 
          className={`rounded-lg sm:rounded-xl overflow-hidden shadow-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
          style={{ 
            aspectRatio: '16/9', // Standard YouTube aspect ratio
            width: '100%'
          }}
        >
        {embedUrl && videoId ? (
          <>
            {!isPlaying ? (
              <div 
                className="relative w-full h-full bg-cover bg-center cursor-pointer"
                style={{
                  backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
              >
                {/* Overlay for better text contrast */}
                {showOverlay && (
                  <div className="absolute inset-0 bg-black/50 z-0"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 ml-0.5 sm:ml-1" style={{ color: primaryColor }} />
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={`${embedUrl}?autoplay=1`}
                className="w-full h-full"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || 'Video'}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <span className={`text-xs sm:text-sm md:text-base text-center ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {isEditable ? 'Add video URL in the editor' : 'Video content will appear here'}
            </span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
