import React, { useState } from 'react';
import { 
  Home, 
  Building, 
  Users, 
  Plus,
  X,
  ShoppingCart,
  Shield,
  FileText,
  Globe,
  Gift,
  MessageSquare,
  Globe2,
  Video,
  GripVertical,
  Lock
} from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useSelectedTheme } from '../stores/pageBuilderStore';
import { usePageBuilderStoreState, useAddSection, useRemoveSection, useSetSelectedPageType, useReorderSections, useSetSelectedSection, useUpdateSectionData } from '../stores/pageBuilderStore';
import { useSubscriptionPlan } from '../../../../hooks/useSubscriptionPlan';

interface BuilderSidebarProps {
  onSave: () => void;
  saving: boolean;
}

export const BuilderSidebar: React.FC<BuilderSidebarProps> = () => {
  const { isDarkMode } = useTheme();
  const selectedTheme = useSelectedTheme();
  const { isPro, isLoading: isLoadingPlan } = useSubscriptionPlan();
  
  // Zustand store
  const { addedSections, selectedPageType, sectionData } = usePageBuilderStoreState();
  const addSection = useAddSection();
  const removeSection = useRemoveSection();
  const setSelectedPageType = useSetSelectedPageType();
  const reorderSections = useReorderSections();
  const setSelectedSection = useSetSelectedSection();
  const updateSectionData = useUpdateSectionData();
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedSubSection, setDraggedSubSection] = useState<string | null>(null);
  const [dragOverSubSection, setDragOverSubSection] = useState<string | null>(null);
  
  const pageTypes = [
    { id: 'sales-page', name: 'Sales Page', icon: ShoppingCart },
    { id: 'privacy-policy', name: 'Privacy Policy', icon: Shield },
    { id: 'terms-of-service', name: 'Terms of Service', icon: FileText }
  ];

  const getSectionsForPageType = (pageType: string) => {
    // Fitness Trainer theme has different section ordering
    if (selectedTheme === 'fitness-trainer' && pageType === 'sales-page') {
      return [
        { id: 'hero', name: 'Fitness Hero', icon: Home, isAdded: addedSections.includes('hero') },
        { id: 'banner', name: 'Fitness Banner', icon: Gift, isAdded: addedSections.includes('banner') },
        { id: 'trainer-about', name: 'About Trainer', icon: Users, isAdded: addedSections.includes('trainer-about') },
        { id: 'workout-plans', name: 'Workout Plans', icon: Building, isAdded: addedSections.includes('workout-plans') },
        { id: 'video', name: 'Video', icon: Video, isAdded: addedSections.includes('video') },
        { id: 'transformation-gallery', name: 'Transformation Gallery', icon: Gift, isAdded: addedSections.includes('transformation-gallery') },
        { id: 'testimonials', name: 'Testimonials', icon: MessageSquare, isAdded: addedSections.includes('testimonials') },
        { id: 'whats-included', name: "What's Included", icon: Building, isAdded: addedSections.includes('whats-included') },
        { id: 'design', name: 'Design', icon: Home, isAdded: false, isSpecial: true },
        { id: 'domain', name: 'Domain', icon: Globe2, isAdded: false, isSpecial: true }
      ];
    }
    
    switch (pageType) {
      case 'sales-page':
        return [
          { id: 'banner', name: 'Banner', icon: Gift, isAdded: addedSections.includes('banner') },
          { id: 'offer-box', name: 'Offer Box', icon: Gift, isAdded: addedSections.includes('offer-box') },
          { id: 'about-join-combined', name: 'About + Join Community', icon: Users, isAdded: addedSections.includes('about-join-combined'), isCombined: true },
          { id: 'video', name: 'Video', icon: Video, isAdded: addedSections.includes('video') },
          { id: 'whats-included', name: "What's Included", icon: Building, isAdded: addedSections.includes('whats-included') },
          { id: 'testimonials', name: 'Testimonials', icon: MessageSquare, isAdded: addedSections.includes('testimonials') },
          { id: 'design', name: 'Design', icon: Home, isAdded: false, isSpecial: true },
          { id: 'domain', name: 'Domain', icon: Globe2, isAdded: false, isSpecial: true }
        ];
      case 'privacy-policy':
        return [
          { id: 'privacy-section', name: 'Privacy Section', icon: Shield, isAdded: true, isStatic: true }
        ];
      case 'terms-of-service':
        return [
          { id: 'terms-section', name: 'Terms Section', icon: FileText, isAdded: true, isStatic: true }
        ];
      default:
        return [
          { id: 'hero', name: 'Hero Section', icon: Home, isAdded: addedSections.includes('hero') },
          { id: 'features', name: 'Features Section', icon: Building, isAdded: addedSections.includes('features') },
          { id: 'testimonials', name: 'Testimonials Section', icon: MessageSquare, isAdded: addedSections.includes('testimonials') },
          { id: 'about-join-combined', name: 'About + Join Community', icon: Users, isAdded: addedSections.includes('about-join-combined'), isCombined: true },
          { id: 'banner', name: 'Banner Section', icon: Gift, isAdded: addedSections.includes('banner') },
          { id: 'footer', name: 'Footer Section', icon: Globe2, isAdded: addedSections.includes('footer') }
        ];
    }
  };

  const allSections = getSectionsForPageType(selectedPageType);
  
  // Reorder sections to show added sections in their current order first, then unadded sections
  const currentSections = [
    // First show added sections in their current order
    ...addedSections.map(sectionId => 
      allSections.find(section => section.id === sectionId)
    ).filter((section): section is NonNullable<typeof section> => Boolean(section)),
    // Then show unadded sections in their original order
    ...allSections.filter(section => !addedSections.includes(section.id))
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    // Only allow dropping on added sections
    const targetSection = currentSections[index];
    if (targetSection?.isAdded) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragOverIndex(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      // Only allow reordering within added sections
      const draggedSection = currentSections[draggedIndex];
      const dropSection = currentSections[dropIndex];
      
      if (draggedSection?.isAdded && dropSection?.isAdded) {
        // Find the actual indices in the addedSections array
        const draggedAddedIndex = addedSections.indexOf(draggedSection.id);
        const dropAddedIndex = addedSections.indexOf(dropSection.id);
        
        if (draggedAddedIndex !== -1 && dropAddedIndex !== -1) {
          reorderSections(draggedAddedIndex, dropAddedIndex);
        }
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Sub-section drag and drop handlers
  const handleSubSectionDragStart = (e: React.DragEvent, subSection: string) => {
    setDraggedSubSection(subSection);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleSubSectionDragOver = (e: React.DragEvent, subSection: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSubSection(subSection);
  };

  const handleSubSectionDragLeave = () => {
    setDragOverSubSection(null);
  };

  const handleSubSectionDrop = (e: React.DragEvent, dropSubSection: string) => {
    e.preventDefault();
    
    if (draggedSubSection && draggedSubSection !== dropSubSection) {
      const currentData = sectionData['about-join-combined'] || {};
      const newPosition = dropSubSection === 'about' ? 'about-left' : 'join-left';
      updateSectionData('about-join-combined', {
        ...currentData,
        position: newPosition
      });
    }
    
    setDraggedSubSection(null);
    setDragOverSubSection(null);
  };

  const handleSubSectionDragEnd = () => {
    setDraggedSubSection(null);
    setDragOverSubSection(null);
  };

  return (
    <div className="w-80 h-full flex-shrink-0">
      <div className={`rounded-xl shadow-sm border p-3 sm:p-4 h-full flex flex-col ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Website Builder
        </h2>

        {/* Page Type Selector */}
        <div className="mb-3 sm:mb-4">
          <h3 className={`text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Page Type
          </h3>
          <div className="flex space-x-2">
            {pageTypes.map((pageType) => (
              <button
                key={pageType.id}
                className={`
                  flex-1 p-2 transition-all cursor-pointer text-center whitespace-nowrap text-xs
                  ${selectedPageType === pageType.id
                    ? 'text-purple-600 font-semibold'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-purple-400'
                      : 'text-gray-600 hover:text-purple-600'
                  }
                `}
                onClick={() => setSelectedPageType(pageType.id)}
              >
                {pageType.name}
              </button>
            ))}
          </div>
        </div>

        {/* Available Sections - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <h3 className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Available Sections
            </h3>
            <div className="space-y-1.5">
              {currentSections.map((section, index) => (
                ('isCombined' in section && section.isCombined) && section.isAdded ? (
                  // Special rendering for combined section
                <div
                  key={section.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  className={`
                      rounded-lg border transition-all cursor-pointer
                      ${isDarkMode
                        ? 'border-green-600 bg-green-900/20'
                        : 'border-green-200 bg-green-50'
                      }
                      ${draggedIndex === index ? 'opacity-50' : ''}
                      ${dragOverIndex === index ? 'border-blue-500 bg-blue-50' : ''}
                    `}
                  >
                    {/* Combined section header */}
                    <div className="p-2.5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {section.isAdded && (
                            <div className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className={`
                            p-2 rounded-lg
                            ${isDarkMode
                              ? 'bg-green-800 text-green-300'
                              : 'bg-green-100 text-green-600'
                            }
                          `}>
                            <section.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={`font-medium text-sm ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {section.name}
                            </h4>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(section.id);
                          }}
                          className={`p-1 rounded-full transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' 
                              : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                          }`}
                          title="Remove section"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Two-column layout */}
                    <div className="p-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        {(() => {
                          const currentData = sectionData['about-join-combined'] || {};
                          const position = currentData.position || 'about-left';
                          const isAboutLeft = position === 'about-left';
                          
                          return (
                            <>
                              {/* Left column */}
                              <div 
                                draggable={true}
                                onDragStart={(e) => handleSubSectionDragStart(e, isAboutLeft ? 'about' : 'join')}
                                onDragOver={(e) => handleSubSectionDragOver(e, isAboutLeft ? 'about' : 'join')}
                                onDragLeave={handleSubSectionDragLeave}
                                onDrop={(e) => handleSubSectionDrop(e, isAboutLeft ? 'about' : 'join')}
                                onDragEnd={handleSubSectionDragEnd}
                                className={`p-2 rounded border border-gray-200 bg-white cursor-pointer hover:border-purple-300 transition-colors ${
                                  draggedSubSection === (isAboutLeft ? 'about' : 'join') ? 'opacity-50' : ''
                                } ${
                                  dragOverSubSection === (isAboutLeft ? 'about' : 'join') ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSection('about-join-combined');
                                  // Update editor mode based on which section is clicked
                                  const editorMode = isAboutLeft ? 'about' : 'join';
                                  updateSectionData('about-join-combined', { editorMode });
                                }}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <GripVertical className="w-3 h-3 text-gray-400" />
                                  {isAboutLeft ? (
                                    <>
                                      <Globe className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-700">About</span>
                                    </>
                                  ) : (
                                    <>
                                      <Users className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-700">Join Community</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {/* Right column */}
                              <div 
                                draggable={true}
                                onDragStart={(e) => handleSubSectionDragStart(e, isAboutLeft ? 'join' : 'about')}
                                onDragOver={(e) => handleSubSectionDragOver(e, isAboutLeft ? 'join' : 'about')}
                                onDragLeave={handleSubSectionDragLeave}
                                onDrop={(e) => handleSubSectionDrop(e, isAboutLeft ? 'join' : 'about')}
                                onDragEnd={handleSubSectionDragEnd}
                                className={`p-2 rounded border border-gray-200 bg-white cursor-pointer hover:border-purple-300 transition-colors ${
                                  draggedSubSection === (isAboutLeft ? 'join' : 'about') ? 'opacity-50' : ''
                                } ${
                                  dragOverSubSection === (isAboutLeft ? 'join' : 'about') ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSection('about-join-combined');
                                  // Update editor mode based on which section is clicked
                                  const editorMode = isAboutLeft ? 'join' : 'about';
                                  updateSectionData('about-join-combined', { editorMode });
                                }}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <GripVertical className="w-3 h-3 text-gray-400" />
                                  {isAboutLeft ? (
                                    <>
                                      <Users className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-700">Join Community</span>
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-700">About</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular section rendering
                  <div
                    key={section.id}
                    draggable={section.isAdded}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      p-2.5 rounded-lg border transition-all ${
                      section.id === 'domain' && !isPro && !isLoadingPlan
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                    }
                    ${section.isAdded
                      ? isDarkMode
                        ? 'border-green-600 bg-green-900/20'
                        : 'border-green-200 bg-green-50'
                      : section.id === 'domain' && !isPro && !isLoadingPlan
                        ? isDarkMode
                          ? 'border-gray-700 bg-gray-800/50'
                          : 'border-gray-300 bg-gray-50'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/20'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }
                      ${draggedIndex === index ? 'opacity-50' : ''}
                      ${dragOverIndex === index ? 'border-blue-500 bg-blue-50' : ''}
                  `}
                    onClick={() => {
                      // Static sections should not be interactive
                      if ('isStatic' in section && section.isStatic) {
                        return;
                      }
                      // Domain section is Pro-only - disable for Basic users
                      if (section.id === 'domain' && !isPro && !isLoadingPlan) {
                        return;
                      }
                      // Design and Domain sections should only open edit panel, not add to preview
                      if (section.id === 'design' || section.id === 'domain') {
                        setSelectedSection(section.id);
                      } else {
                        addSection(section.id);
                        setSelectedSection(section.id);
                      }
                    }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {section.isAdded && (
                          <div className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      <div className={`
                        p-2 rounded-lg
                        ${section.isAdded 
                          ? isDarkMode
                            ? 'bg-green-800 text-green-300'
                            : 'bg-green-100 text-green-600'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        <section.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`font-medium text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {section.name}
                        </h4>
                        {section.id === 'domain' && !isPro && !isLoadingPlan && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 mt-0.5">
                            <Lock className="w-3 h-3" />
                            Pro
                          </span>
                        )}
                      </div>
                    </div>
                  <div className="flex items-center space-x-2">
                    {section.isAdded && !('isStatic' in section && section.isStatic) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(section.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' 
                            : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                        }`}
                        title="Remove section"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : !section.isAdded && !('isSpecial' in section && section.isSpecial) && !('isStatic' in section && section.isStatic) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Domain section is Pro-only - disable for Basic users
                          if (section.id === 'domain' && !isPro && !isLoadingPlan) {
                            return;
                          }
                          // Design and Domain sections should only open edit panel, not add to preview
                          if (section.id === 'design' || section.id === 'domain') {
                            setSelectedSection(section.id);
                          } else {
                            addSection(section.id);
                            setSelectedSection(section.id);
                          }
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-purple-900/20 text-purple-400 hover:text-purple-300' 
                            : 'hover:bg-purple-50 text-purple-500 hover:text-purple-600'
                        }`}
                        title="Add section"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                  </div>
                </div>
                )
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
