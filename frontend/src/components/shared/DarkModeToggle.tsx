import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DarkModeToggle Component
 * 
 * A reusable toggle button for switching between light and dark modes.
 * Uses the ThemeContext to manage theme state and persists preference in localStorage.
 * 
 * @param className - Additional CSS classes to apply
 * @param size - Size variant: 'sm', 'md', or 'lg'
 */
interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${isDarkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 ring-offset-gray-800'
          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm ring-offset-white'}
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun 
          size={iconSizes[size]} 
          className="text-yellow-400"
        />
      ) : (
        <Moon 
          size={iconSizes[size]} 
          className="text-gray-700"
        />
      )}
    </button>
  );
};

export default DarkModeToggle;
