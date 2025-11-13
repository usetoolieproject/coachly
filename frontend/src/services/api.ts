// Shared API utilities

export function getApiBase(): string {
  // Always use direct backend URL for API calls to avoid CORS issues with proxy
  // Check for environment variable first
  if ((import.meta as any).env?.VITE_API_URL) {
    const raw = (import.meta as any).env.VITE_API_URL;
    const trimmed = String(raw).replace(/\/$/, '');
    const result = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    console.log('API: Using VITE_API_URL:', result);
    return result;
  }
  
  // For local development, use localhost backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.log('API: Using localhost backend');
    return 'http://localhost:8000/api';
  }
  
  // Default fallback - use deployed backend directly
  const fallback = 'https://coachly-backend.onrender.com/api';
  console.log('API: Using direct backend URL:', fallback);
  return fallback;
}

function deriveTenantFromHost(host?: string): string | null {
  if (!host) return null;
  const h = host.toLowerCase().split(':')[0];
  const parts = h.split('.');
  if (parts[0] === 'www') parts.shift();
  if (parts.length <= 2) return null; // apex
  return parts[0] || null;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Send tenant header to backend; backend also resolves from subdomain
  try {
    const slug = deriveTenantFromHost(typeof window !== 'undefined' ? window.location.host : undefined);
    if (slug) headers['X-Tenant'] = slug;
  } catch {}
  return headers;
}

export function getAuthHeadersForFormData(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const slug = deriveTenantFromHost(typeof window !== 'undefined' ? window.location.host : undefined);
    if (slug) headers['X-Tenant'] = slug;
  } catch {}
  return headers;
}

export async function apiFetch<T = any>(path: string, init?: RequestInit & { omitCredentials?: boolean }): Promise<T> {
  const { omitCredentials, ...rest } = init || {};
  const apiBase = getApiBase();
  const url = path.startsWith('http') ? path : `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const res = await fetch(url, { credentials: omitCredentials ? 'omit' : 'include', ...rest });
  
  if (!res.ok) {
    let body: any = null;
    try { body = await res.text(); } catch {}
    const error = new Error((body && typeof body === 'string' ? body : '') || `Request failed: ${res.status}`);
    // @ts-ignore - Add status to error for handling
    error.status = res.status;
    throw error;
  }
  try {
    return await res.json();
  } catch {
    // non-JSON
    // @ts-ignore
    return undefined;
  }
}
