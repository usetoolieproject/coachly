/**
 * Clean Student Meetings Dashboard - Zoom-inspired Design
 * Simple, elegant interface for students to view and join meetings
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Plus, 
  Clock, 
  Users,
  AlertCircle,
  Calendar as CalendarIcon,
  X
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
  participants?: Array<{
    user_id: string;
    user_type: string;
    role: string;
  }>;
}

const StudentMeetings: React.FC = () => {
  const navigate = useNavigate();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showJoinModal, setShowJoinModal] = useState(false);

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

  const upcomingMeetings = meetings.filter(m => 
    m.status === 'scheduled' || m.status === 'in-progress'
  );

  const pastMeetings = meetings.filter(m => 
    m.status === 'ended' || m.status === 'cancelled'
  );

  const displayedMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canJoin = (meeting: Meeting) => {
    if (meeting.status === 'cancelled' || meeting.status === 'ended') {
      return false;
    }

    const now = new Date();
    const meetingTime = new Date(meeting.scheduled_at);
    const timeDiff = meetingTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can join if meeting is in progress OR within 10 minutes before start time
    return meeting.status === 'in-progress' || (minutesDiff <= 10 && minutesDiff >= -meeting.duration_minutes);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Error loading meetings</p>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <button 
              onClick={fetchMeetings}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Meetings</h1>
          <p className="text-gray-600">View and join your scheduled meetings</p>
        </div>

        {/* Action Cards Grid - Simplified for Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Join Meeting Card */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="group bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-8 transition-all duration-200 shadow-sm hover:shadow-lg text-center"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Join Meeting</h3>
            <p className="text-sm text-gray-500">Enter meeting ID to join</p>
          </button>

          {/* My Meetings Card */}
          <button
            className="group bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-500 rounded-2xl p-8 transition-all duration-200 shadow-sm hover:shadow-lg text-center"
          >
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Scheduled</h3>
            <p className="text-sm text-gray-500">View all your meetings</p>
          </button>
        </div>

        {/* Upcoming Meetings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                    activeTab === 'upcoming' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Upcoming ({upcomingMeetings.length})
                </button>
                <button 
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                    activeTab === 'past' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Past ({pastMeetings.length})
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : displayedMeetings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 opacity-50">
                  <Video className="h-full w-full text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg mb-2">
                  {activeTab === 'upcoming' 
                    ? "No upcoming meetings" 
                    : "No past meetings"}
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'upcoming' 
                    ? "You don't have any scheduled meetings"
                    : "You don't have any meeting history"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedMeetings.map(meeting => (
                  <div 
                    key={meeting.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-200"
                    onClick={() => canJoin(meeting) && handleJoinMeeting(meeting)}
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(meeting.scheduled_at).getDate()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(meeting.scheduled_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{meeting.participants?.length || 0} participants</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>

                    {canJoin(meeting) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinMeeting(meeting);
                        }}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                      >
                        Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <JoinMeetingModal 
          onClose={() => setShowJoinModal(false)}
        />
      )}
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

export default StudentMeetings;
