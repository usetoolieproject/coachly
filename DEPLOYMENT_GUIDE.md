# Deployment Guide - MongoDB to Supabase Migration

## Overview
The application now supports **dual database configuration**:
- **MongoDB** for local development
- **Supabase** for production deployment

## What Was Changed

### 1. Unified Meeting Controller
Created `backend/controllers/meetingControllerUnified.js` that:
- Auto-detects database type from `DB_TYPE` environment variable
- Routes requests to appropriate controller (MongoDB or Supabase)
- Provides seamless switching between databases

### 2. Updated Routes
Modified `backend/routes/meetings.js` to use the unified controller instead of directly importing Supabase controller.

### 3. Enhanced Backend Index
Updated `backend/index.js` to:
- Auto-detect and connect to MongoDB when `DB_TYPE=mongodb`
- Fall back to Supabase if MongoDB connection fails
- Add health check endpoint at `/api/health`

### 4. Environment Configuration
Created `backend/.env.example` with all necessary environment variables documented.

## Quick Start

### For Local Development (MongoDB)
```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 --name trainr-mongo mongo:latest

# 2. Configure backend/.env
echo "DB_TYPE=mongodb" > backend/.env
echo "MONGODB_URI=mongodb://localhost:27017/trainr" >> backend/.env

# 3. Start backend
cd backend
npm run dev
```

### For Production Deployment (Supabase)
```bash
# 1. Set environment variables on your hosting platform
DB_TYPE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 2. Deploy as normal
# The application will automatically use Supabase
```

## Features That Work With Both Databases

✅ **Video Meetings**
- Create meetings
- List meetings
- Join meetings
- Meeting participants
- Meeting chat
- Meeting status updates

✅ **Screen Recording**
- All screen recording features work independently of database

## Verification

### Check Active Database
```bash
curl http://your-domain/api/health
```

Response will show:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "database": "mongodb" or "supabase",
  "mongodb": "connected" or "not connected",
  "supabase": "initialized" or "not initialized"
}
```

### Test Meeting Creation
```bash
# Create a meeting
curl -X POST http://your-domain/api/meetings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "title": "Test Meeting",
    "scheduled_at": "2025-11-10T15:00:00Z",
    "duration_minutes": 60
  }'
```

## Deployment Checklist

### Before Deploying to Production

- [ ] Verify Supabase tables exist (see DATABASE_CONFIG.md)
- [ ] Set `DB_TYPE=supabase` in production environment
- [ ] Configure all Supabase environment variables
- [ ] Test meeting creation on production
- [ ] Test video call functionality
- [ ] Verify WebSocket connections work

### Supabase Tables Required
Run these SQL commands in your Supabase SQL editor:

```sql
-- meetings table
create table if not exists meetings (
  id text primary key,
  instructor_id text not null,
  title text not null,
  description text,
  scheduled_at timestamp with time zone,
  duration_minutes integer default 60,
  status text default 'scheduled',
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  room_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- meeting_participants table
create table if not exists meeting_participants (
  id uuid primary key default uuid_generate_v4(),
  meeting_id text references meetings(id) on delete cascade,
  user_id text not null,
  user_type text,
  role text,
  joined_at timestamp with time zone,
  left_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- meeting_messages table
create table if not exists meeting_messages (
  id uuid primary key default uuid_generate_v4(),
  meeting_id text references meetings(id) on delete cascade,
  user_id text not null,
  user_name text,
  message text not null,
  timestamp timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_meetings_instructor on meetings(instructor_id);
create index if not exists idx_meetings_status on meetings(status);
create index if not exists idx_meetings_scheduled on meetings(scheduled_at);
create index if not exists idx_participants_meeting on meeting_participants(meeting_id);
create index if not exists idx_messages_meeting on meeting_messages(meeting_id);
```

## Troubleshooting

### Meeting Creation Fails
1. Check `/api/health` to verify database connection
2. Ensure JWT token is valid and contains userId
3. Verify environment variables are set correctly

### Database Connection Issues
1. **MongoDB**: Ensure MongoDB is running and accessible
2. **Supabase**: Verify URL and API keys are correct
3. Check application logs for connection errors

### Switch Database Mid-Development
Simply change `DB_TYPE` and restart:
```bash
# Switch to MongoDB
export DB_TYPE=mongodb
npm run dev

# Switch to Supabase
export DB_TYPE=supabase
npm run dev
```

## Notes

- **Data is NOT automatically synced** between MongoDB and Supabase
- Each database maintains its own data
- Choose one database per environment (local vs production)
- The VideoMeeting Socket.IO service works with both databases

## Support

For issues or questions:
1. Check DATABASE_CONFIG.md for detailed configuration
2. Review backend logs for error messages
3. Verify environment variables match your setup
