import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface Testimonial {
  id: string;
  clientName: string;
  clientImage?: string;
  quote: string;
  results?: string;
}

interface FitnessTestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
  alignment?: 'left' | 'center' | 'right';
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  allSectionData?: any;
}

export const FitnessTestimonials: React.FC<FitnessTestimonialsProps> = ({
  title = 'What Our Clients Say',
  testimonials = [],
  alignment = 'center',
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {}
}) => {
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });

  // Limit to max 3 items
  const displayTestimonials = testimonials.slice(0, 3);
  
  // Determine grid layout based on count
  const getGridClass = () => {
    if (displayTestimonials.length === 1) {
      return 'grid-cols-1 max-w-md mx-auto';
    } else if (displayTestimonials.length === 2) {
      return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    } else {
      return 'grid-cols-1 md:grid-cols-3';
    }
  };

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

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
        {title && (
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0 ${alignmentClass} ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h2>
        )}

        {/* Testimonials Grid */}
        {displayTestimonials.length > 0 ? (
          <div className={`grid ${getGridClass()} gap-4 sm:gap-6 md:gap-8`}>
            {displayTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-100'
                }`}
              >
                {/* Quote Icon */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 opacity-20">
                  <Quote 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    style={{ color: primaryColor }}
                  />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-3.5 md:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className={`text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6 leading-relaxed ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  "{testimonial.quote}"
                </p>

                {/* Client Info */}
                <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
                  {testimonial.clientImage ? (
                    <img
                      src={testimonial.clientImage}
                      alt={testimonial.clientName}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {testimonial.clientName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-sm sm:text-base md:text-lg ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.clientName}
                    </p>
                    {testimonial.results && (
                      <p 
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {testimonial.results}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEditable ? 'Add testimonials in the editor' : 'No testimonials to display'}
          </div>
        )}
      </div>
    </div>
  );
};
