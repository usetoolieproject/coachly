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
          
          <div className="flex justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

