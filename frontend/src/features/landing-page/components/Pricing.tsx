import { Check, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Plan IDs from database
const PLAN_IDS = {
  BASIC: '3425044c-2a58-423f-a498-6bf5309c366c',
  PRO: '6e20a522-992f-449a-a6da-102ed32a552d',
} as const;

const basicFeatures = [
  "Unlimited Courses",
  "Community Chat",
  "Members – Up to 1,000",
  { text: "10% transaction fee", excluded: true },
  "Content Calendar",
  "One-page website",
];

const proFeatures = [
  "Everything in Basic",
  "Screen recorder",
  "Meet for Coaching Calls",
  "Full website builder + templates",
  "Custom domains",
  "1-on-1 setup call",
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleGetStarted = (planId: string, planName: string, planPrice: number) => {
    // Store plan data in sessionStorage for instant display
    sessionStorage.setItem('selectedPlanId', planId);
    sessionStorage.setItem('selectedPlanName', planName);
    sessionStorage.setItem('selectedPlanPrice', planPrice.toString());
    navigate('/signup');
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Choose the perfect plan for your coaching business.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Basic Plan */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-gray-200 shadow-lg flex flex-col hover:shadow-xl transition-all">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Basic</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Get your first course online fast.</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$49</span>
                <span className="text-gray-600 text-base sm:text-lg">one-time</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {basicFeatures.map((feature, index) => {
                const isExcluded = typeof feature === 'object' && feature.excluded;
                const text = typeof feature === 'string' ? feature : feature.text;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    {isExcluded ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                    )}
                    <span className={`text-sm sm:text-base ${isExcluded ? "text-gray-500" : "text-gray-900"}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div>
              <button 
                onClick={() => handleGetStarted(PLAN_IDS.BASIC, 'Basic', 49)}
                className="w-full mb-3 sm:mb-4 bg-gray-100 text-purple-600 border-2 border-gray-200 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-200 transition-all"
              >
                Get Started
              </button>
              <p className="text-xs sm:text-sm text-center text-gray-600">Basic Plan</p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-purple-600 shadow-2xl flex flex-col relative hover:shadow-3xl transition-all">
            <div className="absolute -top-2 right-4 sm:-top-3 sm:right-6">
              <span className="bg-purple-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                Most Popular
              </span>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Pro</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Everything in Basic, plus tools to scale.</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$89</span>
                <span className="text-gray-600 text-base sm:text-lg">one-time</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-900">{feature}</span>
                </div>
              ))}
            </div>
            
            <div>
              <button 
                onClick={() => handleGetStarted(PLAN_IDS.PRO, 'Pro', 89)}
                className="w-full mb-3 sm:mb-4 bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
              <p className="text-xs sm:text-sm text-center text-gray-600">
                Most popular choice
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-sm sm:text-base text-gray-600">
            One-time payment • Lifetime access • All features included • Priority support
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

