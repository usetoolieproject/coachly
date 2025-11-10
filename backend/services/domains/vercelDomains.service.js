import fetch from 'node-fetch'

// Minimal helper for future automation via Vercel Domains API
// Not invoked automatically; wire this to your tenant creation flow later.

const VERCEL_API_BASE = 'https://api.vercel.com';

export async function addProjectDomain({ projectId, teamId, domain, token }) {
	if (!projectId || !domain || !token) {
		throw new Error('Missing required params');
	}
	const qs = new URLSearchParams();
	if (teamId) qs.set('teamId', teamId);
	const url = `${VERCEL_API_BASE}/v9/projects/${projectId}/domains?${qs.toString()}`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name: domain })
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Vercel add domain failed: ${res.status} ${body}`);
	}
	return res.json();
}


