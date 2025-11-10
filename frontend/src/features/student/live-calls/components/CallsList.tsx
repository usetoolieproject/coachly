import React from 'react';
import { Calendar, Clock, Video, Eye, ExternalLink } from 'lucide-react';
import type { Call } from '../types';
import { useTheme } from '../../../../contexts/ThemeContext';


const toExternalUrl = (url: string) => {
  if (!url) return '';
  const hasProtocol = /^https?:\/\//i.test(url);
  return hasProtocol ? url : `https://${url}`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: '2-digit' }).format(d);
};

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
};

const getPlatform = (link: string) => {
  try {
    const u = new URL(link);
    if (u.hostname.includes('zoom.us')) return 'Zoom';
    if (u.hostname.includes('meet.google.com')) return 'Google Meet';
    return 'Other';
  } catch { return 'Other'; }
};

const getPlatformBadgeClass = (platform: string, isDark: boolean) => {
  if (!isDark) {
    // Light mode: neutral subtle gray badge
    return 'bg-gray-100 text-gray-800';
  }
  // Dark mode: sleek, subtle platform colors
  switch (platform) {
    case 'Zoom': return 'bg-blue-900/30 text-blue-300';
    case 'Google Meet': return 'bg-green-900/30 text-green-300';
    default: return 'bg-gray-900/50 text-gray-300';
  }
};

interface CallsListProps {
  calls: Call[];
  onViewDetails: (call: Call) => void;
  onAddToCalendar?: (call: Call) => void;
}

const CallsList: React.FC<CallsListProps> = ({ calls, onViewDetails, onAddToCalendar }) => {
  if (!calls.length) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Video className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
        <p className="text-sm sm:text-base text-gray-600">Your instructor hasn't scheduled any live calls yet.</p>
      </div>
    );
  }
  const { isDarkMode } = useTheme();
  
  const containerClass = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const headerClass = isDarkMode ? 'bg-gray-800 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500';
  const rowClass = isDarkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50';
  const chipClass = isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600';
  const primaryText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const linkClass = isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-700 hover:text-purple-800';

  return (
    <div className={`rounded-xl border ${containerClass}`}>
      <div className="min-w-full">
        {/* Desktop Header - Hidden on mobile */}
        <div className={`hidden lg:grid grid-cols-[1.25fr_1fr_0.9fr_0.7fr] px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b ${headerClass}`}>
          <div>Date & Time</div>
          <div>Title</div>
          <div>Platform</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-3 p-3">
          {calls.map((call) => {
            const platform = getPlatform(call.meeting_link);
            return (
              <div key={call.id} className={`border rounded-lg p-4 transition-colors ${rowClass}`}>
                {/* Mobile Card Layout */}
                <div className="space-y-3">
                  {/* Date & Time - Mobile */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${chipClass}`}>
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${primaryText}`}>{fmtDate(call.scheduled_at)}</div>
                        <div className={`text-xs ${secondaryText}`}>{fmtTime(call.scheduled_at)} • {call.duration_minutes}m</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-purple-300' : 'hover:bg-gray-100 text-purple-600'}`} title="View details" onClick={() => onViewDetails(call)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      {onAddToCalendar && (
                        <button type="button" className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-purple-300' : 'hover:bg-gray-100 text-purple-600'}`} title="Add to calendar" onClick={() => onAddToCalendar(call)}>
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title - Mobile */}
                  <div>
                    <div className={`text-sm font-medium ${primaryText} mb-1`}>{call.title || 'Untitled'}</div>
                    {call.description && (
                      <div className={`text-xs ${secondaryText} line-clamp-2`}>{call.description}</div>
                    )}
                  </div>

                  {/* Platform & Join - Mobile */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformBadgeClass(platform, isDarkMode)}`}>
                      {platform}
                    </span>
                    {call.meeting_link && (
                      <a
                        href={toExternalUrl(call.meeting_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-sm font-medium ${linkClass}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Join
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block space-y-2 p-1">
          {calls.map((call) => {
            const platform = getPlatform(call.meeting_link);
            return (
              <div key={call.id} className={`grid grid-cols-[1.25fr_1fr_0.9fr_0.7fr] items-center px-6 py-4 border rounded-lg transition-colors ${rowClass}`}>
                {/* Date & Time */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${chipClass}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${primaryText}`}>{fmtDate(call.scheduled_at)}, {fmtTime(call.scheduled_at)}</div>
                    <div className={`text-xs ${secondaryText}`}>{call.duration_minutes} minutes</div>
                  </div>
                </div>

                {/* Title */}
                <div className="truncate">
                  <div className={`text-sm font-medium truncate ${primaryText}`}>{call.title || 'Untitled'}</div>
                  {call.description && (
                    <div className={`text-xs truncate ${secondaryText}`}>{call.description}</div>
                  )}
                </div>

                {/* Platform */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium dark:bg-white dark:text-gray-800 ${getPlatformBadgeClass(platform, isDarkMode)}`}>
                    {platform}
                  </span>
                  {call.meeting_link && (
                    <a
                      href={toExternalUrl(call.meeting_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-sm ${linkClass}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button type="button" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-purple-300' : 'hover:bg-gray-100 text-purple-600'}`} title="View details" onClick={() => onViewDetails(call)}>
                    <Eye className="w-4 h-4" />
                  </button>
                  {onAddToCalendar && (
                    <button type="button" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-purple-300' : 'hover:bg-gray-100 text-purple-600'}`} title="Add to calendar" onClick={() => onAddToCalendar(call)}>
                      <Calendar className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CallsList;


