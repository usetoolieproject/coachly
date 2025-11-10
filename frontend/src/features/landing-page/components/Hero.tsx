import { ArrowRight } from 'lucide-react';
import heroDashboard from '/hero-dashboard.jpg';

const Hero = () => {
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
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-100 rounded-full border border-purple-200 shadow-sm">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse-slow" />
              <span className="text-xs sm:text-sm font-medium text-purple-800">Transform Your Coaching Business</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Scale Your{' '}
              <span className="text-purple-600">Coaching</span>
              <br />Business Effortlessly
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              The all-in-one platform that helps coaches manage clients, schedule sessions, and grow their business—without the complexity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
          </div>
          
          {/* Right Content - Image */}
          <div className="relative mt-8 md:mt-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded-3xl blur-3xl opacity-30" />
            <img 
              src={heroDashboard} 
              alt="Coachly Dashboard Interface"
              className="relative rounded-3xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

