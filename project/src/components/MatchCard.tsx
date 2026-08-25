import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MatchModel } from '../models/types';
import { AppColors, tierColor, tournamentAccentColor } from '../theme/colors';
import { toPeru } from '../lib/peruTime';
import { AppCard } from './AppCard';
import { TeamLogo } from './TeamLogo';
import { LiveBadge } from './LiveBadge';

const BEST_OF_LABELS: Record<string, string> = { bo1: 'Bo1', bo2: 'Bo2', bo3: 'Bo3', bo5: 'Bo5' };

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

interface Props {
  match: MatchModel;
  favoriteTeamIds: Set<string>;
}

export function MatchCard({ match, favoriteTeamIds }: Props) {
  const navigation = useNavigation<any>();
  const isFavorite = favoriteTeamIds.has(match.teamA.id) || favoriteTeamIds.has(match.teamB.id);
  const isLive = match.status === 'running';
  const time = formatTime(toPeru(match.startTimeUtc));

  return (
    <AppCard
      onPress={() => navigation.navigate('MatchDetail', { match })}
      color={isFavorite ? blendAccent() : undefined}
      glowColor={isLive ? AppColors.live : undefined}
      leftAccentColor={tournamentAccentColor(match.tournament.id)}>
      <View style={styles.row}>
        <View style={styles.timeColumn}>
          {isLive ? (
            <LiveBadge />
          ) : (
            <View style={styles.bestOfChip}>
              <Text style={styles.bestOfText}>{BEST_OF_LABELS[match.bestOf] ?? ''}</Text>
            </View>
          )}
          <Text style={styles.time}>{time}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.tournamentRow}>
            <View style={[styles.tierDot, { backgroundColor: tierColor(match.tournament.tier) }]} />
            <Text style={styles.tournamentName} numberOfLines={1}>
              {match.tournament.name}
            </Text>
          </View>
          <TeamRow team={match.teamA} score={isLive ? match.liveScore?.teamAScore : undefined} />
          <TeamRow team={match.teamB} score={isLive ? match.liveScore?.teamBScore : undefined} />
        </View>
      </View>
    </AppCard>
  );
}

function blendAccent(): string {
  return '#20263C';
}

function TeamRow({ team, score }: { team: MatchModel['teamA']; score?: number }) {
  return (
    <View style={styles.teamRow}>
      <TeamLogo logoUrl={team.logoUrl} teamName={team.name} region={team.region} size={24} />
      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>
      {score != null ? (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  timeColumn: { width: 68 },
  bestOfChip: {
    backgroundColor: AppColors.chipBackground,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  bestOfText: { color: AppColors.textSecondary, fontSize: 11 },
  time: { color: AppColors.textPrimary, fontWeight: 'bold', marginTop: 6 },
  info: { flex: 1, marginLeft: 8 },
  tournamentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tierDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  tournamentName: { color: AppColors.textSecondary, fontSize: 12, flex: 1 },
  teamRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  teamName: { color: AppColors.textPrimary, fontWeight: '600', marginLeft: 8, flex: 1 },
  scoreBox: {
    width: 26,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(226,76,76,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { color: AppColors.live, fontWeight: 'bold', fontSize: 14 },
});
