import { supabase } from './supabase-admin.mjs';
import { mapRegion } from './region-map.mjs';
import { mapTier } from './tier-map.mjs';

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;

if (!PANDASCORE_API_KEY) {
  console.error('Falta la variable de entorno PANDASCORE_API_KEY');
  process.exit(1);
}

const MAX_H2H_ENTRIES = 5;

function mapBestOf(games) {
  return { 1: 'bo1', 2: 'bo2', 3: 'bo3', 5: 'bo5' }[games] ?? 'bo1';
}

function parseTeam(json) {
  return {
    id: String(json.id),
    name: json.name ?? json.acronym ?? 'TBD',
    logoUrl: json.image_url ?? '',
    region: mapRegion(json.location),
  };
}

function parseOpponents(raw) {
  const opponents = raw.opponents ?? [];
  if (opponents.length < 2) return null;
  const teamAJson = opponents[0]?.opponent;
  const teamBJson = opponents[1]?.opponent;
  if (!teamAJson || !teamBJson) return null;
  return { teamAJson, teamBJson };
}

function parseLiveScore(raw, teamAId, teamBId, status) {
  if (status !== 'running') return null;
  const results = raw.results ?? [];
  const scoreFor = id => results.find(r => String(r.team_id) === id)?.score ?? 0;
  return { teamAScore: scoreFor(teamAId), teamBScore: scoreFor(teamBId) };
}

function parseMatch(raw, status) {
  const parsedOpponents = parseOpponents(raw);
  if (!parsedOpponents) return null;

  const scheduledAt = raw.scheduled_at ?? raw.begin_at;
  if (!scheduledAt) return null;

  const league = raw.league;
  const tournament = raw.tournament;
  const teamA = parseTeam(parsedOpponents.teamAJson);
  const teamB = parseTeam(parsedOpponents.teamBJson);

  return {
    id: String(raw.id),
    tournament_id: String(league?.id ?? tournament?.id ?? raw.id),
    tournament_name: league?.name ?? tournament?.name ?? 'Torneo',
    tier: mapTier(tournament?.tier),
    team_a: teamA,
    team_b: teamB,
    start_time_utc: new Date(scheduledAt).toISOString(),
    best_of: mapBestOf(raw.number_of_games),
    status,
    live_score: parseLiveScore(raw, teamA.id, teamB.id, status),
    updated_at: new Date().toISOString(),
  };
}

function parsePastMatch(raw) {
  const parsedOpponents = parseOpponents(raw);
  if (!parsedOpponents) return null;
  const endAt = raw.end_at ?? raw.scheduled_at ?? raw.begin_at;
  if (!endAt || !raw.results || raw.results.length < 2) return null;

  const teamAId = String(parsedOpponents.teamAJson.id);
  const teamBId = String(parsedOpponents.teamBJson.id);
  const scoreFor = teamId => raw.results.find(r => String(r.team_id) === teamId)?.score ?? 0;

  return {
    teamAId,
    teamBId,
    teamAScore: scoreFor(teamAId),
    teamBScore: scoreFor(teamBId),
    winnerId: raw.winner_id != null ? String(raw.winner_id) : null,
    tournamentName: raw.league?.name ?? raw.tournament?.name ?? 'Torneo',
    dateUtc: new Date(endAt),
  };
}

function buildHeadToHead(match, pastMatches) {
  return pastMatches
    .filter(
      p =>
        (p.teamAId === match.team_a.id && p.teamBId === match.team_b.id) ||
        (p.teamAId === match.team_b.id && p.teamBId === match.team_a.id),
    )
    .sort((a, b) => b.dateUtc - a.dateUtc)
    .slice(0, MAX_H2H_ENTRIES)
    .map(p => {
      const sameOrder = p.teamAId === match.team_a.id;
      return {
        dateUtc: p.dateUtc.toISOString(),
        tournamentName: p.tournamentName,
        teamAScore: sameOrder ? p.teamAScore : p.teamBScore,
        teamBScore: sameOrder ? p.teamBScore : p.teamAScore,
        winnerId: p.winnerId,
      };
    });
}

async function fetchMatches(endpoint, status) {
  const response = await fetch(`https://api.pandascore.co/dota2/matches/${endpoint}?per_page=100&sort=begin_at`, {
    headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`PandaScore respondió ${response.status} en ${endpoint}: ${await response.text()}`);
  }
  const data = await response.json();
  return data.map(raw => parseMatch(raw, status)).filter(Boolean);
}

async function fetchPastMatches() {
  const response = await fetch('https://api.pandascore.co/dota2/matches/past?per_page=100&sort=-end_at', {
    headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
  });
  if (!response.ok) {
    console.warn(`No se pudo traer el historial de partidos pasados (HTTP ${response.status}) — se sigue sin historial cara a cara.`);
    return [];
  }
  const data = await response.json();
  return data.map(parsePastMatch).filter(Boolean);
}

async function replaceMatchesTable(matches) {
  const { error: deleteError } = await supabase.from('matches').delete().not('id', 'is', null);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from('matches').insert(matches);
  if (insertError) throw insertError;
}

const [upcoming, running, pastMatches] = await Promise.all([
  fetchMatches('upcoming', 'upcoming'),
  fetchMatches('running', 'running'),
  fetchPastMatches(),
]);

const matches = [...running, ...upcoming];

if (matches.length === 0) {
  console.warn('PandaScore devolvió 0 partidos — no se toca Supabase, probablemente un hipo transitorio de la API.');
  process.exit(0);
}

for (const match of matches) {
  match.head_to_head = buildHeadToHead(match, pastMatches);
}

await replaceMatchesTable(matches);
console.log(`Sincronizados ${matches.length} partidos (${running.length} en vivo), con historial cara a cara desde ${pastMatches.length} partidos pasados.`);
