import { create } from 'zustand';
import type { SubscriptionStatus } from '../../../../services/subscriptionService';
import type { StripeConnectStatus } from '../types';
import type { ProfileData } from '../../../../services/profileService';

type SettingsState = {
  profile?: ProfileData;
  connect?: StripeConnectStatus;
  subscription?: SubscriptionStatus;
  lastLoadedAt?: number;
  setProfile: (p: ProfileData) => void;
  setConnect: (c: StripeConnectStatus) => void;
  setSubscription: (s: SubscriptionStatus) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: undefined,
  connect: undefined,
  subscription: undefined,
  lastLoadedAt: undefined,
  setProfile: (p) => set({ profile: p, lastLoadedAt: Date.now() }),
  setConnect: (c) => set({ connect: c, lastLoadedAt: Date.now() }),
  setSubscription: (s) => set({ subscription: s, lastLoadedAt: Date.now() }),
}));


