// Reference rates used for late-payment penalties between professionals (Code de commerce, art. L441-10).
//
// - Statutory penalty rate: ECB main refinancing rate in force on 1 January (H1) or 1 July (H2), plus 10 points.
// - Contractual floor: 3 × the "taux d'intérêt légal" for professional creditors of the same semester.
// - Public procurement: ECB rate + 8 points.
//
// Update this table every semester (ECB rate on 1 Jan / 1 Jul, legal rate from the arrêté published in the JO).

export type Semester = `${number}-S${1 | 2}`;

export interface SemesterRates {
  /** ECB main refinancing operations rate, in percent. */
  ecb: number;
  /** Taux d'intérêt légal, professional creditors, in percent. */
  legalPro: number;
}

export const RATES: Record<Semester, SemesterRates> = {
  "2024-S1": { ecb: 4.5, legalPro: 5.07 },
  "2024-S2": { ecb: 4.25, legalPro: 4.92 },
  "2025-S1": { ecb: 3.15, legalPro: 3.71 },
  "2025-S2": { ecb: 2.15, legalPro: 2.76 },
  "2026-S1": { ecb: 2.15, legalPro: 2.62 },
  "2026-S2": { ecb: 2.4, legalPro: 2.75 },
};

export const RATES_UPDATED_AT = "2026-10-26";

export function semesterOf(iso: string): Semester {
  const [y, m] = iso.split("-").map(Number);
  return `${y}-S${m <= 6 ? 1 : 2}` as Semester;
}

const known = (Object.keys(RATES) as Semester[]).sort();

/**
 * Rates for the semester containing `iso`. Semesters outside the table fall back to the closest
 * known semester and are flagged as estimated so the UI can say so.
 */
export function ratesFor(iso: string): SemesterRates & { semester: Semester; estimated: boolean } {
  const semester = semesterOf(iso);
  if (RATES[semester]) return { ...RATES[semester], semester, estimated: false };
  const fallback = semester < known[0] ? known[0] : known[known.length - 1];
  return { ...RATES[fallback], semester, estimated: true };
}

export type RateMode = "statutory" | "contract" | "public";

export function penaltyRate(iso: string, mode: RateMode, contractRate?: number) {
  const r = ratesFor(iso);
  const floor = round2(r.legalPro * 3);
  let rate: number;
  let belowFloor = false;
  if (mode === "statutory") rate = r.ecb + 10;
  else if (mode === "public") rate = r.ecb + 8;
  else {
    rate = contractRate ?? 0;
    if (rate < floor) {
      belowFloor = true;
      rate = floor;
    }
  }
  return { rate: round2(rate), floor, belowFloor, semester: r.semester, estimated: r.estimated };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
