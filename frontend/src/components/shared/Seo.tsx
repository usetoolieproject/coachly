import { useEffect } from 'react';

export function useCanonical(pathname?: string) {
	useEffect(() => {
		try {
			const head = document.querySelector('head');
			if (!head) return;
			const existing: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
			const link = existing || document.createElement('link');
			link.setAttribute('rel', 'canonical');
			const url = new URL(window.location.href);
			if (pathname) url.pathname = pathname;
			link.setAttribute('href', url.toString());
			if (!existing) head.appendChild(link);
		} catch {}
	}, [pathname]);
}


