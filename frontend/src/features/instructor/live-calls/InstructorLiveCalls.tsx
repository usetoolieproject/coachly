import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useInstructorLiveCalls } from "./hooks/useInstructorLiveCalls";
import type { Call } from "./types";
import { Header, Toolbar, ListView, CalendarView, EditCallModal } from "./components";

const InstructorLiveCalls: React.FC = () => {
  const { user } = useAuth();
  const { calls, isLoading, isRefreshing, upsert, remove } = useInstructorLiveCalls(user);
  const [view, setView] = React.useState<'list' | 'calendar'>('list');
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState<Call | null>(null);
  const [monthCursor, setMonthCursor] = React.useState(new Date());

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return calls;
    return calls.filter(c => {
      const platform = (() => { try { const u = new URL(c.meeting_link); if (u.hostname.includes('zoom.us')) return 'zoom'; if (u.hostname.includes('meet.google.com')) return 'google meet'; return 'other'; } catch { return 'other'; } })();
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        platform.includes(q) ||
        (c.meeting_link || '').toLowerCase().includes(q)
      );
    });
  }, [calls, search]);

  const addToCalendar = (call: Call) => {
    const startDate = new Date(call.scheduled_at);
    const endDate = new Date(startDate.getTime() + call.duration_minutes * 60000);
    const title = encodeURIComponent(call.title || 'Live Call');
    const details = encodeURIComponent(call.description || '');
    const location = encodeURIComponent(call.meeting_link || '');
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Header isUpdating={isRefreshing} onCreate={() => setEditing({ id: '', title: '', scheduled_at: new Date().toISOString(), duration_minutes: 60, meeting_link: '', notes: '', is_cancelled: false })} />
      <Toolbar view={view} onChangeView={setView} search={search} onSearch={setSearch} />

      <div className="mb-6 sm:mb-8">
        {view === 'list' ? (
          <ListView calls={filtered} onEdit={setEditing} onDelete={(id) => remove(id)} onAddToCalendar={addToCalendar} />
        ) : (
          <CalendarView
            month={monthCursor}
            calls={calls}
            onPrev={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            onNext={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            onSelect={(c) => setEditing(c)}
          />
        )}
      </div>

      {editing && (
        <EditCallModal
            value={editing}
            onCancel={() => setEditing(null)}
            onSave={async (payload) => {
            await upsert(payload);
                setEditing(null);
            }}
          />
      )}
    </div>
  );
};

export default InstructorLiveCalls;