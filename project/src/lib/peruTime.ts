const PERU_OFFSET_MS = -5 * 60 * 60 * 1000;

export function peruNow(): Date {
  return new Date(Date.now() + PERU_OFFSET_MS);
}

export function toPeru(utc: string | Date): Date {
  const date = typeof utc === 'string' ? new Date(utc) : utc;
  return new Date(date.getTime() + PERU_OFFSET_MS);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
