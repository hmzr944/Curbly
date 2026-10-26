"use client";

import { useEffect, useState } from "react";

export function EarlyAccess() {
  const [email, setEmail] = useState("");
  const [volume, setVolume] = useState("");
  const [ref, setRef] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRef(new URLSearchParams(window.location.search).get("ref"));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const website = new FormData(e.currentTarget).get("website");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, volume, ref, website }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data?.code) {
      setError(data?.error ?? "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.");
      setState("idle");
      return;
    }
    setLink(`${window.location.origin}/?ref=${data.code}`);
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="space-y-3">
        <svg viewBox="0 0 24 24" className="h-12 w-12 rounded-full bg-paid p-2.5 text-white" aria-hidden>
          <path className="draw-check" d="M5 12.5l4.2 4L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-display text-2xl font-bold">C'est noté. On vous écrit dès que votre accès est prêt.</p>
        <p className="text-muted">
          Vous connaissez un indépendant qui court après ses factures ? Envoyez-lui ce lien : chaque inscription faite avec
          vous fait avancer votre place dans la file.
        </p>
        <div className="flex flex-wrap gap-2">
          <input readOnly value={link} className="field num max-w-md" aria-label="Votre lien de parrainage" />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              await navigator.clipboard.writeText(link);
              setCopied(true);
            }}
          >
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <label className="space-y-1.5 text-sm sm:col-span-2">
        <span className="font-medium">Votre email professionnel</span>
        <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <fieldset className="text-sm sm:col-span-2">
        <legend className="mb-2 font-medium">Combien de factures payées en retard par mois, en moyenne ?</legend>
        <div className="flex flex-wrap gap-2">
          {["0", "1-2", "3-10", "10+"].map((v) => (
            <label key={v} data-active={volume === v} className="pill cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
              <input type="radio" name="volume" value={v} className="sr-only" checked={volume === v} onChange={() => setVolume(v)} />
              {v === "0" ? "Aucune" : v}
            </label>
          ))}
        </div>
      </fieldset>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button type="submit" disabled={state === "sending"} className="btn btn-primary disabled:opacity-60 sm:w-fit">
        {state === "sending" ? "Inscription…" : "Demander mon accès"}
      </button>
      {error && <p className="text-sm text-late-ink sm:col-span-2" role="alert">{error}</p>}
      <p className="text-xs text-muted sm:col-span-2">
        Votre email sert uniquement à vous prévenir de l'ouverture. Désinscription en un clic.
      </p>
    </form>
  );
}
