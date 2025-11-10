import React from 'react';
import { Dumbbell, Apple, MessageCircle } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface FitnessWhatsIncludedProps {
  title?: string;
  showWorkoutPlans?: boolean;
  showNutritionGuide?: boolean;
  show247Support?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  allSectionData?: any;
}

const items = [
  { id: 'workout-plans', title: 'Workout Plans', icon: Dumbbell },
  { id: 'nutrition-guide', title: 'Nutrition Guide', icon: Apple },
  { id: '24-7-support', title: '24/7 Support', icon: MessageCircle }
];

export const FitnessWhatsIncluded: React.FC<FitnessWhatsIncludedProps> = ({
  title = "What's Included",
  showWorkoutPlans = true,
  showNutritionGuide = true,
  show247Support = true,
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {}
}) => {
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });

  // Determine which items to show based on checkboxes
  const visibleItems = [
    showWorkoutPlans && items[0],
    showNutritionGuide && items[1],
    show247Support && items[2]
  ].filter(Boolean) as typeof items;

  // Determine grid layout based on count (always centered)
  const getGridClass = () => {
    if (visibleItems.length === 1) {
      return 'grid-cols-1 max-w-md mx-auto';
    } else if (visibleItems.length === 2) {
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
        {title && (
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 sm:mb-10 md:mb-12 text-center px-2 sm:px-0 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h2>
        )}

        {/* Items Grid - Cards/Squares - Always Centered */}
        {visibleItems.length > 0 ? (
          <div className={`grid ${getGridClass()} gap-4 sm:gap-6 md:gap-8`}>
            {visibleItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl transform transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-800 border-2 border-gray-700' 
                      : 'bg-white border-2 border-gray-100'
                  }`}
                >
                  {/* Icon */}
                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 mx-auto sm:mx-0"
                    style={{ 
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor
                    }}
                  >
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: primaryColor }} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-base sm:text-lg md:text-xl font-black mb-0 text-center sm:text-left ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEditable ? 'Enable items in the editor' : 'No items configured'}
          </div>
        )}
      </div>
    </div>
  );
};
