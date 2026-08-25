import { supabase } from '../lib/supabase';
import type { Team } from '../models/types';

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? '',
    region: row.region ?? 'other',
  }));
}
