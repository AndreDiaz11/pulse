import { supabase } from '../lib/supabase';
import type { MatchModel } from '../models/types';

export async function getUpcomingMatches(): Promise<MatchModel[]> {
  const { data, error } = await supabase.from('matches').select('*').order('start_time_utc', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    tournament: { id: row.tournament_id, name: row.tournament_name, tier: row.tier },
    teamA: row.team_a,
    teamB: row.team_b,
    startTimeUtc: row.start_time_utc,
    bestOf: row.best_of,
    status: row.status,
    headToHead: row.head_to_head ?? [],
    liveScore: row.live_score ?? null,
  }));
}
