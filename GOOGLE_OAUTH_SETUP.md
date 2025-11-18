# Google OAuth Setup Instructions

## Overview
Google OAuth has been implemented for instructor login. This allows instructors to sign in with their Google accounts instead of using email/password.

## Changes Made

### Frontend Changes
- **SignInPage.tsx**: Removed Apple login button, kept only Google login
- Google button now redirects to: `${VITE_API_URL}/auth/google`
- Button is full-width for better UX

### Backend Changes
- **authController.js**: Added two new functions:
  - `googleAuth`: Initiates OAuth flow by redirecting to Google
  - `googleCallback`: Handles the OAuth callback and creates/logs in user
  
- **router.js**: Added two new routes:
  - `GET /auth/google`: Starts OAuth flow
  - `GET /auth/google/callback`: Receives OAuth response

## Required Environment Variables

Add these to your backend `.env` file or Render environment variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://coachly-backend.onrender.com/auth/google/callback

# Existing variables (make sure these are set)
FRONTEND_URL=https://usecoachly.com
API_URL=https://coachly-backend.onrender.com
```

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API" or "Google Identity Services"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Coachly
   - User support email: Your email
   - Authorized domains: usecoachly.com, onrender.com
   - Developer contact: Your email
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: Coachly Backend
   - Authorized JavaScript origins:
     - `https://usecoachly.com`
     - `https://coachly-backend.onrender.com`
   - Authorized redirect URIs:
     - `https://coachly-backend.onrender.com/auth/google/callback`
7. Copy the Client ID and Client Secret

## Testing Locally

For local development, add these to your local `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:5001
```

And add `http://localhost:5001/auth/google/callback` to the authorized redirect URIs in Google Cloud Console.

## How It Works

1. User clicks "Continue with Google" on the sign-in page
2. Frontend redirects to: `https://coachly-backend.onrender.com/auth/google`
3. Backend redirects user to Google's OAuth consent screen
4. User authorizes the application
5. Google redirects back to: `https://coachly-backend.onrender.com/auth/google/callback?code=...`
6. Backend exchanges the code for user information
7. Backend creates new instructor account if email doesn't exist (or logs in existing user)
8. Backend sets session cookie and redirects to: `https://usecoachly.com/coach/dashboard`

## Features

- **Auto-create instructor accounts**: If user doesn't exist, creates new instructor profile
- **Instructor-only**: Only allows instructors to login via Google OAuth (students use regular login)
- **Email verification**: Google OAuth users are automatically marked as email verified
- **Secure cookies**: Sets HttpOnly, Secure, and SameSite cookies for cross-subdomain auth
- **Error handling**: Redirects to sign-in page with error parameters if OAuth fails

## Error Messages

The callback can redirect with these error parameters:
- `?error=oauth_failed`: General OAuth failure
- `?error=signup_failed`: Failed to create new user account
- `?error=instructor_only`: User tried to login but is not an instructor

You can display these errors on the sign-in page if needed.

## Security Notes

- Google Client Secret should NEVER be exposed in frontend code
- All OAuth flows happen server-side for security
- Session cookies are HttpOnly to prevent XSS attacks
- Cookies use SameSite=None with Secure flag for production cross-subdomain support

## Next Steps

1. Set up Google Cloud Project
2. Get OAuth credentials
3. Add environment variables to Render
4. Test the login flow
5. (Optional) Customize the OAuth consent screen with logo and privacy policy

## Troubleshooting

**"Google OAuth not configured" error:**
- Make sure `GOOGLE_CLIENT_ID` is set in environment variables

**"oauth_failed" redirect:**
- Check that redirect URI matches exactly in Google Cloud Console
- Verify `GOOGLE_CLIENT_SECRET` is correct
- Check backend logs for detailed error messages

**Cookie not being set:**
- Ensure `FRONTEND_URL` and `API_URL` are correct
- Verify domains match (usecoachly.com)
- Check that Secure flag is only used in production

**Redirect loop:**
- Clear browser cookies for usecoachly.com
- Check that user has `role: 'instructor'` in database
