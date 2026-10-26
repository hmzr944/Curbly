// Dates are handled as ISO calendar days ("2026-03-15") in UTC to avoid timezone drift.

const DAY_MS = 86_400_000;

export function parseDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Date invalide : ${iso}`);
  return Date.UTC(y, m - 1, d);
}

export function formatDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return formatDay(parseDay(iso) + days * DAY_MS);
}

/** Number of days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to) - parseDay(from)) / DAY_MS);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function frenchDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    parseDay(iso),
  );
}

export function euros(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}
