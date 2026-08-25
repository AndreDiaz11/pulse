import { supabase } from './supabase-admin.mjs';
import { mapRegion } from './region-map.mjs';
import { mapTier } from './tier-map.mjs';

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;

if (!PANDASCORE_API_KEY) {
  console.error('Falta la variable de entorno PANDASCORE_API_KEY');
  process.exit(1);
}

const PAST_PAGES = 15;

function parseTeam(json) {
  return {
    id: String(json.id),
    name: json.name ?? json.acronym ?? 'TBD',
    logo_url: json.image_url ?? '',
    region: mapRegion(json.location),
  };
}

const PRO_TIERS = new Set(['tier1', 'tier2', 'tier3']);

function collectTeamsFromMatches(matches, teamsById, { onlyProTier = false } = {}) {
  for (const match of matches) {
    if (onlyProTier) {
      const tier = mapTier(match.tournament?.tier ?? match.league?.tier);
      if (!PRO_TIERS.has(tier)) continue;
    }
    for (const opponent of match.opponents ?? []) {
      if (opponent.opponent) {
        const team = parseTeam(opponent.opponent);
        teamsById.set(team.id, team);
      }
    }
  }
}

async function fetchMatchesPage(endpoint, page) {
  const response = await fetch(`https://api.pandascore.co/dota2/matches/${endpoint}?per_page=100&page=${page}&sort=-end_at`, {
    headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`PandaScore respondió ${response.status} en ${endpoint} página ${page}: ${await response.text()}`);
  }
  return response.json();
}

async function collectTeams() {
  const teamsById = new Map();

  for (const endpoint of ['upcoming', 'running']) {
    const matches = await fetchMatchesPage(endpoint, 1);
    collectTeamsFromMatches(matches, teamsById);
  }

  for (let page = 1; page <= PAST_PAGES; page++) {
    const matches = await fetchMatchesPage('past', page);
    if (matches.length === 0) break;
    collectTeamsFromMatches(matches, teamsById, { onlyProTier: true });
  }

  return [...teamsById.values()];
}

async function replaceTeamsTable(teams) {
  const { error: deleteError } = await supabase.from('teams').delete().not('id', 'is', null);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from('teams').insert(teams);
  if (insertError) throw insertError;
}

const teams = await collectTeams();

if (teams.length === 0) {
  console.warn('PandaScore devolvió 0 equipos — no se toca Supabase, probablemente un hipo transitorio de la API.');
  process.exit(0);
}

await replaceTeamsTable(teams);
console.log(`Sincronizados ${teams.length} equipos (partidos actuales + tier1/tier2/tier3 de los últimos ~3 años, sin clasificatorios).`);
