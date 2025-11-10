import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { websiteService } from '../../../../services/websiteService';
import { PrivacySection } from '../themes/theme1/components/PrivacySection';
import { TermsSection } from '../themes/theme1/components/TermsSection';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
  subdomain: string;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
  type,
  subdomain
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    if (isOpen && subdomain) {
      loadContent();
    }
  }, [isOpen, type, subdomain]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll just use the static components
      // In the future, you could fetch published content from the backend
      setContent({});
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="bg-gray-50">
              {type === 'privacy' ? (
                <div className="py-4 px-4 sm:px-6">
                  <PrivacySection />
                </div>
              ) : (
                <div className="py-4 px-4 sm:px-6">
                  <TermsSection />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

