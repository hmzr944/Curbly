"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays } from "@/lib/dates";
import { STAGES, type StageId } from "@/lib/sequence";
import { renderLetter, SIGNATURE_FOOTER } from "@/lib/templates";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const STAGE_IDS = STAGES.map((s) => s.id);

export function LetterGenerator({ initialStage = "first" }: { initialStage?: StageId }) {
  const [stageId, setStageId] = useState<StageId>(initialStage);
  const [f, setF] = useState({
    senderName: "",
    senderCompany: "",
    clientName: "",
    clientCompany: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    amount: "",
    paymentDetails: "",
  });
  const [footer, setFooter] = useState(true);
  const [copied, setCopied] = useState<"" | "subject" | "body">("");

  const [now, setNow] = useState("");

  // Pages are prerendered, so dates are filled on the client. Query parameters from the penalty calculator
  // or a template page (?montant=…&echeance=…&etape=…) pre-fill the form.
  useEffect(() => {
    const t = today();
    setNow(t);
    const q = new URLSearchParams(window.location.search);
    const montant = q.get("montant");
    const echeance = q.get("echeance");
    const etape = q.get("etape") as StageId | null;
    setF((prev) => ({
      ...prev,
      amount: montant ?? prev.amount,
      dueDate: validDate(echeance) ? echeance : addDays(t, -30),
      invoiceDate: validDate(echeance) ? addDays(echeance, -30) : addDays(t, -60),
    }));
    if (etape && STAGE_IDS.includes(etape)) setStageId(etape);
    else if (montant && echeance) setStageId("final");
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const letter = useMemo(() => {
    const day = now || "2026-01-01";
    const amount = Number(f.amount.replace(",", ".").replace(/\s/g, "")) || 0;
    const l = renderLetter(stageId, {
      senderName: f.senderName || "[Votre nom]",
      senderCompany: f.senderCompany || undefined,
      clientName: f.clientName || "[Nom du client]",
      clientCompany: f.clientCompany || undefined,
      invoiceNumber: f.invoiceNumber || "[numéro]",
      invoiceDate: f.invoiceDate || day,
      dueDate: f.dueDate || day,
      amount,
      today: day,
      paymentDetails: f.paymentDetails || undefined,
    });
    const body = footer && stageId !== "formal-notice" ? `${l.body}\n\n--\n${SIGNATURE_FOOTER}` : l.body;
    return { ...l, body };
  }, [f, stageId, footer, now]);

  async function copy(what: "subject" | "body") {
    await navigator.clipboard.writeText(what === "subject" ? letter.subject : letter.body);
    setCopied(what);
    setTimeout(() => setCopied(""), 1600);
  }

  const isNotice = stageId === "formal-notice";
  const mailto = `mailto:?subject=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form className="no-print space-y-5" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Étape de la relance</legend>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageId(s.id)}
                aria-pressed={stageId === s.id}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  stageId === s.id ? "border-ink bg-ink text-paper" : "border-rule bg-sheet hover:border-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Votre nom" value={f.senderName} onChange={set("senderName")} />
          <Field label="Votre entreprise (facultatif)" value={f.senderCompany} onChange={set("senderCompany")} />
          <Field label="Nom de votre contact" value={f.clientName} onChange={set("clientName")} />
          <Field label="Entreprise cliente" value={f.clientCompany} onChange={set("clientCompany")} />
          <Field label="Numéro de facture" value={f.invoiceNumber} onChange={set("invoiceNumber")} />
          <Field label="Montant TTC (€)" value={f.amount} onChange={set("amount")} inputMode="decimal" />
          <Field label="Date de la facture" type="date" value={f.invoiceDate} onChange={set("invoiceDate")} />
          <Field label="Date d'échéance" type="date" value={f.dueDate} onChange={set("dueDate")} />
        </div>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Coordonnées de paiement (facultatif)</span>
          <textarea className="field min-h-20" value={f.paymentDetails} onChange={set("paymentDetails")} placeholder="IBAN, lien de paiement…" />
        </label>
        {!isNotice && (
          <label className="flex items-start gap-2.5 text-sm text-muted">
            <input type="checkbox" className="mt-1 accent-[var(--color-ink)]" checked={footer} onChange={(e) => setFooter(e.target.checked)} />
            <span>Ajouter une ligne discrète mentionnant Dûment en bas du message. C'est ce qui garde l'outil gratuit.</span>
          </label>
        )}
      </form>

      <article className="rounded-2xl border border-rule bg-sheet p-5 sm:p-7 print:border-0 print:p-0">
        <div className="no-print mb-4 flex flex-wrap items-center gap-2">
          {!isNotice && (
            <a href={mailto} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
              Ouvrir dans ma messagerie
            </a>
          )}
          {isNotice && (
            <button type="button" onClick={() => window.print()} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
              Imprimer ou enregistrer en PDF
            </button>
          )}
          <button type="button" onClick={() => copy("subject")} className="rounded-lg border border-rule px-3 py-2 text-sm hover:border-ink">
            {copied === "subject" ? "Objet copié" : "Copier l'objet"}
          </button>
          <button type="button" onClick={() => copy("body")} className="rounded-lg border border-rule px-3 py-2 text-sm hover:border-ink">
            {copied === "body" ? "Texte copié" : "Copier le texte"}
          </button>
        </div>
        <p className="text-sm text-muted">Objet</p>
        <p className="mb-4 font-semibold">{letter.subject}</p>
        <div className="prose-letter">{letter.body}</div>
        {isNotice && (
          <p className="no-print mt-6 rounded-lg bg-late-soft px-3 py-2 text-sm">
            Envoyez la mise en demeure en lettre recommandée avec accusé de réception (papier ou électronique) : c'est elle
            qui fait courir les délais et qui servira de preuve devant le juge.
          </p>
        )}
      </article>
    </div>
  );
}

function validDate(s: string | null): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function Field(props: { label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; type?: string; inputMode?: "decimal" }) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium">{props.label}</span>
      <input className="field" type={props.type ?? "text"} value={props.value} onChange={props.onChange} inputMode={props.inputMode} />
    </label>
  );
}
