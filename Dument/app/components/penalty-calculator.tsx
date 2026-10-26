"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDays, euros, frenchDate } from "@/lib/dates";
import { computePenalties, fmtRate } from "@/lib/penalties";
import { CountUp } from "./count-up";
import type { RateMode } from "@/lib/rates";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function PenaltyCalculator({ compact = false }: { compact?: boolean }) {
  const [amount, setAmount] = useState("2400");
  // Dates are filled on the client: pages are prerendered, so "today" must be the visitor's day, not the build's.
  const [dueDate, setDueDate] = useState("");
  const [until, setUntil] = useState("");
  useEffect(() => {
    setDueDate(addDays(today(), -45));
    setUntil(today());
  }, []);
  const [mode, setMode] = useState<RateMode>("statutory");
  const [contractRate, setContractRate] = useState("");
  const [invoices, setInvoices] = useState("1");

  const value = Number(amount.replace(",", ".").replace(/\s/g, ""));
  const valid = value > 0 && dueDate && until;
  const result = useMemo(
    () =>
      valid
        ? computePenalties({
            amount: value,
            dueDate,
            until,
            mode,
            contractRate: Number(contractRate.replace(",", ".")) || 0,
            invoices: Math.max(1, Number(invoices) || 1),
          })
        : null,
    [valid, value, dueDate, until, mode, contractRate, invoices],
  );

  return (
    <div className="card p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Montant TTC impayé</span>
          <div className="relative">
            <input className="field num pr-8" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">€</span>
          </div>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Date d'échéance de la facture</span>
          <input className="field num" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        {!compact && (
          <>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Calculer jusqu'au</span>
              <input className="field num" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
              <span className="block text-xs text-muted">Date du paiement, ou aujourd'hui si la facture est toujours impayée.</span>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Nombre de factures concernées</span>
              <input className="field num" inputMode="numeric" value={invoices} onChange={(e) => setInvoices(e.target.value)} />
              <span className="block text-xs text-muted">L'indemnité de 40 € est due pour chaque facture.</span>
            </label>
            <fieldset className="space-y-2 text-sm sm:col-span-2">
              <legend className="mb-1.5 font-medium">Taux applicable</legend>
              {(
                [
                  ["statutory", "Mes conditions ne prévoient pas de taux (taux BCE + 10 points)"],
                  ["contract", "Mes conditions générales fixent un taux"],
                  ["public", "Mon client est un acheteur public (taux BCE + 8 points)"],
                ] as const
              ).map(([m, label]) => (
                <label key={m} className="flex items-start gap-2.5">
                  <input type="radio" name="mode" className="mt-1 accent-[var(--color-brand)]" checked={mode === m} onChange={() => setMode(m)} />
                  <span>{label}</span>
                </label>
              ))}
              {mode === "contract" && (
                <div className="relative mt-2 max-w-48">
                  <input
                    className="field num pr-8"
                    inputMode="decimal"
                    placeholder="Taux annuel"
                    value={contractRate}
                    onChange={(e) => setContractRate(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">%</span>
                </div>
              )}
            </fieldset>
          </>
        )}
      </div>

      <div className="mt-6 border-t-2 border-dashed border-rule pt-5" aria-live="polite">
        {!result ? (
          <p className="text-sm text-muted">Indiquez un montant et une date d'échéance.</p>
        ) : result.daysLate === 0 ? (
          <p className="text-sm text-muted">Cette facture n'est pas encore en retard : aucune pénalité n'est due.</p>
        ) : (
          <>
            <p className="text-sm text-muted">
              Votre client vous doit, en plus des {euros(value)} de la facture&nbsp;:
            </p>
            <p className="num font-display mt-1 text-5xl font-extrabold text-late sm:text-6xl">
              <CountUp value={result.total} />
            </p>
            <dl className="num mt-4 grid gap-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Retard</dt>
                <dd>{result.daysLate} jours</dd>
              </div>
              {result.segments.map((s) => (
                <div key={s.semester} className="flex justify-between gap-4">
                  <dt className="text-muted">
                    Pénalités du {frenchDate(s.from)} au {frenchDate(s.to)} à {fmtRate(s.rate)}
                    {s.estimated ? " (estimé)" : ""}
                  </dt>
                  <dd>{euros(s.interest)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Indemnité forfaitaire de recouvrement</dt>
                <dd>{euros(result.indemnity)}</dd>
              </div>
            </dl>
            {result.warnings.map((w) => (
              <p key={w} className="mt-3 rounded-xl bg-late-soft px-3 py-2 text-sm text-late-ink">{w}</p>
            ))}
            <Link
              href={`/outils/lettre-de-relance?montant=${value}&echeance=${dueDate}`}
              className="btn btn-primary btn-sm mt-6"
            >
              Réclamer cette somme dans une relance
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
