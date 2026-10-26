import type { Metadata } from "next";
import { LetterGenerator } from "../../components/letter-generator";

export const metadata: Metadata = {
  title: "Générateur gratuit de lettre de relance de facture impayée",
  description:
    "Rédigez en une minute une relance de facture impayée ou une mise en demeure, avec les pénalités de retard calculées automatiquement. Gratuit, sans inscription.",
  alternates: { canonical: "/outils/lettre-de-relance" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <div className="no-print mb-10 max-w-2xl space-y-4">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Rédigez votre relance de facture impayée
        </h1>
        <p className="text-lg text-muted">
          Choisissez l'étape, remplissez les informations de la facture : le message s'écrit au fur et à mesure, pénalités
          comprises. Sans inscription, rien n'est enregistré.
        </p>
      </div>
      <LetterGenerator />
    </div>
  );
}
