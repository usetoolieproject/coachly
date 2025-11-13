-- Video Meetings Schema for Supabase
-- Run this in Supabase SQL Editor to create the tables

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  room_url TEXT NOT NULL,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('instructor', 'student')),
  role TEXT NOT NULL CHECK (role IN ('host', 'participant')),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_instructor_id ON meetings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings table
-- Instructors can view and manage their own meetings
CREATE POLICY "Instructors can view their own meetings" 
  ON meetings FOR SELECT 
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can create meetings" 
  ON meetings FOR INSERT 
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their own meetings" 
  ON meetings FOR UPDATE 
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete their own meetings" 
  ON meetings FOR DELETE 
  USING (instructor_id = auth.uid());

-- RLS Policies for meeting_participants table
-- Users can view meetings they're invited to
CREATE POLICY "Users can view their meeting participations" 
  ON meeting_participants FOR SELECT 
  USING (user_id = auth.uid());

-- Instructors can manage participants in their meetings
CREATE POLICY "Instructors can manage participants in their meetings" 
  ON meeting_participants FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = meeting_participants.meeting_id 
      AND meetings.instructor_id = auth.uid()
    )
  );
