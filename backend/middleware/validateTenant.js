import { getSupabaseClient } from '../repositories/supabaseClient.js'

// Simple in-memory cache to avoid hammering the DB
const cache = new Map()
const CACHE_TTL_MS = 60 * 1000

async function isKnownTenant(slug) {
  if (!slug) return false
  const now = Date.now()
  const cached = cache.get(slug)
  if (cached && (now - cached.ts) < CACHE_TTL_MS) return cached.exists

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('instructors')
    .select('id')
    .eq('subdomain', slug)
    .limit(1)
    .maybeSingle()

  const exists = !!(data && data.id)
  // Cache both hit and miss to throttle negative lookups too
  cache.set(slug, { exists, ts: now })
  return exists
}

export default async function validateTenant(req, res, next) {
  try {
    // Allow preflight
    if (req.method === 'OPTIONS') return next()

    // Only validate for true subdomains; allow apex and local dev
    if (req.tenant?.isApex || !req.tenant?.slug) {
      return next()
    }

    // Allow critical auth/public routes regardless of tenant (login/signup/me/check)
    const p = req.path || ''
    if (
      p.startsWith('/api/auth/login') ||
      p.startsWith('/api/auth/signup') ||
      p.startsWith('/api/auth/check-subdomain') ||
      p.startsWith('/api/auth/check-subdirectory') || // Legacy route
      p.startsWith('/api/billing/webhook') ||
      p.startsWith('/api/subscription/webhook') ||
      p.startsWith('/api/subscription/') || // Allow all subscription routes
      // Always allow when serving from hosting domains (render/vercel) without tenant
      /onrender\.com$/.test(String(req.headers['x-forwarded-host'] || req.headers.host || '')) ||
      /vercel\.app$/.test(String(req.headers['x-forwarded-host'] || req.headers.host || ''))
    ) {
      return next()
    }

    const slug = req.tenant?.slug
    
    const exists = await isKnownTenant(slug)
    if (!exists) {
      // For API callers, return 404 JSON; for browsers, redirect to apex
      const accept = String(req.headers['accept'] || '')
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
      const hostname = host.split(':')[0].toLowerCase()
      const labels = hostname.split('.')
      if (labels[0] === 'www') labels.shift()
      const apex = labels.slice(-2).join('.') || 'usecoachly.com'

      if (accept.includes('application/json') || req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Unknown tenant', tenant: slug })
      }
      return res.redirect(302, `https://${apex}`)
    }
    return next()
  } catch (e) {
    // Fail-open to avoid taking down the app if Supabase blips
    return next()
  }
}


