import React from 'react';
import { BookOpen, Users, Video } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  title?: string;
  features: Feature[];
}

export const Features: React.FC<FeaturesProps> = ({ 
  title = "What's Included",
  features 
}) => {
  const { darkMode } = useDesignColors();
  
  return (
    <div className="mb-6 sm:mb-8 md:mb-12 px-2 sm:px-4">
      <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-center ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>{title}</h2>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
        {features.map((feature, index) => (
          <div key={index} className={`rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border text-center ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 md:mb-4 flex items-center justify-center ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {feature.icon}
            </div>
            <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>{feature.title}</h3>
            <p className={`text-xs sm:text-sm md:text-base ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
