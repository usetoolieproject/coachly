import React, { useState } from 'react';
import { Plus, Edit, Eye, EyeOff, ToggleLeft, ToggleRight, DollarSign, Tag, RefreshCw } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { CreatePlanModal } from './CreatePlanModal';
import { EditPlanModal } from './EditPlanModal';
import { RefreshButton } from '../../../../components/shared/ui/RefreshButton';
import { UpdatingIndicator } from '../../../../components/shared/ui/UpdatingIndicator';
import Pagination from '../../../../components/shared/ui/Pagination';

interface PlansListProps {
  plans: SubscriptionPlan[];
  loading: boolean;
  onCreatePlan: (data: any) => Promise<any>;
  onUpdatePlan: (id: string, data: any) => Promise<any>;
  onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
  onTogglePromo: (id: string, enabled: boolean) => Promise<void>;
}

export const PlansList: React.FC<PlansListProps> = ({
  plans,
  loading,
  onCreatePlan,
  onUpdatePlan,
  onToggleVisibility,
  onTogglePromo,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getBillingIntervalText = (interval: string, count: number) => {
    switch (interval) {
      case 'month':
        return count === 1 ? 'Monthly' : `Every ${count} months`;
      case 'year':
        return 'Yearly';
      case '3months':
        return 'Quarterly';
      case '6months':
        return 'Semi-annually';
      default:
        return interval;
    }
  };

  const handleTogglePromo = async (plan: SubscriptionPlan) => {
    try {
      await onTogglePromo(plan.id, !plan.promoEnabled);
    } catch (error) {
      console.error('Failed to toggle promo:', error);
    }
  };

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Subscription Plans</h2>
              <p className="text-sm text-slate-500">Manage subscription plans and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <UpdatingIndicator isUpdating={loading} />
              <RefreshButton onClick={() => { window.dispatchEvent(new CustomEvent('subscription-plans:refresh')); }} isRefreshing={loading} />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-medium shadow"
            >
              <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Plan</span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col min-h-[60vh]">
          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="h-56 rounded-lg border border-gray-200 bg-white p-6">
                  <div className="h-5 w-40 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-4 w-56 bg-gray-200 rounded mb-6 animate-pulse" />
                  <div className="h-7 w-28 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="space-y-2 mt-3">
                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.slice((currentPage-1)*pageSize, (currentPage-1)*pageSize + pageSize).map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg border shadow-sm p-6 ${
                    !plan.isActive ? 'opacity-60' : ''
                  }`}
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD'}).format(plan.basePriceCents/100)}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {(() => {
                          switch (plan.billingInterval) {
                            case 'month': return plan.billingIntervalCount === 1 ? 'Monthly' : `Every ${plan.billingIntervalCount} months`;
                            case 'year': return 'Yearly';
                            case '3months': return 'Quarterly';
                            case '6months': return 'Semi-annually';
                            default: return plan.billingInterval;
                          }
                        })()}
                      </span>
                    </div>
                    {plan.promoEnabled && (
                      <div className="mt-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">
                          {plan.promoLabel || `${plan.promoDiscountPercent}% OFF`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-gray-500">+{plan.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Edit plan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleVisibility(plan.id, !plan.isVisible)}
                        className={`p-2 transition-colors ${plan.isVisible ? 'text-gray-400 hover:text-gray-700' : 'text-yellow-600 hover:text-yellow-700'}`}
                        title={plan.isVisible ? 'Hide from instructors' : 'Show to instructors'}
                      >
                        {plan.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleTogglePromo(plan)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        plan.promoEnabled
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {plan.promoEnabled ? (
                        <>
                          <ToggleRight className="w-3 h-3" />
                          Promo ON
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3 h-3" />
                          Promo OFF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination
            className="mt-auto pt-3"
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil((plans?.length || 0) / pageSize))}
            onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(Math.max(1, Math.ceil((plans?.length || 0) / pageSize)), p + 1))}
          />
        </div>
      </div>

      


      {/* Modals */}
      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreatePlan}
        />
      )}

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSubmit={(data) => onUpdatePlan(editingPlan.id, data)}
        />
      )}
    </div>
  );
};
