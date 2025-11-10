import { useQuery } from '@tanstack/react-query';
import type { Community } from '../types';
import { communityService } from '../services/communityService';

export const useCommunityDetails = () => {
  const query = useQuery({
    queryKey: ['community'],
    queryFn: () => communityService.getCommunity(),
    staleTime: 60_000,
  });

  return {
    community: (query.data as Community) || null,
    isLoadingCommunity: query.isLoading,
    loadCommunity: () => query.refetch(),
    lastLoadedAt: query.dataUpdatedAt || null,
    isFetchingCommunity: query.isFetching,
  };
};

export default useCommunityDetails;


