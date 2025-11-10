import React from 'react';
import { Check, ArrowRight, Flame } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';
import { usePayment } from '../../../hooks/usePayment';
import { PaymentData } from '../../../services/paymentService';

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  isFree?: boolean;
  features: string[];
}

interface WorkoutPlansProps {
  title?: string;
  subtitle?: string;
  plans?: WorkoutPlan[];
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  sectionData?: any;
  allSectionData?: any;
  publicViewData?: {
    instructorId?: string;
    communityId?: string;
    subdomain?: string;
  };
}

export const WorkoutPlans: React.FC<WorkoutPlansProps> = ({
  title = 'Choose Your Program',
  subtitle = 'Select the perfect training plan for your goals',
  plans = [],
  isSelected = false,
  isEditable = false,
  onClick,
  allSectionData = {},
  publicViewData
}) => {
  const { primaryColor, secondaryColor, darkMode } = useDesignColors({ allSectionData });
  const { paymentStatus, handleCommunityPayment, handleFreeSignup } = usePayment();

  return (
    <div
      id="workout-plans-section"
      className={`py-16 ${isSelected && isEditable ? 'ring-4' : ''}`}
      style={isSelected && isEditable ? { 
        outline: `4px solid ${primaryColor}`,
        outlineOffset: '-4px'
      } : undefined}
      onClick={isEditable ? onClick : undefined}
      role={isEditable ? 'button' : undefined}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-5 md:px-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white'} p-4 sm:p-6 md:p-8 lg:p-12`}>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          {title && (
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-base sm:text-lg md:text-xl px-2 sm:px-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <div 
            className={`grid gap-4 sm:gap-6 md:gap-8 ${
              plans.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : plans.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            }`}
          >
            {plans.map((plan, index) => {
              // Determine if this plan should be highlighted
              // If only 1 plan, highlight it. If 3 plans, highlight middle one. If 2 plans, highlight first one.
              const isHighlighted = plans.length === 1 
                ? true 
                : plans.length === 3 
                  ? index === 1 
                  : index === 0;
              
              return (
              <div
                key={plan.id || index}
                className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 transform transition-all duration-300 hover:scale-105 ${
                  isHighlighted
                    ? 'text-white shadow-2xl scale-105'
                    : darkMode
                      ? 'bg-gray-800 border-2 border-gray-700'
                      : 'bg-gray-50 border-2 border-gray-200'
                }`}
                style={isHighlighted ? { 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                } : {}}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 font-black px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {/* Plan Icon */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <div 
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center ${
                      isHighlighted ? 'bg-white/20' : ''
                    }`}
                    style={!isHighlighted ? { backgroundColor: `${primaryColor}10` } : {}}
                  >
                    <Flame 
                      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${isHighlighted ? 'text-white' : ''}`}
                      style={!isHighlighted ? { color: primaryColor } : undefined}
                    />
                  </div>
                </div>

                {/* Plan Name */}
                <h3 className={`text-xl sm:text-xl md:text-2xl font-black mb-2 ${
                  isHighlighted ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>

                {/* Description */}
                {plan.description && (
                  <p className={`mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base ${
                    isHighlighted ? 'text-white/90' : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {plan.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                  {plan.isFree ? (
                    <span className={`text-3xl sm:text-4xl md:text-5xl font-black ${
                      isHighlighted ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      FREE
                    </span>
                  ) : (
                    <>
                      <span className={`text-3xl sm:text-4xl md:text-5xl font-black ${
                        isHighlighted ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${plan.price || 0}
                      </span>
                      <span className={`text-sm sm:text-base md:text-lg ml-1 sm:ml-2 ${
                        isHighlighted ? 'text-white/70' : darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        /month
                      </span>
                    </>
                  )}
                </div>

                {/* Features */}
                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-6 sm:mb-7 md:mb-8">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                        <Check 
                          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 flex-shrink-0 mt-0.5 ${isHighlighted ? 'text-white' : ''}`}
                          style={!isHighlighted ? { color: primaryColor } : undefined}
                        />
                        <span className={`text-xs sm:text-sm md:text-base ${
                          isHighlighted 
                            ? 'text-white' 
                            : darkMode 
                              ? 'text-gray-300' 
                              : 'text-gray-700'
                        }`}>
                          {typeof feature === 'string' ? feature : String(feature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    onClick?.();
                    
                    // Don't process payment in builder mode
                    if (isEditable) {
                      return;
                    }
                    
                    // Handle free plans
                    if (plan.isFree === true || plan.price === 0) {
                      handleFreeSignup(publicViewData?.communityId);
                      return;
                    }
                    
                    // Handle paid plans
                    if (publicViewData?.instructorId && publicViewData?.communityId && plan.price) {
                      try {
                        const paymentData: PaymentData = {
                          communityId: publicViewData.communityId,
                          instructorId: publicViewData.instructorId,
                          amount: plan.price,
                          currency: 'usd',
                          description: `Join ${plan.name} - Monthly Subscription`,
                          subdomain: publicViewData.subdomain,
                        };
                        await handleCommunityPayment(paymentData);
                      } catch (error) {
                      }
                    } else {
                    }
                  }}
                  disabled={paymentStatus.isProcessing}
                  className={`w-full py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    isHighlighted
                      ? 'bg-white hover:bg-gray-100'
                      : darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${paymentStatus.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={isHighlighted ? { color: primaryColor } : {}}
                >
                  {paymentStatus.isProcessing 
                    ? 'PROCESSING...' 
                    : plan.isFree === true || plan.price === 0
                      ? 'JOIN FOR FREE'
                      : 'Get Started'}
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </button>
              </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEditable ? 'Add workout plans in the editor' : 'No workout plans configured'}
          </div>
        )}
      </div>
    </div>
  );
};
