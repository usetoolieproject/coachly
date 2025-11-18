import { Check } from 'lucide-react';

// Comparison section - Replace 5+ tools with Coachly
const Comparison = () => {
  const competitorTools = [
    { brand: "Skool", category: "Community", cost: 99, logo: "/brand-skool.svg" },
    { brand: "ClickFunnels", category: "Sales Funnels", cost: 127, logo: "/brand-clickfunnels-new.svg" },
    { brand: "Kajabi", category: "Courses", cost: 149, logo: "/brand-kajabi-new.svg" },
    { brand: "Loom", category: "Screen Recording", cost: 12, logo: "/brand-loom-new.svg" },
    { brand: "Zoom", category: "Live Coaching", cost: 30, logo: "/brand-zoom-new.svg" },
    { brand: "Vimeo", category: "Video Hosting", cost: 20, logo: "/brand-vimeo.svg" },
  ];

  const coachlyFeatures = [
    { name: "Unlimited members", description: "Manage unlimited clients and students.", isPro: false },
    { name: "Community", description: "Group chat & content calendar included.", isPro: false },
    { name: "Unlimited courses", description: "Launch as many programs as you like.", isPro: false },
    { name: "Sales funnels", description: "Landing page that converts.", isPro: false },
    { name: "Host Live Calls with Meet", description: "Book and host live coaching sessions.", isPro: true },
    { name: "Screen recording & video hosting", description: "Record, upload and deliver trainings in one place.", isPro: true },
    { name: "Custom Domain", description: "Brand your site & connect your own domain.", isPro: true },
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
    <section className="py-16 sm:py-20 md:py-24 bg-gray-50" id="why-coachly">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-gray-900">
            Replace 5+ Tools with Coachly
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stop stacking subscriptions. Run your entire coaching business on one platform.
          </p>
        </div>

        {/* Two Column Comparison */}
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            {/* Left Column - Other Tools */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-xl font-bold text-center text-gray-900 mb-1">Other Tools</h3>
                <p className="text-center text-sm text-blue-600">Multiple subscriptions required</p>
              </div>
              
              {competitorTools.map((tool, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img 
                          src={tool.logo} 
                          alt={`${tool.brand} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-base text-gray-900">{tool.brand}</h4>
                        <p className="text-gray-500 text-sm">{tool.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">${tool.cost}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Coachly */}
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="text-xl font-bold text-center text-white mb-2">Replace 5+ tools with Coachly.</h3>
                <p className="text-center text-sm text-gray-300 leading-relaxed">Stop stacking subscriptions. Run your entire coaching business on one platform.</p>
              </div>

              {coachlyFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 relative ${feature.isPro ? 'bg-orange-500' : 'bg-purple-600'}`}>
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                        <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${feature.isPro ? 'bg-orange-600 text-white' : 'bg-purple-700 text-white'}`}>
                          {feature.isPro ? 'Pro' : 'Basic'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-base text-gray-900 mb-0.5">{feature.name}</h4>
                        {feature.description && (
                          <p className="text-gray-500 text-sm leading-snug">{feature.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-base font-bold ${feature.isPro ? 'text-orange-600' : 'text-purple-600'}`}>Included</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VS Badge - Centered between columns */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-gray-200">
              <span className="text-2xl font-black text-gray-900">VS</span>
            </div>
          </div>
        </div>

        {/* Total Cost Comparison */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          <div className="bg-gray-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
            <div className="text-center">
              <h3 className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wide">THE COST OF OTHER TOOLS:</h3>
              <div className="mb-4">
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">${totalCost.toLocaleString()}</span>
                <span className="text-lg sm:text-xl md:text-2xl">/month</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent)]"></div>
            <div className="relative z-10 text-center">
              <h3 className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wide">WHAT YOU PAY FOR COACHLY:</h3>
              <div className="flex items-center justify-center gap-4 mb-3 sm:mb-4">
                <div>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">$49</span>
                  <span className="text-lg sm:text-xl md:text-2xl"> Basic</span>
                </div>
                <div className="w-px h-12 sm:h-16 bg-white/50"></div>
                <div>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">$89</span>
                  <span className="text-lg sm:text-xl md:text-2xl"> Pro</span>
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

