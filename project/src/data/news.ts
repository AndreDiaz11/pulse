import { supabase } from '../lib/supabase';
import type { NewsItem } from '../models/types';

export async function getLatestNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(60);
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title ?? 'Sin título',
    link: row.link,
    source: row.source ?? '',
    summary: row.summary ?? '',
    imageUrl: row.image_url,
    publishedAtUtc: row.published_at,
  }));
}
