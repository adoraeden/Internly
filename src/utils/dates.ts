// Date helpers that work on "YYYY-MM-DD" text using the user's LOCAL calendar day.
// (toISOString() uses UTC, which can give the wrong day in India.)

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayLocalISO(): string {
  return toISO(new Date());
}

/** A date N days from today as YYYY-MM-DD in local time. */
export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** Whole days from today until the given YYYY-MM-DD date (negative = already past). */
export function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}