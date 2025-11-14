/**
 * Clean Meetings Dashboard - Zoom-inspired Design
 * Simple, elegant interface for video meetings
 * Requires Pro subscription
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Plus, 
  Calendar as CalendarIcon, 
  Upload,
  Clock,
  Users,
  X,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { apiFetch, getAuthHeaders } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { ProtectProFeature } from '../../../components/ProtectProFeature';

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in-progress' | 'ended' | 'cancelled';
  participants?: Array<{ user_id: string }>;
}

const CleanMeetingsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const copyMeetingId = (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(meetingId);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; meetings: Meeting[] }>('/meetings', {
        headers: getAuthHeaders(),
      });
      
      if (response.success) {
        setMeetings(response.meetings);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }

    try {
      await apiFetch(`/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      // Remove meeting from local state
      setMeetings(meetings.filter(m => m.id !== meetingId));
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert('Failed to delete meeting. Please try again.');
    }
  };

  const isMeetingExpired = (scheduledAt: string, durationMinutes: number) => {
    const scheduledTime = new Date(scheduledAt);
    const endTime = new Date(scheduledTime.getTime() + durationMinutes * 60000);
    const now = new Date();
    return now > endTime;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const upcomingMeetings = meetings.filter(m => {
    // Filter out cancelled meetings
    if (m.status === 'cancelled') return false;
    
    // Filter out expired meetings
    if (isMeetingExpired(m.scheduled_at, m.duration_minutes)) return false;
    
    // Filter by selected date
    const meetingDate = new Date(m.scheduled_at);
    return isSameDay(meetingDate, selectedDate);
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <ProtectProFeature
      featureName="Video Meetings"
      featureKey="meet"
      description="Host live HD video meetings and coaching sessions with screen sharing, chat, and recording capabilities."
    >
      <div className={`min-h-screen p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Video Meetings
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Create and manage your virtual meetings
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* New Meeting Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className={`group rounded-2xl p-8 transition-all duration-200 shadow-sm hover:shadow-lg text-center border-2 ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-orange-900/30 border-gray-700 hover:border-orange-500'
                : 'bg-white hover:bg-orange-50 border-gray-200 hover:border-orange-500'
            }`}
          >
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              New Meeting
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Start an instant meeting
            </p>
          </button>

          {/* Join Meeting Card */}
          <button
            onClick={() => setShowJoinModal(true)}
            className={`group rounded-2xl p-8 transition-all duration-200 shadow-sm hover:shadow-lg text-center border-2 ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-blue-900/30 border-gray-700 hover:border-blue-500'
                : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-500'
            }`}
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Join
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Join a meeting with ID
            </p>
          </button>

          {/* Schedule Meeting Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className={`group rounded-2xl p-8 transition-all duration-200 shadow-sm hover:shadow-lg text-center border-2 ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-blue-900/30 border-gray-700 hover:border-blue-500'
                : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-500'
            }`}
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Schedule
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Plan a future meeting
            </p>
          </button>

          {/* Share Screen Card */}
          <button
            className={`group rounded-2xl p-8 transition-all duration-200 shadow-sm hover:shadow-lg text-center border-2 ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-blue-900/30 border-gray-700 hover:border-blue-500'
                : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-500'
            }`}
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Share Screen
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Share content only
            </p>
          </button>
        </div>

        {/* Upcoming Meetings Section */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isSameDay(selectedDate, new Date()) ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}, {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={goToPreviousDay}
                  className={`p-2 rounded-lg transition ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Previous day"
                >
                  <span className="text-2xl">‹</span>
                </button>
                <button 
                  onClick={goToToday}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Today
                </button>
                <button 
                  onClick={goToNextDay}
                  className={`p-2 rounded-lg transition ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Next day"
                >
                  <span className="text-2xl">›</span>
                </button>
                <button 
                  className={`p-2 rounded-lg transition ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-xl">⋯</span>
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className={`p-2 rounded-lg transition ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Create new meeting"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 opacity-50">
                  <svg viewBox="0 0 200 200" className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>
                    <path fill="currentColor" d="M100,40 L140,80 L140,160 L60,160 L60,80 Z M80,100 L80,140 M120,100 L120,140"/>
                  </svg>
                </div>
                <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No meetings scheduled for this day
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Schedule a meeting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map(meeting => {
                  const isExpired = isMeetingExpired(meeting.scheduled_at, meeting.duration_minutes);
                  
                  return (
                    <div 
                      key={meeting.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition border ${
                        isExpired
                          ? isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 opacity-60'
                            : 'bg-gray-100 border-gray-200 opacity-60'
                          : isDarkMode
                          ? 'hover:bg-gray-700 border-transparent hover:border-gray-600 cursor-pointer'
                          : 'hover:bg-gray-50 border-transparent hover:border-gray-200 cursor-pointer'
                      }`}
                      onClick={() => !isExpired && navigate(`/meeting/${meeting.id}`)}
                    >
                      <div className="flex-shrink-0 text-center">
                        <div className={`text-2xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {new Date(meeting.scheduled_at).getDate()}
                        </div>
                        <div className={`text-xs uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {meeting.title}
                          </h3>
                          {isExpired && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(meeting.scheduled_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{meeting.participants?.length || 0} participants</span>
                          </div>
                          <button
                            onClick={(e) => copyMeetingId(meeting.id, e)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                              isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-500'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            title="Copy Meeting ID"
                          >
                            {copiedId === meeting.id ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>ID: {meeting.id.substring(0, 8)}...</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => deleteMeeting(meeting.id, e)}
                          className={`p-2 rounded-lg transition ${
                            isDarkMode
                              ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                              : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                          }`}
                          title="Delete meeting"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isExpired) {
                              navigate(`/meeting/${meeting.id}`);
                            }
                          }}
                          disabled={isExpired}
                          className={`px-6 py-2 font-semibold rounded-lg transition ${
                            isExpired
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          title={isExpired ? 'This meeting has expired' : 'Join meeting'}
                        >
                          {isExpired ? 'Expired' : 'Join'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Open recordings →
            </button>
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchMeetings();
          }}
        />
      )}

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <JoinMeetingModal 
          onClose={() => setShowJoinModal(false)}
        />
      )}
        </div>
      </div>
    </ProtectProFeature>
  );
};

// Simple Create Meeting Modal Component
interface CreateMeetingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduled_at) {
      setError('Title and date/time are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert datetime-local to ISO string with proper timezone
      const scheduledDate = new Date(formData.scheduled_at);
      const scheduledAtISO = scheduledDate.toISOString();

      const response = await apiFetch('/meetings', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduled_at: scheduledAtISO
        }),
      });

      if (response.success) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Team Standup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional meeting description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time*
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              min="15"
              step="15"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Join Meeting Modal Component
interface JoinMeetingModalProps {
  onClose: () => void;
}

const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingId.trim()) {
      setError('Please enter a meeting ID');
      return;
    }

    // Navigate directly to the meeting room
    navigate(`/meeting/${meetingId.trim()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Join Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting ID*
            </label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => {
                setMeetingId(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center tracking-wider"
              placeholder="Enter meeting ID"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the meeting ID provided by the host
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CleanMeetingsDashboard;
