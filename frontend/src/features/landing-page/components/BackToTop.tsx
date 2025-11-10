import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-white text-gray-700 p-2.5 sm:p-3 rounded-full shadow-lg hover:shadow-xl border border-gray-200 hover:border-purple-400 hover:text-purple-600 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm"
          aria-label="Back to top"
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </>
  );
};

export default BackToTop;

