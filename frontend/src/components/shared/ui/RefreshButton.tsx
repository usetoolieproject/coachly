import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { RefreshCw } from 'lucide-react';

type Props = {
  onClick?: () => void;
  isRefreshing?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export const RefreshButton: React.FC<Props> = ({ onClick, isRefreshing, children = 'Refresh', className = '' }) => {
  const { isDarkMode } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={`border rounded-md px-3 py-2 text-sm gap-2 flex items-center ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white hover:bg-gray-800' : 'border-gray-200 bg-white text-slate-600 hover:bg-gray-50'} ${className}`}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} text-teal-500`} /> {children}
    </button>
  );
};


