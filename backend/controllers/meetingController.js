/**
 * Video Meeting Controller
 * 
 * Handles HTTP requests for meeting management:
 * - Create scheduled meetings
 * - List meetings (upcoming, past, in-progress)
 * - Get meeting details
 * - Update meeting
 * - Cancel meeting
 * - Add/remove participants
 */

import { getSupabaseClient } from '../repositories/supabaseClient.js';
import { getActiveMeetingsStats } from '../services/videoMeetingService.js';

/**
 * Create a new meeting
 * POST /api/meetings
 */
export async function createMeeting(req, res) {
  try {
    const instructorId = req.user.id;
    const { title, description, scheduled_at, duration_minutes, participant_ids } = req.body;

    // Validation
    if (!title || !scheduled_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and scheduled time are required' 
      });
    }

    const supabase = getSupabaseClient();

    // Create meeting
    const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const roomUrl = `${process.env.FRONTEND_URL}/meeting/${meetingId}`;

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        id: meetingId,
        instructor_id: instructorId,
        title,
        description: description || null,
        scheduled_at,
        duration_minutes: duration_minutes || 60,
        status: 'scheduled',
        room_url: roomUrl
      })
      .select()
      .single();

    if (meetingError) {
      console.error('Error creating meeting:', meetingError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create meeting' 
      });
    }

    // Add instructor as host participant
    await supabase.from('meeting_participants').insert({
      meeting_id: meetingId,
      user_id: instructorId,
      user_type: 'instructor',
      role: 'host'
    });

    // Add invited participants
    if (participant_ids && Array.isArray(participant_ids)) {
      const participants = participant_ids.map(userId => ({
        meeting_id: meetingId,
        user_id: userId,
        user_type: 'student', // Assuming students for now
        role: 'participant'
      }));

      await supabase.from('meeting_participants').insert(participants);
    }

    // TODO: Send email invitations to participants

    res.json({ 
      success: true, 
      meeting 
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create meeting' 
    });
  }
}

/**
 * List meetings for current user
 * GET /api/meetings?status=scheduled
 */
export async function listMeetings(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    console.log('📋 Listing meetings for user:', userId, 'role:', userRole);

    const supabase = getSupabaseClient();

    // Get meetings based on user role
    let query = supabase
      .from('meetings')
      .select('*');

    // Filter by instructor ID for instructors
    if (userRole === 'instructor') {
      query = query.eq('instructor_id', userId);
    } else if (userRole === 'student') {
      // Students see meetings from their assigned instructor
      const studentData = req.user.students?.[0];
      if (!studentData || !studentData.instructor_id) {
        console.log('⚠️ Student has no instructor assigned');
        return res.json({ success: true, meetings: [] });
      }
      query = query.eq('instructor_id', studentData.instructor_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('scheduled_at', { ascending: true });

    const { data: meetings, error } = await query;

    if (error) {
      console.error('❌ Error listing meetings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to list meetings',
        error: error.message 
      });
    }

    console.log('✅ Found meetings:', meetings?.length || 0);

    res.json({ 
      success: true, 
      meetings: meetings || []
    });
  } catch (error) {
    console.error('❌ Error listing meetings:', error);
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
    const userId = req.user.id;
    const { id } = req.params;

    const supabase = getSupabaseClient();

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_participants(
          user_id,
          user_type,
          role,
          joined_at,
          left_at
        )
      `)
      .eq('id', id)
      .single();

    if (error || !meeting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found' 
      });
    }

    // Verify user has access to this meeting
    const hasAccess = meeting.instructor_id === userId || 
                      meeting.meeting_participants.some(p => p.user_id === userId);

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({ 
      success: true, 
      meeting 
    });
  } catch (error) {
    console.error('Error getting meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get meeting details' 
    });
  }
}

/**
 * Update meeting
 * PATCH /api/meetings/:id
 */
export async function updateMeeting(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, scheduled_at, duration_minutes } = req.body;

    const supabase = getSupabaseClient();

    // Verify user is the creator
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('instructor_id')
      .eq('id', id)
      .single();

    if (fetchError || !meeting) {
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

    // Update meeting
    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (scheduled_at) updates.scheduled_at = scheduled_at;
    if (duration_minutes) updates.duration_minutes = duration_minutes;
    updates.updated_at = new Date().toISOString();

    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating meeting:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update meeting' 
      });
    }

    // TODO: Notify participants of changes

    res.json({ 
      success: true, 
      meeting: updatedMeeting 
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update meeting' 
    });
  }
}

/**
 * Cancel meeting
 * DELETE /api/meetings/:id
 */
export async function cancelMeeting(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const supabase = getSupabaseClient();

    // Verify user is the creator
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('instructor_id')
      .eq('id', id)
      .single();

    if (fetchError || !meeting) {
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

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error cancelling meeting:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel meeting' 
      });
    }

    // TODO: Notify participants of cancellation

    res.json({ 
      success: true, 
      message: 'Meeting cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel meeting' 
    });
  }
}

/**
 * Delete meeting permanently
 * DELETE /api/meetings/:id/delete
 */
export async function deleteMeeting(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('🗑️ Deleting meeting:', id, 'by user:', userId);

    const supabase = getSupabaseClient();

    // Verify user is the creator
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('instructor_id')
      .eq('id', id)
      .single();

    if (fetchError || !meeting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found' 
      });
    }

    if (meeting.instructor_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only meeting creator can delete' 
      });
    }

    // Delete meeting (participants will be cascade deleted due to foreign key)
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting meeting:', deleteError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete meeting',
        error: deleteError.message
      });
    }

    console.log('✅ Meeting deleted successfully');

    res.json({ 
      success: true, 
      message: 'Meeting deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting meeting:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete meeting',
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
    const userId = req.user.id;
    const { id } = req.params;
    const { user_id, user_type = 'student' } = req.body;

    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const supabase = getSupabaseClient();

    // Verify user is the creator
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('instructor_id')
      .eq('id', id)
      .single();

    if (fetchError || !meeting) {
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

    // Add participant
    const { error: insertError } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: id,
        user_id,
        user_type,
        role: 'participant'
      });

    if (insertError) {
      console.error('Error adding participant:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add participant' 
      });
    }

    // TODO: Send invitation email

    res.json({ 
      success: true, 
      message: 'Participant added successfully' 
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add participant' 
    });
  }
}

/**
 * Get active meetings statistics
 * GET /api/meetings/stats
 */
export async function getMeetingStats(req, res) {
  try {
    const stats = getActiveMeetingsStats();
    
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('Error getting meeting stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get meeting statistics' 
    });
  }
}
