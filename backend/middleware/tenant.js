// Middleware to resolve tenant from subdomain in the Host header
// Attaches req.tenant = { slug, isApex, host }

function extractTenantSlugFromHost(host) {
	if (!host) return null;
	const hostname = String(host).toLowerCase().split(':')[0];
	const labels = hostname.split('.');
	if (labels.length < 2) return null; // localhost or similar

	// Ignore www prefix
	if (labels[0] === 'www') labels.shift();

	const base = labels.slice(-2).join('.');

	// Only derive tenant for our primary domain or local dev helpers
	const isPrimary = base === 'usecoachly.com';
	const isLocalLvh = base === 'lvh.me';
	const isHostingDomain = base === 'onrender.com' || base === 'vercel.app' || base === 'render.com';

	if (isHostingDomain) return null; // don't treat render/vercel subdomain prefixes as tenants

	if (isPrimary || isLocalLvh) {
		if (labels.length <= 2) return null; // apex
		return labels[0] || null;
	}

	return null; // unknown domain -> don't guess
}

export default function tenantMiddleware(req, _res, next) {
	const host = req.headers['x-forwarded-host'] || req.headers.host;
	let slug = extractTenantSlugFromHost(host);

	const isApex = !extractTenantSlugFromHost(host);
	req.tenant = {
		slug: slug || null,
		host: host || null,
		isApex,
	};


	// Also allow overriding via header for testing
	const headerSlug = req.headers['x-tenant'];
	if (typeof headerSlug === 'string' && headerSlug.trim()) {
		req.tenant.slug = headerSlug.trim().toLowerCase();
	}

	next();
}


