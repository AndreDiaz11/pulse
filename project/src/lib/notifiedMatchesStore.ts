import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pulse.scheduled_match_ids';

export async function loadScheduledIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(KEY);
  return new Set<string>(raw ? JSON.parse(raw) : []);
}

export async function saveScheduledIds(ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify([...ids]));
}
