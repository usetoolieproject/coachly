# Authentication Troubleshooting Guide

## Quick Tests

### 1. Test Backend is Running
Open your browser console and run:
```javascript
fetch('https://coachly-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend health:', d))
  .catch(e => console.error('❌ Backend error:', e));
```

### 2. Test Login Endpoint
```javascript
fetch('https://coachly-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    role: 'student'
  })
})
  .then(r => r.json())
  .then(d => console.log('Login response:', d))
  .catch(e => console.error('Login error:', e));
```

### 3. Test Signup Endpoint
```javascript
fetch('https://coachly-backend.onrender.com/api/auth/signup/student', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'Test123456!'
  })
})
  .then(r => r.json())
  .then(d => console.log('Signup response:', d))
  .catch(e => console.error('Signup error:', e));
```

## Common Issues

### Issue 1: CORS Errors
**Symptom:** Console shows "CORS policy" or "Access-Control-Allow-Origin" errors

**Solution:** Make sure your Render backend has this environment variable:
```env
FRONTEND_URLS=https://usecoachly.com,https://www.usecoachly.com,https://trainr-new-k.vercel.app
```

### Issue 2: JWT_SECRET Not Set
**Symptom:** Login fails with 500 error or "JWT invalid" message

**Solution:** On Render, add this environment variable:
```env
JWT_SECRET=<your-strong-secret-key>
```

Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Issue 3: Supabase Connection Issues
**Symptom:** Signup fails with database errors

**Solution:** Verify these Render environment variables:
```env
DB_TYPE=supabase
SUPABASE_URL=https://zjmjwqqzcvbqxooybvkd.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Issue 4: Missing Supabase Tables
**Symptom:** "relation does not exist" or "table not found" errors

**Solution:** Run the SQL migrations in your Supabase dashboard.

See `backend/migrations/` folder for SQL files, or check `DEPLOYMENT_GUIDE.md` for the complete schema.

### Issue 5: Network Request Failed
**Symptom:** "Failed to fetch" or network timeout

**Solution:** 
1. Check if backend is sleeping (Render free tier sleeps after inactivity)
2. Wait 30-60 seconds for it to wake up
3. Try again

### Issue 6: Frontend Not Using Correct API URL
**Symptom:** Requests go to localhost or wrong URL

**Check Vercel environment variables:**
```env
VITE_API_URL=https://coachly-backend.onrender.com
```

## Debug Steps

### Step 1: Check Browser Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login/signup
4. Look for failed requests (red)
5. Click on the request to see details
6. Check Response tab for error message

### Step 2: Check Browser Console
Look for these log messages:
- `🔐 Attempting login...`
- `🔑 Login response:`
- `API: Using ... URL`
- `✅ Backend health:`

### Step 3: Check Cookies
1. Open DevTools → Application tab
2. Expand Cookies in left sidebar
3. Check if `session` cookie exists after login
4. Cookie should have:
   - Domain: `.usecoachly.com` or `localhost`
   - Path: `/`
   - HttpOnly: ✓
   - Secure: ✓ (on production)

### Step 4: Test API Directly with cURL
```bash
# Test health
curl https://coachly-backend.onrender.com/api/health

# Test signup
curl -X POST https://coachly-backend.onrender.com/api/auth/signup/student \
  -H "Content-Type: application/json" \
  -H "Origin: https://usecoachly.com" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test123!"}'

# Test login
curl -X POST https://coachly-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://usecoachly.com" \
  -d '{"email":"test@example.com","password":"Test123!","role":"student"}'
```

## Quick Fixes

### If Render backend is sleeping:
- Visit: https://coachly-backend.onrender.com/api/health
- Wait 30-60 seconds for it to wake up
- Try login again

### If getting "User already exists":
- The account was created successfully
- Try logging in instead of signing up

### If getting "Invalid credentials":
- Double-check email and password
- Passwords are case-sensitive
- Make sure you're using the correct role (student/instructor/admin)

## Need More Help?

1. **Check Render logs:**
   - Go to Render dashboard
   - Select your service
   - Click "Logs" tab
   - Look for errors when you try to login

2. **Check Vercel logs:**
   - Go to Vercel dashboard
   - Select your deployment
   - Click on the deployment
   - Check "Functions" or "Build Logs"

3. **Check Supabase logs:**
   - Go to Supabase dashboard
   - Click "Logs" in left sidebar
   - Filter by API logs
   - Look for failed queries

## What to Report

If still having issues, please provide:
1. Error message from browser console
2. Failed request details from Network tab
3. Backend logs from Render (if accessible)
4. What you're trying to do (login/signup)
5. Which role (student/instructor/admin)
