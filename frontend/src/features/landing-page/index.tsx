import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Navigation,
  Hero,
  Features,
  Comparison,
  Testimonials,
  Pricing,
  FAQ,
  CTA,
  Footer,
  BackToTop
} from './components';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading, isLoggingOut } = useAuth();

  // Force light mode while on landing page
  useEffect(() => {
    const hadDarkHtml = document.documentElement.classList.contains('dark');
    const hadDarkBody = document.body.classList.contains('dark');
    if (hadDarkHtml) document.documentElement.classList.remove('dark');
    if (hadDarkBody) document.body.classList.remove('dark');
    const prevScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = 'light';
    return () => {
      if (hadDarkHtml) document.documentElement.classList.add('dark');
      if (hadDarkBody) document.body.classList.add('dark');
      document.documentElement.style.colorScheme = prevScheme || (hadDarkHtml ? 'dark' : 'light');
    };
  }, []);

  // Handle authentication redirects
  useEffect(() => {
    if (loading || isLoggingOut) return;
    
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (currentPath !== '/') {
      return;
    }
    
    // Don't redirect if user is null (logged out)
    if (!user) {
      return;
    }
    
    // Check if user just logged out - don't redirect back to dashboard
    if (typeof window !== 'undefined') {
      const justLoggedOut = sessionStorage.getItem('justLoggedOut');
      if (justLoggedOut === 'true') {
        // Stay on landing page after logout
        console.log('🚪 Landing page: User just logged out, staying here');
        
        // Clear the flag after a short delay (user will stay logged out via logoutTimestamp)
        setTimeout(() => {
          sessionStorage.removeItem('justLoggedOut');
        }, 2000);
        return;
      }
    }
    
    if (user) {
      // On apex domain (usecoachly.com): instructors manage their business here
      // Students should not be on apex
      if (typeof window !== 'undefined') {
        const currentHost = window.location.hostname.toLowerCase();
        const parts = currentHost.split('.');
        if (parts[0] === 'www') parts.shift();
        
        // If on apex domain
        if (parts.length <= 2) {
          if (user.role === 'instructor') {
            // Instructors stay on apex - redirect to their dashboard
            navigate('/coach/dashboard', { replace: true });
            return;
          } else if (user.role === 'student') {
            // Students shouldn't be on apex
            navigate('/login', { replace: true });
            return;
          }
        }
      }

      switch (user.role) {
        case 'instructor':
          navigate('/coach/dashboard', { replace: true });
          break;
        case 'student':
          navigate('/login', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [user, loading, isLoggingOut, navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="why-coachly">
          <Comparison />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
        <section id="reviews">
          <Testimonials />
        </section>
       
        <section id="faq">
          <FAQ />
        </section>
        <CTA />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default LandingPage;

