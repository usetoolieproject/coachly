import React, { useEffect, useState } from 'react';
import { Tag, Trash2, Check, AlertCircle } from 'lucide-react';
import { instructorPromoClient } from '../services/promoClient';
import { useTheme } from '../../../../contexts/ThemeContext';

const PromoCodeCard: React.FC = () => {
  const [promoLoading, setPromoLoading] = useState(false);
  const [promo, setPromo] = useState<any | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMyPromo = async () => {
    try {
      setPromoLoading(true);
      const data = await instructorPromoClient.getMyPromo();
      setPromo(data);
    } catch (e) {
      // Handle error silently
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    loadMyPromo();
  }, []);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      setPromoLoading(true);
      await instructorPromoClient.redeem(promoInput.trim().toUpperCase(), null);
      setPromoInput('');
      await loadMyPromo();
      setMessage({ type: 'success', text: 'Promo code applied' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to apply promo code' });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = async () => {
    try {
      setPromoLoading(true);
      await instructorPromoClient.removeMyPromo();
      await loadMyPromo();
      setMessage({ type: 'success', text: 'Promo code removed' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to remove promo code' });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setPromoLoading(false);
    }
  };

  const { isDarkMode } = useTheme();
  const cardClasses = `mt-8 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const headingClasses = isDarkMode ? 'text-white' : 'text-slate-800';
  const subtextClasses = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const inputClasses = `w-full rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`;
  const removeBtnClasses = isDarkMode
    ? 'inline-flex items-center gap-1 rounded-2xl border border-red-800/40 bg-transparent px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-900/20'
    : 'inline-flex items-center gap-1 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50';

  return (
    <div className={cardClasses}>
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-500">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={`text-base font-semibold ${headingClasses}`}>Promo Code</h3>
            <p className={`text-sm ${subtextClasses}`}>Apply a promo for discounted or free access</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mx-6 mb-4 p-3 rounded-lg flex items-center ${
          message.type === 'success'
            ? (isDarkMode ? 'bg-green-900/20 text-green-200' : 'bg-green-100 text-green-800')
            : (isDarkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-100 text-red-800')
        }`}>
          {message.type === 'success' ? <Check className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="px-6 py-4">
        {promo ? (
          <div className={`rounded-lg border bg-gradient-to-r ${isDarkMode ? 'from-violet-900/20 to-blue-900/20 border-violet-800' : 'from-violet-50 to-blue-50 border-gray-200'}`}>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{promo.promo_codes?.code || '—'}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{promo.promo_codes?.type === 'discount' ? `${promo.promo_codes?.discount_percent}% off` : `${promo.promo_codes?.free_months} months free`}</div>
              </div>
              <button
                onClick={() => { if (confirm('Remove promo code?')) removePromo(); }}
                disabled={promoLoading}
                className={removeBtnClasses}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter promo code"
              className={inputClasses}
            />
            <button
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-medium shadow disabled:opacity-60"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodeCard;


