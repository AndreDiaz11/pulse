import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAsyncData } from '../lib/useAsyncData';
import { getUpcomingMatches } from '../data/matches';
import { useFavoritesStore } from '../store/favoritesStore';
import { AppColors, tierColor } from '../theme/colors';
import { dayKey, peruNow, startOfDay } from '../lib/peruTime';
import { groupMatchesByDay, groupMatchesByTournament } from '../lib/matchGrouping';
import { MatchCard } from '../components/MatchCard';
import { StateMessage } from '../components/StateMessage';

const WEEKDAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function CalendarScreen() {
  const { data: matches, loading, error } = useAsyncData(getUpcomingMatches);
  const favorites = useFavoritesStore(s => s.favorites);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortMode, setSortMode] = useState<'time' | 'tournament'>('time');

  const today = startOfDay(peruNow());
  const strip = useMemo(() => Array.from({ length: 14 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)), []);
  const [selectedDay, setSelectedDay] = useState(today);

  const byDay = useMemo(() => (matches ? groupMatchesByDay(matches) : new Map()), [matches]);
  const dayMatches = useMemo(() => {
    const list = byDay.get(dayKey(selectedDay))?.matches ?? [];
    if (!onlyFavorites) return list;
    return list.filter((m: any) => favorites.has(m.teamA.id) || favorites.has(m.teamB.id));
  }, [byDay, selectedDay, onlyFavorites, favorites]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }
  if (error) {
    return <StateMessage icon="error-outline" message="No se pudo cargar el calendario." />;
  }

  const tournamentGroups = sortMode === 'tournament' ? groupMatchesByTournament(dayMatches) : null;

  return (
    <View style={styles.container}>
      <View style={styles.strip}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={strip}
          keyExtractor={d => dayKey(d)}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          renderItem={({ item: day }) => {
            const isSelected = dayKey(day) === dayKey(selectedDay);
            const hasMatches = byDay.has(dayKey(day));
            return (
              <Pressable onPress={() => setSelectedDay(day)} style={[styles.dayCell, isSelected ? styles.dayCellSelected : null]}>
                <Text style={[styles.dayName, isSelected ? styles.textSelected : null]}>{WEEKDAY_SHORT[day.getDay()]}</Text>
                <Text style={[styles.dayNumber, isSelected ? styles.textSelected : null]}>{day.getDate()}</Text>
                {hasMatches ? <View style={[styles.dot, isSelected ? { backgroundColor: '#fff' } : null]} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
      <View style={styles.divider} />
      {dayMatches.length > 0 ? (
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Ordenar:</Text>
          <SortChip label="Hora" selected={sortMode === 'time'} onPress={() => setSortMode('time')} />
          <SortChip label="Torneo" selected={sortMode === 'tournament'} onPress={() => setSortMode('tournament')} />
          <View style={{ flex: 1 }} />
          <FilterChip label="Solo favoritos" selected={onlyFavorites} onPress={() => setOnlyFavorites(v => !v)} />
        </View>
      ) : (
        <View style={styles.sortRow}>
          <View style={{ flex: 1 }} />
          <FilterChip label="Solo favoritos" selected={onlyFavorites} onPress={() => setOnlyFavorites(v => !v)} />
        </View>
      )}
      {dayMatches.length === 0 ? (
        <StateMessage icon="event-busy" message="No hay partidos ese día." />
      ) : sortMode === 'time' ? (
        <FlatList
          data={dayMatches}
          keyExtractor={(m: any) => m.id}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => <MatchCard match={item} favoriteTeamIds={favorites} />}
        />
      ) : (
        <FlatList
          data={[...(tournamentGroups?.entries() ?? [])]}
          keyExtractor={([id]) => id}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item: [, list] }) => (
            <View>
              <View style={styles.tournamentHeader}>
                <View style={[styles.tierDot, { backgroundColor: tierColor(list[0].tournament.tier) }]} />
                <Text style={styles.tournamentHeaderText} numberOfLines={1}>
                  {list[0].tournament.name}
                </Text>
              </View>
              {list.map((match: any) => (
                <MatchCard key={match.id} match={match} favoriteTeamIds={favorites} />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

function SortChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? styles.chipSelected : null, { marginRight: 6 }]}>
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? styles.chipSelected : null]}>
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  strip: { height: 72, backgroundColor: AppColors.surface },
  dayCell: { width: 52, marginHorizontal: 4, marginVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dayCellSelected: { backgroundColor: AppColors.accent },
  dayName: { color: AppColors.textSecondary, fontSize: 12 },
  dayNumber: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 16, marginTop: 2 },
  textSelected: { color: '#fff' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: AppColors.accentOnDark },
  divider: { height: 1, backgroundColor: AppColors.divider },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 },
  sortLabel: { color: AppColors.textSecondary, fontSize: 12, marginRight: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: AppColors.chipBackground },
  chipSelected: { backgroundColor: AppColors.accent },
  chipText: { color: AppColors.textSecondary, fontSize: 12 },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  tournamentHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  tierDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  tournamentHeaderText: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 13, flex: 1 },
});
