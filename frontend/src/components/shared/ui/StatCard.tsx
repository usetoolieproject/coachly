import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  borderColor?: 'emerald' | 'indigo' | 'purple' | 'pink' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  iconColor?: 'emerald' | 'indigo' | 'purple' | 'pink' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  delta?: string; // optional small helper text under the value
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  borderColor = 'gray',
  iconColor = 'gray',
  className = '',
  delta
}) => {
  const { isDarkMode } = useTheme();

  const cardBase = isDarkMode
    ? 'rounded-lg p-3 sm:p-4 shadow-sm border border-gray-700 bg-gray-800/80 backdrop-blur'
    : 'rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 bg-white';
  
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const titleText = isDarkMode ? 'text-gray-100' : 'text-slate-900';
  const iconBg = isDarkMode ? 'bg-white/10' : 'bg-gray-100';

  const borderColorClass = `border-l-4 border-${borderColor}-500`;
  const iconColorClass = `text-${iconColor}-500`;

  return (
    <div className={`${borderColorClass} ${cardBase} ${className}`}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm ${mutedText}`}>{label}</p>
          <div className="flex items-center gap-2 mt-1 sm:mt-2">
            <h3 className={`text-lg sm:text-xl lg:text-2xl font-semibold leading-none ${titleText} truncate`}>{value}</h3>
          </div>
          {delta && (
            <div className={`text-xs mt-1 ${mutedText}`}>{delta}</div>
          )}
        </div>
        <div className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl ${iconBg} flex-shrink-0`}>
          <div className={iconColorClass}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
