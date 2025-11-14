# Bunny CDN Video Library Integration - Setup Guide

## Overview
The video library feature allows instructors to record, upload, and manage videos with a 100GB storage limit per instructor. Videos are hosted on Bunny CDN for fast, reliable streaming worldwide.

## Features Implemented

### Frontend
- ✅ **Video Library Page** (`/coach/library`)
  - Grid and List view modes
  - Search functionality
  - Storage statistics dashboard
  - Bulk video deletion
  - Real-time video processing status
  
- ✅ **Screen Recorder Integration**
  - "Save to Library" button
  - Upload progress tracking
  - Storage limit warnings
  - Automatic cleanup after successful upload

### Backend
- ✅ **Bunny CDN Service** (`backend/services/bunnyService.js`)
  - Video upload to Bunny Stream
  - Storage usage tracking
  - 100GB per-instructor limit enforcement
  - Video metadata management
  - Bulk operations support

- ✅ **Video Library Controller** (`backend/controllers/videoLibraryController.js`)
  - Upload endpoint with file size validation
  - List videos with status updates
  - Storage statistics endpoint
  - Single and bulk delete operations

- ✅ **API Routes** (`backend/router.js`)
  - `POST /api/videos/upload` - Upload video
  - `GET /api/videos` - Get all instructor videos
  - `GET /api/videos/storage-stats` - Get storage statistics
  - `DELETE /api/videos/:videoId` - Delete single video
  - `POST /api/videos/bulk-delete` - Delete multiple videos

### Database
- ✅ **instructor_videos Table**
  - Stores video metadata (title, size, duration, etc.)
  - Links to Bunny CDN video IDs
  - Tracks processing status
  - Includes RLS policies for security

## Setup Instructions

### Step 1: Set Up Bunny CDN Account

1. **Create a Bunny.net Account**
   - Go to https://bunny.net
   - Sign up for an account
   - Verify your email

2. **Create a Stream Library**
   - Go to **Stream** → **Video Library**
   - Click **Add Video Library**
   - Name it (e.g., "Coachly Videos")
   - Choose a region (closest to your users)
   - Note the **Library ID** (e.g., 123456)

3. **Get Your API Key**
   - Go to **Account Settings** → **API**
   - Copy your **API Key**
   - Keep this secure!

4. **Get CDN Hostname**
   - In your Stream Library settings
   - Find the **CDN Hostname** (e.g., `vz-12345678-123.b-cdn.net`)
   - This is used for video playback

5. **(Optional) Create Storage Zone**
   - Go to **Storage** → **Zones**
   - Create a new zone for additional storage
   - Note the zone name and password

### Step 2: Configure Backend Environment Variables

1. **Update `.env` file on Render**
   
   Go to your Render dashboard → Backend service → Environment tab and add:

   ```env
   # Bunny CDN Configuration
   BUNNY_API_KEY=your_bunny_api_key_here
   BUNNY_LIBRARY_ID=your_library_id_here
   BUNNY_STORAGE_ZONE=your_storage_zone_name
   BUNNY_STORAGE_PASSWORD=your_storage_password_here
   BUNNY_CDN_HOSTNAME=vz-xxxxx.b-cdn.net
   ```

   **Example values:**
   ```env
   BUNNY_API_KEY=a1b2c3d4-e5f6-7890-abcd-ef1234567890
   BUNNY_LIBRARY_ID=123456
   BUNNY_STORAGE_ZONE=coachly-videos
   BUNNY_STORAGE_PASSWORD=password123-456a-7890-bcde-f1234567890
   BUNNY_CDN_HOSTNAME=vz-12345678-123.b-cdn.net
   ```

2. **Save and redeploy** the backend service

### Step 3: Run Database Migration

1. **Connect to Supabase**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the migration**
   - Copy the contents of `backend/migrations/create_instructor_videos_table.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify table creation**
   ```sql
   SELECT * FROM instructor_videos LIMIT 1;
   ```

### Step 4: Install Required Dependencies

The following dependencies should already be in package.json, but verify:

**Backend:**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "form-data": "^4.0.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

If missing, run:
```bash
cd backend
npm install axios form-data multer
```

### Step 5: Test the Integration

1. **Test Upload**
   - Log in as an instructor
   - Go to `/coach/record`
   - Record a short video (10-15 seconds)
   - Click **Save to Library**
   - Watch the upload progress

2. **Check Library**
   - Navigate to `/coach/library`
   - Verify the video appears (may show "Processing...")
   - Check storage statistics are displayed correctly

3. **Test Delete**
   - Select a video
   - Click the delete button
   - Confirm deletion
   - Verify storage stats update

## Storage Limit Enforcement

### How It Works
- Each instructor has a **100GB storage limit**
- Before upload, the system checks current usage + new video size
- If limit would be exceeded, upload is rejected with error message
- Storage bar shows usage percentage (changes color at 75% and 90%)

### Storage Calculation
```javascript
Total Storage Used = Sum of all video file_size values
Remaining = 100GB - Total Storage Used
```

### Error Handling
When storage limit is exceeded:
- Backend returns `413 Payload Too Large` status
- Error message: "Storage limit exceeded. You have X.XX GB remaining."
- Frontend displays user-friendly alert

## Video Processing States

### Status Flow
1. **processing** - Video uploaded, Bunny is encoding
2. **ready** - Video encoded and ready to stream
3. **failed** - Encoding failed (rare)

### Status Updates
- Videos are checked on library page load
- Status automatically updates from "processing" to "ready"
- Thumbnail URLs are updated when processing completes

## API Endpoints Reference

### Upload Video
```http
POST /api/videos/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- video: File (required)
- title: String (optional)

Response 200:
{
  "success": true,
  "message": "Video uploaded successfully",
  "video": {
    "id": "uuid",
    "bunnyVideoId": "guid",
    "title": "Video Title",
    "fileSize": 12345678,
    "duration": 120,
    "thumbnailUrl": "https://...",
    "videoUrl": "https://...",
    "status": "processing"
  }
}

Response 413 (Storage Limit):
{
  "error": "Storage limit exceeded. You have 5.23 GB remaining.",
  "code": "STORAGE_LIMIT_EXCEEDED"
}
```

### Get Videos
```http
GET /api/videos
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "videos": [...]
}
```

### Get Storage Stats
```http
GET /api/videos/storage-stats
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "stats": {
    "totalVideos": 5,
    "usedStorageGB": "2.45",
    "maxStorageGB": 100,
    "storagePercentage": "2.5",
    "totalDurationSeconds": 1200,
    "remainingStorageGB": "97.55"
  }
}
```

### Delete Video
```http
DELETE /api/videos/:videoId
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### Bulk Delete
```http
POST /api/videos/bulk-delete
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "videoIds": ["uuid1", "uuid2", "uuid3"]
}

Response 200:
{
  "success": true,
  "message": "Deleted 3 videos",
  "results": {
    "success": ["uuid1", "uuid2", "uuid3"],
    "failed": []
  }
}
```

## Troubleshooting

### Issue: Videos stuck in "Processing"
**Solution:**
- Check Bunny CDN dashboard for encoding status
- Verify `BUNNY_API_KEY` and `BUNNY_LIBRARY_ID` are correct
- Videos typically process in 1-5 minutes depending on size

### Issue: Upload fails with 500 error
**Solution:**
- Check backend logs in Render
- Verify all environment variables are set
- Check Bunny CDN API key permissions

### Issue: Storage stats not updating
**Solution:**
- Refresh the library page
- Check database connection
- Verify `instructor_videos` table exists

### Issue: "Storage limit exceeded" but storage shows low usage
**Solution:**
- Check if there are orphaned records in database
- Run query: `SELECT SUM(file_size) FROM instructor_videos WHERE instructor_id = 'xxx';`
- Compare with Bunny CDN actual usage

## Cost Estimates (Bunny CDN Pricing)

### Bunny Stream Pricing (as of 2024)
- **Storage:** $0.005/GB/month
- **Encoding:** $0.0025/minute
- **Streaming:** $0.01/GB (first 500GB free monthly)

### Example Costs for 100GB Storage
- Storage: 100GB × $0.005 = **$0.50/month**
- Encoding: 100 hours × 60 min × $0.0025 = **$15.00** (one-time)
- Streaming: Depends on views (first 500GB free)

**Total for typical usage:** $5-20/month per instructor

## Security Considerations

### Row Level Security (RLS)
- ✅ Instructors can only access their own videos
- ✅ Students cannot access video library
- ✅ Admin access requires separate policy (if needed)

### File Upload Security
- ✅ File type validation (video/* only)
- ✅ File size limit (2GB per upload)
- ✅ Storage quota enforcement (100GB total)
- ✅ Authentication required for all operations

### API Security
- ✅ JWT token authentication
- ✅ Role-based access control (instructor only)
- ✅ Premium subscription check
- ✅ Rate limiting on upload endpoint

## Future Enhancements

### Potential Features
- [ ] Video player with analytics (watch time, completion rate)
- [ ] Video sharing with students via courses
- [ ] Video trimming/editing
- [ ] Subtitle/caption support
- [ ] Video folders/categories
- [ ] Batch upload
- [ ] Video quality selection
- [ ] Download original video
- [ ] Video expiration dates
- [ ] Storage upgrade options (150GB, 200GB plans)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs in Render dashboard
3. Check Bunny CDN dashboard for video status
4. Verify all environment variables are set correctly

## Resources

- [Bunny.net Documentation](https://docs.bunny.net/)
- [Bunny Stream API](https://docs.bunny.net/reference/video-library)
- [Supabase Documentation](https://supabase.com/docs)
