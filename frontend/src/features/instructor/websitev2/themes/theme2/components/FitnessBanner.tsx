import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface FitnessBannerProps {
  bannerUrl?: string;
  bannerHeight?: string;
  overlayText?: string;
  overlayTextColor?: string;
  showOverlay?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  sectionData?: any;
  allSectionData?: any;
}

export const FitnessBanner: React.FC<FitnessBannerProps> = ({
  bannerUrl = '',
  bannerHeight = '400px',
  overlayText = '',
  overlayTextColor = '#FFFFFF',
  showOverlay = true,
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {}
}) => {
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });

  const bannerStyle: React.CSSProperties = {
    height: bannerHeight,
    backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
    backgroundColor: bannerUrl ? undefined : (darkMode ? '#1A1A1A' : primaryColor),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      className={`relative w-full flex items-center justify-center overflow-hidden min-h-[250px] sm:min-h-[300px] md:min-h-[400px] ${
        isSelected && isEditable ? 'ring-4' : ''
      }`}
      style={{ 
        ...bannerStyle,
        ...(isSelected && isEditable ? { ringColor: primaryColor } : {})
      }}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
      )}
      
      {/* Overlay Text */}
      {overlayText && (
        <div className="relative z-10 px-4 sm:px-5 md:px-6 text-center">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-wider"
            style={{ color: overlayTextColor }}
          >
            {overlayText}
          </h2>
        </div>
      )}
      
      {/* Placeholder when no image - only show in builder mode */}
      {!bannerUrl && isEditable && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-3.5 md:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/80 text-xs sm:text-sm">Upload a banner image to display here</p>
          </div>
        </div>
      )}
    </div>
  );
};
