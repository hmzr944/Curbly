import { addDays, daysBetween } from "./dates";
import { penaltyRate, semesterOf, type RateMode, type Semester } from "./rates";

export const FIXED_INDEMNITY = 40;

export interface PenaltyInput {
  /** Amount due including VAT, in euros. */
  amount: number;
  /** Due date printed on the invoice (ISO). */
  dueDate: string;
  /** Payment date, or the date the claim is computed for (ISO). */
  until: string;
  mode: RateMode;
  /** Annual rate written in the terms of sale, in percent (mode "contract" only). */
  contractRate?: number;
  /** Number of invoices covered by `amount`: the €40 indemnity is due per invoice. */
  invoices?: number;
  includeIndemnity?: boolean;
}

export interface PenaltySegment {
  semester: Semester;
  from: string;
  to: string;
  days: number;
  rate: number;
  interest: number;
  estimated: boolean;
}

export interface PenaltyResult {
  daysLate: number;
  segments: PenaltySegment[];
  interest: number;
  indemnity: number;
  total: number;
  warnings: string[];
}

/**
 * Late-payment interest between professionals: simple interest, amount × rate × days / 365, counted
 * from the day after the due date. A delay spanning several semesters is split so each day uses the
 * rate of its own semester.
 */
export function computePenalties(input: PenaltyInput): PenaltyResult {
  const { amount, dueDate, until, mode, contractRate, invoices = 1, includeIndemnity = true } = input;
  const warnings: string[] = [];
  const daysLate = Math.max(0, daysBetween(dueDate, until));
  const segments: PenaltySegment[] = [];

  let cursor = addDays(dueDate, 1);
  let remaining = daysLate;
  while (remaining > 0) {
    const semester = semesterOf(cursor);
    const end = semesterEnd(cursor);
    const days = Math.min(remaining, daysBetween(cursor, end) + 1);
    const to = addDays(cursor, days - 1);
    const r = penaltyRate(cursor, mode, contractRate);
    if (r.belowFloor && !warnings.some((w) => w.startsWith("Le taux"))) {
      warnings.push(
        `Le taux de vos conditions générales est inférieur au minimum légal (3 × le taux d'intérêt légal). Le minimum de ${fmtRate(r.floor)} est appliqué.`,
      );
    }
    if (r.estimated && !warnings.some((w) => w.startsWith("Taux estimé"))) {
      warnings.push(`Taux estimé pour ${semester} : le taux officiel de cette période n'est pas encore dans notre table.`);
    }
    segments.push({ semester, from: cursor, to, days, rate: r.rate, interest: round2((amount * r.rate * days) / 36500), estimated: r.estimated });
    remaining -= days;
    cursor = addDays(to, 1);
  }

  const interest = round2(segments.reduce((s, x) => s + x.interest, 0));
  const indemnity = includeIndemnity && daysLate > 0 ? FIXED_INDEMNITY * Math.max(1, invoices) : 0;
  return { daysLate, segments, interest, indemnity, total: round2(interest + indemnity), warnings };
}

function semesterEnd(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return m <= 6 ? `${y}-06-30` : `${y}-12-31`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function fmtRate(n: number) {
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
}
