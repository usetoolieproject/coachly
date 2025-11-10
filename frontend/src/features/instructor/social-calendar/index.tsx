import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Instagram, Facebook, Youtube, Linkedin, Twitter, Globe } from 'lucide-react';
import CalendarGrid from '../../../components/shared/ui/CalendarGrid';
import Week from '../../../components/shared/ui/Week';
import { Header } from './components/Header';
import { EditPostModal } from './components/EditPostModal';
import { useSocialCalendar } from './hooks/useSocialCalendar';
import type { SocialPost } from './types';

const PLATFORMS = ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn", "X/Twitter"];

const formatDate = (date: Date, format: string) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  if (format === 'YYYY-MM-DD') return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (format === 'MMMM YYYY') return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (format === '[Week of] MMM D, YYYY') return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  if (format === 'MMM') return date.toLocaleDateString('en-US', { month: 'short' });
  return date.toLocaleDateString();
};

const addPeriod = (date: Date, amount: number, unit: 'month' | 'week' | 'day') => {
  const x = new Date(date);
  if (unit === 'month') x.setMonth(x.getMonth() + amount);
  else if (unit === 'week') x.setDate(x.getDate() + amount * 7);
  else x.setDate(x.getDate() + amount);
  return x;
};

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const SocialCalendarPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [current, setCurrent] = useState(new Date());
  const { posts, byDate, isLoading, upsert, remove } = useSocialCalendar();
  const [modal, setModal] = useState<{ open: boolean; draft: SocialPost | null }>({ open: false, draft: null });

  const changePeriod = (delta: number) => setCurrent(prev => addPeriod(prev, delta, view === 'month' ? 'month' : 'week'));
  const goToday = () => setCurrent(new Date());

  const openNew = (date?: Date) => setModal({
    open: true,
    draft: {
      id: '',
      date: formatDate(date || current, 'YYYY-MM-DD'),
      time: '09:00',
      platform: PLATFORMS[0],
      title: '',
      copy: '',
      media_link: '',
      status: 'Draft'
    }
  });
  const openEdit = (p: SocialPost) => setModal({ open: true, draft: { ...p } });

  const saveDraft = async () => { if (modal.draft) { await upsert.mutateAsync(modal.draft); setModal({ open: false, draft: null }); } };
  const deletePost = async (id: string) => { if (confirm('Remove post?')) { await remove.mutateAsync(id); setModal({ open: false, draft: null }); } };

  const PlatformIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
    if (name === 'Instagram') return <Instagram className={className} />;
    if (name === 'Facebook') return <Facebook className={className} />;
    if (name === 'YouTube') return <Youtube className={className} />;
    if (name === 'LinkedIn') return <Linkedin className={className} />;
    if (name === 'X/Twitter') return <Twitter className={className} />;
    if (name === 'TikTok') {
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path fill="#000" d="M28 6c1.7 3.5 4.7 6 8.5 6V18c-3.3 0-6.3-1.1-8.5-2.9V31c0 6.1-5 11-11.1 11S6.9 37.1 6.9 31c0-6.1 4.9-11 11-11 1.2 0 2.3.2 3.4.6V26c-.9-.5-2-.8-3.1-.8-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2V6H28z"/>
        </svg>
      );
    }
    return <Globe className={className} />;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-[500px] rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Header
        view={view}
        onChangeView={setView}
        onNew={() => openNew()}
        label={formatDate(current, view === 'month' ? 'MMMM YYYY' : '[Week of] MMM D, YYYY')}
        onPrev={() => changePeriod(-1)}
        onNext={() => changePeriod(1)}
        onToday={goToday}
      />

      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        {view === 'month' ? (
          <CalendarGrid
            month={current}
            events={posts.map(p => ({ id: p.id, startsAt: `${p.date}T${p.time}`, call: p })) as any}
            onPrev={() => setCurrent(addPeriod(current, -1, 'month'))}
            onNext={() => setCurrent(addPeriod(current, 1, 'month'))}
            onEventClick={(e: any) => openEdit(e.call as SocialPost)}
            renderEvent={(e: any) => {
              const d = new Date(`${e.call.date}T${e.call.time}`);
              const dateStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
              const timeStr = d.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' });
              
              return (
                <div className={`text-xs flex items-center justify-between w-full ${isDarkMode ? 'text-gray-100' : ''}`}>
                  {/* Desktop/Tablet: Full details */}
                  <div className="hidden sm:flex sm:flex-col sm:leading-tight">
                    <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} font-semibold`}>{dateStr}</span>
                    <span className={`${isDarkMode ? 'text-gray-100' : 'text-purple-900'} font-medium`}>{timeStr}</span>
                  </div>

                  {/* Mobile: Time only */}
                  <div className="sm:hidden flex items-center justify-center flex-1">
                    <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} font-medium text-center`}>{timeStr}</span>
                  </div>

                  {/* Platform Icon - Always visible */}
                  <PlatformIcon name={e.call.platform} className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-white' : 'text-purple-800'} flex-shrink-0`} />
                </div>
              );
            }}
            renderAddButton={(date)=> (
              <button
                aria-label="Add post"
                className="hidden sm:inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:shadow-md transition-all ring-1 ring-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => openNew(date)}
              >
                <span className="text-sm leading-none">+</span>
              </button>
            )}
            hideHeader
          />
        ) : (
          <Week
            startDate={startOfWeek(current)}
            eventsByDate={Object.fromEntries(Object.entries(byDate).map(([k, arr]) => [k, arr.map(p => ({ id: p.id, date: p.date, time: p.time, content: (() => {
              const d = new Date(`${p.date}T${p.time}`);
              const dateStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
              const timeStr = d.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' });
              return (
                <span className={`flex items-center justify-between w-full ${isDarkMode ? 'text-gray-100' : ''}`}>
                  {/* Desktop/Tablet: Full details */}
                  <span className="hidden sm:flex sm:flex-col sm:leading-tight">
                    <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} font-semibold`}>{dateStr}</span>
                    <span className={`${isDarkMode ? 'text-gray-100' : 'text-purple-900'} font-medium`}>{timeStr}</span>
                  </span>

                  {/* Mobile: Time only */}
                  <span className="sm:hidden flex items-center justify-center flex-1">
                    <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} font-medium text-center`}>{timeStr}</span>
                  </span>

                  {/* Platform Icon - Always visible */}
                  <PlatformIcon name={p.platform} className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-white' : 'text-purple-800'} flex-shrink-0`} />
                </span>
              );
            })() }))]))}
            onEventClick={(e) => openEdit(posts.find(p => p.id === e.id)!)}
            formatDate={formatDate}
            onAdd={(date)=> openNew(date)}
          />
        )}
      </div>

      <EditPostModal
        open={modal.open}
        draft={modal.draft}
        saving={upsert.isPending}
        onClose={() => setModal({ open: false, draft: null })}
        onSave={() => saveDraft()}
        onDelete={(id) => deletePost(id)}
        setDraft={(next: any) => setModal(m => ({ ...m, draft: typeof next === 'function' ? next(m.draft!) : next }))}
      />
    </div>
  );
};

export default SocialCalendarPage;


