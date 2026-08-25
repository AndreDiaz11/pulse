import { supabase } from './supabase-admin.mjs';

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;

if (!PANDASCORE_API_KEY) {
  console.error('Falta la variable de entorno PANDASCORE_API_KEY');
  process.exit(1);
}

const TIER_MAP = { s: 'tier1', a: 'tier1', b: 'tier2', c: 'tier3', d: 'qualifier' };

function mapTier(tier) {
  return TIER_MAP[tier] ?? 'amateur';
}

function pickBestStage(stages) {
  return stages.find(s => s.has_bracket) ?? stages[0] ?? null;
}

function parseSeries(raw, status) {
  const stages = raw.tournaments ?? [];
  if (stages.length === 0) return null;

  const bestStage = pickBestStage(stages);
  const prizepool = stages.map(s => s.prizepool).find(p => p != null) ?? null;
  const country = stages.map(s => s.country).find(c => c != null) ?? null;
  const winnerId = raw.winner_type === 'Team' && raw.winner_id != null ? String(raw.winner_id) : null;

  return {
    id: String(raw.id),
    league_id: String(raw.league_id ?? raw.league?.id ?? ''),
    league_name: raw.league?.name ?? 'Torneo',
    league_image_url: raw.league?.image_url ?? '',
    season_name: raw.full_name || raw.name || '',
    tier: mapTier(bestStage?.tier),
    type: bestStage?.type ?? 'online',
    prizepool,
    country,
    begin_at: raw.begin_at ? new Date(raw.begin_at).toISOString() : null,
    end_at: raw.end_at ? new Date(raw.end_at).toISOString() : null,
    status,
    winner_id: winnerId,
    winner_name: null,
    winner_logo_url: null,
    updated_at: new Date().toISOString(),
  };
}

async function fetchSeries(endpoint, status) {
  const response = await fetch(`https://api.pandascore.co/dota2/series/${endpoint}?per_page=50&sort=-begin_at`, {
    headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`PandaScore respondió ${response.status} en series/${endpoint}: ${await response.text()}`);
  }
  const data = await response.json();
  return data.map(raw => parseSeries(raw, status)).filter(Boolean);
}

async function resolveWinners(tournaments) {
  const withWinner = tournaments.filter(t => t.status === 'past' && t.winner_id);
  await Promise.all(
    withWinner.map(async t => {
      try {
        const response = await fetch(`https://api.pandascore.co/teams/${t.winner_id}`, {
          headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
        });
        if (!response.ok) return;
        const team = await response.json();
        t.winner_name = team.name ?? team.acronym ?? null;
        t.winner_logo_url = team.image_url ?? null;
      } catch {
        // sin ganador resuelto, no es crítico
      }
    }),
  );
}

async function replaceTournamentsTable(tournaments) {
  const { error: deleteError } = await supabase.from('tournaments').delete().not('id', 'is', null);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from('tournaments').insert(tournaments);
  if (insertError) throw insertError;
}

const [running, upcoming, past] = await Promise.all([
  fetchSeries('running', 'running'),
  fetchSeries('upcoming', 'upcoming'),
  fetchSeries('past', 'past'),
]);

const tournaments = [...running, ...upcoming, ...past];

if (tournaments.length === 0) {
  console.warn('PandaScore devolvió 0 torneos — no se toca Supabase, probablemente un hipo transitorio de la API.');
  process.exit(0);
}

await resolveWinners(tournaments);
await replaceTournamentsTable(tournaments);
console.log(`Sincronizados ${tournaments.length} torneos (${running.length} en curso, ${upcoming.length} próximos, ${past.length} finalizados).`);
