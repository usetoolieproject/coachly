import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type ProfileData } from '../../../../services/profileService';
import { communityService } from '../services/communityService';
import type { CommunitySummary, Message } from '../types';

export function useStudentSettings() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const profileQuery = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => await profileService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const communityQuery = useQuery({
    queryKey: ['studentCommunity'],
    queryFn: async () => await communityService.getStudentCommunity(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const community = (communityQuery.data as CommunitySummary) || null;
  const loading = profileQuery.isLoading;
  const isUpdating = profileQuery.isFetching || communityQuery.isFetching;

  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data as ProfileData;
      setProfile(p);
      setFirstName(p.firstName || '');
      setLastName(p.lastName || '');
      setPhone(p.phone || '');
      setLocation(p.location || '');
      setBio(p.bio || '');
    }
  }, [profileQuery.data]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await profileService.updateProfile({ firstName, lastName, phone, location, bio });
      setProfile(result.user);
      await queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setMessage({ type: 'success', text: result.message });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const result = await profileService.uploadProfilePicture(file);
      setProfile(result.user);
      setMessage({ type: 'success', text: result.message });
      await queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setUploading(false);
    }
  };

  return {
    state: { profile, loading, saving, uploading, message, community, isUpdating },
    form: { firstName, lastName, phone, location, bio, setFirstName, setLastName, setPhone, setLocation, setBio },
    actions: { handleSaveProfile, handleProfilePictureChange, setMessage, refetch: () => { profileQuery.refetch(); communityQuery.refetch(); } },
  };
}


