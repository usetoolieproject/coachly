import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface HeroProps {
  title: string;
  price: number;
  trialDays?: number;
  onJoinClick?: () => void;
  onSignInClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  title, 
  price, 
  trialDays = 7,
  onJoinClick,
  onSignInClick 
}) => {
  const { darkMode } = useDesignColors();
  
  return (
    <div className="text-center py-4 sm:py-6 px-2 sm:px-4">
      <h1 className={`text-lg sm:text-2xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>{title}</h1>
      
      <button 
        onClick={onJoinClick}
        className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4 transition-colors w-full sm:w-auto ${
          darkMode 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        Join for ${price}/month
      </button>
      
      <div className={`text-xs sm:text-xs md:text-sm mb-1 sm:mb-2 ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {trialDays}-day free trial • Cancel anytime
      </div>
      
      <div className={`text-xs sm:text-xs md:text-sm ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Already have an account?{' '}
        <button 
          onClick={onSignInClick}
          className={`font-medium ${
            darkMode 
              ? 'text-purple-400 hover:text-purple-300' 
              : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
