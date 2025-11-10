import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Check, AlertCircle, X } from 'lucide-react';
import { profileService, ProfileData } from '../../../services/profileService';
import { UpdatingIndicator, RefreshButton } from '../../../components/shared';
import { connectService } from './services/connectService';
import type { StripeConnectStatus } from './types';
import PayoutsCard from './components/PayoutsCard';
import BillingCard from './components/BillingCard';
import ProfileInformationCard from './components/ProfileInformationCard';
import { SubscriptionService, SubscriptionStatus } from '../../../services/subscriptionService';
import PromoCodeCard from './components/PromoCodeCard';
import { useSettingsStore } from './services/settingsStore';
import { useTheme } from '../../../contexts/ThemeContext';

// Removed unused helper components after modularization

const InstructorSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { refreshUser } = useAuth();
  const { profile: cachedProfile, connect: cachedConnect, subscription: cachedSubscription, setProfile: setCachedProfile, setConnect: setCachedConnect, setSubscription: setCachedSubscription, lastLoadedAt } = useSettingsStore();
  const [profile, setProfile] = useState<ProfileData | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(cachedConnect ?? null);
  const [loadingConnect, setLoadingConnect] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(cachedSubscription ?? null);
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  
  // Form states - initialize with cached data if available
  const [firstName, setFirstName] = useState(cachedProfile?.firstName || '');
  const [lastName, setLastName] = useState(cachedProfile?.lastName || '');
  const [company, setCompany] = useState((cachedProfile as any)?.instructor?.business_name || '');
  const [email, setEmail] = useState(cachedProfile?.email || '');
  const [phone, setPhone] = useState(cachedProfile?.phone || '');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // render cached instantly; then background refresh
    const isFresh = lastLoadedAt && (Date.now() - lastLoadedAt) < 60_000;
    
    // If we have cached profile data, show it immediately
    if (profile && isFresh) {
      setLoading(false);
    } else if (profile && !isFresh) {
      // We have cached data but it's stale, show it immediately and refresh in background
      setLoading(false);
      loadProfile(true); // Background refresh
    } else {
      // No cached data, load it
      loadProfile(false); // Initial load
    }
    
    if (!connectStatus || !isFresh) loadConnectStatus();

    // Check for subscription success/cancel URL params
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('subscription') === 'success';
    const isCancelled = urlParams.get('subscription') === 'cancelled';

    if (isSuccess) {
      // Clean URL immediately so message doesn't repeat on refresh
      urlParams.delete('subscription');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);

      setMessage({ type: 'success', text: 'Payment successful! Processing your subscription...' });
      setIsProcessingSubscription(true);

      // Optimistic processing state
      setSubscriptionStatus({
        hasActiveSubscription: true,
        isProcessing: true,
        subscription: {
          id: 'processing',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        }
      });

      // Poll for subscription creation up to ~90s
      let attempts = 0;
      const maxAttempts = 45; // 45 * 2s = 90s
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const status = await loadSubscriptionStatus();
          if (status?.hasActiveSubscription) {
            setIsProcessingSubscription(false);
            setMessage({ type: 'success', text: 'Subscription activated successfully!' });
            setTimeout(() => setMessage(null), 4000);
            clearInterval(interval);
          } else if (attempts >= maxAttempts) {
            setIsProcessingSubscription(false);
            setSubscriptionStatus(null);
            setCachedSubscription({ hasActiveSubscription: false, subscription: null });
            setMessage({ type: 'error', text: 'No active subscription found yet. Please try again or contact support.' });
            setTimeout(() => setMessage(null), 5000);
            clearInterval(interval);
          }
        } catch {
          if (attempts >= maxAttempts) {
            setIsProcessingSubscription(false);
            setSubscriptionStatus(null);
            setCachedSubscription({ hasActiveSubscription: false, subscription: null });
            clearInterval(interval);
          }
        }
      }, 2000);

      // Cleanup
      return () => clearInterval(interval);

    } else if (isCancelled) {
      // Clean URL and show a temporary error message
      urlParams.delete('subscription');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);

      setMessage({ type: 'error', text: 'Subscription process was cancelled.' });
      setTimeout(() => setMessage(null), 4000);
      loadSubscriptionStatus();
    } else {
      // Normal load - parallel refresh
      loadSubscriptionStatus();
    }
  }, []);

  const loadProfile = async (isBackgroundRefresh = false) => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setCachedProfile(profileData);
      
      // Only update form fields if this is not a background refresh or if fields are empty
      if (!isBackgroundRefresh || !firstName) {
        setFirstName(profileData.firstName);
        setLastName(profileData.lastName);
        setCompany((profileData as any).instructor?.business_name || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      // Only set loading to false if this is not a background refresh
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const loadConnectStatus = async () => {
    try {
      setLoadingConnect(true);
      const status = await connectService.getStatus();
      setConnectStatus(status);
      setCachedConnect(status);
    } catch (error) {
      console.error('Error loading connect status:', error);
    } finally {
      setLoadingConnect(false);
    }
  };

  const loadSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
    try {
      setLoadingSubscription(true);
      const status = await SubscriptionService.getSubscriptionStatus();
      
      // Do not override status during processing; let the timer control the state.
      if (isProcessingSubscription) {
        return status;
      }

      if (status?.hasActiveSubscription) {
        setSubscriptionStatus(status);
        setCachedSubscription(status);
        setMessage(null);
      } else {
        setSubscriptionStatus(null);
        setCachedSubscription({ hasActiveSubscription: false, subscription: null });
        setMessage({ type: 'error', text: 'No active subscription found' });
      }
      
      return status;
    } catch (error) {
      // swallow
      
      // If we're processing and there's an error, keep processing state
      if (isProcessingSubscription) {
        setSubscriptionStatus({
          hasActiveSubscription: false,
          isProcessing: true,
          subscription: null,
        });
      } else {
        setSubscriptionStatus(null);
      }
      
      throw error;
    } finally {
      setLoadingSubscription(false);
    }
  };


  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const updateData: any = {
        firstName,
        lastName,
        company,
        email,
        phone
      };
      
      // Only include password if it's provided
      if (password && password.trim() !== '') {
        if (password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          setSaving(false);
          return;
        }
        updateData.password = password;
      }
      
      const result = await profileService.updateProfile(updateData);
      setProfile(result.user);
      setMessage({ type: 'success', text: result.message });
      setPassword(''); // Clear password field after successful update
      
      // Refresh user context to update profile throughout the app
      await refreshUser();
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isEditing) {
      setMessage({ type: 'error', text: 'Click Update to enable changing your photo.' });
      return;
    }

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
      
      // Refresh user context to update profile picture throughout the app
      await refreshUser();
    } catch (error: any) {
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to upload image';
      if (msg.toLowerCase().includes('bucket not found')) {
        setMessage({ type: 'error', text: 'Storage bucket not found. Please contact support to configure file storage.' });
      } else {
        setMessage({ type: 'error', text: msg });
      }
    } finally {
      setUploading(false);
    }
  };

  const isUpdating = loading || loadingConnect || loadingSubscription;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        {/* Title Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} mt-1 sm:mt-2 text-sm sm:text-base`}>Manage your account settings and preferences.</p>
        </div>
        
        {/* Actions & updating indicator */}
        <div className="flex items-center justify-between">
          <div className="w-20 sm:w-24 flex items-center justify-start">
            <UpdatingIndicator isUpdating={isUpdating} />
          </div>
          <RefreshButton onClick={() => {
            Promise.all([
              loadProfile(true), // Background refresh
              loadConnectStatus(),
              loadSubscriptionStatus(),
            ]);
          }} />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          role="alert"
          className={`mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 rounded-lg border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            {message.type === 'success' ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            )}
            <span className={`text-sm sm:text-base ${isDarkMode ? '' : 'font-medium'} truncate`}>{message.text}</span>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => setMessage(null)}
            className={`p-1 sm:p-1.5 rounded-md transition-colors flex-shrink-0 ${
              message.type === 'success'
                ? 'hover:bg-green-100 dark:hover:bg-green-800/30'
                : 'hover:bg-red-100 dark:hover:bg-red-800/30'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile */}
      <ProfileInformationCard
        profile={profile}
        uploading={uploading}
        onPhotoChange={handleProfilePictureChange}
        firstName={firstName}
        setFirstName={(v) => setFirstName(v)}
        lastName={lastName}
        setLastName={(v) => setLastName(v)}
        company={company}
        setCompany={(v) => setCompany(v)}
        email={email}
        setEmail={(v) => setEmail(v)}
        phone={phone}
        setPhone={(v) => setPhone(v)}
        password={password}
        setPassword={(v) => setPassword(v)}
        saving={saving}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
        onSave={handleSaveProfile}
        onCancel={() => { loadProfile(); setPassword(''); setMessage(null); setIsEditing(false); }}
      />

      {/* Plan & Billing */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <BillingCard 
          subscriptionStatus={subscriptionStatus}
          loading={isProcessingSubscription || loadingSubscription}
          onRefresh={loadSubscriptionStatus}
        />
      </div>

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <PromoCodeCard />
      </div>

      {/* Payouts (Stripe Connect) */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <PayoutsCard status={connectStatus} onStatusRefresh={loadConnectStatus} />
      </div>

    
    </div>
  );
};

export default InstructorSettings;