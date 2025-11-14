-- Create instructor_videos table for storing video library metadata

CREATE TABLE IF NOT EXISTS instructor_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  bunny_video_id VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  file_name VARCHAR(500),
  file_size BIGINT NOT NULL DEFAULT 0, -- Size in bytes
  duration INTEGER DEFAULT 0, -- Duration in seconds
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'processing', -- processing, ready, failed
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_instructor_videos_instructor_id ON instructor_videos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_videos_bunny_id ON instructor_videos(bunny_video_id);
CREATE INDEX IF NOT EXISTS idx_instructor_videos_upload_date ON instructor_videos(upload_date DESC);

-- Add RLS policies
ALTER TABLE instructor_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Instructors can only see their own videos
CREATE POLICY instructor_videos_instructor_policy ON instructor_videos
  FOR ALL
  USING (instructor_id IN (
    SELECT id FROM instructors WHERE user_id = auth.uid()
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_instructor_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_instructor_videos_updated_at
  BEFORE UPDATE ON instructor_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_instructor_videos_updated_at();

COMMENT ON TABLE instructor_videos IS 'Stores video library metadata for instructors with Bunny CDN integration';
COMMENT ON COLUMN instructor_videos.bunny_video_id IS 'Bunny CDN video GUID';
COMMENT ON COLUMN instructor_videos.file_size IS 'Video file size in bytes';
COMMENT ON COLUMN instructor_videos.duration IS 'Video duration in seconds';
COMMENT ON COLUMN instructor_videos.status IS 'Video processing status: processing, ready, failed';
