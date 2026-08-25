import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Team } from '../models/types';
import { AppColors, regionColor, regionLabel } from '../theme/colors';
import { AppCard } from './AppCard';
import { TeamLogo } from './TeamLogo';

interface Props {
  team: Team;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function TeamTile({ team, isFavorite, onToggleFavorite }: Props) {
  const navigation = useNavigation<any>();

  return (
    <AppCard onPress={() => navigation.navigate('TeamProfile', { team })}>
      <View style={styles.row}>
        <TeamLogo logoUrl={team.logoUrl} teamName={team.name} region={team.region} size={40} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {team.name}
          </Text>
          <View style={styles.regionRow}>
            <View style={[styles.dot, { backgroundColor: regionColor(team.region) }]} />
            <Text style={styles.regionText} numberOfLines={1}>
              {regionLabel(team.region)}
            </Text>
          </View>
        </View>
        <Pressable onPress={onToggleFavorite} hitSlop={12}>
          <Icon
            name={isFavorite ? 'bookmark' : 'bookmark-border'}
            size={22}
            color={isFavorite ? AppColors.accentOnDark : AppColors.textSecondary}
          />
        </Pressable>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { color: AppColors.textPrimary, fontWeight: '600' },
  regionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  regionText: { color: AppColors.textSecondary, flexShrink: 1 },
});
