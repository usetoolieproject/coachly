-- Native Video Meeting System Database Schema
-- Run this migration to add support for WebRTC video meetings

-- =============================================
-- MEETINGS TABLE
-- Stores scheduled and active video meetings
-- =============================================

CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(255) PRIMARY KEY DEFAULT (CONCAT('meeting_', EXTRACT(EPOCH FROM NOW()), '_', LEFT(MD5(RANDOM()::TEXT), 8))),
    instructor_id VARCHAR(255) NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in-progress, ended, cancelled
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    room_url TEXT, -- Full URL to join the meeting
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meetings_instructor ON meetings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON meetings(scheduled_at);

-- =============================================
-- MEETING PARTICIPANTS TABLE
-- Tracks who is invited to each meeting
-- =============================================

CREATE TABLE IF NOT EXISTS meeting_participants (
    id VARCHAR(255) PRIMARY KEY DEFAULT (CONCAT('participant_', EXTRACT(EPOCH FROM NOW()), '_', LEFT(MD5(RANDOM()::TEXT), 8))),
    meeting_id VARCHAR(255) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Can be student or instructor
    user_type VARCHAR(50) NOT NULL, -- 'student' or 'instructor'
    role VARCHAR(50) DEFAULT 'participant', -- 'host' or 'participant'
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON meeting_participants(user_id);

-- Unique constraint: one entry per user per meeting
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_unique ON meeting_participants(meeting_id, user_id);

-- =============================================
-- MEETING MESSAGES TABLE (Chat History)
-- Stores in-meeting chat messages
-- TODO: Implement saving in Socket.IO handler
-- =============================================

CREATE TABLE IF NOT EXISTS meeting_messages (
    id VARCHAR(255) PRIMARY KEY,
    meeting_id VARCHAR(255) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_meeting ON meeting_messages(meeting_id, timestamp);

-- =============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Meetings Policies
-- Instructors can manage their own meetings
CREATE POLICY meetings_instructor_policy ON meetings
    FOR ALL
    USING (auth.uid() = instructor_id);

-- Participants can view meetings they're invited to
CREATE POLICY meetings_participant_view_policy ON meetings
    FOR SELECT
    USING (
        id IN (
            SELECT meeting_id FROM meeting_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Meeting Participants Policies
-- Anyone can view participants of meetings they're in
CREATE POLICY participants_view_policy ON meeting_participants
    FOR SELECT
    USING (
        meeting_id IN (
            SELECT meeting_id FROM meeting_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Meeting creator can add participants
CREATE POLICY participants_insert_policy ON meeting_participants
    FOR INSERT
    WITH CHECK (
        meeting_id IN (
            SELECT id FROM meetings WHERE instructor_id = auth.uid()
        )
    );

-- Meeting Messages Policies
-- Participants can view and send messages in their meetings
CREATE POLICY messages_view_policy ON meeting_messages
    FOR SELECT
    USING (
        meeting_id IN (
            SELECT meeting_id FROM meeting_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY messages_insert_policy ON meeting_messages
    FOR INSERT
    WITH CHECK (
        meeting_id IN (
            SELECT meeting_id FROM meeting_participants 
            WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE meetings IS 'Stores video meeting information (scheduled and completed)';
COMMENT ON TABLE meeting_participants IS 'Tracks participants invited to each meeting';
COMMENT ON TABLE meeting_messages IS 'Stores in-meeting chat history';

COMMENT ON COLUMN meetings.status IS 'Meeting status: scheduled, in-progress, ended, cancelled';
COMMENT ON COLUMN meetings.duration_minutes IS 'Expected meeting duration in minutes';
COMMENT ON COLUMN meetings.room_url IS 'Direct link to join the meeting room';

COMMENT ON COLUMN meeting_participants.role IS 'Participant role: host or participant';
COMMENT ON COLUMN meeting_participants.user_type IS 'User type: student or instructor';

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment to insert test data:
-- INSERT INTO meetings (id, instructor_id, title, description, scheduled_at, status) VALUES
-- ('test_meeting_1', 'instructor_123', 'Weekly Coaching Session', 'Discuss progress and goals', NOW() + INTERVAL '1 day', 'scheduled');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Run these after migration to verify tables were created:
-- SELECT * FROM meetings LIMIT 1;
-- SELECT * FROM meeting_participants LIMIT 1;
-- SELECT * FROM meeting_messages LIMIT 1;

-- Check indexes:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('meetings', 'meeting_participants', 'meeting_messages');

-- Check RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename IN ('meetings', 'meeting_participants', 'meeting_messages');
