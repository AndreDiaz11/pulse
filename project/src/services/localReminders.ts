import notifee, { AndroidImportance, TimestampTrigger, TriggerType } from '@notifee/react-native';
import type { MatchModel } from '../models/types';
import { loadScheduledIds, saveScheduledIds } from '../lib/notifiedMatchesStore';

const CHANNEL_ID = 'match-reminders';

async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Avisos de partidos',
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleFavoriteMatchReminders(
  matches: MatchModel[],
  favoriteTeamIds: Set<string>,
  leadMinutes: number,
) {
  if (favoriteTeamIds.size === 0) return;
  await ensureChannel();

  const scheduled = await loadScheduledIds();
  const now = Date.now();
  let changed = false;

  for (const match of matches) {
    if (scheduled.has(match.id)) continue;
    const isFavorite = favoriteTeamIds.has(match.teamA.id) || favoriteTeamIds.has(match.teamB.id);
    if (!isFavorite) continue;

    const startMs = new Date(match.startTimeUtc).getTime();
    const fireAt = startMs - leadMinutes * 60000;
    if (fireAt <= now || startMs <= now) continue;

    const trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: fireAt };

    await notifee.createTriggerNotification(
      {
        title: '¡Ya casi empieza!',
        body: `${match.teamA.name} vs ${match.teamB.name} arranca en ${leadMinutes} min · ${match.tournament.name}`,
        android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      },
      trigger,
    );

    scheduled.add(match.id);
    changed = true;
  }

  if (changed) await saveScheduledIds(scheduled);
}
