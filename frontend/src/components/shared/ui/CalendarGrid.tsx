import React, { useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

type EventLike = {
  id: string;
  startsAt: string | Date; // ISO or Date
};

interface CalendarGridProps<T extends EventLike> {
  month: Date;
  events: T[];
  onPrev: () => void;
  onNext: () => void;
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: T) => void;
  renderEvent?: (event: T) => React.ReactNode; // fallback renders time · id
  renderAddButton?: (date: Date) => React.ReactNode; // optional per-day "+" control
  hideHeader?: boolean; // if true, do not render internal header (default true)
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isToday = (d: Date) => isSameDay(d, new Date());

export default function CalendarGrid<T extends EventLike>({ month, events, onPrev, onNext, onDayClick, onEventClick, renderEvent, renderAddButton, hideHeader = false }: CalendarGridProps<T>) {
  const { isDarkMode } = useTheme();
  const monthStart = startOfMonth(month);
  const firstDay = new Date(monthStart);
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // Monday-first grid
  const gridStart = addDays(firstDay, -dayOfWeek);
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)), [gridStart]);
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthStart);

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {hideHeader ? null : (
        <div className={`px-3 sm:px-6 py-3 sm:py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border transition-colors text-xs sm:text-sm font-medium ${isDarkMode ? 'border-gray-700 hover:bg-gray-700 text-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`} onClick={onPrev}>← Prev</button>
              <button className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border transition-colors text-xs sm:text-sm font-medium ${isDarkMode ? 'border-gray-700 hover:bg-gray-700 text-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`} onClick={onNext}>Next →</button>
            </div>
            <h3 className={`text-sm sm:text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{monthLabel}</h3>
            <div />
          </div>
        </div>
      )}

      <div className={`grid grid-cols-7 gap-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className={`${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'} px-1 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-center`}>{d}</div>
        ))}

        {days.map((d) => (
          <div key={d.toISOString()} className={`min-h-[80px] sm:min-h-[120px] p-1.5 sm:p-3 ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} ${d.getMonth() !== monthStart.getMonth() ? 'opacity-40' : ''} transition-colors`}>
            <div className="mb-1 sm:mb-2 flex items-center justify-between">
              <button
                className={`w-6 h-6 sm:w-7 sm:h-7 inline-flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors ${isToday(d) ? 'bg-purple-600 text-white' : (isDarkMode ? 'text-gray-300 hover:bg-purple-900/20' : 'text-gray-700 hover:bg-purple-100')}`}
                onClick={() => onDayClick && onDayClick(d)}
              >
                {d.getDate()}
              </button>
              {renderAddButton && d.getMonth() === monthStart.getMonth() ? (
                <div className="hidden sm:block">
                  {renderAddButton(d)}
                </div>
              ) : null}
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              {events
                .filter((e) => isSameDay(new Date(e.startsAt), d))
                .sort((a,b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
                .slice(0, 3) // Limit to 3 events on mobile to prevent overflow
                .map((e) => (
                  <button key={e.id} onClick={() => onEventClick && onEventClick(e)} className={`w-full rounded-md px-1 sm:px-2 py-0.5 sm:py-1 text-left transition-colors ${isDarkMode ? 'bg-purple-900/20 border border-purple-900/30 hover:bg-purple-900/30' : 'bg-purple-50 border border-purple-200 hover:bg-purple-100'}`}>
                    {renderEvent ? (
                      renderEvent(e)
                    ) : (
                      <div className={`text-[10px] sm:text-xs font-medium leading-tight ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>
                        {new Date(e.startsAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })} · {e.id}
                      </div>
                    )}
                  </button>
                ))}
              {events.filter((e) => isSameDay(new Date(e.startsAt), d)).length > 3 && (
                <div className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-0.5`}>
                  +{events.filter((e) => isSameDay(new Date(e.startsAt), d)).length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


