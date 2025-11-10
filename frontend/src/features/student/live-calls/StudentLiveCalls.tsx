import React from "react";
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from "../../../contexts/AuthContext";
import { useStudentLiveCalls } from "./hooks/useStudentLiveCalls";
import { Header, Stats, CallsList, Skeleton, Toolbar, CallDetailsModal } from "./components";
import CalendarGrid from "../../../components/shared/ui/CalendarGrid";
import type { Call } from './types';

const StudentLiveCalls: React.FC = () => {
  const { user } = useAuth();
  const { calls, isLoading, isRefreshing, refresh, upcomingCount, totalHours } = useStudentLiveCalls(user);
  const [view, setView] = React.useState<'list' | 'calendar'>('list');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<Call | null>(null);
  const [monthCursor, setMonthCursor] = React.useState(new Date());
  const { isDarkMode } = useTheme();

  const location = useLocation() as any;

  // Open modal when navigated from dashboard with a specific id
  React.useEffect(() => {
    const state = location?.state as { selectCallId?: string; openModal?: boolean } | undefined;
    if (!state || !state.selectCallId) return;
    const target = calls.find(c => c.id === state.selectCallId);
    if (target) {
      setSelected(target);
    }
    // clear state to avoid reopening on back/forward
    window.history.replaceState({}, document.title);
  }, [location?.state, calls]);

  const addToCalendar = (call: Call) => {
    const startDate = new Date(call.scheduled_at);
    const endDate = new Date(startDate.getTime() + call.duration_minutes * 60000);
    const title = encodeURIComponent(call.title);
    const details = encodeURIComponent(call.description || '');
    const location = encodeURIComponent(call.meeting_link);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  // Calendar export intentionally omitted in student view details iteration

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Header isUpdating={isRefreshing} onRefresh={refresh} />
      <Toolbar view={view} onChangeView={setView} search={search} onSearch={setSearch} />

      <Stats upcomingCount={upcomingCount} totalHours={totalHours} />

      {/* Live Calls List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Scheduled Sessions</h3>
        </div>
        {(view === 'list') ? (
          <CallsList
            calls={calls.filter(c => {
              const q = search.trim().toLowerCase();
              if (!q) return true;
              const platform = (() => { try { const u = new URL(c.meeting_link); if (u.hostname.includes('zoom.us')) return 'zoom'; if (u.hostname.includes('meet.google.com')) return 'google meet'; return 'other'; } catch { return 'other'; } })();
              return (
                c.title.toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q) ||
                platform.includes(q) ||
                c.meeting_link.toLowerCase().includes(q)
              );
            })}
            onViewDetails={(call) => setSelected(call)}
            onAddToCalendar={addToCalendar}
          />
        ) : (
          <CalendarGrid
            month={monthCursor}
            events={calls.map((c) => ({ id: c.id, startsAt: c.scheduled_at, call: c })) as any}
            onPrev={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            onNext={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            onEventClick={(e: any) => setSelected(e.call as Call)}
            renderEvent={(e: any) => (
              <div>
                <div className={`text-[10px] sm:text-xs font-medium leading-tight ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>
                  {new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {e.call.title || 'Untitled'}
                </div>
                <div className={`text-[8px] sm:text-[10px] leading-tight ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>
                  {(() => { try { const u = new URL(e.call.meeting_link); if (u.hostname.includes('zoom.us')) return 'Zoom'; if (u.hostname.includes('meet.google.com')) return 'Google Meet'; return 'Other'; } catch { return 'Other'; } })()} • {e.call.duration_minutes}m
                </div>
              </div>
            )}
          />
        )}
      </div>

      <CallDetailsModal call={selected} isOpen={!!selected} onClose={() => setSelected(null)} onAddToCalendar={addToCalendar} />
    </div>
  );
};

export default StudentLiveCalls;