interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

interface PlanSelectorProps {
  selectedPlan: string | null;
  onPlanSelect: (planId: string) => void;
  plans: Plan[];
  isLoading?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanSelect,
  plans,
  isLoading = false
}) => {
  if (isLoading || plans.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="animate-pulse bg-gray-100 rounded-lg p-6 h-48"></div>
        <div className="animate-pulse bg-gray-100 rounded-lg p-6 h-48"></div>
      </div>
    );
  }

  const basicPlan = plans.find(p => p.name === 'Basic');
  const proPlan = plans.find(p => p.name === 'Pro');

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Basic Plan */}
        {basicPlan && (
          <button
            type="button"
            onClick={() => onPlanSelect(basicPlan.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPlan === basicPlan.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedPlan === basicPlan.id && (
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{basicPlan.name}</div>
                  <div className="text-sm">
                    <span className="font-bold text-gray-900">${basicPlan.price}</span>
                    <span className="text-gray-600"> one-time</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Pro Plan */}
        {proPlan && (
          <button
            type="button"
            onClick={() => onPlanSelect(proPlan.id)}
            className={`p-3 rounded-lg border-2 transition-all relative ${
              selectedPlan === proPlan.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="absolute -top-2 right-2 bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              Popular
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedPlan === proPlan.id && (
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{proPlan.name}</div>
                  <div className="text-sm">
                    <span className="font-bold text-gray-900">${proPlan.price}</span>
                    <span className="text-gray-600"> one-time</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

