/**
 * Unified Video Meeting Controller
 * 
 * Automatically detects database type (MongoDB or Supabase) and routes to appropriate implementation
 * 
 * Environment variable:
 * - DB_TYPE: 'mongodb' or 'supabase' (defaults to 'supabase' if not set)
 */

import * as mongoController from './meetingControllerMongo.js';
import * as supabaseController from './meetingController.js';

// Detect database type from environment
const dbType = process.env.DB_TYPE || 'supabase';

console.log(`[Meeting Controller] Using database: ${dbType}`);

// Select the appropriate controller based on database type
const controller = dbType === 'mongodb' ? mongoController : supabaseController;

// Export all controller functions with unified interface
export const createMeeting = (req, res) => controller.createMeeting(req, res);
export const listMeetings = (req, res) => controller.listMeetings(req, res);
export const getMeeting = (req, res) => controller.getMeeting(req, res);
export const updateMeeting = (req, res) => controller.updateMeeting(req, res);
export const cancelMeeting = (req, res) => controller.cancelMeeting(req, res);
export const deleteMeeting = (req, res) => controller.deleteMeeting(req, res);
export const addParticipant = (req, res) => controller.addParticipant(req, res);
export const getMeetingStats = (req, res) => controller.getMeetingStats(req, res);

// Export database type for debugging
export const getDatabaseType = () => dbType;
