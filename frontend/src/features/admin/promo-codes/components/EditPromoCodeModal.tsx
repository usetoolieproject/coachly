import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { PromoCode } from '../../types';

interface Props {
  promo: PromoCode;
  plans: Array<{ id: string; name: string; billingInterval: string; billingIntervalCount: number }>;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

const DISCOUNT_OPTIONS = [10, 20, 25, 50, 75, 100];
const DURATION_OPTIONS = [1, 3, 6, 12];

export const EditPromoCodeModal: React.FC<Props> = ({ promo, plans, onClose, onSubmit }) => {
  const [type, setType] = useState<'discount' | 'duration'>(promo.type);
  const [discountPercent, setDiscountPercent] = useState<number>(promo.discount_percent || 25);
  const [freeMonths, setFreeMonths] = useState<number>(promo.free_months || 6);
  const [planId, setPlanId] = useState<string>(promo.plan_id || 'any');
  const [maxUses, setMaxUses] = useState<number | ''>(promo.max_uses ?? '');
  const [expiresAt, setExpiresAt] = useState<string>(promo.expires_at ? promo.expires_at.substring(0, 10) : '');
  const [code, setCode] = useState<string>(promo.code);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setType(promo.type);
  }, [promo.type]);

  const planOptions = useMemo(() => {
    const weight = (interval: string, count: number) => {
      if (interval === 'month') return 1 * (count || 1);
      if (interval === '3months') return 3;
      if (interval === '6months') return 6;
      if (interval === 'year') return 12;
      return 100;
    };
    const sorted = [...plans].sort((a, b) => weight(a.billingInterval, a.billingIntervalCount) - weight(b.billingInterval, b.billingIntervalCount));
    return [{ id: 'any', name: 'Any plan', billingInterval: '', billingIntervalCount: 0 }, ...sorted];
  }, [plans]);

  const submit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        type,
        code: code.trim().toUpperCase(),
        planId: type === 'discount' ? (planId === 'any' ? null : planId) : null,
        maxUses: maxUses === '' ? null : Number(maxUses),
        expiresAt: expiresAt || null,
      };
      if (type === 'discount') payload.discountPercent = discountPercent;
      if (type === 'duration') payload.freeMonths = freeMonths;
      await onSubmit(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Edit Promo Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="discount">Discount</option>
              <option value="duration">Free Duration</option>
            </select>
          </div>

          {type === 'discount' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
              <select value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}%</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Free Duration (months)</label>
              <select value={freeMonths} onChange={(e) => setFreeMonths(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {DURATION_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m} {m === 1 ? 'month' : 'months'}</option>
                ))}
              </select>
            </div>
          )}

          {type === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Applies To Plan</label>
              <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {planOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name === 'Any plan' ? p.name : `${p.name}`}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Uses Per Code (optional)</label>
            <input type="number" min={1} value={maxUses as any} onChange={(e) => setMaxUses(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiration Date (optional)</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-gray-700">Cancel</button>
          <button disabled={saving} onClick={submit} className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-60">Save Changes</button>
        </div>
      </div>
    </div>
  );
};


