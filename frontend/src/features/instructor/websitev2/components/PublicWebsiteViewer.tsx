import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../../contexts/TenantContext';
import { Theme1Preview } from '../themes/theme1/Theme1Preview';
import { Theme2Preview } from '../themes/theme2/Theme2Preview';
import { StartFromScratchPreview } from '../themes/start-from-scratch/StartFromScratchPreview';
import { websiteService } from '../../../../services/websiteService';
import { UrlInvitePage } from '../../../student/website';
import { PrivacyTermsModal } from './PrivacyTermsModal';

interface PublicWebsiteViewerProps {}

export const PublicWebsiteViewer: React.FC<PublicWebsiteViewerProps> = () => {
  const { slug: subdomain } = useTenant();
  const [websiteConfig, setWebsiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'privacy' | 'terms'>('privacy');

  const handlePrivacyClick = () => {
    setModalType('privacy');
    setModalOpen(true);
  };

  const handleTermsClick = () => {
    setModalType('terms');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (subdomain) {
      loadWebsiteConfiguration();
    }
  }, [subdomain]);

  const loadWebsiteConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      
      // Load the public website configuration for this subdomain
      const config = await websiteService.loadPublicWebsiteConfiguration(subdomain!);
      
      if (config) {
        setWebsiteConfig(config);
        // [Public DEBUG] log removed.
      } else {
        setError('Website not found or not published');
      }
    } catch (error) {
      setError('Website not found or not published');
    } finally {
      setLoading(false);
    }
  };

  // Apply dark mode based on website configuration
  useEffect(() => {
    if (websiteConfig?.sectionData?.design?.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = '';
    };
  }, [websiteConfig?.sectionData?.design?.darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website...</p>
          <p className="text-sm text-gray-500 mt-2">Using new websitev2 system for: {subdomain}</p>
        </div>
      </div>
    );
  }

  if (error || !websiteConfig) {
    // If no websitev2 configuration found, fall back to the old website system
    return <UrlInvitePage />;
  }

  return (
    <>
      <PrivacyTermsModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        type={modalType}
        subdomain={subdomain || ''}
      />
      
      <div className="min-h-screen bg-white">
        {/* Website Content - Full Width, No Preview Elements */}
        <div className="w-full">
          {(() => {
            const themeId = websiteConfig.themeId;
            const commonProps = {
              sectionData: websiteConfig.sectionData || {},
              addedSections: websiteConfig.addedSections || [],
              selectedSection: undefined,
              isEditable: false, // Not editable in public view
              onSelectSection: () => {}, // No selection for public view
              onHeightChange: () => {}, // No height changes for public view
            };

            // Render the appropriate theme preview based on themeId
            if (themeId === 'fitness-trainer') {
              return (
                <Theme2Preview
                  {...commonProps}
                  publicViewData={{
                    instructorId: websiteConfig.instructorId,
                    communityId: websiteConfig.communityId,
                    subdomain: subdomain || undefined
                  }}
                  onPrivacyClick={handlePrivacyClick}
                  onTermsClick={handleTermsClick}
                />
              );
            } else if (themeId === 'start-from-scratch') {
              return <StartFromScratchPreview {...commonProps} />;
            } else {
              // Default to Theme1Preview for 'professional-coach' and backward compatibility
              return (
                <Theme1Preview
                  {...commonProps}
                  publicViewData={{
                    instructorId: websiteConfig.instructorId,
                    communityId: websiteConfig.communityId,
                    subdomain: subdomain || undefined
                  }}
                  onPrivacyClick={handlePrivacyClick}
                  onTermsClick={handleTermsClick}
                />
              );
            }
          })()}
        </div>
      </div>
    </>
  );
};
