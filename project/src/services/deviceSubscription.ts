import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/deviceId';

let fcmToken: string | null = null;

export function setFcmToken(token: string | null) {
  fcmToken = token;
}

export async function syncSubscription(favoriteTeamIds: string[], leadMinutes: number) {
  const deviceId = await getDeviceId();
  await supabase.from('device_subscriptions').upsert({
    device_id: deviceId,
    fcm_token: fcmToken,
    favorite_team_ids: favoriteTeamIds,
    notification_lead_minutes: leadMinutes,
    updated_at: new Date().toISOString(),
  });
}
