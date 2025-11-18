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
    // Show all themes while loading (better UX)
    // After loading: if Pro, show all themes; if Basic/None, show only professional-coach
    if (!isLoadingPlan && !isPro) {
      // Only restrict if we've successfully determined they're not Pro
      filtered = filtered.filter(theme => theme.id === 'professional-coach');
    }
    // If loading or Pro: show all themes

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
