import React from 'react';
import { Play, ArrowRight, TrendingUp, Users, Star } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface FitnessHeroProps {
  headline?: string;
  tagline?: string;
  description?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  backgroundImage?: string;
  alignment?: 'left' | 'center' | 'right';
  showStats?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  sectionData?: any;
  allSectionData?: any;
}

export const FitnessHero: React.FC<FitnessHeroProps> = ({
  headline = 'Transform Your Body',
  tagline = 'START YOUR JOURNEY',
  description = 'Join thousands who have transformed their lives with our proven fitness programs',
  ctaText = 'Get Started Today',
  secondaryCtaText = 'Watch Video',
  backgroundImage = '',
  alignment = 'left',
  showStats = true,
  isSelected = false,
  isEditable = false,
  onClick,
  sectionData,
  allSectionData = {}
}) => {
  const { primaryColor, secondaryColor, darkMode } = useDesignColors({ allSectionData });
  
  const bgStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { 
        background: darkMode 
          ? `linear-gradient(135deg, ${secondaryColor} 0%, #000000 100%)`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      };

  return (
    <div
      className={`relative flex items-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px] ${isSelected && isEditable ? 'ring-4' : ''}`}
      style={{ 
        ...bgStyle,
        ...(isSelected && isEditable ? { ringColor: primaryColor } : {})
      }}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* Content */}
      <div className={`relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12 md:py-16 ${
        alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Tagline */}
          {tagline && (
            <div className="mb-3 sm:mb-4">
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white font-bold text-xs sm:text-sm tracking-widest uppercase rounded-full">
                {tagline}
              </span>
            </div>
          )}
          
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-5 md:mb-6 leading-tight">
            {headline}
          </h1>
          
          {/* Description */}
          {description && (
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-7 md:mb-8 max-w-2xl font-medium">
              {description}
            </p>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
            {ctaText && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isEditable) {
                    const plansSection = document.getElementById('workout-plans-section');
                    if (plansSection) {
                      plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className="w-full sm:w-auto px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white font-bold text-sm sm:text-base md:text-lg rounded-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center justify-center gap-2"
                style={{ color: primaryColor }}
              >
                {ctaText}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            {secondaryCtaText && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isEditable) {
                    const videoSection = document.getElementById('video-section');
                    if (videoSection) {
                      videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className="w-full sm:w-auto px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-200 border-2 border-white/50 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                {secondaryCtaText}
              </button>
            )}
          </div>
          
          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-3xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <span className="text-2xl sm:text-2xl md:text-3xl font-black text-white">10K+</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Transformations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <span className="text-2xl sm:text-2xl md:text-3xl font-black text-white">5K+</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Active Members</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <span className="text-2xl sm:text-2xl md:text-3xl font-black text-white">4.9</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Average Rating</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
