import { NativeModules } from 'react-native';
import type { MatchModel } from '../models/types';

const { PersistentNotification } = NativeModules;

export async function syncPersistentNotification(
  favoriteMatches: MatchModel[],
  leadMinutes: number,
): Promise<void> {
  if (!PersistentNotification) return;
  const payload = favoriteMatches.map(m => ({
    id: m.id,
    teamA: m.teamA.name,
    teamB: m.teamB.name,
    tournament: m.tournament.name,
    startTimeMs: new Date(m.startTimeUtc).getTime(),
    isLive: m.status === 'running',
  }));
  await PersistentNotification.sync(JSON.stringify(payload), leadMinutes);
}

export async function stopPersistentNotification(): Promise<void> {
  if (!PersistentNotification) return;
  await PersistentNotification.stop();
}
