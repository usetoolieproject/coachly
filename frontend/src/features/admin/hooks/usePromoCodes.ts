import { useCallback, useEffect, useState } from 'react';
import { promoCodesService } from '../services/promoCodesService';
import type { PromoCode } from '../types';

export function usePromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promoCodesService.list();
      setCodes(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = useCallback(async (payload: any) => {
    const created = await promoCodesService.generate(payload);
    setCodes((prev) => [...created, ...prev]);
    return created;
  }, []);

  const deactivate = useCallback(async (id: string) => {
    const updated = await promoCodesService.deactivate(id);
    setCodes((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const toggle = useCallback(async (id: string, isActive: boolean) => {
    const updated = await promoCodesService.toggle(id, isActive);
    setCodes((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const update = useCallback(async (id: string, payload: any) => {
    const updated = await promoCodesService.update(id, payload);
    setCodes((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await promoCodesService.remove(id);
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  return { codes, loading, error, refetch: fetchCodes, generate, deactivate, toggle, update, remove };
}


