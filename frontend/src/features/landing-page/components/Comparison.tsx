import { Check } from 'lucide-react';

const Comparison = () => {
  const competitorTools = [
    { brand: "Skool", category: "Community", cost: 99 },
    { brand: "ClickFunnels", category: "Sales Funnels", cost: 127 },
    { brand: "Kajabi", category: "Courses", cost: 149 },
    { brand: "Loom", category: "Video Messages", cost: 12 },
    { brand: "Zoom", category: "Live Coaching", cost: 30 },
  ];

  const coachlyFeatures = [
    { name: "Community", description: "Basic + Pro", isPro: false },
    { name: "Sales Funnels", description: "Basic + Pro", isPro: false },
    { name: "Video Messages", description: "Basic + Pro", isPro: false },
    { name: "Live Coaching", description: "Pro-only", isPro: true },
    { name: "Video Hosting", description: "", isPro: false },
  ];

  const totalCost = competitorTools.reduce((sum, tool) => sum + tool.cost, 0);

  const handleGetStarted = () => {
    const element = document.getElementById('pricing');
    if (element) {
      const offset = 70; // Account for fixed navbar height
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white" id="why-coachly">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 text-gray-900">
            Why Choose Coachly?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            One platform vs juggling multiple tools. See how much you'll save.
          </p>
        </div>

        {/* Two Column Comparison */}
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8 sm:mb-12">
            {/* Left Column - Other Tools */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-900">Other Tools</h3>
                <p className="text-center text-sm sm:text-base text-gray-600">Multiple subscriptions required</p>
              </div>
              
              {competitorTools.map((tool, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-14 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                          {tool.brand.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base md:text-lg mb-1 text-gray-900 truncate">{tool.brand}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm truncate">{tool.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base sm:text-lg md:text-xl font-bold text-red-600">${tool.cost}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Coachly */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-400 to-purple-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">Coachly</h3>
                <p className="text-center text-sm sm:text-base text-white/90">All-in-one platform</p>
              </div>

              {coachlyFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${feature.isPro ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-purple-600 to-purple-700'}`}>
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base md:text-lg mb-1 text-gray-900 truncate">{feature.name}</h4>
                        {feature.description && (
                          <p className="text-gray-600 text-xs sm:text-sm truncate">{feature.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base sm:text-lg md:text-xl font-bold text-purple-600">Included</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VS Badge - Centered between columns */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-purple-600/20">
              <span className="text-3xl sm:text-4xl font-black text-gray-900">VS</span>
            </div>
          </div>
        </div>

        {/* Total Cost Comparison */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          <div className="bg-gray-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
            <div className="text-center">
              <h3 className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wide">THE COST OF OTHER TOOLS:</h3>
              <div>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">${totalCost.toLocaleString()}</span>
                <span className="text-lg sm:text-xl md:text-2xl">/month</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent)]"></div>
            <div className="relative z-10 text-center">
              <h3 className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wide">WHAT YOU PAY FOR:</h3>
              <div className="flex items-center justify-center gap-4 mb-3 sm:mb-4">
                <div>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">$49</span>
                  <span className="text-lg sm:text-xl md:text-2xl"> one-time</span>
                </div>
                <div className="w-px h-12 sm:h-16 bg-white/50"></div>
                <div>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">$89</span>
                  <span className="text-lg sm:text-xl md:text-2xl"> one-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center px-4">
          <p className="text-gray-600 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 font-medium">
            Everything you need in one platform. Community funnels, video messages, courses, and more.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm sm:text-base md:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            GET STARTED
          </button>
        </div>
      </div>
    </section>
  );
};

export default Comparison;

