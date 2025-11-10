import React, { useEffect, useMemo, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { SubscriptionService } from '../../services/subscriptionService';
import { useQuery } from '@tanstack/react-query';

interface PromoBannerProps {
  userId?: string | null;
  onSubscribe?: () => void;
  subscribeHref?: string; // fallback navigation if no handler provided
  className?: string;
}

// 24 hours in ms
const PROMO_WINDOW_MS = 24 * 60 * 60 * 1000;

const PromoBanner: React.FC<PromoBannerProps> = ({ userId, onSubscribe, subscribeHref = '/coach/settings?tab=billing', className = '' }) => {
  const storageKey = useMemo(() => `promo-20off-start-${userId || 'anon'}`, [userId]);
  const { isDarkMode } = useTheme();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      const v = sessionStorage.getItem(`promo-20off-dismissed-${userId || 'anon'}`);
      return v === '1';
    } catch { return false; }
  });
  const [nowTick, setNowTick] = useState<number>(Date.now());

  // Use TanStack Query for subscription status with better caching
  const { 
    data: subscriptionStatus, 
    isLoading: subscriptionLoading, 
    error: subscriptionError 
  } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const status = await SubscriptionService.getSubscriptionStatus();
      return status;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for more responsive updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Always refetch on mount to get latest data
  });

  // TanStack Query will automatically handle refetching when the query is invalidated

  // establish a start time; if missing, set it to now
  useEffect(() => {
    const value = localStorage.getItem(storageKey);
    if (!value) {
      localStorage.setItem(storageKey, `${Date.now()}`);
    }
  }, [storageKey]);

  // tick every second for the countdown
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { remainingMs } = useMemo(() => {
    const startRaw = localStorage.getItem(storageKey);
    // initialize silently
    const startedAt = startRaw ? parseInt(startRaw, 10) : Date.now();
    let remaining = startedAt + PROMO_WINDOW_MS - nowTick;
    if (remaining <= 0) {
      // Marketing reset: when reaching zero, immediately start another 24h window
      // silent reset
      const newStart = Date.now();
      localStorage.setItem(storageKey, `${newStart}`);
      remaining = newStart + PROMO_WINDOW_MS - nowTick;
    }
    return { remainingMs: Math.max(0, remaining) };
  }, [storageKey, nowTick]);

  const fmt = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Always hide banner by default - only show after confirming no subscription
  if (dismissed) {
    return null;
  }
  
  // Hide banner while loading subscription status
  if (subscriptionLoading) {
    return null;
  }
  
  // Hide banner on error to be safe
  if (subscriptionError) {
    return null;
  }
  
  // Hide banner if user has active subscription
  if (subscriptionStatus?.hasActiveSubscription) {
    return null;
  }
  
  // Only show banner if we've confirmed there's no subscription
  if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
    // Show banner
  } else {
    // Still loading or no data yet - hide banner
    return null;
  }

  const container = isDarkMode
    ? 'bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white border-white/10'
    : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white border-white/20';

  return (
    <div className={`px-4 py-2 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`${container} rounded-2xl shadow-xl border relative overflow-hidden`}> 
          <div className="px-5 py-3 flex items-center justify-between">
            {/* Left: message */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <Clock className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">Limited-time offer</div>
                <div className="text-sm opacity-95">Get 20% off your first 3 months when you subscribe today.</div>
              </div>
            </div>
            {/* Right: timer + CTA */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/20 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums">{fmt(remainingMs)}</span>
              </div>
              <a
                href={subscribeHref}
                onClick={(e) => { if (onSubscribe) { e.preventDefault(); onSubscribe(); } }}
                className={`${isDarkMode 
                  ? 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/15 hover:bg-white/25 ring-1 ring-white/25' 
                  : 'px-4 py-2 rounded-lg text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm'} transition-colors`}
              >
                Subscribe now
              </a>
              <button aria-label="Dismiss" onClick={() => { setDismissed(true); try { sessionStorage.setItem(`promo-20off-dismissed-${userId || 'anon'}`,'1'); } catch {} }} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;



