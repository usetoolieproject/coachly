import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type TenantContextValue = {
	slug: string | null;
	host: string;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);


function deriveTenantFromHost(host?: string): string | null {
    if (!host) return null;
	const h = host.toLowerCase().split(':')[0];
	const parts = h.split('.');
	if (parts[0] === 'www') parts.shift();
    if (parts.length <= 2) return null; // Apex domain - no tenant
    return parts[0] || null;
}

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [host, setHost] = useState(typeof window !== 'undefined' ? window.location.host : '');
	
	// Update host when window.location changes (e.g., after redirect)
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const currentHost = window.location.host;
			if (currentHost !== host) {
				setHost(currentHost);
			}
		}
	}, []);
	
	const value = useMemo<TenantContextValue>(() => ({
		host,
		slug: deriveTenantFromHost(host),
	}), [host]);

	// Simple validation: only check if we're on a subdomain
	const [isValidTenant, setIsValidTenant] = useState(true);
	useEffect(() => {
		if (typeof window === 'undefined') return;
		
		const h = window.location.hostname.toLowerCase();
		const parts = h.split('.');
		if (parts[0] === 'www') parts.shift();
		
		
		// SCENARIO 1: If on apex domain, always allow (no validation needed)
		if (parts.length <= 2) {
			setIsValidTenant(true);
			return;
		}
		
		// SCENARIO 2-4: If on subdomain, allow access (authentication will handle redirects)
		setIsValidTenant(true);
	}, []);

	if (!isValidTenant) return null;
	return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export function useTenant(): TenantContextValue {
	const ctx = useContext(TenantContext);
	if (!ctx) throw new Error('useTenant must be used within a TenantProvider');
	return ctx;
}


