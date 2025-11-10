import type { Call } from '../types';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && /usecoachly\.com$/.test(window.location.hostname.toLowerCase())) return '/api';
  return (import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/api` : 'http://localhost:8000/api';
}

export async function fetchStudentCalls(): Promise<Call[]> {
  const res = await fetch(`${getApiBaseUrl()}/student/live-calls`, { credentials: 'include' });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to fetch live calls');
  }
  return data as Call[];
}


