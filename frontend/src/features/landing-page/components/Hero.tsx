import { ArrowRight, Play, Sparkles, Calendar, Users, Zap, X } from 'lucide-react';
import { useState } from 'react';
import heroDashboard from '/landing-page.png';

const Hero = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  const handleWatchDemo = () => {
    setShowVideoModal(true);
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
  };

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-100 rounded-full border border-purple-200 shadow-sm">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse-slow" />
              <span className="text-xs sm:text-sm font-medium text-purple-800">New: All-in-One Coaching OS</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Run Your Entire{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Coaching Business</span>
              {' '}From One Platform
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              Coachly replaces 5–7 tools with one simple dashboard — courses, clients, sessions, payments, and community. No tech headaches.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleWatchDemo}
                className="bg-white border-2 border-purple-200 text-purple-600 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg hover:border-purple-300 transition-all duration-300 flex items-center justify-center group"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Watch Demo (1 min)
              </button>
            </div>

            <p className="text-sm text-gray-500">No credit card needed · Free to try</p>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <span className="text-sm text-gray-600">Trusted by <span className="font-semibold">Coaches & Course Creators</span></span>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Unlimited Courses</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Scheduling</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Community</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Payments</span>
              </div>
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

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Video Player */}
            <div className="relative pt-[56.25%]">
              <video
                className="absolute top-0 left-0 w-full h-full"
                controls
                autoPlay
                src="/demo.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;

