import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncSubscription } from '../services/deviceSubscription';

const LEAD_KEY = 'pulse.notification_lead_minutes';
const PERSISTENT_KEY = 'pulse.persistent_notification_enabled';

export const DEFAULT_LEAD_MINUTES = 30;

interface SettingsState {
  leadMinutes: number;
  persistentEnabled: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setLeadMinutes: (minutes: number) => Promise<void>;
  setPersistentEnabled: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>(set => ({
  leadMinutes: DEFAULT_LEAD_MINUTES,
  persistentEnabled: true,
  loaded: false,
  load: async () => {
    const [lead, persistent] = await Promise.all([
      AsyncStorage.getItem(LEAD_KEY),
      AsyncStorage.getItem(PERSISTENT_KEY),
    ]);
    set({
      leadMinutes: lead ? Number(lead) : DEFAULT_LEAD_MINUTES,
      persistentEnabled: persistent ? persistent === 'true' : true,
      loaded: true,
    });
  },
  setLeadMinutes: async minutes => {
    set({ leadMinutes: minutes });
    await AsyncStorage.setItem(LEAD_KEY, String(minutes));
    const { useFavoritesStore } = await import('./favoritesStore');
    const favorites = [...useFavoritesStore.getState().favorites];
    syncSubscription(favorites, minutes).catch(() => {});
  },
  setPersistentEnabled: async enabled => {
    set({ persistentEnabled: enabled });
    await AsyncStorage.setItem(PERSISTENT_KEY, String(enabled));
  },
}));
