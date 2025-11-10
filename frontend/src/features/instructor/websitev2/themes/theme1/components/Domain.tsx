import React, { useState, useEffect } from 'react';
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDomainData } from '../../../hooks/useDomainData';
import { useDesignColors } from '../../../hooks/useDesignColors';
import { useUpdateSectionData } from '../../../stores/pageBuilderStore';
import { apiFetch } from '../../../../../../../src/services/api';

interface DomainProps {
  customDomain?: string;
  subdomain?: string;
  padding?: number;
}

export const Domain: React.FC<DomainProps> = ({
  padding = 4
}) => {
  const { subdomain: currentSubdomain, customDomain: currentCustomDomain } = useDomainData();
  const { darkMode } = useDesignColors();
  const updateSectionData = useUpdateSectionData();
  
  const [editingSubdomain, setEditingSubdomain] = useState(false);
  const [subdomainValue, setSubdomainValue] = useState(currentSubdomain);
  const [isSaving, setIsSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSubdomainValue(currentSubdomain);
    // Update the store with real domain data
    updateSectionData('domain', {
      subdomain: currentSubdomain,
      customDomain: currentCustomDomain
    });
  }, [currentSubdomain, currentCustomDomain, updateSectionData]);

  // Update store whenever real data changes
  useEffect(() => {
    updateSectionData('domain', {
      subdomain: currentSubdomain,
      customDomain: currentCustomDomain
    });
  }, [currentSubdomain, currentCustomDomain, updateSectionData]);

  const isValid = (slug: string) => /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(slug);

  const checkAvailability = async (slug: string) => {
    if (!isValid(slug)) { 
      setAvailable(null); 
      return; 
    }
    setChecking(true);
    try {
      const data = await apiFetch(`/auth/check-subdomain/${encodeURIComponent(slug)}`);
      setAvailable(!!data?.available);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.replace(/[^a-z0-9-]/gi, '').toLowerCase();
    setSubdomainValue(cleanValue);
    setMessage(null);
    
    // Check availability after a short delay
    if (cleanValue && cleanValue !== currentSubdomain) {
      const timeoutId = setTimeout(() => {
        checkAvailability(cleanValue);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSaveSubdomain = async () => {
    setIsSaving(true);
    try {
      setMessage(null);
      if (!isValid(subdomainValue)) throw new Error('Invalid subdomain format');
      if (subdomainValue === currentSubdomain) { 
        setEditingSubdomain(false); 
        return; 
      }
      
      if (available === false) throw new Error('Subdomain already taken');
      
      const data = await apiFetch('/instructor/subdomain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomainValue })
      });
      
      if (!data?.success) throw new Error(data?.error || 'Failed to update subdomain');
      
      setEditingSubdomain(false);
      setMessage({ type: 'success', text: 'Subdomain updated successfully!' });
      
      // Update the store with the new subdomain
      updateSectionData('domain', {
        subdomain: subdomainValue,
        customDomain: currentCustomDomain
      });
      
    } catch (error) {
      console.error('Error saving subdomain:', error);
      setMessage({ type: 'error', text: (error as Error)?.message || 'Failed to update subdomain' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateClick = () => {
    setEditingSubdomain(true);
  };

  const handleCancel = () => {
    setSubdomainValue(currentSubdomain);
    setEditingSubdomain(false);
    setMessage(null);
  };

  return (
    <div 
      className={`rounded-xl shadow-sm border p-6 ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
      }`}
      style={{ padding: `${padding * 0.25}rem` }}
    >
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Domain Settings
      </h2>
      <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Configure your website domain and subdomain settings.
      </p>
      
      <div className="space-y-6">
        {/* Subdomain Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Subdomain
          </label>
          <div className="flex items-center w-full max-w-md">
            <input
              type="text"
              value={subdomainValue}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              placeholder="your-community"
              disabled={!editingSubdomain}
              className={`flex-1 min-w-0 px-3 py-2 border rounded-l-lg text-sm ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-300' 
                  : 'border-gray-300 bg-white text-gray-900'
              } ${!editingSubdomain ? 'opacity-60' : ''}`}
            />
            <span className={`px-2 py-2 border border-l-0 rounded-r-lg text-xs whitespace-nowrap ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}>
              .usecoachly.com
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {!editingSubdomain && (
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Your subdomain for your instructor page
              </p>
            )}
            {editingSubdomain && (
              <>
                {checking && <Loader2 className="w-3 h-3 animate-spin text-violet-500" />}
                {isValid(subdomainValue) && available === true && (
                  <span className="text-xs text-green-600 flex items-center">
                    <Check className="w-3 h-3 mr-1"/>Available
                  </span>
                )}
                {isValid(subdomainValue) && available === false && (
                  <span className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1"/>Already taken
                  </span>
                )}
                {!isValid(subdomainValue) && (
                  <span className="text-xs text-orange-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1"/>3–30 chars, letters, numbers, dashes, no edge dashes
                  </span>
                )}
              </>
            )}
          </div>
          {editingSubdomain && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleSaveSubdomain}
                disabled={isSaving || !isValid(subdomainValue) || subdomainValue === currentSubdomain || available === false}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
          {!editingSubdomain && (
            <button
              onClick={handleUpdateClick}
              className="mt-2 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Update
            </button>
          )}
        </div>

        {/* Custom Domain Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Custom Domain
          </label>
          <input
            type="text"
            value={currentCustomDomain || ''}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-300' 
                : 'border-gray-300 bg-white text-gray-900'
            } opacity-60`}
            placeholder="Enter your custom domain..."
            disabled
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Custom domain setup coming soon
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
            message.type === 'success' 
              ? (darkMode 
                  ? 'bg-green-900/30 border-green-700 text-green-100' 
                  : 'bg-green-100 border-green-300 text-green-800')
              : (darkMode 
                  ? 'bg-red-900/30 border-red-700 text-red-100' 
                  : 'bg-red-100 border-red-300 text-red-800')
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Publication Status */}
        <div className={`border-t pt-6 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Publication Status
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Make your website public
              </p>
            </div>
            <div className="flex items-center">
              <span className={`flex items-center text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Lock className="w-4 h-4 mr-1" />
                Draft
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};