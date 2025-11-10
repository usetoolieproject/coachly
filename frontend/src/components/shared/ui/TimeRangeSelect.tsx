import { CalendarClock } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export type TimeRangeValue = '7d' | '30d' | '90d' | '1y' | '7days' | '30days' | '90days';

interface TimeRangeSelectProps<T extends TimeRangeValue = TimeRangeValue> {
  value: T;
  onChange: (value: T) => void;
  options?: Array<{ value: T; label: string }>;
  className?: string;
}

const defaultOptions = [
  { value: '7d' as TimeRangeValue, label: 'Last 7 days' },
  { value: '30d' as TimeRangeValue, label: 'Last 30 days' },
  { value: '90d' as TimeRangeValue, label: 'Last 90 days' },
  { value: '1y' as TimeRangeValue, label: 'Last year' },
];

const TimeRangeSelect = <T extends TimeRangeValue = TimeRangeValue>({ 
  value, 
  onChange, 
  options = defaultOptions as Array<{ value: T; label: string }>,
  className = ''
}: TimeRangeSelectProps<T>) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none border appearance-none pr-8 cursor-pointer ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-800 text-gray-100 hover:bg-gray-800' 
            : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CalendarClock 
        className={`h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
          isDarkMode ? 'text-indigo-300' : 'text-indigo-500'
        }`} 
      />
    </div>
  );
};

export default TimeRangeSelect;
