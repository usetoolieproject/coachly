import React, { useState } from 'react';
import { useWebsiteV2, useThemeData } from './hooks';
import { ThemeSelectionGrid, ThemePreviewModal, BuilderInterface } from './components';

export default function InstructorWebsiteV2() {
  const { selectedTheme, isBuilderMode, selectTheme, backToSelection } = useWebsiteV2();
  const {
    themes,
    searchQuery,
    setSearchQuery,
    isLoadingPlan
  } = useThemeData();

  const [previewTheme, setPreviewTheme] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleThemeSelect = (theme: any) => {
    // Only allow selecting themes that are not coming soon
    if (!theme.comingSoon) {
      selectTheme(theme);
    }
  };

  const handleThemePreview = (theme: any) => {
    setPreviewTheme(theme);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewTheme(null);
  };

  const handlePreviewSelect = (theme: any) => {
    selectTheme(theme);
    setShowPreview(false);
    setPreviewTheme(null);
  };

  if (isBuilderMode && selectedTheme) {
    return (
      <BuilderInterface
        selectedTheme={selectedTheme}
        onBackToSelection={backToSelection}
      />
    );
  }

  return (
    <>
      <ThemeSelectionGrid
        themes={themes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onThemeSelect={handleThemeSelect}
        onThemePreview={handleThemePreview}
        isLoading={isLoadingPlan}
      />

      <ThemePreviewModal
        theme={previewTheme}
        isOpen={showPreview}
        onClose={handleClosePreview}
        onSelect={handlePreviewSelect}
      />
    </>
  );
}
