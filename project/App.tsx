import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useFavoritesStore } from './src/store/favoritesStore';
import { useSettingsStore } from './src/store/settingsStore';
import { getUpcomingMatches } from './src/data/matches';
import { initPushNotifications } from './src/services/pushNotifications';
import { scheduleFavoriteMatchReminders } from './src/services/localReminders';
import { syncPersistentNotification, stopPersistentNotification } from './src/services/persistentNotification';
import { checkForUpdate, UpdateInfo } from './src/services/updateChecker';
import { UpdateDialog } from './src/components/UpdateDialog';
import { AppColors } from './src/theme/colors';
import packageJson from './package.json';

export default function App() {
  const loadFavorites = useFavoritesStore(s => s.load);
  const favoritesLoaded = useFavoritesStore(s => s.loaded);
  const favorites = useFavoritesStore(s => s.favorites);
  const loadSettings = useSettingsStore(s => s.load);
  const settingsLoaded = useSettingsStore(s => s.loaded);
  const leadMinutes = useSettingsStore(s => s.leadMinutes);
  const persistentEnabled = useSettingsStore(s => s.persistentEnabled);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    loadFavorites();
    loadSettings();
    initPushNotifications();
    checkForUpdate(packageJson.version).then(setUpdate).catch(() => {});
  }, [loadFavorites, loadSettings]);

  useEffect(() => {
    if (!favoritesLoaded || !settingsLoaded) return;

    let cancelled = false;
    getUpcomingMatches()
      .then(matches => {
        if (cancelled) return;
        scheduleFavoriteMatchReminders(matches, favorites, leadMinutes).catch(() => {});

        if (persistentEnabled) {
          const favoriteMatches = matches.filter(m => favorites.has(m.teamA.id) || favorites.has(m.teamB.id));
          syncPersistentNotification(favoriteMatches, leadMinutes).catch(() => {});
        } else {
          stopPersistentNotification().catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [favoritesLoaded, settingsLoaded, favorites, leadMinutes, persistentEnabled]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: AppColors.background }}>
      <SafeAreaProvider>
        <RootNavigator />
        {update && !updateDismissed ? <UpdateDialog update={update} onDismiss={() => setUpdateDismissed(true)} /> : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
