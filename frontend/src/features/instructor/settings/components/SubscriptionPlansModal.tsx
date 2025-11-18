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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const promoPrice = plan.promoEnabled 
                  ? calculatePromoPrice(plan.basePriceCents, plan.promoDiscountPercent)
                  : null;

                // Preview user-level promo (discount type), if applicable to this plan
                const userPromoApplies = appliedPromo && appliedPromo.type === 'discount' && (!appliedPromo.plan_id || appliedPromo.plan_id === plan.id);
                const userPromoPrice = userPromoApplies && appliedPromo?.discount_percent
                  ? calculatePromoPrice(plan.basePriceCents, appliedPromo.discount_percent)
                  : null;

                const isPro = plan.name === 'Pro';
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border-2 p-8 transition-all flex flex-col ${
                      isPro
                        ? 'border-purple-500 shadow-xl' 
                        : 'border-gray-200 hover:border-purple-300 shadow-lg'
                    }`}
                  >
                    {/* Most Popular Badge for Pro */}
                    {isPro && (
                      <div className="absolute -top-4 right-8">
                        <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      </div>
                    )}

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
                    <div className={`mb-6 ${plan.promoEnabled ? 'mt-3' : ''}`}>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-1">
                        {userPromoPrice && (
                          <>
                            <span className="text-4xl font-bold text-orange-600">
                              {formatPrice(userPromoPrice)}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                              {formatPrice(plan.basePriceCents)}
                            </span>
                          </>
                        )}
                        {!userPromoPrice && promoPrice && (
                          <>
                            <span className="text-4xl font-bold text-orange-600">
                              {formatPrice(promoPrice)}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                              {formatPrice(plan.basePriceCents)}
                            </span>
                          </>
                        )}
                        {!userPromoPrice && !promoPrice && (
                          <span className="text-5xl font-bold text-gray-900">
                            {formatPrice(plan.basePriceCents)}
                          </span>
                        )}
                        <span className="text-gray-600">
                          {getBillingIntervalText(plan.billingInterval, plan.billingIntervalCount)}
                        </span>
                      </div>
                      
                      {(plan.promoEnabled || userPromoApplies) && (
                        <p className="text-xs text-orange-600 mt-2">
                          {userPromoApplies ? `Your ${appliedPromo?.discount_percent}% promo will be applied at checkout.` : (plan.promoDescription || 'Promotional pricing available.')}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-8 flex-grow">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">What's included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-gray-700">
                            <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={selectingPlan === plan.id}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all ${
                        isPro
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {selectingPlan === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : (
                        'Get Started'
                      )}
                    </button>
                    
                    {/* Footer text */}
                    <p className="text-center text-xs text-gray-500 mt-3">
                      {isPro ? 'Most popular choice' : 'Basic Plan'}
                    </p>
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
