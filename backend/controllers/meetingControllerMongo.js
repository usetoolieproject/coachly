/**
 * Video Meeting Controller (MongoDB Version)
 * 
 * Handles HTTP requests for meeting management using MongoDB
 */

import mongoose from 'mongoose';

// Meeting Schema
const meetingSchema = new mongoose.Schema({
  meeting_id: { type: String, required: true, unique: true },
  instructor_id: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  scheduled_at: Date,
  duration_minutes: { type: Number, default: 60 },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'ended', 'cancelled'],
    default: 'scheduled' 
  },
  started_at: Date,
  ended_at: Date,
  room_url: String,
  participants: [{
    user_id: String,
    user_type: String,
    role: String,
    joined_at: Date,
    left_at: Date
  }],
  messages: [{
    user_id: String,
    user_name: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);

/**
 * Create a new meeting
 * POST /api/meetings
 */
export async function createMeeting(req, res) {
  try {
    const instructorId = req.user?.userId || req.user?.id || req.user?._id;
    
    if (!instructorId) {
      console.error('No instructor ID found in req.user:', req.user);
      return res.status(400).json({ 
        success: false, 
        message: 'User authentication error: instructor ID not found'
      });
    }
    
    console.log('Creating meeting for instructor:', instructorId);
    
    const { title, description, scheduled_at, duration_minutes, participant_ids } = req.body;

    // Validation
    if (!title || !scheduled_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and scheduled time are required' 
      });
    }

    // Create meeting ID
    const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const roomUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/meeting/${meetingId}`;

    // Build participants array
    const participants = [
      {
        user_id: instructorId,
        user_type: 'instructor',
        role: 'host'
      }
    ];

    // Add invited participants
    if (participant_ids && Array.isArray(participant_ids)) {
      participant_ids.forEach(userId => {
        participants.push({
          user_id: userId,
          user_type: 'student',
          role: 'participant'
        });
      });
    }

    // Create meeting
    const meeting = new Meeting({
      meeting_id: meetingId,
      instructor_id: instructorId,
      title,
      description: description || '',
      scheduled_at: new Date(scheduled_at),
      duration_minutes: duration_minutes || 60,
      status: 'scheduled',
      room_url: roomUrl,
      participants,
      messages: []
    });

    await meeting.save();

    // Return meeting with id field for frontend compatibility
    const meetingObj = meeting.toObject();
    meetingObj.id = meetingObj.meeting_id;

    res.json({ 
      success: true, 
      meeting: meetingObj
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create meeting',
      error: error.message
    });
  }
}

/**
 * List meetings for current user
 * GET /api/meetings?status=scheduled
 */
export async function listMeetings(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { status } = req.query;

    console.log('Listing meetings for user:', userId);

    // Build query - find meetings where user is instructor or participant
    const query = {
      $or: [
        { instructor_id: userId },
        { 'participants.user_id': userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .sort({ scheduled_at: 1 })
      .lean();

    // Add id field for frontend compatibility
    const meetingsWithId = meetings.map(m => ({
      ...m,
      id: m.meeting_id
    }));

    res.json({ 
      success: true, 
      meetings: meetingsWithId
    });
  } catch (error) {
    console.error('Error listing meetings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list meetings',
      error: error.message
    });
  }
}

/**
 * Get single meeting details
 * GET /api/meetings/:id
 */
export async function getMeeting(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { id } = req.params;

    const meeting = await Meeting.findOne({ meeting_id: id }).lean();

    if (!meeting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found' 
      });
    }

    // Verify user has access to this meeting
    const hasAccess = meeting.instructor_id === userId || 
                      meeting.participants.some(p => p.user_id === userId);

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Check if meeting has expired (past scheduled time + duration)
    if (meeting.scheduled_at && meeting.duration_minutes) {
      const scheduledTime = new Date(meeting.scheduled_at);
      const endTime = new Date(scheduledTime.getTime() + meeting.duration_minutes * 60000);
      const now = new Date();
      
      if (now > endTime && meeting.status !== 'in-progress') {
        return res.status(410).json({ 
          success: false, 
          message: 'This meeting has expired and can no longer be joined',
          expired: true
        });
      }
    }

    // Add id field for frontend compatibility
    const meetingWithId = {
      ...meeting,
      id: meeting.meeting_id
    };

    res.json({ 
      success: true, 
      meeting: meetingWithId
    });
  } catch (error) {
    console.error('Error getting meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get meeting details',
      error: error.message
    });
  }
}

/**
 * Update meeting
 * PATCH /api/meetings/:id
 */
export async function updateMeeting(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { id } = req.params;
    const { title, description, scheduled_at, duration_minutes } = req.body;

    const meeting = await Meeting.findOne({ meeting_id: id });

    if (!meeting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found' 
      });
    }

    if (meeting.instructor_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only meeting creator can update' 
      });
    }

    // Update fields
    if (title) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (scheduled_at) meeting.scheduled_at = new Date(scheduled_at);
    if (duration_minutes) meeting.duration_minutes = duration_minutes;

    await meeting.save();

    const meetingObj = meeting.toObject();
    meetingObj.id = meetingObj.meeting_id;

    res.json({ 
      success: true, 
      meeting: meetingObj
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update meeting',
      error: error.message
    });
  }
}

/**
 * Cancel meeting
 * DELETE /api/meetings/:id
 */
export async function cancelMeeting(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { id } = req.params;

    const meeting = await Meeting.findOne({ meeting_id: id });

    if (!meeting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found' 
      });
    }

    if (meeting.instructor_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only meeting creator can cancel' 
      });
    }

    meeting.status = 'cancelled';
    await meeting.save();

    res.json({ 
      success: true, 
      message: 'Meeting cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel meeting',
      error: error.message
    });
  }
}

/**
 * Add participant to meeting
 * POST /api/meetings/:id/participants
 */
export async function addParticipant(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { id } = req.params;
    const { user_id, user_type = 'student' } = req.body;

    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const meeting = await Meeting.findOne({ meeting_id: id });

    if (!meeting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found' 
      });
    }

    if (meeting.instructor_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only meeting creator can add participants' 
      });
    }

    // Check if participant already exists
    const exists = meeting.participants.some(p => p.user_id === user_id);
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Participant already added' 
      });
    }

    // Add participant
    meeting.participants.push({
      user_id,
      user_type,
      role: 'participant'
    });

    await meeting.save();

    res.json({ 
      success: true, 
      message: 'Participant added successfully' 
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add participant',
      error: error.message
    });
  }
}

/**
 * Get active meetings statistics
 * GET /api/meetings/stats
 */
export async function getMeetingStats(req, res) {
  try {
    const totalMeetings = await Meeting.countDocuments();
    const activeMeetings = await Meeting.countDocuments({ status: 'in-progress' });
    const scheduledMeetings = await Meeting.countDocuments({ status: 'scheduled' });

    res.json({ 
      success: true, 
      stats: {
        total: totalMeetings,
        active: activeMeetings,
        scheduled: scheduledMeetings
      }
    });
  } catch (error) {
    console.error('Error getting meeting stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get meeting statistics',
      error: error.message
    });
  }
}
