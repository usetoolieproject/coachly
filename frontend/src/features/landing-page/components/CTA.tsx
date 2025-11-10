const CTA = () => {
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
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-gray-900">
            Launch your next course in{' '}
            <span className="text-purple-600">days, not weeks</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Everything you need to create, sell, and deliver — fast.
          </p>
          
          <div className="flex justify-center mb-6 sm:mb-8">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

