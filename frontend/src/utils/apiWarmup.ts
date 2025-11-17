/**
 * API Warmup Utility
 * Prevents Render cold starts by keeping the backend warm
 */

const WARMUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const API_BASE = import.meta.env.VITE_API_URL || 'https://coachly-backend.onrender.com/api';

let warmupInterval: NodeJS.Timeout | null = null;

/**
 * Ping the backend health endpoint to keep it warm
 */
async function pingBackend() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Backend warmup ping successful');
  } catch (error) {
    console.warn('⚠️ Backend warmup ping failed:', error);
  }
}

/**
 * Start periodic backend warmup pings
 */
export function startApiWarmup() {
  if (warmupInterval) {
    return; // Already running
  }
  
  // Initial ping
  pingBackend();
  
  // Set up periodic pings
  warmupInterval = setInterval(pingBackend, WARMUP_INTERVAL);
  
  console.log('🔥 API warmup started - pinging every 5 minutes');
}

/**
 * Stop periodic backend warmup pings
 */
export function stopApiWarmup() {
  if (warmupInterval) {
    clearInterval(warmupInterval);
    warmupInterval = null;
    console.log('❄️ API warmup stopped');
  }
}

/**
 * Perform immediate warmup on page load
 */
export async function warmupBackend() {
  console.log('🔥 Warming up backend...');
  await pingBackend();
}
