import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useAsyncData } from '../lib/useAsyncData';
import { getUpcomingMatches } from '../data/matches';
import { useFavoritesStore } from '../store/favoritesStore';
import { AppColors } from '../theme/colors';
import { dayKey, peruNow } from '../lib/peruTime';
import { groupMatchesByDay } from '../lib/matchGrouping';
import { MatchCard } from '../components/MatchCard';
import { StateMessage } from '../components/StateMessage';
import { MonthCalendar } from '../components/MonthCalendar';

export function WatchlistScreen() {
  const { data: matches, loading, error } = useAsyncData(getUpcomingMatches);
  const favorites = useFavoritesStore(s => s.favorites);
  const now = peruNow();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

  const favoriteMatches = useMemo(
    () => (matches ?? []).filter(m => favorites.has(m.teamA.id) || favorites.has(m.teamB.id)),
    [matches, favorites],
  );
  const byDay = useMemo(() => groupMatchesByDay(favoriteMatches), [favoriteMatches]);
  const daysWithMatches = useMemo(() => new Set(byDay.keys()), [byDay]);
  const dayMatches = byDay.get(dayKey(selectedDay))?.matches ?? [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }
  if (error) return <StateMessage icon="error-outline" message="No se pudo cargar tu seguimiento." />;
  if (favorites.size === 0) {
    return <StateMessage icon="bookmark-border" message="Marca equipos favoritos en la pestaña Equipos para verlos aquí." />;
  }

  return (
    <View style={styles.container}>
      <MonthCalendar
        month={month}
        selectedDay={selectedDay}
        daysWithMatches={daysWithMatches}
        onSelectDay={setSelectedDay}
        onPrevMonth={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
        onNextMonth={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
      />
      <View style={styles.divider} />
      {dayMatches.length === 0 ? (
        <StateMessage icon="event-busy" message="No tienes partidos de tus favoritos ese día." />
      ) : (
        <FlatList
          data={dayMatches}
          keyExtractor={m => m.id}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => <MatchCard match={item} favoriteTeamIds={favorites} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: AppColors.divider },
});
