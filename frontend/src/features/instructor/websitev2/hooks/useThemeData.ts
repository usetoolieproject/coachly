import { useState, useMemo } from 'react';
import { themes } from '../themes/themeData';
import { Theme } from '../types';
import { useSubscriptionPlan } from '../../../../hooks/useSubscriptionPlan';

export const useThemeData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { planName, isPro, isLoading: isLoadingPlan } = useSubscriptionPlan();

  const filteredThemes = useMemo(() => {
    let filtered = themes;

    // Show all themes to all users regardless of subscription plan
    // Subscription restrictions are applied at the feature level, not theme selection

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery]);

  return {
    themes: filteredThemes,
    searchQuery,
    setSearchQuery,
    isLoadingPlan
  };
};
