/**
 * Meetings Dashboard Component
 * 
 * Allows instructors to:
 * - View upcoming, in-progress, and past meetings
 * - Create new meetings
 * - Edit/cancel meetings
 * - Join meeting rooms
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Video, 
  Users, 
  Trash2,
  VideoOff,
  AlertCircle
} from 'lucide-react';
import { apiFetch, getAuthHeaders } from '../../../services/api';

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in-progress' | 'ended' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  room_url: string;
  meeting_participants: Array<{
    user_id: string;
    user_type: string;
    role: string;
  }>;
}

const MeetingsDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch<{ success: boolean; meetings: Meeting[] }>('/meetings', {
        headers: getAuthHeaders(),
      });
      
      if (response.success) {
        setMeetings(response.meetings);
      }
    } catch (err: any) {
      console.error('Error fetching meetings:', err);
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    navigate(`/meeting/${meeting.id}`);
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }

    try {
      await apiFetch(`/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchMeetings();
    } catch (err: any) {
      console.error('Error cancelling meeting:', err);
      alert(err.message || 'Failed to cancel meeting');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: Meeting['status']) => {
    const badges = {
      scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
      'in-progress': { label: 'In Progress', className: 'bg-green-100 text-green-800' },
      ended: { label: 'Ended', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const upcomingMeetings = meetings.filter(
    m => m.status === 'scheduled' || m.status === 'in-progress'
  );

  const pastMeetings = meetings.filter(
    m => m.status === 'ended' || m.status === 'cancelled'
  );

  const displayedMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Meetings</h1>
          <p className="text-gray-600 mt-1">Manage your coaching sessions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-semibold"
        >
          <Plus className="w-5 h-5" />
          Schedule Meeting
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'upcoming'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming ({upcomingMeetings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'past'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past ({pastMeetings.length})
          </button>
        </nav>
      </div>

      {/* Meetings List */}
      {displayedMeetings.length === 0 ? (
        <div className="text-center py-12">
          <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming meetings' : 'No past meetings'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'upcoming' 
              ? 'Schedule your first meeting to get started'
              : 'Completed meetings will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <Video className="w-5 h-5 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {meeting.title}
                      </h3>
                      {meeting.description && (
                        <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(meeting.scheduled_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(meeting.scheduled_at)} • {meeting.duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.meeting_participants?.length || 0} participants
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 ml-4">
                  {getStatusBadge(meeting.status)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                {meeting.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </button>
                    <button
                      onClick={() => handleCancelMeeting(meeting.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                
                {meeting.status === 'in-progress' && (
                  <button
                    onClick={() => handleJoinMeeting(meeting)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors animate-pulse font-semibold shadow-md"
                  >
                    <Video className="w-4 h-4" />
                    Join Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduled_at) {
      setError('Title and scheduled time are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await apiFetch('/meetings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      setError(err.message || 'Failed to create meeting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Meeting</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Weekly Coaching Session"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Discuss goals and progress..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="15"
              step="15"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingsDashboard;
