# Database Configuration - Quick Reference

## ✅ Dual Database Support Added

The application now seamlessly supports both MongoDB (local) and Supabase (production) with automatic switching.

## 🚀 For Local Development

**Option 1: Use MongoDB**
```bash
# .env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/trainr
```

**Option 2: Use Supabase**
```bash
# .env
DB_TYPE=supabase
# (or leave DB_TYPE unset - Supabase is default)
```

## 🌐 For Production Deployment

Simply deploy with these environment variables:
```bash
DB_TYPE=supabase  # or leave unset
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

## 🔍 Check Which Database is Active

```bash
curl http://localhost:8000/api/health
```

Returns:
```json
{
  "status": "ok",
  "database": "mongodb" or "supabase",
  "mongodb": "connected",
  "supabase": "initialized"
}
```

## 📦 What Was Changed

1. **New Files Created:**
   - `backend/controllers/meetingControllerUnified.js` - Auto-routing controller
   - `backend/.env.example` - Environment variable template
   - `DATABASE_CONFIG.md` - Detailed configuration guide
   - `DEPLOYMENT_GUIDE.md` - Step-by-step deployment instructions

2. **Modified Files:**
   - `backend/index.js` - Added MongoDB support and health check
   - `backend/routes/meetings.js` - Uses unified controller

3. **Unchanged:**
   - `backend/controllers/meetingControllerMongo.js` - MongoDB implementation (existing)
   - `backend/controllers/meetingController.js` - Supabase implementation (existing)
   - All other features work exactly the same

## ✨ Features

- ✅ **Automatic database detection** based on DB_TYPE
- ✅ **Automatic fallback** to Supabase if MongoDB fails
- ✅ **Zero code changes** needed in controllers
- ✅ **Health check endpoint** to verify database connection
- ✅ **Both databases fully functional** for meetings feature

## 📝 Notes

- Default is **Supabase** (production-ready)
- Set `DB_TYPE=mongodb` only for local development
- Data is NOT synced between databases
- WebRTC/Socket.IO works with both databases

## 📚 Read More

- See `DATABASE_CONFIG.md` for detailed setup
- See `DEPLOYMENT_GUIDE.md` for production deployment steps
