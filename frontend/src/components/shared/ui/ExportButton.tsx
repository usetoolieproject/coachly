import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Download } from 'lucide-react';

type Props = {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export const ExportButton: React.FC<Props> = ({ onClick, className = '', children = 'Export CSV' }) => {
  const { isDarkMode } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={`border bg-white rounded-md px-3 py-2 text-sm gap-2 flex items-center ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white hover:bg-gray-800' : 'border-gray-200 text-slate-600 hover:bg-gray-50'} ${className}`}
    >
      <Download className="h-4 w-4 text-indigo-500" /> {children}
    </button>
  );
};


