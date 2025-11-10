const toExternalUrl = (url: string) => {
  if (!url) return '';
  const hasProtocol = /^https?:\/\//i.test(url);
  return hasProtocol ? url : `https://${url}`;
};
import React from 'react';
import type { Call } from '../types';
import { Calendar, Clock, ExternalLink } from 'lucide-react';

interface Props {
  call: Call | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCalendar?: (call: Call) => void;
}

const fmtDate = (iso: string) => new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const fmtTime = (iso: string) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(iso));

const getPlatform = (link: string) => {
  try {
    const u = new URL(link);
    if (u.hostname.includes('zoom.us')) return 'Zoom';
    if (u.hostname.includes('meet.google.com')) return 'Google Meet';
    return 'Other';
  } catch { return 'Other'; }
};

const CallDetailsModal: React.FC<Props> = ({ call, isOpen, onClose, onAddToCalendar }) => {
  if (!isOpen || !call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Live Session Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <span className="text-lg">✕</span>
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">Call Title</label>
            <div className="text-sm sm:text-base text-gray-900 font-medium">{call.title}</div>
          </div>
          {call.description && (
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">Description</label>
              <div className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">{call.description}</div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">Date</label>
              <div className="flex items-center text-sm sm:text-base text-gray-900">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> 
                {fmtDate(call.scheduled_at)}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">Time</label>
              <div className="flex items-center text-sm sm:text-base text-gray-900">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> 
                {fmtTime(call.scheduled_at)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">Duration (minutes)</label>
              <div className="text-sm sm:text-base text-gray-900">{call.duration_minutes}</div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">Platform</label>
              <div className="text-sm sm:text-base text-gray-900">{getPlatform(call.meeting_link)}</div>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">Meeting Link</label>
            <a href={toExternalUrl(call.meeting_link)} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline text-sm sm:text-base break-all">
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{call.meeting_link}</span>
            </a>
          </div>
          {call.notes && (
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">Notes</label>
              <div className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">{call.notes}</div>
            </div>
          )}
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          {onAddToCalendar && (
            <button
              onClick={() => onAddToCalendar(call)}
              className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm sm:text-base w-full sm:w-auto"
            >
              Add to Calendar
            </button>
          )}
          <button onClick={onClose} className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm sm:text-base w-full sm:w-auto">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CallDetailsModal;


