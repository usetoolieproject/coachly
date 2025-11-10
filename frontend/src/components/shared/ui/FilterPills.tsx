import React from 'react';
import { Filter } from 'lucide-react';

type FilterOption = 'all' | 'free' | 'paid';

type Props = {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  className?: string;
  dark?: boolean;
};

export const FilterPills: React.FC<Props> = ({ value, onChange, className = '', dark }) => {
  const isDark = !!dark;
  const container = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const icon = isDark ? 'text-gray-300' : 'text-gray-500';
  const inactive = isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100';
  const active = 'bg-blue-600 text-white';

  const options: FilterOption[] = ['all', 'free', 'paid'];

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full border shadow-sm ${container} ${className}`} title="Filter">
      <Filter className={`w-4 h-4 ${icon}`} />
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${value === opt ? active : inactive}`}
        >
          {opt === 'all' ? 'All' : opt === 'free' ? 'Free' : 'Paid'}
        </button>
      ))}
    </div>
  );
};

export default FilterPills;


