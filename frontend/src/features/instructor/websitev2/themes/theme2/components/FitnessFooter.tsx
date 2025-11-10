import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface FitnessFooterProps {
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  allSectionData?: any;
}

export const FitnessFooter: React.FC<FitnessFooterProps> = ({
  onPrivacyClick,
  onTermsClick,
  allSectionData = {}
}) => {
  const { primaryColor } = useDesignColors({ allSectionData });

  return (
    <footer className="w-full bg-gray-900 border-t border-gray-800">
      <div className="w-full px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black mb-4 text-white">
              TRANSFORM YOUR LIFE
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Join thousands of members achieving their fitness goals. Start your transformation journey today.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Programs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hello@fitness.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            {onPrivacyClick && (
              <button 
                onClick={onPrivacyClick}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
            )}
            {onTermsClick && (
              <button 
                onClick={onTermsClick}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
};
