import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { supabase } from './supabase-admin.mjs';

const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!FIREBASE_SERVICE_ACCOUNT) {
  console.error('Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT');
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
const messaging = getMessaging();

function matchLabel(match) {
  return `${match.team_a?.name ?? 'TBD'} vs ${match.team_b?.name ?? 'TBD'}`;
}

const STALE_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

async function main() {
  const now = Date.now();

  const [{ data: matches, error: matchesError }, { data: devices, error: devicesError }] = await Promise.all([
    supabase.from('matches').select('*'),
    supabase.from('device_subscriptions').select('*'),
  ]);
  if (matchesError) throw matchesError;
  if (devicesError) throw devicesError;

  let sentCount = 0;

  for (const device of devices ?? []) {
    const favoriteIds = new Set(device.favorite_team_ids ?? []);
    const notifiedIds = new Set(device.notified_match_ids ?? []);
    const leadMinutes = device.notification_lead_minutes ?? 30;
    const token = device.fcm_token;

    if (favoriteIds.size === 0 || !token) continue;

    const dueMatches = (matches ?? []).filter(match => {
      if (notifiedIds.has(match.id)) return false;
      const isFavorite = favoriteIds.has(match.team_a?.id) || favoriteIds.has(match.team_b?.id);
      if (!isFavorite) return false;
      const startMs = new Date(match.start_time_utc).getTime();
      const minutesUntil = (startMs - now) / 60000;
      return minutesUntil >= 0 && minutesUntil <= leadMinutes;
    });

    if (dueMatches.length === 0) continue;

    let staleToken = false;
    for (const match of dueMatches) {
      const minutesUntil = Math.round((new Date(match.start_time_utc).getTime() - now) / 60000);

      try {
        await messaging.send({
          token,
          notification: {
            title: '¡Ya casi empieza!',
            body: `${matchLabel(match)} arranca en ${minutesUntil} min · ${match.tournament_name ?? 'Torneo'}`,
          },
        });
        sentCount++;
      } catch (err) {
        if (STALE_TOKEN_ERRORS.has(err.code)) staleToken = true;
      }

      notifiedIds.add(match.id);
    }

    const update = { notified_match_ids: [...notifiedIds] };
    if (staleToken) update.fcm_token = null;

    await supabase.from('device_subscriptions').update(update).eq('device_id', device.device_id);
  }

  console.log(`Notificaciones enviadas: ${sentCount}`);
}

await main();
