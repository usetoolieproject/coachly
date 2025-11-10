import React, { useMemo } from 'react';
import type { Call } from '../types';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Props {
  calls: Call[];
  onSelect: (call: Call) => void;
}

// Lightweight month view: groups by date and lists titles. Not a full calendar lib to keep it clean.
const CalendarView: React.FC<Props> = ({ calls, onSelect }) => {
  const { isDarkMode } = useTheme();
  const byDate = useMemo(() => {
    const map = new Map<string, Call[]>();
    calls.forEach(c => {
      const key = new Date(c.scheduled_at).toDateString();
      map.set(key, [...(map.get(key) || []), c]);
    });
    return Array.from(map.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [calls]);

  if (!byDate.length) {
    return <div className={isDarkMode ? 'text-white' : 'text-gray-600'}>No sessions scheduled.</div>;
  }

  return (
    <div className="space-y-6">
      {byDate.map(([date, items]) => (
        <div key={date} className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`px-4 py-2 text-sm font-medium ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{date}</div>
          <ul className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
            {items.map(call => (
              <li key={call.id} className={`px-4 py-3 cursor-pointer ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`} onClick={() => onSelect(call)}>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{call.title}</div>
                <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>{new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {call.duration_minutes}m</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CalendarView;


