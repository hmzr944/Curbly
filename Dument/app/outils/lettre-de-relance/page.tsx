import type { Metadata } from "next";
import { LetterGenerator } from "../../components/letter-generator";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Générateur gratuit de lettre de relance de facture impayée",
  description:
    "Rédigez en une minute une relance de facture impayée ou une mise en demeure, avec les pénalités de retard calculées automatiquement. Gratuit, sans inscription.",
  alternates: { canonical: "/outils/lettre-de-relance" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <div className="mb-12">
        <PageHeader
          title="Rédigez votre relance de facture impayée"
          intro="Choisissez l'étape, remplissez les informations de la facture : le message s'écrit au fur et à mesure, pénalités comprises. Sans inscription, rien n'est enregistré."
        />
      </div>
      <div className="fade-up" style={{ "--i": 2 } as React.CSSProperties}>
        <LetterGenerator />
      </div>
    </div>
  );
}
