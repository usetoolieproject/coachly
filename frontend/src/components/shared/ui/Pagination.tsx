import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  className = ''
}) => {
  const { isDarkMode } = useTheme();

  // Always render pagination for consistent layout, even when single page

  return (
    <div className={`flex items-center justify-between pt-2 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isDarkMode 
            ? 'border-gray-700 text-white hover:bg-gray-700' 
            : 'border-gray-200 text-slate-700 hover:bg-gray-50'
        }`}
      >
        Prev
      </button>
      <div className={`text-xs ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
        Page {currentPage} of {totalPages}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isDarkMode 
            ? 'border-gray-700 text-white hover:bg-gray-700' 
            : 'border-gray-200 text-slate-700 hover:bg-gray-50'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
