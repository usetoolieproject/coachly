import { Clock, Video, Edit, Trash2, ExternalLink, Bell } from 'lucide-react';
import type { Call } from '../types';
import { useTheme } from '../../../../contexts/ThemeContext';

const getPlatform = (link: string) => {
  try { const u = new URL(link); if (u.hostname.includes('zoom.us')) return 'Zoom'; if (u.hostname.includes('meet.google.com')) return 'Google Meet'; return 'Other'; } catch { return 'Other'; }
};
const withProtocol = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
const getPlatformBadgeClass = (platform: string, isDark: boolean) => {
  if (!isDark) {
    return 'bg-gray-100 text-gray-800';
  }
  switch (platform) {
    case 'Zoom': return 'bg-blue-900/30 text-blue-300';
    case 'Google Meet': return 'bg-green-900/30 text-green-300';
    default: return 'bg-gray-900/50 text-gray-300';
  }
};
const fmtDateTime = (iso: string) => new Intl.DateTimeFormat(undefined, { weekday:'short', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(iso));

export function ListView({ calls, onEdit, onDelete, onAddToCalendar }: { calls: Call[]; onEdit: (c: Call)=>void; onDelete: (id: string)=>void; onAddToCalendar: (c: Call)=>void; }) {
  const { isDarkMode } = useTheme();

  if (!calls.length) return (
    <div className={`rounded-xl border p-8 sm:p-12 text-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <Video className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
      <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No upcoming calls</h3>
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Schedule your first call to see it here.</p>
    </div>
  );

  const cardClass = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const primaryText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const linkClass = isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-700 hover:text-purple-800';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop Table View (lg and above) */}
      <div className="hidden lg:block">
        <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
          <div className={`px-6 py-3 border-b text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'bg-gray-800 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">Date & Time</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Platform</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {calls.map((c) => (
              <div key={c.id} className={`grid grid-cols-12 items-center px-6 py-4 border-0 ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <div className="col-span-3 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-medium ${primaryText}`}>{fmtDateTime(c.scheduled_at)}</div>
                    <div className={`text-sm ${secondaryText}`}>{c.duration_minutes} minutes</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className={`font-medium ${primaryText}`}>{c.title || 'Untitled call'}</div>
                  {c.notes && <div className={`text-sm line-clamp-1 mt-1 ${secondaryText}`}>{c.notes}</div>}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformBadgeClass(getPlatform(c.meeting_link), isDarkMode)}`}>
                      {getPlatform(c.meeting_link)}
                    </span>
                    <a className={`inline-flex items-center space-x-1 text-sm font-medium transition-colors ${linkClass}`} href={withProtocol(c.meeting_link)} target="_blank" rel="noreferrer noopener">
                      <ExternalLink className="w-4 h-4" />
                      <span>Join</span>
                    </a>
                  </div>
                </div>
                <div className="col-span-3 flex justify-end space-x-2">
                  <button className={`p-1.5 rounded-md ${isDarkMode ? 'hover:bg-gray-800 text-blue-300' : 'hover:bg-blue-100 text-blue-600'}`} onClick={()=>onAddToCalendar(c)} title="Add to Google Calendar">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button className={`p-1.5 rounded-md ${isDarkMode ? 'hover:bg-gray-800 text-purple-300' : 'hover:bg-purple-100 text-purple-600'}`} onClick={()=>onEdit(c)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className={`p-1.5 rounded-md ${isDarkMode ? 'hover:bg-gray-800 text-red-300' : 'hover:bg-red-100 text-red-600'}`} onClick={()=>onDelete(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Card View (below lg) */}
      <div className="lg:hidden space-y-4">
        {calls.map((c) => (
          <div key={c.id} className={`rounded-xl border p-4 sm:p-6 ${cardClass}`}>
            {/* Header Row: Date & Time */}
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${primaryText}`}>{fmtDateTime(c.scheduled_at)}</div>
                <div className={`text-sm ${secondaryText}`}>{c.duration_minutes} minutes</div>
              </div>
            </div>

            {/* Title Row */}
            <div className="mb-4">
              <div className={`font-semibold text-lg ${primaryText}`}>{c.title || 'Untitled call'}</div>
              {c.notes && <div className={`text-sm mt-1 ${secondaryText}`}>{c.notes}</div>}
            </div>

            {/* Platform & Join Row */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlatformBadgeClass(getPlatform(c.meeting_link), isDarkMode)}`}>
                {getPlatform(c.meeting_link)}
              </span>
              <a className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`} href={withProtocol(c.meeting_link)} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="w-4 h-4" />
                <span>Join Call</span>
              </a>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-blue-300' : 'hover:bg-blue-100 text-blue-600'}`} onClick={()=>onAddToCalendar(c)} title="Add to Google Calendar">
                <Bell className="w-4 h-4" />
              </button>
              <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-purple-300' : 'hover:bg-purple-100 text-purple-600'}`} onClick={()=>onEdit(c)}>
                <Edit className="w-4 h-4" />
              </button>
              <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-red-300' : 'hover:bg-red-100 text-red-600'}`} onClick={()=>onDelete(c.id)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


