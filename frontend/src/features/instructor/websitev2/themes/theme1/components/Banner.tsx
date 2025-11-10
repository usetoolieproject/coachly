import React from 'react';
import {  Upload } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface BannerProps {
  bannerUrl?: string;
  bannerHeight?: string;
  isEditable?: boolean;
  onBannerClick?: () => void;
  allSectionData?: any; // Added for debug logging
}

export const Banner: React.FC<BannerProps> = React.memo(({ 
  bannerUrl,
  bannerHeight = '250px',
  isEditable = false,
  onBannerClick,
  allSectionData,
}) => {
  const { primaryColor } = useDesignColors({ allSectionData });
  return (
    <div 
      className="relative w-full overflow-hidden cursor-pointer group"
      style={{ 
        backgroundColor: bannerUrl && bannerUrl.trim() !== '' ? 'transparent' : primaryColor,
        minHeight: bannerHeight
      }}
      onClick={onBannerClick}
    >
      {/* Banner Image */}
      {bannerUrl && bannerUrl.trim() !== '' ? (
        <img 
          src={bannerUrl} 
          alt="Banner" 
          className="w-full h-full object-cover"
          style={{ 
            height: bannerHeight
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        isEditable ? (
          <div 
            className="flex flex-col items-center justify-center h-full"
            style={{ height: bannerHeight }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 text-white opacity-75 px-4">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              <span className="text-sm sm:text-base md:text-lg text-center">Upload your banner</span>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full"
            style={{ height: bannerHeight }}
          >
          </div>
        )
      )}
    </div>
  );
});