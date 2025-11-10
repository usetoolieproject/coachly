import React, { useState } from 'react';
import { CreditCard, Loader2, Check, AlertCircle, DollarSign, Tag, X } from 'lucide-react';
import { SubscriptionService, SubscriptionStatus } from '../../../../services/subscriptionService';
import { SubscriptionPlansModal } from './SubscriptionPlansModal';
import { instructorPromoClient } from '../services/promoClient';
import { useActivePlans } from '../../../admin/subscription-plans/hooks/useSubscriptionPlans';
import { useTheme } from '../../../../contexts/ThemeContext';

interface BillingCardProps {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

const BillingCard: React.FC<BillingCardProps> = ({ subscriptionStatus, loading }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [dismissedNotification, setDismissedNotification] = useState(false);
  
  const { plans: availablePlans, loading: plansLoading } = useActivePlans();
  const { isDarkMode } = useTheme();
  const cardClasses = `rounded-xl shadow-sm border mb-4 sm:mb-6 lg:mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const headingClasses = isDarkMode ? 'text-white' : 'text-slate-800';
  const subtextClasses = isDarkMode ? 'text-gray-400' : 'text-slate-700';

  const handleSubscribe = async () => {
    try {
      // Load applied promo before opening modal so we can preview discount
      const promo = await instructorPromoClient.getMyPromo();
      setAppliedPromo(promo);
    } catch {}
    setShowPlansModal(true);
  };

  const handleSelectPlan = async (planId: string) => {
    setActionLoading('subscribe');
    setMessage(null);
    
    try {
      const { url } = await SubscriptionService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to start subscription process' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleManagePlan = async () => {
    setActionLoading('manage');
    setMessage(null);
    
    try {
      const { url } = await SubscriptionService.openBillingPortal();
      window.location.href = url;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to open billing portal' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async () => {
    setActionLoading('upgrade');
    setMessage(null);
    
    try {
      const { url } = await SubscriptionService.upgradeToProPlan();
      window.location.href = url;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to start upgrade process' });
    } finally {
      setActionLoading(null);
    }
  };

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


  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-500">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-semibold ${headingClasses}`}>Plan & Billing</h3>
              <p className={`text-xs sm:text-sm ${subtextClasses}`}>Loading subscription status...</p>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-8">
          <div className="animate-pulse space-y-4">
              <div className={`h-4 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-6 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-4 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-4 rounded w-1/5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  //
  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription;
  const isProcessing = subscriptionStatus?.isProcessing;
  const subscription = subscriptionStatus?.subscription;

  return (
    <div className={cardClasses}>
      <div className="p-4 sm:p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 sm:p-2 rounded-full bg-blue-500">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-semibold ${headingClasses}`}>Plan & Billing</h3>
            <p className={`text-xs sm:text-sm ${subtextClasses}`}>
              {isProcessing ? 'Processing your subscription...' : 'Your subscription status'}
            </p>
          </div>
        </div>
      </div>

      {/* Processing Banner */}
      {isProcessing && (
        <div className="mx-6 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-blue-700 dark:text-blue-400 mr-3 animate-spin" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">Processing Subscription</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">This can take up to ~40 seconds. We'll refresh automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-4 p-3 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {isProcessing ? (
          <>
            {/* Processing State */}
            <div className="space-y-3 animate-pulse">
              <div className="flex items-center justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-48"></div>
              </div>
              <div className="flex items-center justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-40"></div>
              </div>
              <div className="flex items-center justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status</span>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32"></div>
              </div>
              <div className="h-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"></div>
            </div>
          </>
        ) : hasActiveSubscription && subscription ? (
          <>
            {/* Active Subscription */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                <span className={`font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  isProcessing ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isProcessing ? 'Processing...' : ((subscription as any)?.subscription_plans?.name || 'Trainr Pro')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const sub: any = subscription as any;
                    const plan = sub?.subscription_plans;
                    const intervalText = getBillingIntervalText(plan?.billing_interval || 'month', plan?.billing_interval_count || 1);
                    const locked = typeof sub?.original_price_cents === 'number' && sub.original_price_cents > 0
                      ? sub.original_price_cents
                      : (plan?.base_price_cents || 0);
                    const showPromo = !!sub?.has_promo && !!plan?.promo_enabled;
                    const promoAmount = showPromo
                      ? Math.max(0, Math.round(locked * (1 - (plan?.promo_discount_percent || 0) / 100)))
                      : null;
                    return (
                      <>
                        {showPromo && promoAmount != null ? (
                          <>
                            <span className="font-medium text-orange-700">{formatPrice(promoAmount)}</span>
                            <span className="text-sm text-gray-500 line-through">{formatPrice(locked)}</span>
                          </>
                        ) : (
                          <span className="font-medium">{formatPrice(locked)}</span>
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">/ {intervalText}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {((subscription as any)?.has_promo && (subscription as any)?.promo_end_date) && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Promo ends</span>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                    <span className="text-sm text-orange-700 dark:text-orange-400">
                      {new Date((subscription as any).promo_end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className={`font-medium flex items-center gap-2 ${
                  isProcessing ? 'text-blue-600 dark:text-blue-400' :
                  subscription.cancel_at_period_end ? 'text-orange-700 dark:text-orange-400' :
                  subscription.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                  subscription.status === 'past_due' ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>
                  {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isProcessing ? 'Processing...' :
                   subscription.cancel_at_period_end ? 'Cancelling at period end' :
                   subscription.status === 'active' ? 'Active' : 
                   subscription.status === 'past_due' ? 'Past Due' : 
                   'Canceled'}
                </span>
              </div>

              {subscription.cancel_at_period_end && !dismissedNotification && (
                <div className="p-3 bg-amber-50 dark:bg-yellow-900/20 border border-amber-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle 
                        className="w-4 h-4 text-gray-900 dark:text-amber-400 mr-2" 
                        style={{ color: isDarkMode ? undefined : '#111827' }}
                      />
                      <span 
                        className="text-sm font-medium text-gray-900 dark:text-amber-400"
                        style={{ color: isDarkMode ? undefined : '#111827' }}
                      >
                        Subscription will be canceled at the end of the current billing period
                      </span>
                    </div>
                    <button
                      onClick={() => setDismissedNotification(true)}
                      className="ml-2 p-1 hover:bg-amber-100 dark:hover:bg-yellow-800/30 rounded-full transition-colors"
                      aria-label="Dismiss notification"
                    >
                      <X 
                        className="w-4 h-4 text-gray-900 dark:text-amber-400" 
                        style={{ color: isDarkMode ? undefined : '#111827' }}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(() => {
                const sub: any = subscription as any;
                const isOneTimePayment = String(sub?.stripe_subscription_id || '').startsWith('ONE_TIME_');
                
                // Handle one-time payments (Basic can upgrade, Pro shows only lifetime access)
                if (isOneTimePayment) {
                  const currentPlanName = sub?.subscription_plans?.name;
                  const isBasicPlan = currentPlanName === 'Basic';
                  
                  if (isBasicPlan) {
                    // Basic users can upgrade to Pro for $40
                    return (
                      <button
                        onClick={handleUpgrade}
                        disabled={actionLoading === 'upgrade'}
                        className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === 'upgrade' && <Loader2 className="w-3 h-3 animate-spin" />}
                        Upgrade to Pro for $40
                      </button>
                    );
                  } else {
                    // Pro users - no upgrade needed
                    return null;
                  }
                }
                
                const isPromoSubscription = sub?.has_promo || String(sub?.stripe_subscription_id || '').startsWith('FREE-') || sub?.original_price_cents === 0;
                
                if (subscription.cancel_at_period_end) {
                  return (
                    <>
                      <button
                        onClick={handleManagePlan}
                        disabled={actionLoading === 'manage' || isPromoSubscription}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                          isPromoSubscription 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-violet-500 hover:bg-violet-600 text-white'
                        }`}
                        title={isPromoSubscription ? 'Manage Plan not available for promo subscriptions' : ''}
                      >
                        {actionLoading === 'manage' && <Loader2 className="w-3 h-3 animate-spin" />}
                        Manage Plan
                      </button>
                      
                      <button
                        onClick={handleSubscribe}
                        disabled={actionLoading === 'subscribe'}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === 'subscribe' && <Loader2 className="w-3 h-3 animate-spin" />}
                        Resubscribe
                      </button>
                    </>
                  );
                } else {
                  return (
                    <>
                      <button
                        onClick={handleManagePlan}
                        disabled={actionLoading === 'manage' || isPromoSubscription}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                          isPromoSubscription 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-violet-500 hover:bg-violet-600 text-white'
                        }`}
                        title={isPromoSubscription ? 'Manage Plan not available for promo subscriptions' : ''}
                      >
                        {actionLoading === 'manage' && <Loader2 className="w-3 h-3 animate-spin" />}
                        Manage Plan
                      </button>
                      
                    </>
                  );
                }
              })()}
            </div>
          </>
        ) : (
          <>
            {/* No Active Subscription */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                <span className="font-medium text-gray-600 dark:text-gray-300">No Active Subscription</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Available Plans</span>
                <span className="font-medium text-gray-600 dark:text-gray-300">{availablePlans.length} plans available</span>
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-violet-900/20 to-blue-900/20 border-violet-800' : 'bg-gradient-to-r from-violet-100 to-blue-100 border-violet-300'}`}>
                <div className="flex items-center mb-2">
                  <DollarSign className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`} />
                  <span className={`font-medium ${isDarkMode ? 'text-violet-200' : 'text-slate-800'}`}>Choose Your Plan</span>
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-violet-300' : 'text-slate-700'}`}>
                  Select from our available subscription plans to get started with Trainr Pro.
                </p>
                <button
                  onClick={handleSubscribe}
                  disabled={actionLoading === 'subscribe'}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === 'subscribe' && <Loader2 className="w-3 h-3 animate-spin" />}
                  Choose Plan
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Subscription Plans Modal */}
      <SubscriptionPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onSelectPlan={handleSelectPlan}
        plans={availablePlans}
        loading={plansLoading}
        appliedPromo={appliedPromo?.promo_codes || null}
      />
    </div>
  );
};

export default BillingCard;
