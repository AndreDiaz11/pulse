import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAsyncData } from '../lib/useAsyncData';
import { getTeams } from '../data/teams';
import { useFavoritesStore } from '../store/favoritesStore';
import { AppColors, Region, regionColor, regionLabel } from '../theme/colors';
import { TeamTile } from '../components/TeamTile';
import { StateMessage } from '../components/StateMessage';

const REGIONS: Region[] = ['na', 'sa', 'eu', 'cn', 'sea', 'other'];

export function TeamsScreen() {
  const { data: teams, loading, error } = useAsyncData(getTeams);
  const favorites = useFavoritesStore(s => s.favorites);
  const toggle = useFavoritesStore(s => s.toggle);
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<Region | null>(null);

  const filtered = useMemo(() => {
    return (teams ?? [])
      .filter(t => !query || t.name.toLowerCase().includes(query.toLowerCase()))
      .filter(t => !regionFilter || t.region === regionFilter);
  }, [teams, query, regionFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Icon name="search" size={18} color={AppColors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar equipo..."
          placeholderTextColor={AppColors.textSecondary}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.regionRow}>
        <RegionChip label="Todos" color={AppColors.accent} selected={regionFilter === null} onPress={() => setRegionFilter(null)} />
        {REGIONS.map(region => (
          <RegionChip
            key={region}
            label={regionLabel(region)}
            color={regionColor(region)}
            selected={regionFilter === region}
            onPress={() => setRegionFilter(region)}
          />
        ))}
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={AppColors.accent} />
        </View>
      ) : error ? (
        <StateMessage icon="error-outline" message="No se pudo cargar la lista de equipos." />
      ) : filtered.length === 0 ? (
        <StateMessage icon="search-off" message="Ningún equipo coincide con la búsqueda." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => (
            <TeamTile team={item} isFavorite={favorites.has(item.id)} onToggleFavorite={() => toggle(item.id)} />
          )}
        />
      )}
    </View>
  );
}

function RegionChip({ label, color, selected, onPress }: { label: string; color: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.regionChip, selected ? { backgroundColor: color + '38', borderColor: color } : null]}>
      <View style={[styles.regionDot, { backgroundColor: color }]} />
      <Text style={[styles.regionChipText, selected ? { color: AppColors.textPrimary, fontWeight: '600' } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    marginBottom: 0,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.divider,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: AppColors.textPrimary, paddingVertical: 10, marginLeft: 8 },
  regionRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingTop: 8 },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.chipBackground,
    borderWidth: 1.2,
    borderColor: 'transparent',
    marginRight: 8,
    marginBottom: 8,
  },
  regionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  regionChipText: { color: AppColors.textSecondary, fontSize: 12 },
});
