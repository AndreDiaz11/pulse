import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { setFcmToken, syncSubscription } from './deviceSubscription';
import { useFavoritesStore } from '../store/favoritesStore';
import { useSettingsStore } from '../store/settingsStore';

const CHANNEL_ID = 'match-reminders';

export async function initPushNotifications() {
  try {
    await messaging().requestPermission();
    const token = await messaging().getToken();
    setFcmToken(token);

    const favorites = [...useFavoritesStore.getState().favorites];
    const leadMinutes = useSettingsStore.getState().leadMinutes;
    await syncSubscription(favorites, leadMinutes);

    messaging().onTokenRefresh(newToken => {
      setFcmToken(newToken);
      const favs = [...useFavoritesStore.getState().favorites];
      const lead = useSettingsStore.getState().leadMinutes;
      syncSubscription(favs, lead).catch(() => {});
    });

    await notifee.createChannel({ id: CHANNEL_ID, name: 'Avisos de partidos', importance: AndroidImportance.HIGH });

    messaging().onMessage(async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? 'Pulse',
        body: remoteMessage.notification?.body ?? '',
        android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      });
    });
  } catch {
    // El registro de notificaciones push es secundario: si falla no debe
    // impedir que la app arranque.
  }
}
