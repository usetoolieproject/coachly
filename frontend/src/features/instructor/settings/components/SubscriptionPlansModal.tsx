import React, { useState } from 'react';
import { X, Check, Tag, DollarSign, Calendar } from 'lucide-react';
import { SubscriptionPlan } from '../../../admin/subscription-plans/types';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => Promise<void>;
  plans: SubscriptionPlan[];
  loading: boolean;
  appliedPromo?: { id: string; type: 'discount' | 'duration'; discount_percent?: number | null; free_months?: number | null; plan_id?: string | null } | null;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  plans,
  loading,
  appliedPromo,
}) => {
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getBillingIntervalText = (interval: string, count: number) => {
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

  const calculatePromoPrice = (basePriceCents: number, discountPercent: number) => {
    return Math.round(basePriceCents * (1 - discountPercent / 100));
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectingPlan(planId);
    try {
      await onSelectPlan(planId);
      onClose();
    } catch (error) {
      console.error('Failed to select plan:', error);
    } finally {
      setSelectingPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-600 mt-1">Select the subscription plan that works best for you</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const promoPrice = plan.promoEnabled 
                  ? calculatePromoPrice(plan.basePriceCents, plan.promoDiscountPercent)
                  : null;

                // Preview user-level promo (discount type), if applicable to this plan
                const userPromoApplies = appliedPromo && appliedPromo.type === 'discount' && (!appliedPromo.plan_id || appliedPromo.plan_id === plan.id);
                const userPromoPrice = userPromoApplies && appliedPromo?.discount_percent
                  ? calculatePromoPrice(plan.basePriceCents, appliedPromo.discount_percent)
                  : null;

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-lg border-2 p-6 transition-all ${
                      plan.promoEnabled 
                        ? 'border-orange-300 shadow-lg' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {/* Promo Badge */}
                    {(plan.promoEnabled || userPromoApplies) && (
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                        <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {userPromoApplies ? `${appliedPromo?.discount_percent}% OFF with promo` : (plan.promoLabel || `${plan.promoDiscountPercent}% OFF`)}
                        </div>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className={`text-center mb-6 ${plan.promoEnabled ? 'mt-3' : ''}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {userPromoPrice && (
                          <>
                            <span className="text-3xl font-bold text-orange-600">
                              {formatPrice(userPromoPrice)}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(plan.basePriceCents)}
                            </span>
                          </>
                        )}
                        {!userPromoPrice && promoPrice && (
                          <>
                            <span className="text-3xl font-bold text-orange-600">
                              {formatPrice(promoPrice)}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(plan.basePriceCents)}
                            </span>
                          </>
                        )}
                        {!userPromoPrice && !promoPrice && (
                          <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(plan.basePriceCents)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          per {getBillingIntervalText(plan.billingInterval, plan.billingIntervalCount)}
                        </span>
                      </div>
                      
                      {(plan.promoEnabled || userPromoApplies) && (
                        <p className="text-xs text-orange-600 mt-2">
                          {userPromoApplies ? `Your ${appliedPromo?.discount_percent}% promo will be applied at checkout.` : (plan.promoDescription || 'Promotional pricing available.')}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={selectingPlan === plan.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.promoEnabled
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {selectingPlan === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Selecting...
                        </div>
                      ) : (
                        'Select Plan'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && plans.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No plans available</h3>
              <p className="mt-1 text-sm text-gray-500">Please contact support for assistance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
