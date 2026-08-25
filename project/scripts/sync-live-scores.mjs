import { supabase } from './supabase-admin.mjs';

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;

if (!PANDASCORE_API_KEY) {
  console.error('Falta la variable de entorno PANDASCORE_API_KEY');
  process.exit(1);
}

async function fetchRunning() {
  const response = await fetch('https://api.pandascore.co/dota2/matches/running?per_page=100', {
    headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`PandaScore respondió ${response.status} en running: ${await response.text()}`);
  }
  return response.json();
}

const running = await fetchRunning();

if (running.length === 0) {
  console.log('No hay partidos en vivo ahora mismo.');
  process.exit(0);
}

let updated = 0;

for (const raw of running) {
  const opponents = raw.opponents ?? [];
  if (opponents.length < 2) continue;
  const teamAId = opponents[0]?.opponent?.id != null ? String(opponents[0].opponent.id) : null;
  const teamBId = opponents[1]?.opponent?.id != null ? String(opponents[1].opponent.id) : null;
  if (!teamAId || !teamBId) continue;

  const results = raw.results ?? [];
  const scoreFor = id => results.find(r => String(r.team_id) === id)?.score ?? 0;

  const { error } = await supabase
    .from('matches')
    .update({ live_score: { teamAScore: scoreFor(teamAId), teamBScore: scoreFor(teamBId) } })
    .eq('id', String(raw.id));

  if (!error) updated++;
}

console.log(`Marcador en vivo actualizado en ${updated} partidos.`);
