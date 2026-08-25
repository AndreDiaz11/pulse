import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncSubscription } from '../services/deviceSubscription';
import { useSettingsStore } from './settingsStore';

const KEY = 'pulse.favorite_team_ids';

interface FavoritesState {
  favorites: Set<string>;
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (teamId: string) => Promise<void>;
}

async function persistAndSync(favorites: Set<string>) {
  const list = [...favorites];
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  const leadMinutes = useSettingsStore.getState().leadMinutes;
  syncSubscription(list, leadMinutes).catch(() => {});
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: new Set(),
  loaded: false,
  load: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    set({ favorites: new Set(ids), loaded: true });
  },
  toggle: async teamId => {
    const next = new Set(get().favorites);
    if (next.has(teamId)) next.delete(teamId);
    else next.add(teamId);
    set({ favorites: next });
    await persistAndSync(next);
  },
}));
