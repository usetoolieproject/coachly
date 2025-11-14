-- Add password reset columns to users table
-- Run this in your Supabase SQL editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Add comment
COMMENT ON COLUMN users.reset_token IS 'SHA-256 hash of password reset token';
COMMENT ON COLUMN users.reset_token_expiry IS 'Expiry timestamp for reset token (1 hour from creation)';
