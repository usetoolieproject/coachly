import React from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const MobileMenuToggle = React.forwardRef<HTMLButtonElement, MobileMenuToggleProps>(({ 
  isOpen, 
  onToggle, 
  className = '' 
}, ref) => {
  const { isDarkMode } = useTheme();

  return (
    <button
      ref={ref}
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors ${className} ${
        isDarkMode 
          ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <X size={24} className="transition-transform" />
      ) : (
        <Menu size={24} className="transition-transform" />
      )}
    </button>
  );
});

export default MobileMenuToggle;
