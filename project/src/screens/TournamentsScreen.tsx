import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAsyncData } from '../lib/useAsyncData';
import { getTournaments } from '../data/tournaments';
import { AppColors, tierColor } from '../theme/colors';
import { toPeru } from '../lib/peruTime';
import { AppCard } from '../components/AppCard';
import { TeamLogo } from '../components/TeamLogo';
import { StateMessage } from '../components/StateMessage';
import type { TournamentEvent, TournamentEventStatus } from '../models/types';

const TABS: { key: TournamentEventStatus; label: string; empty: string }[] = [
  { key: 'running', label: 'En curso', empty: 'No hay torneos en curso ahora mismo.' },
  { key: 'upcoming', label: 'Próximos', empty: 'No hay torneos próximos por ahora.' },
  { key: 'past', label: 'Finalizados', empty: 'Todavía no hay torneos finalizados.' },
];

const TIER_LABELS: Record<string, string> = {
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
  qualifier: 'Clasificatorio',
  amateur: 'Amateur',
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function TournamentsScreen() {
  const { data: tournaments, loading, error } = useAsyncData(getTournaments);
  const [status, setStatus] = useState<TournamentEventStatus>('running');

  const filtered = useMemo(() => {
    const list = (tournaments ?? []).filter(t => t.status === status);
    if (status === 'upcoming') {
      list.sort((a, b) => new Date(a.beginAtUtc ?? 0).getTime() - new Date(b.beginAtUtc ?? 0).getTime());
    } else {
      list.sort((a, b) => new Date(b.endAtUtc ?? b.beginAtUtc ?? 0).getTime() - new Date(a.endAtUtc ?? a.beginAtUtc ?? 0).getTime());
    }
    return list;
  }, [tournaments, status]);

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <Pressable key={tab.key} onPress={() => setStatus(tab.key)} style={[styles.tab, status === tab.key ? styles.tabSelected : null]}>
            <Text style={[styles.tabText, status === tab.key ? styles.tabTextSelected : null]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={AppColors.accent} />
        </View>
      ) : error ? (
        <StateMessage icon="error-outline" message="No se pudieron cargar los torneos." />
      ) : filtered.length === 0 ? (
        <StateMessage icon="emoji-events" message={TABS.find(t => t.key === status)!.empty} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => <TournamentCard tournament={item} />}
        />
      )}
    </View>
  );
}

function TournamentCard({ tournament }: { tournament: TournamentEvent }) {
  const begin = tournament.beginAtUtc ? toPeru(tournament.beginAtUtc) : null;
  const end = tournament.endAtUtc ? toPeru(tournament.endAtUtc) : null;
  let dateLabel: string | null = null;
  if (begin && end) dateLabel = `${formatDate(begin)} – ${formatDate(end)}`;
  else if (begin) dateLabel = formatDate(begin);

  return (
    <AppCard leftAccentColor={tierColor(tournament.tier)}>
      <View style={styles.headerRow}>
        {tournament.leagueImageUrl ? (
          <Image source={{ uri: tournament.leagueImageUrl }} style={styles.leagueImage} resizeMode="contain" />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.leagueName}>{tournament.leagueName}</Text>
          {tournament.seasonName ? <Text style={styles.seasonName}>{tournament.seasonName}</Text> : null}
        </View>
      </View>
      <View style={styles.chipsRow}>
        <InfoChip icon="emoji-events" label={TIER_LABELS[tournament.tier] ?? ''} color={tierColor(tournament.tier)} />
        <InfoChip icon={tournament.type === 'offline' ? 'stadium' : 'wifi'} label={tournament.type === 'offline' ? 'Presencial' : 'En línea'} />
        {tournament.country ? <InfoChip icon="public" label={tournament.country} /> : null}
        {tournament.prizepool ? <InfoChip icon="payments" label={tournament.prizepool} /> : null}
      </View>
      {dateLabel ? <Text style={styles.dateLabel}>{dateLabel}</Text> : null}
      {tournament.status === 'past' && tournament.winnerName ? (
        <View style={styles.winnerRow}>
          <View style={styles.winnerDivider} />
          <View style={styles.winnerContent}>
            <Icon name="military-tech" color={AppColors.live} size={18} />
            <Text style={styles.winnerLabel}>Ganador: </Text>
            {tournament.winnerLogoUrl ? (
              <TeamLogo logoUrl={tournament.winnerLogoUrl} teamName={tournament.winnerName} region="other" size={20} />
            ) : null}
            <Text style={styles.winnerName} numberOfLines={1}>
              {' '}
              {tournament.winnerName}
            </Text>
          </View>
        </View>
      ) : null}
    </AppCard>
  );
}

function InfoChip({ icon, label, color }: { icon: string; label: string; color?: string }) {
  return (
    <View style={styles.infoChip}>
      <Icon name={icon} size={13} color={color ?? AppColors.textSecondary} />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: AppColors.chipBackground, alignItems: 'center' },
  tabSelected: { backgroundColor: AppColors.accent },
  tabText: { color: AppColors.textSecondary, fontSize: 13 },
  tabTextSelected: { color: '#fff', fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  leagueImage: { width: 36, height: 36, marginRight: 10 },
  leagueName: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 15 },
  seasonName: { color: AppColors.textSecondary, fontSize: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.chipBackground, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  infoChipText: { color: AppColors.textSecondary, fontSize: 11, marginLeft: 4 },
  dateLabel: { color: AppColors.textSecondary, fontSize: 12, marginTop: 8 },
  winnerRow: { marginTop: 10 },
  winnerDivider: { height: 1, backgroundColor: AppColors.divider, marginBottom: 10 },
  winnerContent: { flexDirection: 'row', alignItems: 'center' },
  winnerLabel: { color: AppColors.textSecondary, fontSize: 13 },
  winnerName: { color: AppColors.textPrimary, fontWeight: '600', fontSize: 13, flexShrink: 1 },
});
