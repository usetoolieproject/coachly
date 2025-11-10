# Database Configuration Guide

This application supports both **MongoDB** (for local development) and **Supabase** (for production deployment).

## How It Works

The application automatically detects which database to use based on the `DB_TYPE` environment variable:

- **MongoDB**: Set `DB_TYPE=mongodb` (for local development)
- **Supabase**: Set `DB_TYPE=supabase` or leave unset (default for production)

### Automatic Fallback

If MongoDB connection fails, the application automatically falls back to Supabase.

## Local Development Setup (MongoDB)

1. **Install MongoDB** locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name trainr-mongo mongo:latest
   ```

2. **Configure environment variables** in `backend/.env`:
   ```env
   DB_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017/trainr
   ```

3. **Start the server**:
   ```bash
   cd backend
   npm run dev
   ```

## Production Deployment (Supabase)

1. **Configure environment variables** on your hosting platform (Render, Vercel, etc.):
   ```env
   DB_TYPE=supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Deploy** your application - it will automatically use Supabase

## Required Supabase Tables

Make sure your Supabase database has these tables:

### meetings
```sql
create table meetings (
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
```

### meeting_participants
```sql
create table meeting_participants (
  id uuid primary key default uuid_generate_v4(),
  meeting_id text references meetings(id),
  user_id text not null,
  user_type text,
  role text,
  joined_at timestamp with time zone,
  left_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

### meeting_messages
```sql
create table meeting_messages (
  id uuid primary key default uuid_generate_v4(),
  meeting_id text references meetings(id),
  user_id text not null,
  user_name text,
  message text not null,
  timestamp timestamp with time zone default now()
);
```

## Code Structure

### Unified Controller
`backend/controllers/meetingControllerUnified.js` - Auto-detects database type and routes to appropriate implementation

### Database-Specific Controllers
- `backend/controllers/meetingControllerMongo.js` - MongoDB implementation
- `backend/controllers/meetingController.js` - Supabase implementation

### Routes
`backend/routes/meetings.js` - Uses unified controller (works with both databases)

## Testing Database Connection

### MongoDB
```bash
curl http://localhost:8000/api/health
# Should show: "database": "mongodb"
```

### Supabase
```bash
curl http://localhost:8000/api/test-db
# Should return: "Database connection successful!"
```

## Environment Variables Priority

The application checks environment variables in this order:
1. `DB_TYPE` - Explicitly set database type
2. `MONGODB_URI` - If set and DB_TYPE=mongodb, connects to MongoDB
3. Falls back to Supabase if MongoDB connection fails
4. Defaults to Supabase if no DB_TYPE is set

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `docker ps` or `mongosh`
- Check connection string format: `mongodb://host:port/database`
- Ensure firewall allows port 27017

### Supabase Connection Issues
- Verify Supabase URL and keys in environment variables
- Check Supabase project is active
- Ensure tables exist in your Supabase database

### Switching Databases
Simply change the `DB_TYPE` environment variable and restart the server:
```bash
# Switch to MongoDB
export DB_TYPE=mongodb

# Switch to Supabase
export DB_TYPE=supabase

# Restart server
npm run dev
```
