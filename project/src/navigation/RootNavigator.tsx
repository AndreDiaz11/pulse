import React from 'react';
import { Pressable } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColors } from '../theme/colors';
import { DrawerContent } from './DrawerContent';
import { CalendarScreen } from '../screens/CalendarScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { TeamsScreen } from '../screens/TeamsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { TournamentsScreen } from '../screens/TournamentsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { MatchDetailScreen } from '../screens/MatchDetailScreen';
import { TeamProfileScreen } from '../screens/TeamProfileScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: AppColors.headerBackground },
  headerTintColor: AppColors.headerForeground,
  headerTitleStyle: { fontWeight: 'bold' as const },
};

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={{ marginLeft: 12 }}>
      <Icon name="menu" size={24} color={AppColors.headerForeground} />
    </Pressable>
  );
}

function TabsDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        ...headerOptions,
        headerLeft: () => <MenuButton onPress={() => navigation.toggleDrawer()} />,
        drawerType: 'front',
      })}>
      <Drawer.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario' }} />
      <Drawer.Screen name="Watchlist" component={WatchlistScreen} options={{ title: 'Seguimiento' }} />
      <Drawer.Screen name="Teams" component={TeamsScreen} options={{ title: 'Equipos' }} />
      <Drawer.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Drawer.Screen name="Tournaments" component={TournamentsScreen} options={{ title: 'Torneos' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Drawer.Screen name="News" component={NewsScreen} options={{ title: 'Noticias' }} />
    </Drawer.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: AppColors.background, card: AppColors.surface, border: AppColors.divider },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabsDrawer} options={{ headerShown: false }} />
        <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ ...headerOptions, title: 'Detalle del partido' }} />
        <Stack.Screen name="TeamProfile" component={TeamProfileScreen} options={({ route }: any) => ({ ...headerOptions, title: route.params.team.name })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
