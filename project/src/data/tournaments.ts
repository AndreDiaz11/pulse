import { supabase } from '../lib/supabase';
import type { TournamentEvent } from '../models/types';

export async function getTournaments(): Promise<TournamentEvent[]> {
  const { data, error } = await supabase.from('tournaments').select('*').order('begin_at', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    leagueName: row.league_name ?? 'Torneo',
    leagueImageUrl: row.league_image_url ?? '',
    seasonName: row.season_name ?? '',
    tier: row.tier ?? 'amateur',
    type: row.type ?? 'online',
    prizepool: row.prizepool,
    country: row.country,
    beginAtUtc: row.begin_at,
    endAtUtc: row.end_at,
    status: row.status,
    winnerName: row.winner_name,
    winnerLogoUrl: row.winner_logo_url,
  }));
}
