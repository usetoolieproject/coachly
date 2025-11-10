import { getSupabaseClient } from '../repositories/supabaseClient.js';


// Get all calls for instructor
export const getInstructorCalls = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0]?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const { data: calls, error } = await supabase
      .from('live_calls')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new call
export const createCall = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0]?.id;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    const { title, description, scheduled_at, duration_minutes, meeting_link, notes } = req.body;

    if (!title || !scheduled_at || !duration_minutes || !meeting_link) {
      return res.status(400).json({ error: 'Title, scheduled time, duration, and meeting link are required' });
    }

    const { data: call, error } = await supabase
      .from('live_calls')
      .insert({
        instructor_id: instructorId,
        title,
        description,
        scheduled_at,
        duration_minutes: parseInt(duration_minutes),
        meeting_link,
        notes
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update call
export const updateCall = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0]?.id;
    const { callId } = req.params;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    // Verify call belongs to instructor
    const { data: existingCall } = await supabase
      .from('live_calls')
      .select('id')
      .eq('id', callId)
      .eq('instructor_id', instructorId)
      .single();

    if (!existingCall) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const { title, description, scheduled_at, duration_minutes, meeting_link, notes, is_cancelled } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;
    if (duration_minutes !== undefined) updateData.duration_minutes = parseInt(duration_minutes);
    if (meeting_link !== undefined) updateData.meeting_link = meeting_link;
    if (notes !== undefined) updateData.notes = notes;
    if (is_cancelled !== undefined) updateData.is_cancelled = is_cancelled;

    const { data: call, error } = await supabase
      .from('live_calls')
      .update(updateData)
      .eq('id', callId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(call);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete call
export const deleteCall = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const instructorId = req.user.instructors[0]?.id;
    const { callId } = req.params;

    if (!instructorId) {
      return res.status(403).json({ error: 'Instructor access required' });
    }

    // Verify call belongs to instructor
    const { data: existingCall } = await supabase
      .from('live_calls')
      .select('id')
      .eq('id', callId)
      .eq('instructor_id', instructorId)
      .single();

    if (!existingCall) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const { error } = await supabase
      .from('live_calls')
      .delete()
      .eq('id', callId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student calls (for students to see available calls)
export const getStudentCalls = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const studentRecord = req.user.students?.[0];

    if (!studentRecord || !studentRecord.instructor_id) {
      return res.status(403).json({ error: 'Student access required and must be assigned to instructor' });
    }

    // Fetch all not-cancelled calls for the student's instructor and let the client handle timezone-aware filtering
    const { data: calls, error } = await supabase
      .from('live_calls')
      .select('*')
      .eq('instructor_id', studentRecord.instructor_id)
      .eq('is_cancelled', false)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};