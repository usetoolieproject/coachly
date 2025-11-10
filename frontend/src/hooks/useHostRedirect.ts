import { useRef, useEffect, useState } from 'react';

interface HostRedirectState {
  shouldRedirect: boolean;
  targetUrl: string | null;
  isLoading: boolean;
}

/**
 * Custom hook that handles host canonicalization and redirects
 * Simplified to only handle www redirects
 */
export const useHostRedirect = (): HostRedirectState => {
  const hasRedirected = useRef(false);
  const [state, setState] = useState<HostRedirectState>({
    shouldRedirect: false,
    targetUrl: null,
    isLoading: true
  });

  useEffect(() => {
    if (hasRedirected.current || typeof window === 'undefined') {
      setState({ shouldRedirect: false, targetUrl: null, isLoading: false });
      return;
    }

    const host = window.location.hostname.toLowerCase();
    const parts = host.split('.');
    
    // Only handle www redirect
    if (parts[0] === 'www') {
      const target = parts.slice(1).join('.');
      const path = window.location.pathname + window.location.search + window.location.hash;
      hasRedirected.current = true;
      setState({ shouldRedirect: true, targetUrl: `https://${target}${path}`, isLoading: false });
      return;
    }

    // No other redirects
    setState({ shouldRedirect: false, targetUrl: null, isLoading: false });
  }, []);

  return state;
};
