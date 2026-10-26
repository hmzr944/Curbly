import Link from "next/link";
import { STAGES } from "@/lib/sequence";
import { SITE } from "@/lib/site";
import { EarlyAccess } from "./components/early-access";
import { HeroScene } from "./components/hero-scene";
import { JsonLd } from "./components/json-ld";
import { PenaltyCalculator } from "./components/penalty-calculator";

const examples: Record<string, string> = {
  courtesy: "« Petit rappel pratique : la facture F-041 arrive à échéance vendredi. »",
  first: "« Sauf erreur de ma part, je n'ai pas encore reçu le règlement… »",
  second: "« Je vous remercie de procéder au règlement dans les 7 jours. »",
  final: "« À ce jour, les pénalités de retard s'élèvent à 64,46 €. »",
  "formal-notice": "Lettre recommandée prête à envoyer, montants détaillés.",
};

const audiences = ["Freelances", "Artisans", "Agences", "Consultants", "Développeurs", "Graphistes", "Architectes", "Formateurs", "TPE"];

const promises = [
  {
    title: "Vos messages, votre adresse",
    body: "Les relances partent de votre boîte mail, signées de votre nom, dans le fil de la facture. Votre client vous répond directement.",
    icon: "M4 7l8 6 8-6M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  },
  {
    title: "Rien de grave sans votre accord",
    body: "La mise en demeure attend votre validation. Un client fidèle qui traverse une passe difficile ? Mettez sa séquence en pause en un clic.",
    icon: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z",
  },
  {
    title: "L'argent ne passe pas par nous",
    body: "Dûment est un logiciel, pas une agence de recouvrement : votre client vous paie directement et nous ne prenons aucune commission.",
    icon: "M3 10h18M5 10V19M19 10v9M9 10v9M15 10v9M2 21h20M12 3l9 5H3l9-5z",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE.name,
          url: SITE.url,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: SITE.description,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pb-28 lg:pt-16">
          <div>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1] tracking-tight sm:text-[3.6rem]">
              {["Faites-vous payer", "sans passer vos", "soirées à relancer."].map((line, i) => (
                <span key={line} className="line-mask">
                  <span style={{ "--i": i } as React.CSSProperties}>{line}</span>
                </span>
              ))}
            </h1>
            <p className="fade-up mt-6 max-w-xl text-lg text-muted" style={{ "--i": 1 } as React.CSSProperties}>
              Dûment envoie vos relances au bon moment, depuis votre propre adresse, calcule les pénalités de retard prévues
              par la loi et prépare la mise en demeure. Vous validez les étapes sensibles, l'argent arrive directement sur
              votre compte.
            </p>
            <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--i": 2 } as React.CSSProperties}>
              <Link href="#acces" className="btn btn-primary">
                Demander l'accès anticipé
              </Link>
              <Link href="/outils/lettre-de-relance" className="btn btn-secondary">
                Rédiger une relance maintenant
              </Link>
            </div>
            <ul className="fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ "--i": 3 } as React.CSSProperties}>
              {["Gratuit pour démarrer", "Envoyé depuis votre adresse", "Aucune commission"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 rounded-full bg-brand-soft p-1 text-brand-ink" aria-hidden>
                    <path className="draw-check" d="M5 12.5l4.2 4L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="fade-up" style={{ "--i": 2 } as React.CSSProperties}>
            <HeroScene />
          </div>
        </div>
      </section>

      {/* Audience marquee */}
      <div className="overflow-hidden border-y border-rule py-4 text-muted" aria-label="Pour qui">
        <div className="marquee flex w-max gap-10 pr-10">
          {[...audiences, ...audiences].map((a, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-lg font-semibold" aria-hidden={i >= audiences.length}>
              {a}
              <span className="h-1.5 w-1.5 rounded-full bg-rule" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      {/* Calculator */}
      <section className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div data-reveal className="space-y-5">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Combien votre client vous doit déjà ?</h2>
          <p className="max-w-md text-lg text-muted">
            Entre professionnels, chaque jour de retard coûte des pénalités à votre client, plus 40 € d'indemnité par
            facture. La loi le prévoit, même si personne ne le réclame.
          </p>
          <Link href="/outils/calcul-penalites-de-retard" className="link">
            Ouvrir le calculateur complet
          </Link>
        </div>
        <div data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <PenaltyCalculator compact />
        </div>
      </section>

      {/* Sequence */}
      <section className="border-y border-rule bg-sheet">
        <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div>
            <h2 data-reveal className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Une séquence qui tient la distance à votre place
            </h2>
            <p data-reveal className="mt-4 max-w-xl text-muted" style={{ "--i": 1 } as React.CSSProperties}>
              Chaque facture suit la même progression, du rappel courtois à la mise en demeure. Dès que le paiement arrive,
              tout s'arrête.
            </p>
            <ol data-reveal className="relative mt-12">
              <span aria-hidden className="draw-y absolute bottom-6 left-[2.2rem] top-4 w-0.5 rounded-full bg-rule" />
              {STAGES.map((s, i) => (
                <li
                  key={s.id}
                  data-reveal
                  style={{ "--i": i + 1 } as React.CSSProperties}
                  className="relative grid grid-cols-[4.4rem_1fr] gap-5 pb-9 last:pb-0"
                >
                  <span
                    className={`num relative z-10 h-fit rounded-full py-1 text-center text-sm font-bold ${
                      s.requiresApproval ? "bg-brand text-white" : "border border-rule bg-paper"
                    }`}
                  >
                    {s.offset < 0 ? `J${s.offset}` : `J+${s.offset}`}
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold">
                      {s.label}
                      {s.requiresApproval && (
                        <span className="ml-2 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 align-middle font-sans text-xs font-semibold text-brand-ink">
                          Envoyée après votre accord
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-muted">{examples[s.id]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div data-reveal className="card relative h-fit self-center bg-paper p-6 pb-24">
            <p className="text-sm text-muted">Facture</p>
            <p className="num font-display text-xl font-bold">F-2026-041</p>
            <dl className="num mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Client</dt><dd>Atelier Nord</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Échéance</dt><dd>30 septembre</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Relances</dt><dd>3 envoyées</dd></div>
              <div className="flex justify-between border-t border-rule pt-2 font-semibold"><dt>Montant</dt><dd>2 400,00 €</dd></div>
            </dl>
            <span className="stamp absolute bottom-6 left-6 rounded-xl border-[3px] border-paid px-3 py-1 font-display text-3xl font-extrabold text-paid">
              PAYÉE
            </span>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h2 data-reveal className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Vous gardez la main</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {promises.map((p, i) => (
            <div key={p.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                  <path d={p.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Early access */}
      <section id="acces" className="scroll-mt-24 px-4 sm:px-6">
        <div
          data-reveal
          className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 overflow-hidden rounded-[28px] bg-brand px-6 py-14 text-white sm:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <div className="relative space-y-4">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">L'envoi automatique arrive bientôt</h2>
            <p className="text-white/85">
              Les outils de calcul et de rédaction sont déjà gratuits. Le suivi automatique de vos factures ouvre d'abord à
              un petit groupe d'indépendants, pour le construire avec eux.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/outils/calcul-penalites-de-retard" className="btn btn-light btn-sm">
                Calculer mes pénalités
              </Link>
              <Link href="/modeles" className="btn btn-sm border-[1.5px] border-white/60 text-white">
                Voir les modèles
              </Link>
            </div>
          </div>
          <div className="relative rounded-[22px] bg-sheet p-6 text-ink sm:p-7">
            <EarlyAccess />
          </div>
        </div>
      </section>
    </>
  );
}
