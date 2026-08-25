import type { MatchModel } from '../models/types';
import { dayKey, startOfDay, toPeru } from './peruTime';

export interface DayGroup {
  key: string;
  day: Date;
  matches: MatchModel[];
}

export function groupMatchesByDay(matches: MatchModel[]): Map<string, DayGroup> {
  const map = new Map<string, DayGroup>();
  for (const match of matches) {
    const day = startOfDay(toPeru(match.startTimeUtc));
    const key = dayKey(day);
    if (!map.has(key)) map.set(key, { key, day, matches: [] });
    map.get(key)!.matches.push(match);
  }
  for (const group of map.values()) {
    group.matches.sort((a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime());
  }
  return map;
}

export function groupMatchesByTournament(matches: MatchModel[]): Map<string, MatchModel[]> {
  const map = new Map<string, MatchModel[]>();
  for (const match of matches) {
    if (!map.has(match.tournament.id)) map.set(match.tournament.id, []);
    map.get(match.tournament.id)!.push(match);
  }
  return map;
}
