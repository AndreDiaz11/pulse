import type { Region, TournamentTier } from '../theme/colors';

export type BestOf = 'bo1' | 'bo2' | 'bo3' | 'bo5';
export type MatchStatus = 'upcoming' | 'running';
export type TournamentEventStatus = 'running' | 'upcoming' | 'past';

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  region: Region;
}

export interface Tournament {
  id: string;
  name: string;
  tier: TournamentTier;
}

export interface LiveScore {
  teamAScore: number;
  teamBScore: number;
}

export interface H2HResult {
  dateUtc: string;
  tournamentName: string;
  teamAScore: number;
  teamBScore: number;
  winnerId: string | null;
}

export interface MatchModel {
  id: string;
  tournament: Tournament;
  teamA: Team;
  teamB: Team;
  startTimeUtc: string;
  bestOf: BestOf;
  status: MatchStatus;
  headToHead: H2HResult[];
  liveScore: LiveScore | null;
}

export interface TournamentEvent {
  id: string;
  leagueName: string;
  leagueImageUrl: string;
  seasonName: string;
  tier: TournamentTier;
  type: string;
  prizepool: string | null;
  country: string | null;
  beginAtUtc: string | null;
  endAtUtc: string | null;
  status: TournamentEventStatus;
  winnerName: string | null;
  winnerLogoUrl: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  summary: string;
  imageUrl: string | null;
  publishedAtUtc: string;
}

export function matchIsLive(match: MatchModel): boolean {
  return match.status === 'running';
}

export function matchInvolvesTeam(match: MatchModel, teamId: string): boolean {
  return match.teamA.id === teamId || match.teamB.id === teamId;
}
