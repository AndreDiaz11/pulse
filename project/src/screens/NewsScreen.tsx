import React from 'react';
import { ActivityIndicator, FlatList, Image, Linking, StyleSheet, Text, View } from 'react-native';
import { useAsyncData } from '../lib/useAsyncData';
import { getLatestNews } from '../data/news';
import { AppColors } from '../theme/colors';
import { toPeru } from '../lib/peruTime';
import { AppCard } from '../components/AppCard';
import { StateMessage } from '../components/StateMessage';
import type { NewsItem } from '../models/types';

function formatDate(date: Date): string {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${date.getDate()} ${months[date.getMonth()]}, ${hh}:${mm}`;
}

export function NewsScreen() {
  const { data: items, loading, error } = useAsyncData(getLatestNews);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }
  if (error) return <StateMessage icon="error-outline" message="No se pudieron cargar las noticias." />;
  if (!items || items.length === 0) return <StateMessage icon="article" message="No hay noticias por el momento." />;

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={i => i.id}
      contentContainerStyle={{ paddingVertical: 6 }}
      renderItem={({ item }) => <NewsCard item={item} />}
    />
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const date = formatDate(toPeru(item.publishedAtUtc));
  return (
    <AppCard onPress={() => Linking.openURL(item.link)} padding={0}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.source} · {date}
        </Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  image: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: 12 },
  title: { color: AppColors.textPrimary, fontWeight: 'bold', fontSize: 15 },
  meta: { color: AppColors.textSecondary, fontSize: 12, marginTop: 6 },
});
