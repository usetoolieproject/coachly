import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  order_index: number;
}

interface IntroContent {
  id: string;
  description: string;
  instructor_intro_media_items: MediaItem[];
}

interface IntroContentCarouselProps {
  introContent: IntroContent;
  className?: string;
}

const IntroContentCarousel: React.FC<IntroContentCarouselProps> = ({ 
  introContent, 
  className = "" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mediaItems = introContent.instructor_intro_media_items || [];

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!mediaItems.length) return null;

  const currentMedia = mediaItems[currentIndex];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Media Container */}
      <div className="relative">
        {currentMedia.type === 'video' && getEmbedUrl(currentMedia.url) ? (
          <div className="aspect-video">
            <iframe
              src={getEmbedUrl(currentMedia.url)}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt="Community media"
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-16 h-16 text-white mb-4 mx-auto" />
              <h3 className="text-xl font-bold">Media Content</h3>
            </div>
          </div>
        )}

        {/* Navigation Arrows - Only show if more than 1 item */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
              aria-label="Next media"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Indicator - Only show if more than 1 item */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Media Counter */}
        {mediaItems.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {mediaItems.length}
          </div>
        )}
      </div>

      {/* Description */}
      {introContent.description && (
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{introContent.description}</p>
        </div>
      )}
    </div>
  );
};

export default IntroContentCarousel;