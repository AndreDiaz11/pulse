import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAsyncData } from '../lib/useAsyncData';
import { getUpcomingMatches } from '../data/matches';
import { useFavoritesStore } from '../store/favoritesStore';
import { AppColors, regionColor, regionLabel } from '../theme/colors';
import { groupMatchesByDay } from '../lib/matchGrouping';
import { toPeru } from '../lib/peruTime';
import { MatchCard } from '../components/MatchCard';
import { StateMessage } from '../components/StateMessage';
import { TeamLogo } from '../components/TeamLogo';
import type { Team } from '../models/types';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function TeamProfileScreen() {
  const route = useRoute<RouteProp<{ params: { team: Team } }, 'params'>>();
  const team = route.params.team;
  const { data: matches, loading, error } = useAsyncData(getUpcomingMatches);
  const favorites = useFavoritesStore(s => s.favorites);
  const toggle = useFavoritesStore(s => s.toggle);
  const isFavorite = favorites.has(team.id);

  const teamMatches = useMemo(() => {
    return (matches ?? []).filter(m => m.teamA.id === team.id || m.teamB.id === team.id);
  }, [matches, team.id]);
  const byDay = useMemo(() => groupMatchesByDay(teamMatches), [teamMatches]);
  const groups = useMemo(() => [...byDay.values()].sort((a, b) => a.day.getTime() - b.day.getTime()), [byDay]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TeamLogo logoUrl={team.logoUrl} teamName={team.name} region={team.region} size={72} />
        <Text style={styles.name}>{team.name}</Text>
        <View style={styles.regionRow}>
          <View style={[styles.dot, { backgroundColor: regionColor(team.region) }]} />
          <Text style={styles.regionText}>{regionLabel(team.region)}</Text>
        </View>
        <Pressable onPress={() => toggle(team.id)} style={styles.favoriteButton} hitSlop={12}>
          <Icon name={isFavorite ? 'bookmark' : 'bookmark-border'} size={22} color={AppColors.accentOnDark} />
        </Pressable>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Próximos partidos</Text>
      {loading ? (
        <ActivityIndicator color={AppColors.accent} style={{ marginTop: 24 }} />
      ) : error ? (
        <StateMessage icon="error-outline" message="No se pudieron cargar los partidos." />
      ) : teamMatches.length === 0 ? (
        <StateMessage icon="event-busy" message="Este equipo no tiene partidos programados." />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={g => g.key}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item: group }) => (
            <View>
              <Text style={styles.dayLabel}>
                {capitalize(`${WEEKDAYS[group.day.getDay()]} ${group.day.getDate()} ${MONTHS[group.day.getMonth()]}`)}
              </Text>
              {group.matches.map(match => (
                <MatchCard key={match.id} match={match} favoriteTeamIds={favorites} />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: { alignItems: 'center', padding: 20 },
  name: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 18, marginTop: 10 },
  regionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  regionText: { color: AppColors.textSecondary },
  favoriteButton: { position: 'absolute', top: 16, right: 16 },
  divider: { height: 1, backgroundColor: AppColors.divider },
  sectionTitle: { color: AppColors.textPrimary, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  dayLabel: { color: AppColors.textSecondary, fontWeight: '600', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
});
