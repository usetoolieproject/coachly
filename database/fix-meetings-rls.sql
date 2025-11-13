-- Fix RLS for meetings tables
-- Run this in Supabase SQL Editor to disable RLS

-- Drop existing policies
DROP POLICY IF EXISTS "Instructors can view their own meetings" ON meetings;
DROP POLICY IF EXISTS "Instructors can create meetings" ON meetings;
DROP POLICY IF EXISTS "Instructors can update their own meetings" ON meetings;
DROP POLICY IF EXISTS "Instructors can delete their own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can view their meeting participations" ON meeting_participants;
DROP POLICY IF EXISTS "Instructors can manage participants in their meetings" ON meeting_participants;

-- Disable RLS (backend uses service_role key which bypasses RLS anyway)
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
