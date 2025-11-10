import { useState } from 'react';
import type { Call } from '../types';
import { useTheme } from '../../../../contexts/ThemeContext';

function getPlatform(link: string) {
  try { const u = new URL(link); if (u.hostname.includes('zoom.us')) return 'Zoom'; if (u.hostname.includes('meet.google.com')) return 'Google Meet'; return 'Other'; } catch { return 'Other'; }
}
function platformClass(p: string, isDark: boolean) {
  if (!isDark) {
    switch (p) { case 'Zoom': return 'bg-blue-100 text-blue-800'; case 'Google Meet': return 'bg-green-100 text-green-800'; default: return 'bg-gray-100 text-gray-800'; }
  }
  switch (p) { case 'Zoom': return 'bg-blue-900/30 text-blue-300'; case 'Google Meet': return 'bg-green-900/30 text-green-300'; default: return 'bg-gray-900/50 text-gray-300'; }
}

export function EditCallModal({ value, onSave, onCancel }: { value: Call; onSave: (call: Call)=>Promise<void>; onCancel: ()=>void; }) {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState(value?.title || '');
  const [description, setDescription] = useState(value?.description || '');
  const [date, setDate] = useState(() => (value?.scheduled_at || new Date().toISOString()).slice(0,10));
  const [time, setTime] = useState(() => (value?.scheduled_at || 'T09:00').slice(11,16) || '09:00');
  const [duration, setDuration] = useState(value?.duration_minutes || 60);
  const [link, setLink] = useState(value?.meeting_link || '');
  const [notes, setNotes] = useState(value?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !link.trim()) { alert('Title and meeting link are required'); return; }
    setSaving(true);
    try {
      const scheduled_at = new Date(`${date}T${time}:00`).toISOString();
      const normalizedLink = /^https?:\/\//i.test(link.trim()) ? link.trim() : `https://${link.trim()}`;
      await onSave({ ...value, title: title.trim(), description: description.trim() || undefined, scheduled_at, duration_minutes: Number(duration) || 60, meeting_link: normalizedLink, notes: notes.trim() || undefined });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/40'}`} onClick={onCancel} />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Schedule Call</h2>
          <button className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} onClick={onCancel}>✕</button>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Call Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Call Title *</label>
            <input className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g., Group Coaching Session" />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} rows={2} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Brief description of what will be covered..." />
          </div>

          {/* Date and Time - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date *</label>
              <input type="date" className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} value={date} onChange={(e)=>setDate(e.target.value)} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time *</label>
              <input type="time" className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} value={time} onChange={(e)=>setTime(e.target.value)} />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration (minutes) *</label>
            <input type="number" min={5} step={5} className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} value={duration} onChange={(e)=>setDuration(Number(e.target.value))} />
          </div>

          {/* Meeting Link */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Meeting Link *</label>
            <input className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} placeholder="Paste Zoom/Meet link" value={link} onChange={(e)=>setLink(e.target.value)} />
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
            <textarea className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border border-gray-300'}`} rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Anything students should prepare or bring to the call..." />
          </div>

          {/* Platform Detection */}
          <div className={`rounded-lg p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detected Platform:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${platformClass(getPlatform(link), isDarkMode)}`}>{getPlatform(link)}</span>
            </div>
          </div>

          {/* Action Buttons - Responsive Layout */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'border border-gray-700 text-gray-300 hover:bg-gray-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`} onClick={onCancel} disabled={saving}>Cancel</button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Call'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


