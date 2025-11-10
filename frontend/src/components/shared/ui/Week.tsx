import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export type WeekEvent = { id: string; date: string; time: string; content: React.ReactNode };

type Props = {
  startDate: Date; // start of week
  eventsByDate: Record<string, WeekEvent[]>;
  onEventClick?: (e: WeekEvent) => void;
  renderDayHeader?: (date: Date) => React.ReactNode;
  formatDate: (d: Date, fmt: string) => string;
  onAdd?: (date: Date) => void; // optional per-day "+" control visible only if provided
};

const Week: React.FC<Props> = ({ startDate, eventsByDate, onEventClick, renderDayHeader, formatDate, onAdd }) => {
  const { isDarkMode } = useTheme();
  const days = Array.from({ length: 7 }, (_, i) => new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const today = new Date();
  return (
    <div className={`grid grid-cols-7 gap-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
      {days.map((date, idx) => (
        <div key={idx} className={`min-h-[120px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[260px] p-2 sm:p-3 transition-colors ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'}`}> 
          <div className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center justify-between">
            {renderDayHeader ? renderDayHeader(date) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm ${isSameDay(date, today) ? 'bg-purple-600 text-white' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>{date.getDate()}</span>
                <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(date, 'MMM')}</span>
              </div>
            )}
            {onAdd ? (
              <button
                aria-label="Add post"
                className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:shadow-md transition-all ring-1 ring-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => onAdd(date)}
              >
                <span className="text-xs sm:text-sm leading-none">+</span>
              </button>
            ) : null}
          </div>
          <div className="space-y-2">
            {(eventsByDate[formatDate(date, 'YYYY-MM-DD')] || []).map(e => (
              <div
                key={e.id}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer border ${isDarkMode ? 'bg-purple-900/20 border-purple-900/30 hover:bg-purple-900/30' : 'bg-purple-50 border-purple-200 hover:bg-purple-100'}`}
                onClick={() => onEventClick && onEventClick(e)}
              >
                <div className={`text-xs flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : ''}`}>{e.content}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Week;


