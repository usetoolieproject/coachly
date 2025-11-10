import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../contexts/AuthContext';
import { adminProfileService } from '../services/profileService';
import { AdminProfile, AdminProfileUpdateData, AdminPasswordUpdateData } from '../types';

export const useAdminProfile = () => {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Query for profile data
  const profileQuery = useQuery({
    queryKey: ['adminProfile'],
    queryFn: adminProfileService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: adminProfileService.updateProfile,
    onSuccess: (updatedProfile) => {
      // Update query cache
      queryClient.setQueryData(['adminProfile'], updatedProfile);
      
      // Refresh user context to get updated data
      refreshUser();
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: adminProfileService.updatePassword,
  });

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: adminProfileService.uploadProfilePicture,
    onSuccess: (result) => {
      // Update query cache with new profile picture
      queryClient.setQueryData(['adminProfile'], (old: AdminProfile | undefined) => {
        if (!old) return old;
        return { ...old, profilePicture: result.url };
      });
      
      // Refresh user context to get updated data
      refreshUser();
    },
  });

  // Helper functions
  const updateProfile = async (data: AdminProfileUpdateData) => {
    return updateProfileMutation.mutateAsync(data);
  };

  const updatePassword = async (data: AdminPasswordUpdateData) => {
    return updatePasswordMutation.mutateAsync(data);
  };

  const uploadProfilePicture = async (file: File) => {
    return uploadProfilePictureMutation.mutateAsync(file);
  };

  const refetchProfile = () => {
    return profileQuery.refetch();
  };

  return {
    profile: profileQuery.data || null,
    loading: profileQuery.isLoading,
    error: profileQuery.error?.message || null,
    isUpdating: profileQuery.isFetching,
    isSaving: updateProfileMutation.isPending,
    isPasswordSaving: updatePasswordMutation.isPending,
    isUploading: uploadProfilePictureMutation.isPending,
    updateProfile,
    updatePassword,
    uploadProfilePicture,
    refetchProfile,
  };
};
