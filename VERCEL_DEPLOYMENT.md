# Vercel Deployment Guide

## Current Configuration

### Frontend (Vercel)
- **Domain**: usecoachly.com
- **Project**: Coachly Platform
- **Framework**: React + Vite

### Backend (Render)
- **URL**: https://coachly-backend.onrender.com
- **API Endpoints**: All `/api/*` routes proxy to backend

## Deployment Steps

### 1. Vercel Project Setup

1. Go to https://vercel.com/new
2. Import the GitHub repository: `usetoolieproject/coachly`
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Environment Variables

Add these environment variables in Vercel dashboard:

```env
VITE_SUPABASE_URL=https://zjmjwqqzcvbqxooybvkd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWp3cXF6Y3ZicXhvb3lidmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjgyMTQsImV4cCI6MjA3Mjc0NDIxNH0.fFs2vZr-yVMnfxqgMn0Qv2rVps9Y8MpkzKnGZlBm5m4
VITE_API_URL=https://coachly-backend.onrender.com
```

### 3. Custom Domain Setup

1. In Vercel dashboard, go to **Project Settings** → **Domains**
2. Add your domain: `usecoachly.com`
3. Add www subdomain: `www.usecoachly.com`
4. Vercel will provide DNS records to add to your domain registrar

#### DNS Records to Add:

**For apex domain (usecoachly.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Alternative (if A record doesn't work):**
```
Type: ALIAS or ANAME
Name: @
Value: cname.vercel-dns.com
```

### 4. Backend Configuration on Render

Your backend is already deployed at: https://trainr-new-k.onrender.com

**Environment Variables on Render:**
```env
DB_TYPE=supabase
SUPABASE_URL=https://zjmjwqqzcvbqxooybvkd.supabase.co
SUPABASE_SERVICE_KEY=<your-service-key>
JWT_SECRET=<your-jwt-secret>
PORT=8000
NODE_ENV=production
```

**CORS Configuration:**
Make sure your backend allows requests from:
- https://usecoachly.com
- https://www.usecoachly.com
- Your Vercel preview URLs

### 5. Vercel Configuration Files

The repository includes:

**`/vercel.json`** (root level - for monorepo):
- Handles build from `frontend` directory
- Proxies `/api/*` requests to Render backend
- Sets up proper caching headers
- Configures SPA routing

**`/frontend/vercel.json`** (frontend specific):
- Additional frontend-specific configurations
- Can be used if deploying frontend directly

### 6. Deploy

#### Option A: Automatic Deployment (Recommended)
Push to GitHub and Vercel will auto-deploy:
```bash
git add .
git commit -m "Configure Vercel deployment for usecoachly.com"
git push origin main
```

#### Option B: Manual Deployment
```bash
cd frontend
npm install
npm run build
vercel --prod
```

## Post-Deployment Checklist

- [ ] Verify frontend loads at https://usecoachly.com
- [ ] Test API calls to backend (check Network tab)
- [ ] Verify login/authentication works
- [ ] Test video meeting creation
- [ ] Check screen recorder functionality
- [ ] Verify community features
- [ ] Test course enrollment
- [ ] Check favicon and PWA icons load correctly

## Troubleshooting

### 404 on Favicon
- Fixed by adding explicit headers in `vercel.json`
- Favicon files are in `frontend/public/`

### API Calls Failing
- Check CORS settings on Render backend
- Verify API proxy in `vercel.json`
- Check environment variables in Vercel

### Blank Page
- Check browser console for errors
- Verify build completed successfully
- Check environment variables are set

### Routes Not Working (404 on refresh)
- Ensure rewrites are configured in `vercel.json`
- All non-API routes should redirect to `/index.html`

## Performance Optimization

The configuration includes:
- Static asset caching (CSS/JS: 1 year)
- Favicon caching (24 hours)
- Service worker (no cache)
- Security headers (XSS, MIME sniffing protection)
- PWA manifest caching (1 week)

## Domain Propagation

After adding DNS records:
- DNS propagation takes 5 minutes to 48 hours
- Use https://dnschecker.org to verify propagation
- Test with `www` subdomain first (usually faster)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Domain Setup**: https://vercel.com/docs/concepts/projects/domains
- **Render Docs**: https://render.com/docs
