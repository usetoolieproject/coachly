import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navigation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');

  const handleSignIn = () => {
    navigate('/login');
  };

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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
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

  // Track active section based on scroll position
  useEffect(() => {
    const sections = ['features', 'why-coachly', 'pricing', 'reviews', 'faq'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const getNavLinkClass = (sectionId: string) => {
    const isActive = activeSection === sectionId;
    return isActive 
      ? "text-purple-600 transition-colors" 
      : "text-gray-900 hover:text-purple-600 transition-colors";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="/Coachly official.png"
              alt="Coachly"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain"
              draggable="false"
            />
          </a>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" onClick={(e) => handleNavClick(e, 'features')} className={getNavLinkClass('features')}>Features</a>
            <a href="#" onClick={(e) => handleNavClick(e, 'why-coachly')} className={getNavLinkClass('why-coachly')}>Why Coachly</a>
            <a href="#" onClick={(e) => handleNavClick(e, 'pricing')} className={getNavLinkClass('pricing')}>Pricing</a>
            <a href="#" onClick={(e) => handleNavClick(e, 'reviews')} className={getNavLinkClass('reviews')}>Reviews</a>
            <a href="#" onClick={(e) => handleNavClick(e, 'faq')} className={getNavLinkClass('faq')}>FAQ's</a>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleSignIn}
              className="inline-flex text-gray-900 hover:text-white hover:bg-purple-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

