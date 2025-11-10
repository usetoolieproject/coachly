# Database Migration Guide - Video Meetings

## How to Run the Migration

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/sguavpabcxeppkgwdssl

2. Navigate to **SQL Editor** in the left sidebar

3. Click **"New query"**

4. Copy the contents of `backend/migrations/video_meetings.sql`

5. Paste into the SQL Editor

6. Click **"Run"** or press `Ctrl+Enter`

7. Verify the tables were created:
   ```sql
   SELECT * FROM meetings LIMIT 1;
   SELECT * FROM meeting_participants LIMIT 1;
   SELECT * FROM meeting_messages LIMIT 1;
   ```

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
cd backend
supabase db push migrations/video_meetings.sql
```

### Option 3: psql (PostgreSQL CLI)

```bash
# Connect to your database
psql "postgresql://postgres:[password]@db.sguavpabcxeppkgwdssl.supabase.co:5432/postgres"

# Run the migration
\i backend/migrations/video_meetings.sql
```

## Verification

After running the migration, verify the tables exist:

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('meetings', 'meeting_participants', 'meeting_messages');

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('meetings', 'meeting_participants', 'meeting_messages');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('meetings', 'meeting_participants', 'meeting_messages');
```

## Expected Result

You should see:
- ✅ 3 tables created: `meetings`, `meeting_participants`, `meeting_messages`
- ✅ 5 indexes created
- ✅ 6 RLS policies created
- ✅ RLS enabled on all 3 tables

## What the Migration Creates

### Tables
1. **meetings** - Stores video meeting information
2. **meeting_participants** - Tracks who's invited/joined
3. **meeting_messages** - Stores chat history

### Security
- Row Level Security (RLS) enabled
- Instructors can manage their own meetings
- Participants can only view meetings they're invited to
- Participants can send messages in their meetings

## Troubleshooting

### Error: "relation already exists"
The tables already exist. You can either:
- Skip the migration (tables are already there)
- Drop the tables first: `DROP TABLE IF EXISTS meetings CASCADE;`

### Error: "permission denied"
Make sure you're connected with a user that has CREATE TABLE permissions (usually `postgres` role).

### Error: "auth.uid() does not exist"
Supabase uses `auth.uid()` for RLS. Make sure you're running this on a Supabase instance, not a vanilla PostgreSQL database.

## Next Steps

After migration is complete:
1. ✅ Backend is already running with Socket.IO
2. ✅ Frontend is already integrated
3. ✅ Test by creating a meeting from `/coach/meetings`
4. ✅ Join the meeting from `/meeting/:roomId`

The system is ready to use!
