import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useAsyncData } from '../lib/useAsyncData';
import { getTeams } from '../data/teams';
import { useFavoritesStore } from '../store/favoritesStore';
import { AppColors } from '../theme/colors';
import { TeamTile } from '../components/TeamTile';
import { StateMessage } from '../components/StateMessage';

export function FavoritesScreen() {
  const { data: teams, loading, error } = useAsyncData(getTeams);
  const favorites = useFavoritesStore(s => s.favorites);
  const toggle = useFavoritesStore(s => s.toggle);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }
  if (error) return <StateMessage icon="error-outline" message="No se pudo cargar la lista de equipos." />;

  const favoriteTeams = (teams ?? []).filter(t => favorites.has(t.id));
  if (favoriteTeams.length === 0) {
    return (
      <StateMessage
        icon="bookmark-border"
        message={'Todavía no marcaste ningún equipo favorito.\nHazlo desde Equipos tocando el marcador.'}
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={favoriteTeams}
      keyExtractor={t => t.id}
      contentContainerStyle={{ paddingVertical: 6 }}
      renderItem={({ item }) => <TeamTile team={item} isFavorite onToggleFavorite={() => toggle(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
});
