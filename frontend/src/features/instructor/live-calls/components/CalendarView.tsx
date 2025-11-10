// React import intentionally omitted because only JSX is used and bundler provides it
import CalendarGrid from '../../../../components/shared/ui/CalendarGrid';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Video, Clock } from 'lucide-react';
import type { Call } from '../types';

export function CalendarView({ month, calls, onPrev, onNext, onSelect }: {
  month: Date;
  calls: Call[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (c: Call) => void;
}) {
  const { isDarkMode } = useTheme();
  
  const getPlatform = (link: string) => {
    try { 
      const u = new URL(link); 
      if (u.hostname.includes('zoom.us')) return 'Zoom'; 
      if (u.hostname.includes('meet.google.com')) return 'Google Meet'; 
      return 'Other'; 
    } catch { 
      return 'Other'; 
    }
  };

  return (
    <CalendarGrid
      month={month}
      events={calls.map((c) => ({ id: c.id, startsAt: c.scheduled_at, call: c })) as any}
      onPrev={onPrev}
      onNext={onNext}
      onEventClick={(e: any) => onSelect(e.call as Call)}
      renderEvent={(e: any) => (
        <div>
          {/* Desktop/Tablet: Full details */}
          <div className="hidden sm:block">
            <div className={`text-xs font-medium leading-tight ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>
              {new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {e.call.title || 'Untitled'}
            </div>
            <div className={`text-[10px] leading-tight ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>
              {getPlatform(e.call.meeting_link)} • {e.call.duration_minutes}m
            </div>
          </div>

          {/* Mobile: Symbol only */}
          <div className="sm:hidden flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <Video className="w-3 h-3" />
              <Clock className="w-3 h-3" />
            </div>
          </div>

          {/* Mobile: Time only (fallback if symbol doesn't work) */}
          <div className="sm:hidden hidden">
            <div className={`text-xs font-medium text-center ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>
              {new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}
    />
  );
}


