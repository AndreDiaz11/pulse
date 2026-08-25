import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColors } from '../theme/colors';

const ITEMS: { route: string; icon: string; label: string }[] = [
  { route: 'Calendar', icon: 'calendar-month', label: 'Calendario' },
  { route: 'Watchlist', icon: 'calendar-view-month', label: 'Seguimiento' },
  { route: 'Teams', icon: 'groups', label: 'Equipos' },
  { route: 'Favorites', icon: 'bookmark', label: 'Favoritos' },
  { route: 'Tournaments', icon: 'emoji-events', label: 'Torneos' },
  { route: 'Settings', icon: 'settings', label: 'Ajustes' },
  { route: 'News', icon: 'article', label: 'Noticias' },
];

export function DrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const currentRoute = state.routeNames[state.index];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pulse</Text>
      {ITEMS.map(item => {
        const selected = item.route === currentRoute;
        return (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={[styles.item, selected ? styles.itemSelected : null]}>
            <Icon name={item.icon} size={22} color={selected ? AppColors.accentOnDark : AppColors.textSecondary} />
            <Text style={[styles.itemLabel, selected ? styles.itemLabelSelected : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.surface, paddingTop: 20 },
  title: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 18, paddingHorizontal: 16, marginBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 3,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  itemSelected: { backgroundColor: 'rgba(76,127,221,0.18)' },
  itemLabel: { color: AppColors.textSecondary, marginLeft: 14 },
  itemLabelSelected: { color: AppColors.textPrimary, fontWeight: '600' },
});
