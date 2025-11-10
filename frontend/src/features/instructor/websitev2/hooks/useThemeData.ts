import { useState, useMemo } from 'react';
import { themes } from '../themes/themeData';
import { Theme } from '../types';
import { useSubscriptionPlan } from '../../../../hooks/useSubscriptionPlan';

export const useThemeData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { planName, isPro, isLoading: isLoadingPlan } = useSubscriptionPlan();

  const filteredThemes = useMemo(() => {
    let filtered = themes;

    // Filter by subscription plan
    // Pro subscription: show all themes
    // Basic subscription or no subscription: show only professional-coach theme
    // While loading: conservatively show only professional-coach to prevent showing unavailable themes
    // After loading: filter based on actual subscription plan
    if (isLoadingPlan) {
      // While loading, show only professional-coach to be safe
      filtered = filtered.filter(theme => theme.id === 'professional-coach');
    } else if (!isPro) {
      // After loading, if not Pro, show only professional-coach
      filtered = filtered.filter(theme => theme.id === 'professional-coach');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, isPro, isLoadingPlan]);

  return {
    themes: filteredThemes,
    searchQuery,
    setSearchQuery,
    isLoadingPlan
  };
};
