# Backend Configuration for Render

## Current Backend URL
`https://coachly-backend.onrender.com`

## Required Environment Variables on Render

Go to your Render dashboard → Select your service → Environment tab → Add these variables:

### Database Configuration
```env
DB_TYPE=supabase
```

### Supabase Configuration
```env
SUPABASE_URL=https://zjmjwqqzcvbqxooybvkd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWp3cXF6Y3ZicXhvb3lidmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjgyMTQsImV4cCI6MjA3Mjc0NDIxNH0.fFs2vZr-yVMnfxqgMn0Qv2rVps9Y8MpkzKnGZlBm5m4
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>
```

### Frontend URLs (IMPORTANT for CORS)
```env
FRONTEND_URLS=https://usecoachly.com,https://www.usecoachly.com,https://trainr-new-k.vercel.app
```

### Server Configuration
```env
PORT=8000
NODE_ENV=production
```

### JWT Secret (IMPORTANT)
```env
JWT_SECRET=<generate-a-strong-secret>
```

Generate JWT secret with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Optional: Stripe Configuration (if using payments)
```env
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
```

## Deployment Steps on Render

1. **Update Environment Variables**
   - Add the `FRONTEND_URLS` variable with your custom domain
   - Verify all Supabase credentials are set
   - Set a strong JWT_SECRET

2. **Redeploy**
   - After updating env vars, manually redeploy or push to trigger auto-deploy
   - Or go to: Manual Deploy → Deploy latest commit

3. **Verify**
   - Check logs for any errors
   - Test the health endpoint: `https://trainr-new-k.onrender.com/api/health`
   - Should show database connection status

## Health Check

Test if backend is working:
```bash
curl https://coachly-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "supabase",
  "mongodb": "not connected",
  "supabase": "initialized"
}
```

## CORS Configuration

The backend is already configured to accept requests from:
- ✅ `https://usecoachly.com`
- ✅ `https://www.usecoachly.com`
- ✅ `https://*.vercel.app` (all Vercel preview deployments)
- ✅ Local development URLs

**The CORS pattern automatically allows:**
- Any subdomain of `usecoachly.com`
- Any subdomain of `vercel.app`
- HTTP/HTTPS localhost for development

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Verify `FRONTEND_URLS` is set correctly on Render
2. Check that the domain matches exactly (including https://)
3. Redeploy after adding environment variables

### Database Connection Issues
1. Verify Supabase URL and keys are correct
2. Check Render logs for error messages
3. Test health endpoint

### JWT Errors
1. Make sure JWT_SECRET is set
2. Should be the same value that was used when creating tokens
3. If changing JWT_SECRET, all users need to login again

## Auto-Deploy from GitHub

If you want Render to auto-deploy when you push to GitHub:
1. Go to Render dashboard → Service → Settings
2. Under "Build & Deploy" section
3. Connect your GitHub repository: `usetoolieproject/coachly`
4. Set branch: `main`
5. Set root directory: `backend`
6. Build command: `npm install`
7. Start command: `node index.js`

## Support
- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
