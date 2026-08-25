export const AppColors = {
  background: '#121214',
  surface: '#1B1B1F',
  divider: '#2A2A2F',
  headerBackground: '#B9D2F3',
  headerForeground: '#15294D',
  accent: '#4C7FDD',
  accentOnDark: '#6C93E0',
  chipBackground: '#2A2A30',
  textPrimary: '#F2F2F3',
  textSecondary: '#A0A0A8',
  live: '#E24C4C',
};

export const AppRadius = { sm: 10, md: 14, lg: 18 };

export type TournamentTier = 'tier1' | 'tier2' | 'tier3' | 'qualifier' | 'amateur';
export type Region = 'na' | 'sa' | 'eu' | 'cn' | 'sea' | 'other';

export function tierColor(tier: TournamentTier): string {
  switch (tier) {
    case 'tier1':
      return '#E0B84C';
    case 'tier2':
      return '#C0C4CC';
    case 'tier3':
      return '#CD8A4C';
    case 'qualifier':
      return '#6C93E0';
    default:
      return '#7A7A82';
  }
}

export function regionColor(region: Region): string {
  switch (region) {
    case 'na':
      return '#4C7FDD';
    case 'sa':
      return '#4CC97D';
    case 'eu':
      return '#9B6CDD';
    case 'cn':
      return '#E0A83C';
    case 'sea':
      return '#4CC9DD';
    default:
      return '#8A8A93';
  }
}

const REGION_LABELS: Record<Region, string> = {
  na: 'Norteamérica',
  sa: 'Sudamérica',
  eu: 'Europa',
  cn: 'China',
  sea: 'Sudeste Asiático',
  other: 'Otra región',
};

export function regionLabel(region: Region): string {
  return REGION_LABELS[region] ?? '';
}

export function tournamentAccentColor(tournamentId: string): string {
  let hash = 0;
  for (let i = 0; i < tournamentId.length; i++) {
    hash = (hash * 31 + tournamentId.charCodeAt(i)) & 0x7fffffff;
  }
  const hue = hash % 360;
  return hslToHex(hue, 0.55, 0.58);
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
