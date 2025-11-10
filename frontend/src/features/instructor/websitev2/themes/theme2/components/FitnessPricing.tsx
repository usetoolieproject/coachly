import React from 'react';
import { Check, Zap } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period?: string;
  features: string[];
  popular?: boolean;
}

interface FitnessPricingProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  showMonthly?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  sectionData?: any;
  allSectionData?: any;
}

export const FitnessPricing: React.FC<FitnessPricingProps> = ({
  title = 'Choose Your Plan',
  subtitle = 'Flexible pricing for every fitness goal',
  plans = [],
  showMonthly = true,
  isSelected = false,
  isEditable = false,
  onClick,
  sectionData,
  allSectionData = {}
}) => {
  const { primaryColor, darkMode } = useDesignColors({ allSectionData });

  return (
    <div
      className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 to-red-50'} ${
        isSelected && isEditable ? 'ring-4 ring-orange-400' : ''
      }`}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          {title && (
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? darkMode
                      ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-2xl scale-105'
                      : 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl scale-105'
                    : darkMode
                      ? 'bg-gray-800 border-2 border-gray-700'
                      : 'bg-white border-2 border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 font-black px-4 py-1 rounded-full text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      BEST VALUE
                    </span>
                  </div>
                )}
                
                {/* Plan Name */}
                <h3 className={`text-2xl font-black mb-2 ${
                  plan.popular ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-5xl font-black ${
                    plan.popular ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-lg ml-2 ${
                      plan.popular ? 'text-white/70' : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      /{plan.period}
                    </span>
                  )}
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check 
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.popular ? 'text-white' : ''
                          }`}
                          style={!plan.popular ? { color: primaryColor || '#FF6B35' } : undefined}
                        />
                        <span className={
                          plan.popular 
                            ? 'text-white' 
                            : darkMode 
                              ? 'text-gray-300' 
                              : 'text-gray-700'
                        }>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    plan.popular
                      ? 'bg-white text-orange-600 hover:bg-gray-100'
                      : darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Join Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEditable ? 'Add pricing plans in the editor' : 'No pricing plans configured'}
          </div>
        )}
      </div>
    </div>
  );
};

