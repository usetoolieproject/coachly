import React from 'react';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
  annualPrice: number;
  monthlyPrice: number;
}

export const PricingToggle: React.FC<PricingToggleProps> = ({
  isAnnual,
  onToggle,
  annualPrice,
  monthlyPrice,
}) => {
  return (
    <div className="mb-6">
      <div className="inline-flex rounded-lg border-2 border-gray-200 p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            isAnnual
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Annual (save 15%)
        </button>
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            !isAnnual
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Monthly
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        Selected: {isAnnual ? 'Annual' : 'Monthly'} • ${isAnnual ? annualPrice : monthlyPrice}
      </p>
    </div>
  );
};

