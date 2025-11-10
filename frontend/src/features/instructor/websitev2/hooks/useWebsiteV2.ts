import { useState } from 'react';
import { Theme, WebsiteV2State } from '../types';

export const useWebsiteV2 = () => {
  const [state, setState] = useState<WebsiteV2State>({
    selectedTheme: null,
    isBuilderMode: false,
    isSaving: false
  });

  const selectTheme = (theme: Theme) => {
    setState(prev => ({
      ...prev,
      selectedTheme: theme,
      isBuilderMode: true
    }));
  };

  const backToSelection = () => {
    setState(prev => ({
      ...prev,
      selectedTheme: null,
      isBuilderMode: false
    }));
  };

  const setSaving = (saving: boolean) => {
    setState(prev => ({
      ...prev,
      isSaving: saving
    }));
  };

  return {
    ...state,
    selectTheme,
    backToSelection,
    setSaving
  };
};
