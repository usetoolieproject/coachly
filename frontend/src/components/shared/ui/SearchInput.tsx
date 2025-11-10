import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string; // wrapper width/positioning
  inputClassName?: string; // extra classes for the input element
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Search...', className = '', inputClassName = '' }) => {
  const { isDarkMode } = useTheme();
  const baseInput = isDarkMode
    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400';
  const iconClass = isDarkMode ? 'text-gray-400' : 'text-gray-400';
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconClass}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-9 pr-3 py-2.5 h-11 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${baseInput} ${inputClassName}`}
      />
    </div>
  );
};

export default SearchInput;


