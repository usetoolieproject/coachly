import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface Transformation {
  id: string;
  beforeImage?: string;
  afterImage?: string;
  clientName?: string;
  results?: string;
}

interface TransformationGalleryProps {
  title?: string;
  subtitle?: string;
  transformations?: Transformation[];
  layout?: 'grid' | 'masonry';
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  allSectionData?: any;
}

export const TransformationGallery: React.FC<TransformationGalleryProps> = ({
  title = 'Real Results',
  subtitle = 'See the transformations of our clients',
  transformations = [],
  layout = 'grid',
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {}
}) => {
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });

  // Limit to max 3 items
  const displayTransformations = transformations.slice(0, 3);
  
  // Determine grid layout based on count
  const getGridClass = () => {
    if (displayTransformations.length === 1) {
      return 'grid-cols-1 max-w-md mx-auto';
    } else if (displayTransformations.length === 2) {
      return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    } else {
      return 'grid-cols-1 md:grid-cols-3';
    }
  };

  return (
    <div
      className={`py-16 ${isSelected && isEditable ? 'ring-4' : ''}`}
      style={isSelected && isEditable ? { 
        outline: `4px solid ${primaryColor}`,
        outlineOffset: '-4px'
      } : undefined}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-5 md:px-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 sm:p-6 md:p-8 lg:p-12`}>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          {title && (
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-base sm:text-lg md:text-xl px-2 sm:px-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Gallery */}
        {displayTransformations.length > 0 ? (
          <div className={`grid ${getGridClass()} gap-4 sm:gap-5 md:gap-6`}>
            {displayTransformations.map((transformation) => (
              <div
                key={transformation.id}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {/* Before/After Split */}
                <div className="grid grid-cols-2 h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
                  {/* Before */}
                  <div className="relative overflow-hidden">
                    {transformation.beforeImage ? (
                      <img
                        src={transformation.beforeImage}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                        {isEditable && (
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Before</span>
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 bg-red-500 text-white px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-0.5 md:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                      BEFORE
                    </div>
                  </div>
                  
                  {/* After */}
                  <div className="relative overflow-hidden">
                    {transformation.afterImage ? (
                      <img
                        src={transformation.afterImage}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        {isEditable && (
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>After</span>
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-green-500 text-white px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-0.5 md:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                      AFTER
                    </div>
                  </div>
                </div>

                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
                  {transformation.clientName && (
                    <p className="text-white font-bold mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">{transformation.clientName}</p>
                  )}
                  {transformation.results && (
                    <p className="font-semibold text-[10px] sm:text-xs md:text-sm" style={{ color: primaryColor }}>{transformation.results}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEditable ? 'Add transformations in the editor' : 'No transformations to display'}
          </div>
        )}
      </div>
    </div>
  );
};
