import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { AppColors, tierColor } from '../theme/colors';
import { toPeru } from '../lib/peruTime';
import { AppCard } from '../components/AppCard';
import { TeamLogo } from '../components/TeamLogo';
import type { MatchModel } from '../models/types';

const BEST_OF_LABELS: Record<string, string> = { bo1: 'Bo1', bo2: 'Bo2', bo3: 'Bo3', bo5: 'Bo5' };
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatFullDate(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12 || 12;
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}, ${hours}:${minutes} ${suffix}`;
}

function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function MatchDetailScreen() {
  const route = useRoute<RouteProp<{ params: { match: MatchModel } }, 'params'>>();
  const match = route.params.match;
  const isLive = match.status === 'running';
  const dateLabel = formatFullDate(toPeru(match.startTimeUtc));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <AppCard>
        <View style={styles.headerCenter}>
          <View style={styles.tournamentRow}>
            <View style={[styles.tierDot, { backgroundColor: tierColor(match.tournament.tier) }]} />
            <Text style={styles.tournamentName} numberOfLines={1}>
              {match.tournament.name}
            </Text>
          </View>
          {isLive ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>EN VIVO</Text>
            </View>
          ) : (
            <Text style={styles.dateLabel}>{dateLabel}</Text>
          )}
          <View style={styles.bestOfChip}>
            <Text style={styles.bestOfText}>{BEST_OF_LABELS[match.bestOf] ?? ''}</Text>
          </View>
          <View style={styles.teamsRow}>
            <TeamColumn name={match.teamA.name} logoUrl={match.teamA.logoUrl} region={match.teamA.region} />
            <Text style={styles.vs}>VS</Text>
            <TeamColumn name={match.teamB.name} logoUrl={match.teamB.logoUrl} region={match.teamB.region} />
          </View>
        </View>
      </AppCard>

      <Text style={styles.sectionTitle}>Historial cara a cara</Text>
      {match.headToHead.length === 0 ? (
        <Text style={styles.emptyText}>Todavía no hay enfrentamientos registrados entre estos equipos.</Text>
      ) : (
        match.headToHead.map((h2h, i) => {
          const teamAWon = h2h.winnerId === match.teamA.id;
          const teamBWon = h2h.winnerId === match.teamB.id;
          return (
            <AppCard key={i}>
              <Text style={styles.h2hMeta}>
                {h2h.tournamentName} · {formatShortDate(toPeru(h2h.dateUtc))}
              </Text>
              <View style={styles.h2hRow}>
                <Text style={[styles.h2hTeam, teamAWon ? styles.h2hWinner : null]} numberOfLines={1}>
                  {match.teamA.name}
                </Text>
                <Text style={styles.h2hScore}>
                  {h2h.teamAScore} - {h2h.teamBScore}
                </Text>
                <Text style={[styles.h2hTeam, styles.h2hRight, teamBWon ? styles.h2hWinner : null]} numberOfLines={1}>
                  {match.teamB.name}
                </Text>
              </View>
            </AppCard>
          );
        })
      )}
    </ScrollView>
  );
}

function TeamColumn({ name, logoUrl, region }: { name: string; logoUrl: string; region: any }) {
  return (
    <View style={styles.teamColumn}>
      <TeamLogo logoUrl={logoUrl} teamName={name} region={region} size={56} />
      <Text style={styles.teamColumnName} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  headerCenter: { alignItems: 'center', paddingVertical: 8 },
  tournamentRow: { flexDirection: 'row', alignItems: 'center' },
  tierDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  tournamentName: { color: AppColors.textSecondary, fontSize: 13 },
  liveBadge: { backgroundColor: AppColors.live, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, marginBottom: 8 },
  liveBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  dateLabel: { color: AppColors.textPrimary, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  bestOfChip: { backgroundColor: AppColors.chipBackground, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  bestOfText: { color: AppColors.textSecondary, fontSize: 12 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, width: '100%' },
  teamColumn: { flex: 1, alignItems: 'center' },
  teamColumnName: { color: AppColors.textPrimary, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  vs: { color: AppColors.textSecondary, fontWeight: 'bold', marginHorizontal: 12 },
  sectionTitle: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 16, marginTop: 24, marginBottom: 8 },
  emptyText: { color: AppColors.textSecondary, paddingVertical: 16 },
  h2hMeta: { color: AppColors.textSecondary, fontSize: 12 },
  h2hRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  h2hTeam: { color: AppColors.textPrimary, flex: 1 },
  h2hRight: { textAlign: 'right' },
  h2hWinner: { color: AppColors.accentOnDark, fontWeight: 'bold' },
  h2hScore: { color: AppColors.textPrimary, fontWeight: 'bold', marginHorizontal: 8 },
});
