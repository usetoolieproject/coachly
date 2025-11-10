import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 text-center">
          {/* Brand */}
          <h3 className="text-xl sm:text-2xl font-bold text-purple-600">
            Coachly
          </h3>
          
          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm">
            <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</Link>
            <Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">Terms</Link>
          </nav>
          
          {/* Copyright */}
          <p className="text-xs sm:text-sm text-gray-600">
            © 2025 Coachly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

