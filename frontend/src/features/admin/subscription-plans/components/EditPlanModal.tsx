import React, { useState } from 'react';
import { X, DollarSign, Check } from 'lucide-react';
import { SubscriptionPlan, UpdatePlanData } from '../types';

interface EditPlanModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSubmit: (data: UpdatePlanData) => Promise<void>;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ plan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UpdatePlanData>({
    name: plan.name,
    description: plan.description,
    basePriceCents: plan.basePriceCents,
    billingInterval: plan.billingInterval,
    billingIntervalCount: plan.billingIntervalCount,
    isActive: plan.isActive,
    promoEnabled: plan.promoEnabled,
    promoDiscountPercent: plan.promoDiscountPercent,
    promoDurationMonths: plan.promoDurationMonths,
    promoLabel: plan.promoLabel,
    promoDescription: plan.promoDescription,
    displayOrder: plan.displayOrder,
    features: [...plan.features]
  });

  const [loading, setLoading] = useState(false);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);

  const getIntervalLabel = (interval: string, count: number) => {
    switch (interval) {
      case 'month':
        return count === 1 ? 'month' : `${count} months`;
      case 'year':
        return 'year';
      case '3months':
        return '3 months';
      case '6months':
        return '6 months';
      default:
        return interval;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to update plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features ?? [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features ?? []), '']
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = (formData.features ?? []).filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Subscription Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Monthly Pro, Annual Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Describe what this plan includes..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label className="text-sm text-gray-700">Plan is active</label>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                  value={(formData.basePriceCents ?? 0) / 100}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      basePriceCents: Math.round(parseFloat(e.target.value) * 100) 
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Interval *
                </label>
                <select
                  value={formData.billingInterval}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    billingInterval: e.target.value as any 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="month">Monthly</option>
                  <option value="3months">Quarterly (3 months)</option>
                  <option value="6months">Semi-annually (6 months)</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Promotional Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Promotional Pricing</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.promoEnabled}
                  onChange={(e) => setFormData({ ...formData, promoEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Enable Promo</span>
              </label>
            </div>

            {formData.promoEnabled && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Label
                  </label>
                  <input
                    type="text"
                    value={formData.promoLabel}
                    onChange={(e) => setFormData({ ...formData, promoLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., First 3 Months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.promoDiscountPercent}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      promoDiscountPercent: parseInt(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.promoDurationMonths}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      promoDurationMonths: parseInt(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Description
                  </label>
                  <input
                    type="text"
                    value={formData.promoDescription}
                    onChange={(e) => setFormData({ ...formData, promoDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Save 20% on your first quarter"
                  />
                </div>
              </div>
            )}

            {/* Live Promo Preview */}
            {formData.promoEnabled && (
              <div className="p-3 rounded-md border border-orange-200 bg-white">
                {(() => {
                  const original = formData.basePriceCents || 0;
                  const discount = Math.max(0, Math.min(100, formData.promoDiscountPercent || 0));
                  const promo = Math.max(0, Math.round(original * (1 - discount / 100)));
                  const duration = Math.max(1, formData.promoDurationMonths || 1);
                  const intervalText = getIntervalLabel(formData.billingInterval || 'month', formData.billingIntervalCount || 1);
                  return (
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">Promotional preview</div>
                      <div className="mt-1">
                        {formatCurrency(promo)} per {intervalText} for {duration} {duration === 1 ? 'month' : 'months'}
                      </div>
                      <div className="text-gray-500">
                        then {formatCurrency(original)} per {intervalText}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Features</h3>
            
            <div className="space-y-2">
              {(formData.features ?? []).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Feature description"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Add Feature
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
