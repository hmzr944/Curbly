"use client";

import { useEffect, useState } from "react";
import { CountUp } from "./count-up";

// One invoice's life in a few seconds: overdue, three reminders, paid. Purely illustrative.
const MESSAGES = [
  { day: "J+1", title: "Première relance envoyée", body: "« Sauf erreur de ma part, je n'ai pas encore reçu le règlement… »" },
  { day: "J+8", title: "Deuxième relance envoyée", body: "« Merci de procéder au règlement sous 7 jours. »" },
  { day: "J+15", title: "Dernière relance, pénalités chiffrées", body: "Pénalités légales et indemnité de 40 € ajoutées." },
];
const TIMELINE = [700, 1900, 3100, 4700]; // reveal times for messages 1–3, then "paid"
const LOOP = 9000;

export function HeroScene() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(4);
      return;
    }
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setStep(0);
      timers = TIMELINE.map((t, i) => setTimeout(() => setStep(i + 1), t));
      timers.push(setTimeout(run, LOOP));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const paid = step >= 4;
  const penalties = step >= 3 ? 64.46 : 0;

  return (
    <div className="relative" aria-hidden>
      <div className="card relative overflow-hidden p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Facture</p>
            <p className="num font-display text-2xl font-bold">F-2026-041</p>
            <p className="text-sm text-muted">Atelier Nord, échue le 30 septembre</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
              paid ? "bg-paid-soft text-paid-ink" : "bg-late-soft text-late-ink"
            }`}
          >
            {paid ? "Payée" : "En retard"}
          </span>
        </div>

        <ol className="mt-6 space-y-2.5">
          {MESSAGES.map((m, i) => (
            <li
              key={m.day}
              data-state={step > i ? "shown" : "hidden"}
              className="msg flex gap-3 rounded-2xl border border-rule bg-paper p-3"
            >
              <span className="num mt-0.5 h-fit shrink-0 rounded-full bg-late px-2 py-0.5 text-xs font-bold text-white">{m.day}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{m.title}</span>
                <span className="block truncate text-sm text-muted">{m.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="num mt-6 space-y-1.5 border-t border-dashed border-rule pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Facture</span>
            <span>2 400,00 €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Pénalités et indemnité</span>
            <span className="font-semibold text-late-ink">
              + <CountUp value={penalties} duration={900} />
            </span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold">
            <span>{paid ? "Reçu sur votre compte" : "À encaisser"}</span>
            <span className={paid ? "text-paid-ink" : ""}>
              <CountUp value={2400 + penalties} duration={900} />
            </span>
          </div>
        </div>

        {paid && (
          <span
            data-play
            className="stamp absolute right-6 top-28 rounded-xl border-[3px] border-paid px-3 py-1 font-display text-3xl font-extrabold text-paid backdrop-blur-[1px]"
          >
            PAYÉE
          </span>
        )}
      </div>
    </div>
  );
}
