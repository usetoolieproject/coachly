/**
 * Video Meeting Routes
 * 
 * API endpoints for managing video meetings
 * Uses unified controller that auto-detects MongoDB or Supabase
 */

import express from 'express';
import {
  createMeeting,
  listMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  deleteMeeting,
  addParticipant,
  getMeetingStats
} from '../controllers/meetingControllerUnified.js';

const router = express.Router();

// Create a new meeting
router.post('/', createMeeting);

// List meetings for current user
router.get('/', listMeetings);

// Get meeting statistics
router.get('/stats', getMeetingStats);

// Get single meeting details
router.get('/:id', getMeeting);

// Update meeting
router.patch('/:id', updateMeeting);

// Cancel meeting (sets status to cancelled)
router.patch('/:id/cancel', cancelMeeting);

// Delete meeting permanently
router.delete('/:id', deleteMeeting);

// Add participant to meeting
router.post('/:id/participants', addParticipant);

export default router;
