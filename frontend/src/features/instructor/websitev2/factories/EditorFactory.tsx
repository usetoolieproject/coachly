import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getSectionConfig } from '../config/themeConfig';
import { Plus, Trash2, Check, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { usePageBuilderStoreState, useUpdateSectionData } from '../stores/pageBuilderStore';
import { useDomainData } from '../hooks/useDomainData';

interface EditorFactoryProps {
  themeId: string;
  sectionId: string;
  onClose: () => void;
}

export const EditorFactory: React.FC<EditorFactoryProps> = ({
  themeId,
  sectionId,
  onClose
}) => {
  const { isDarkMode } = useTheme();
  
  // Zustand store
  const { sectionData } = usePageBuilderStoreState();
  const updateSectionData = useUpdateSectionData();
  const currentSectionData = sectionData[sectionId] || {};
  
  // Get real domain data for domain section
  const domainData = useDomainData();
  
  // For domain section, use real data instead of store data
  const effectiveSectionData = sectionId === 'domain' ? {
    ...currentSectionData,
    subdomain: domainData.subdomain,
    customDomain: domainData.customDomain
  } : currentSectionData;
  
  
  
  
  const [arrayItems, setArrayItems] = useState<any[]>([]);
  const [isEditingSubdomain, setIsEditingSubdomain] = useState(false);
  const [subdomainValue, setSubdomainValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize subdomain value when domain section is selected
  useEffect(() => {
    if (sectionId === 'domain') {
      setSubdomainValue(domainData.subdomain);
    }
  }, [sectionId, domainData.subdomain]);

  // Domain-specific functions
  const isValid = (slug: string) => /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(slug);

  const checkAvailability = async (slug: string) => {
    if (!isValid(slug)) { 
      setAvailable(null); 
      return; 
    }
    setChecking(true);
    try {
      const { apiFetch } = await import('../../../../services/api');
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
    if (cleanValue && cleanValue !== domainData.subdomain) {
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
      if (subdomainValue === domainData.subdomain) { 
        setIsEditingSubdomain(false); 
        return; 
      }
      
      if (available === false) throw new Error('Subdomain already taken');
      
      const { apiFetch } = await import('../../../../services/api');
      const data = await apiFetch('/instructor/subdomain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomainValue })
      });
      
      if (!data?.success) throw new Error(data?.error || 'Failed to update subdomain');
      
      setIsEditingSubdomain(false);
      setMessage({ type: 'success', text: 'Subdomain updated successfully!' });
      
      // Update the store with the new subdomain
      updateSectionData('domain', {
        subdomain: subdomainValue,
        customDomain: domainData.customDomain
      });
      
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error)?.message || 'Failed to update subdomain' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateClick = () => {
    setIsEditingSubdomain(true);
  };

  const handleCancel = () => {
    setSubdomainValue(domainData.subdomain);
    setIsEditingSubdomain(false);
    setMessage(null);
  };

  // Define baseInputClass at component level
  const baseInputClass = `w-full px-3 py-2 rounded-lg border ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  } focus:outline-none focus:ring-2 focus:ring-purple-500`;

  const sectionConfig = getSectionConfig(themeId, sectionId);
  
  if (!sectionConfig) {
    return (
      <div className={`w-80 border-l ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex flex-col h-full`}>
        <div className="p-4">
          <p className="text-red-500">Section configuration not found</p>
        </div>
      </div>
    );
  }

  // Initialize array items when section data changes
  useEffect(() => {
    if (sectionId === 'transformation-gallery' && effectiveSectionData.transformations && Array.isArray(effectiveSectionData.transformations)) {
      // Limit to 3 for transformation gallery
      setArrayItems(effectiveSectionData.transformations.slice(0, 3));
    } else if (sectionId === 'workout-plans' && effectiveSectionData.plans && Array.isArray(effectiveSectionData.plans)) {
      setArrayItems(effectiveSectionData.plans);
    } else if (effectiveSectionData.aboutFeatures && Array.isArray(effectiveSectionData.aboutFeatures)) {
      setArrayItems(effectiveSectionData.aboutFeatures);
    } else if (effectiveSectionData.testimonials && Array.isArray(effectiveSectionData.testimonials)) {
      // Limit to 3 for fitness-trainer testimonials
      if (themeId === 'fitness-trainer') {
        setArrayItems(effectiveSectionData.testimonials.slice(0, 3));
      } else {
      setArrayItems(effectiveSectionData.testimonials);
      }
    } else if (effectiveSectionData.credentials && Array.isArray(effectiveSectionData.credentials)) {
      // Handle credentials array - ensure it's an array of strings
      setArrayItems(effectiveSectionData.credentials.map((cred: any) => 
        typeof cred === 'string' ? cred : (cred?.name || cred?.text || String(cred))
      ));
    } else if (sectionId === 'about-join-combined' && (!effectiveSectionData.aboutFeatures || !Array.isArray(effectiveSectionData.aboutFeatures))) {
      // Set default values if none exist
      setArrayItems([
        "Comprehensive courses with lifetime access",
        "Active community with 24/7 peer support", 
        "Regular live Q&A sessions and coaching calls",
        "Exclusive resources and member-only content"
      ]);
    } else if (sectionId === 'testimonials' && (!effectiveSectionData.testimonials || !Array.isArray(effectiveSectionData.testimonials))) {
      // Set default testimonials if none exist
      setArrayItems([
        {
          id: '1',
          studentName: 'Sarah M.',
          quote: 'This platform has transformed my learning journey. The support and resources are incredible!'
        },
        {
          id: '2', 
          studentName: 'Mike T.',
          quote: 'Best investment I\'ve made in my education. The courses are top-notch and the community is amazing.'
        },
        {
          id: '3',
          studentName: 'Emma L.',
          quote: 'I\'ve learned more here in 3 months than I did in years of self-study. Highly recommended!'
        }
      ]);
    } else if (sectionId === 'trainer-about' && (!effectiveSectionData.credentials || !Array.isArray(effectiveSectionData.credentials))) {
      // Set default credentials for trainer-about if none exist
      setArrayItems([
        'NASM Certified',
        'CPR Certified',
        'Nutrition Specialist'
      ]);
    } else if (sectionId === 'workout-plans' && (!effectiveSectionData.plans || !Array.isArray(effectiveSectionData.plans))) {
      // Set default plans for workout-plans if none exist
      setArrayItems([
        {
          id: '1',
          name: 'Beginner',
          description: 'Perfect for those just starting out',
          price: 49,
          isFree: false,
          features: ['4 week program', 'Basic nutrition guide', 'Email support']
        }
      ]);
    } else if (sectionId === 'transformation-gallery' && (!effectiveSectionData.transformations || !Array.isArray(effectiveSectionData.transformations))) {
      // Set default transformations for transformation-gallery if none exist
      setArrayItems([]);
    } else {
      // Reset arrayItems if no matching data
      setArrayItems([]);
    }
  }, [sectionId, themeId, effectiveSectionData.aboutFeatures, effectiveSectionData.testimonials, effectiveSectionData.credentials, effectiveSectionData.plans, effectiveSectionData.transformations]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    // Update Zustand store directly
    updateSectionData(sectionId, {
      ...effectiveSectionData,
      [fieldId]: value
    });
  }, [updateSectionData, sectionId, effectiveSectionData]);

  const handleArrayAdd = useCallback((fieldId: string) => {
    // Check if fitness-trainer theme testimonials (limit to 3)
    const isFitnessTestimonials = fieldId === 'testimonials' && themeId === 'fitness-trainer';
    
    if (fieldId === 'transformations' && sectionId === 'transformation-gallery') {
      if (arrayItems.length >= 3) {
        return; // Max 3 items
      }
      const newTransformation = {
        id: `transformation-${Date.now()}`,
        beforeImage: '',
        afterImage: '',
        clientName: '',
        results: ''
      };
      const newItems = [...arrayItems, newTransformation];
      setArrayItems(newItems);
      handleFieldChange(fieldId, newItems);
    } else if (isFitnessTestimonials) {
      if (arrayItems.length >= 3) {
        return; // Max 3 testimonials for fitness
      }
      const newTestimonial = {
        id: `testimonial-${Date.now()}`,
        clientName: '',
        quote: '',
        results: ''
      };
      const newItems = [...arrayItems, newTestimonial];
      setArrayItems(newItems);
      handleFieldChange(fieldId, newItems);
    } else if (fieldId === 'plans' && sectionId === 'workout-plans') {
      // For workout plans, add a properly structured object
      const newPlan = {
        id: `plan-${Date.now()}`,
        name: 'New Plan',
        description: '',
        price: 0,
        isFree: false,
        features: []
      };
      const newItems = [...arrayItems, newPlan];
      setArrayItems(newItems);
      handleFieldChange(fieldId, newItems);
    } else {
    const newItems = [...arrayItems, 'New item'];
    setArrayItems(newItems);
      // Always save as array of strings for simple arrays like credentials
      if (fieldId === 'credentials' || fieldId === 'aboutFeatures') {
        handleFieldChange(fieldId, newItems.filter(item => typeof item === 'string' || !item));
      } else {
    handleFieldChange(fieldId, newItems);
      }
    }
  }, [arrayItems, handleFieldChange, sectionId]);

  const handleArrayRemove = useCallback((fieldId: string, index: number) => {
    const newItems = arrayItems.filter((_, i) => i !== index);
    setArrayItems(newItems);
    // Always save as array of strings for simple arrays like credentials
    if (fieldId === 'credentials' || fieldId === 'aboutFeatures') {
      handleFieldChange(fieldId, newItems.filter(item => typeof item === 'string' || !item));
    } else {
    handleFieldChange(fieldId, newItems);
    }
  }, [arrayItems, handleFieldChange]);

  const handleArrayItemChange = useCallback((fieldId: string, index: number, value: string) => {
    const newItems = [...arrayItems];
    newItems[index] = value;
    setArrayItems(newItems);
    // Always save as array of strings for simple arrays like credentials
    if (fieldId === 'credentials' || fieldId === 'aboutFeatures') {
      handleFieldChange(fieldId, newItems.filter(item => typeof item === 'string' || !item));
    } else {
    handleFieldChange(fieldId, newItems);
    }
  }, [arrayItems, handleFieldChange]);

  const renderField = (field: any) => {
    const { id, type, label, placeholder, options, validation } = field;
    // Get value - for whats-included checkboxes, default to true if undefined
    let value = effectiveSectionData[id];
    if (type === 'checkbox' && value === undefined) {
      if (sectionId === 'whats-included' && themeId === 'fitness-trainer') {
        value = true; // Default checkboxes to checked for whats-included
      } else {
        value = false;
      }
    } else if (value === undefined) {
      value = '';
    }


    switch (type) {
      case 'text':
        // Special handling for domain section
        if (sectionId === 'domain' && id === 'subdomain') {
          return (
            <div>
              <div className="flex items-center w-full max-w-md">
                <input
                  type="text"
                  value={subdomainValue}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="your-community"
                  disabled={!isEditingSubdomain}
                  className={`flex-1 min-w-0 px-3 py-2 border rounded-l-lg text-sm ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-300' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } ${!isEditingSubdomain ? 'opacity-60' : ''}`}
                />
                <span className={`px-2 py-2 border border-l-0 rounded-r-lg text-xs whitespace-nowrap ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300' 
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}>
                  .usecoachly.com
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {!isEditingSubdomain && (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Your subdomain for your instructor page
                  </p>
                )}
                {isEditingSubdomain && (
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
              {isEditingSubdomain && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSaveSubdomain}
                    disabled={isSaving || !isValid(subdomainValue) || subdomainValue === domainData.subdomain || available === false}
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
              {!isEditingSubdomain && (
                <button
                  onClick={handleUpdateClick}
                  className="mt-2 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Update
                </button>
              )}
            </div>
          );
        }
        
        // Special handling for custom domain field
        if (sectionId === 'domain' && id === 'customDomain') {
          return (
            <div>
              <input
                type="text"
                value={domainData.customDomain || ''}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-300' 
                    : 'border-gray-300 bg-white text-gray-900'
                } opacity-60`}
                placeholder="Enter your custom domain..."
                disabled
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Custom domain setup coming soon
              </p>
            </div>
          );
        }
        
        // Regular text input for other fields
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            maxLength={validation?.maxLength}
            required={validation?.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`${baseInputClass} resize-none`}
            maxLength={validation?.maxLength}
            required={validation?.required}
          />
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    handleFieldChange(id, result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {value ? (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-green-600">✓ Image uploaded successfully</div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange(id, '')}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Remove Image
                  </button>
                </div>
                <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={value} 
                    alt="Uploaded banner" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-500">
                No image uploaded. The background color will be used instead.
              </div>
            )}
          </div>
        );

      case 'color':
        return (
          <div className="flex space-x-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              placeholder={placeholder || '#000000'}
              className={`flex-1 ${baseInputClass}`}
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            className={baseInputClass}
          >
            {options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'array':
        // Special handling for transformation gallery array
        if (id === 'transformations' && sectionId === 'transformation-gallery') {
          return (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Maximum 3 transformations</span>
                <button
                  onClick={() => {
                    if (arrayItems.length >= 3) {
                      alert('Maximum 3 transformations allowed');
                      return;
                    }
                    const newItem = {
                      id: `transformation-${Date.now()}`,
                      beforeImage: '',
                      afterImage: '',
                      clientName: '',
                      results: ''
                    };
                    const currentItems = Array.isArray(arrayItems) ? arrayItems : [];
                    const newItems = [...currentItems, newItem];
                    setArrayItems(newItems);
                    handleFieldChange(id, newItems);
                  }}
                  disabled={arrayItems.length >= 3}
                  className={`text-sm flex items-center gap-1 ${
                    arrayItems.length >= 3 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Transformation
                </button>
              </div>
              <div className="space-y-4">
                {arrayItems.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Before Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const result = e.target?.result as string;
                                const newItems = [...arrayItems];
                                newItems[index] = { ...(newItems[index] || {}), beforeImage: result };
                                setArrayItems(newItems);
                                handleFieldChange(id, newItems);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {item?.beforeImage && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-green-600">✓ Image uploaded</div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...arrayItems];
                                  newItems[index] = { ...(newItems[index] || {}), beforeImage: '' };
                                  setArrayItems(newItems);
                                  handleFieldChange(id, newItems);
                                }}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={item.beforeImage} 
                                alt="Before" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          After Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const result = e.target?.result as string;
                                const newItems = [...arrayItems];
                                newItems[index] = { ...(newItems[index] || {}), afterImage: result };
                                setArrayItems(newItems);
                                handleFieldChange(id, newItems);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {item?.afterImage && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-green-600">✓ Image uploaded</div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...arrayItems];
                                  newItems[index] = { ...(newItems[index] || {}), afterImage: '' };
                                  setArrayItems(newItems);
                                  handleFieldChange(id, newItems);
                                }}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={item.afterImage} 
                                alt="After" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Name (optional)
                        </label>
                        <input
                          type="text"
                          value={item?.clientName || ''}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { ...(newItems[index] || {}), clientName: e.target.value };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          placeholder="Client name..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Results (optional)
                        </label>
                        <input
                          type="text"
                          value={item?.results || ''}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { ...(newItems[index] || {}), results: e.target.value };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          placeholder="e.g., Lost 30 lbs"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleArrayRemove(id, index)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        // Special handling for workout plans array
        if (id === 'plans' && sectionId === 'workout-plans') {
          return (
            <div>
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={() => {
                    const newItem = {
                      id: `plan-${Date.now()}`,
                      name: 'New Plan',
                      description: '',
                      price: 0,
                      isFree: false,
                      features: []
                    };
                    const currentPlans = Array.isArray(arrayItems) ? arrayItems : [];
                    const newItems = [...currentPlans, newItem];
                    setArrayItems(newItems);
                    handleFieldChange(id, newItems);
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </button>
              </div>
              <div className="space-y-4">
                {arrayItems.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          value={item?.name || ''}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { ...(newItems[index] || {}), name: e.target.value };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          placeholder="Enter plan name..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={item?.isFree === true}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { ...(newItems[index] || {}), isFree: e.target.checked, price: e.target.checked ? 0 : (newItems[index]?.price || 0) };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Free Plan
                        </label>
                      </div>
                      {!item?.isFree && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (number only)
                          </label>
                          <input
                            type="number"
                            value={item?.price || ''}
                            onChange={(e) => {
                              const newItems = [...arrayItems];
                              newItems[index] = { ...(newItems[index] || {}), price: parseFloat(e.target.value) || 0 };
                              setArrayItems(newItems);
                              handleFieldChange(id, newItems);
                            }}
                            placeholder="49"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item?.description || ''}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { ...(newItems[index] || {}), description: e.target.value };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          placeholder="Enter plan description..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleArrayRemove(id, index)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        // Special handling for testimonials array
        if (id === 'testimonials') {
          // Check if this is fitness-trainer theme (limit to 3)
          const isFitnessTrainer = sectionId === 'testimonials' && themeId === 'fitness-trainer';
          const maxItems = isFitnessTrainer ? 3 : undefined;
          
          return (
            <div>
              <div className="flex items-center justify-between mb-2">
                {maxItems && (
                  <span className="text-xs text-gray-500">Maximum {maxItems} testimonials</span>
                )}
                <button
                  onClick={() => {
                    if (maxItems && arrayItems.length >= maxItems) {
                      alert(`Maximum ${maxItems} testimonials allowed`);
                      return;
                    }
                    handleArrayAdd(id);
                  }}
                  disabled={maxItems ? arrayItems.length >= maxItems : false}
                  className={`text-sm flex items-center gap-1 ${
                    maxItems && arrayItems.length >= maxItems
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </button>
              </div>
              <div className="space-y-4">
                {arrayItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isFitnessTrainer ? 'Client Name' : 'Student Name'}
                        </label>
                        <input
                          type="text"
                          value={(item as any)?.clientName || (item as any)?.studentName || ''}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { 
                              ...(newItems[index] as any || {}), 
                              ...(isFitnessTrainer ? { clientName: e.target.value } : { studentName: e.target.value })
                            };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          placeholder={isFitnessTrainer ? "Enter client name..." : "Enter student name..."}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Testimonial Quote
                        </label>
                        <textarea
                          value={(item as any)?.quote || ''}
                          onChange={(e) => {
                            const newItems = [...arrayItems];
                            newItems[index] = { ...(newItems[index] as any || {}), quote: e.target.value };
                            setArrayItems(newItems);
                            handleFieldChange(id, newItems);
                          }}
                          placeholder="Enter testimonial quote..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      {isFitnessTrainer && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Results (optional)
                          </label>
                          <input
                            type="text"
                            value={(item as any)?.results || ''}
                            onChange={(e) => {
                              const newItems = [...arrayItems];
                              newItems[index] = { ...(newItems[index] as any || {}), results: e.target.value };
                              setArrayItems(newItems);
                              handleFieldChange(id, newItems);
                            }}
                            placeholder="e.g., Lost 30 lbs"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleArrayRemove(id, index)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        // Default array handling for simple string arrays (like credentials)
        return (
          <div>
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={() => handleArrayAdd(id)}
                className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            <div className="space-y-2">
              {arrayItems.map((item, index) => {
                // Ensure we always have a string value for display and editing
                const itemValue = typeof item === 'string' 
                  ? item 
                  : (item?.name || item?.text || item?.title || String(item) || '');
                
                return (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                      value={itemValue}
                    onChange={(e) => handleArrayItemChange(id, index, e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 ${baseInputClass}`}
                  />
                  {arrayItems.length > 1 && (
                    <button
                      onClick={() => handleArrayRemove(id, index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options?.map((option: any) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(id, e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleFieldChange(id, e.target.checked)}
              className="text-purple-600 focus:ring-purple-500 rounded"
            />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </span>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className={`w-80 border-l ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex flex-col h-full`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Edit Section
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
              {sectionConfig.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sectionConfig.editorFields.map((field) => {
          
          // Check if field should be shown based on conditional logic
          let shouldShowField = true;
          
          if (field.condition) {
            // Handle new condition format like 'editorMode === "about"'
            const editorMode = effectiveSectionData.editorMode || 'about';
            if (field.condition === 'editorMode === "about"') {
              shouldShowField = editorMode === 'about';
            } else if (field.condition === 'editorMode === "join"') {
              shouldShowField = editorMode === 'join';
            }
          } else if (field.conditional) {
            // Handle old conditional format
            shouldShowField = effectiveSectionData[field.conditional.field] === field.conditional.value;
          }
          
          if (!shouldShowField) {
            return null;
          }
          
          
          return (
            <div key={field.id}>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {field.label}
                {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          );
        })}


        {/* Message Display for Domain Section */}
        {sectionId === 'domain' && message && (
          <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
            message.type === 'success' 
              ? (isDarkMode 
                  ? 'bg-green-900/30 border-green-700 text-green-100' 
                  : 'bg-green-100 border-green-300 text-green-800')
              : (isDarkMode 
                  ? 'bg-red-900/30 border-red-700 text-red-100' 
                  : 'bg-red-100 border-red-300 text-red-800')
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
            <span className="font-medium">{message.text}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-2">
          <button
            onClick={() => updateSectionData(sectionId, sectionConfig.defaultData)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
