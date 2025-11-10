import React from 'react';
import type { SocialPost } from '../types';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

type Props = {
  draft: SocialPost | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: SocialPost) => void;
  onDelete?: (id: string) => void;
  setDraft: (updater: (d: SocialPost) => SocialPost) => void;
};

export function EditPostModal({ draft, open, saving, onClose, onSave, onDelete, setDraft }: Props) {
  const { isDarkMode } = useTheme();
  
  if (!open || !draft) return null;
  const PLATFORMS = ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn", "X/Twitter"];
  
  const modalBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const borderColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const heading = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const label = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900';
  const buttonBg = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
  const deleteButton = isDarkMode ? 'border-red-700 text-red-400 hover:bg-red-900/20' : 'border-red-300 text-red-700 hover:bg-red-50';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-2xl ${modalBg} rounded-xl shadow-xl border ${borderColor} max-h-[90vh] flex flex-col`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${borderColor}`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${heading}`}>{draft.id ? 'Edit Post' : 'Add Post'}</h2>
          <button className={`text-gray-400 hover:text-gray-600 p-1`} onClick={onClose}>✕</button>
        </div>
        <div className={`p-4 sm:p-6 space-y-4 overflow-y-auto flex-1`}>
          <div>
            <label className={`block text-sm font-medium ${label} mb-2`}>
              <LinkIcon className="w-4 h-4 inline mr-2" />Media Link
            </label>
            <input 
              value={draft.media_link || ''} 
              onChange={(e)=>setDraft({ ...draft, media_link: e.target.value })} 
              placeholder="https://..." 
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`} 
            />
          </div>
          
          {/* Date and Time - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${label} mb-2`}>Date</label>
              <input 
                type="date" 
                value={draft.date} 
                onChange={(e)=>setDraft({ ...draft, date: e.target.value })} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`} 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${label} mb-2`}>Time</label>
              <input 
                type="time" 
                value={draft.time} 
                onChange={(e)=>setDraft({ ...draft, time: e.target.value })} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`} 
              />
            </div>
          </div>
          
          {/* Platform and Status - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${label} mb-2`}>Channel</label>
              <select 
                value={draft.platform} 
                onChange={(e)=>setDraft({ ...draft, platform: e.target.value })} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`}
              >
                {PLATFORMS.map(p => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${label} mb-2`}>Status</label>
              <select 
                value={draft.status} 
                onChange={(e)=>setDraft({ ...draft, status: e.target.value as SocialPost['status'] })} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`}
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${label} mb-2`}>Title (optional)</label>
            <input 
              value={draft.title || ''} 
              onChange={(e)=>setDraft({ ...draft, title: e.target.value })} 
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`} 
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${label} mb-2`}>Copy</label>
            <textarea 
              value={draft.copy || ''} 
              onChange={(e)=>setDraft({ ...draft, copy: e.target.value })} 
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] resize-none ${inputBg}`} 
            />
          </div>
        </div>
        
        {/* Footer - Responsive Layout */}
        <div className={`flex flex-col sm:flex-row justify-between p-4 sm:p-6 border-t ${borderColor} gap-3 sm:gap-0`}>
          <div>
            {draft.id && onDelete && (
              <button 
                onClick={()=>onDelete(draft.id!)} 
                className={`px-3 sm:px-4 py-2 border rounded-lg transition-colors flex items-center space-x-2 text-sm sm:text-base ${deleteButton}`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={onClose} 
              className={`px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm sm:text-base ${buttonBg}`} 
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              onClick={()=>onSave(draft)} 
              className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


