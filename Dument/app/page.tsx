import Link from "next/link";
import { STAGES } from "@/lib/sequence";
import { SITE } from "@/lib/site";
import { EarlyAccess } from "./components/early-access";
import { JsonLd } from "./components/json-ld";
import { PenaltyCalculator } from "./components/penalty-calculator";

const examples: Record<string, string> = {
  courtesy: "« Petit rappel pratique : la facture F-041 arrive à échéance vendredi. »",
  first: "« Sauf erreur de ma part, je n'ai pas encore reçu le règlement… »",
  second: "« Je vous remercie de procéder au règlement dans les 7 jours. »",
  final: "« À ce jour, les pénalités de retard s'élèvent à 64,46 €. »",
  "formal-notice": "Lettre recommandée prête à envoyer, montants détaillés.",
};

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

      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:pt-20">
        <div className="space-y-6">
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">
            Faites-vous payer sans passer vos soirées à relancer.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Dûment envoie vos relances au bon moment, depuis votre propre adresse, calcule les pénalités de retard prévues
            par la loi et prépare la mise en demeure. Vous validez les étapes sensibles et l'argent arrive directement sur
            votre compte.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#acces" className="rounded-lg bg-ink px-5 py-3 font-semibold text-paper hover:opacity-90">
              Demander l'accès anticipé
            </Link>
            <Link href="/outils/lettre-de-relance" className="rounded-lg border border-ink px-5 py-3 font-semibold hover:bg-sheet">
              Rédiger une relance maintenant
            </Link>
          </div>
          <p className="text-sm text-muted">Pour les freelances, artisans, agences et TPE qui facturent d'autres entreprises.</p>
        </div>
        <div>
          <p className="mb-3 font-display text-lg font-bold">Combien votre client vous doit déjà ?</p>
          <PenaltyCalculator compact />
        </div>
      </section>

      <section className="border-y border-rule bg-sheet">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Une séquence qui tient la distance à votre place</h2>
            <p className="mt-3 max-w-xl text-muted">
              Chaque facture suit la même progression, du rappel courtois à la mise en demeure. Dès que le paiement arrive,
              tout s'arrête.
            </p>
            <ol className="mt-10 space-y-0">
              {STAGES.map((s, i) => (
                <li key={s.id} className="grid grid-cols-[4.5rem_1fr] gap-4">
                  <div className="relative">
                    <span className="num block rounded-md border border-rule bg-paper py-1 text-center text-sm font-semibold">
                      {s.offset < 0 ? `J${s.offset}` : `J+${s.offset}`}
                    </span>
                    {i < STAGES.length - 1 && <span aria-hidden className="absolute left-1/2 top-9 h-[calc(100%-2.25rem)] w-px bg-rule" />}
                  </div>
                  <div className="pb-8">
                    <p className="font-semibold">
                      {s.label}
                      {s.requiresApproval && <span className="ml-2 rounded-full bg-late-soft px-2 py-0.5 text-xs font-medium text-late">Envoyée après votre accord</span>}
                    </p>
                    <p className="mt-1 text-muted">{examples[s.id]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative h-fit self-center rounded-xl border border-rule bg-paper p-6 pb-24 shadow-[0_18px_40px_-24px_rgba(20,33,61,0.45)]">
            <p className="text-sm text-muted">Facture</p>
            <p className="num font-display text-xl font-bold">F-2026-041</p>
            <dl className="num mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Client</dt><dd>Atelier Nord</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Échéance</dt><dd>30 septembre</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Relances</dt><dd>3 envoyées</dd></div>
              <div className="flex justify-between border-t border-rule pt-2 font-semibold"><dt>Montant</dt><dd>2 400,00 €</dd></div>
            </dl>
            <span className="stamp absolute bottom-6 left-6 rounded-md border-[3px] border-paid px-3 py-1 font-display text-2xl font-extrabold text-paid">
              PAYÉE
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Vous gardez la main</h2>
        </div>
        <div>
          <h3 className="font-semibold">Vos messages, votre adresse</h3>
          <p className="mt-2 text-muted">
            Les relances partent de votre boîte mail, signées de votre nom, dans le fil de la facture. Votre client répond
            à vous, pas à un robot.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Rien de grave sans votre accord</h3>
          <p className="mt-2 text-muted">
            La mise en demeure attend votre validation. Un client fidèle qui traverse une passe difficile ? Mettez sa
            séquence en pause en un clic.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">L'argent ne passe pas par nous</h3>
          <p className="mt-2 text-muted">
            Dûment est un logiciel, pas une agence de recouvrement : votre client vous paie directement et nous ne prenons
            aucune commission.
          </p>
        </div>
      </section>

      <section id="acces" className="scroll-mt-8 border-t border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">L'envoi automatique arrive bientôt</h2>
            <p className="text-muted">
              Les outils de calcul et de rédaction sont déjà gratuits. Le suivi automatique de vos factures ouvre d'abord à
              un petit groupe d'indépendants, pour le construire avec eux.
            </p>
            <p className="text-muted">
              En attendant : <Link href="/outils/calcul-penalites-de-retard" className="font-semibold text-ink underline underline-offset-4">calculez vos pénalités</Link> ou{" "}
              <Link href="/modeles" className="font-semibold text-ink underline underline-offset-4">parcourez les modèles de relance</Link>.
            </p>
          </div>
          <div className="rounded-2xl border border-rule bg-sheet p-6">
            <EarlyAccess />
          </div>
        </div>
      </section>
    </>
  );
}
