import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  plans: Array<{ id: string; name: string; billingInterval: string; billingIntervalCount: number }>;
}

const DISCOUNT_OPTIONS = [10, 20, 25, 50, 75, 100];
const DURATION_OPTIONS = [1, 3, 6, 12];

export const GeneratePromoCodeModal: React.FC<Props> = ({ onClose, onSubmit, plans }) => {
  const [type, setType] = useState<'discount' | 'duration'>('discount');
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [freeMonths, setFreeMonths] = useState<number>(6);
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [planId, setPlanId] = useState<string>('any');
  const [saving, setSaving] = useState(false);

  const planOptions = useMemo(() => {
    const weight = (interval: string, count: number) => {
      switch (interval) {
        case 'month':
          return 1 * (count || 1); // monthly
      }
      if (interval === '3 months') return 3;
      if (interval === '6months') return 6;
      if (interval === 'year') return 12;
      return 100; // unknown goes last
    };
    const sorted = [...plans].sort((a, b) => weight(a.billingInterval, a.billingIntervalCount) - weight(b.billingInterval, b.billingIntervalCount));
    return [{ id: 'any', name: 'Any plan', billingInterval: '', billingIntervalCount: 0 }, ...sorted];
  }, [plans]);

  const submit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        type,
        planId: type === 'discount' ? (planId === 'any' ? null : planId) : null,
        customCode: useCustomCode && customCode.trim() ? customCode.trim().toUpperCase() : undefined,
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
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">Create Promo Code</h3>
            <p className="text-xs text-gray-500">Generate a discount or free-duration access code</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-1 gap-5 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="discount">Discount</option>
              <option value="duration">Free Duration</option>
            </select>
          </div>

          {type === 'discount' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
              <select value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}%</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Free Duration (months)</label>
              <select value={freeMonths} onChange={(e) => setFreeMonths(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {DURATION_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m} {m === 1 ? 'month' : 'months'}</option>
                ))}
              </select>
            </div>
          )}

          {type === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Applies To Plan</label>
              <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {planOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name === 'Any plan' ? p.name : `${p.name}`}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <label className="text-sm font-medium text-gray-700">Use Custom Code</label>
            <button onClick={() => setUseCustomCode(v => !v)} type="button" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useCustomCode ? 'bg-purple-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useCustomCode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {useCustomCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Code</label>
              <input value={customCode} onChange={(e) => setCustomCode(e.target.value)} placeholder="PROMO-ABC123" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Uses Per Code (optional)</label>
            <input type="number" min={1} value={maxUses as any} onChange={(e) => setMaxUses(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiration Date (optional)</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
          <button disabled={saving} onClick={submit} className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-medium text-white shadow hover:opacity-95 disabled:opacity-60">Generate Code</button>
        </div>
      </div>
    </div>
  );
};


