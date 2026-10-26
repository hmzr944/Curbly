import { describe, expect, it } from "vitest";
import { computePenalties } from "../lib/penalties";

describe("computePenalties", () => {
  it("applies ECB + 10 points within a single semester", () => {
    // 2026-S1: ECB 2.15 → 12.15 %. 1 000 € × 12.15 % × 30 / 365 = 9.99 €
    const r = computePenalties({ amount: 1000, dueDate: "2026-03-01", until: "2026-03-31", mode: "statutory" });
    expect(r.daysLate).toBe(30);
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0].rate).toBe(12.15);
    expect(r.interest).toBe(9.99);
    expect(r.indemnity).toBe(40);
    expect(r.total).toBe(49.99);
  });

  it("splits a delay crossing 1 July", () => {
    const r = computePenalties({ amount: 10000, dueDate: "2026-06-20", until: "2026-07-10", mode: "statutory" });
    expect(r.segments.map((s) => [s.semester, s.days, s.rate])).toEqual([
      ["2026-S1", 10, 12.15],
      ["2026-S2", 10, 12.4],
    ]);
    // 10 000 × 12.15 % × 10/365 = 33.29 ; 10 000 × 12.40 % × 10/365 = 33.97
    expect(r.interest).toBe(67.26);
  });

  it("raises a contractual rate below the legal floor", () => {
    const r = computePenalties({ amount: 1000, dueDate: "2026-08-01", until: "2026-08-11", mode: "contract", contractRate: 5 });
    expect(r.segments[0].rate).toBe(8.25);
    expect(r.warnings[0]).toMatch(/inférieur au minimum légal/);
  });

  it("charges the fixed indemnity per invoice and nothing when not late", () => {
    expect(computePenalties({ amount: 500, dueDate: "2026-08-01", until: "2026-08-05", mode: "statutory", invoices: 3 }).indemnity).toBe(120);
    const onTime = computePenalties({ amount: 500, dueDate: "2026-08-01", until: "2026-08-01", mode: "statutory" });
    expect(onTime.total).toBe(0);
  });

  it("flags semesters missing from the rate table", () => {
    const r = computePenalties({ amount: 1000, dueDate: "2026-12-20", until: "2027-01-10", mode: "statutory" });
    expect(r.segments[1].estimated).toBe(true);
    expect(r.warnings.some((w) => w.startsWith("Taux estimé"))).toBe(true);
  });
});
