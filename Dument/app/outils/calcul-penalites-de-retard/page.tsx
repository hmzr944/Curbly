import type { Metadata } from "next";
import Link from "next/link";
import { frenchDate } from "@/lib/dates";
import { fmtRate } from "@/lib/penalties";
import { RATES, RATES_UPDATED_AT, type Semester } from "@/lib/rates";
import { absolute } from "@/lib/site";
import { JsonLd } from "../../components/json-ld";
import { PenaltyCalculator } from "../../components/penalty-calculator";

export const metadata: Metadata = {
  title: "Calcul des pénalités de retard de paiement (taux 2026)",
  description:
    "Calculez gratuitement les pénalités de retard et l'indemnité forfaitaire de 40 € d'une facture impayée entre professionnels, avec les taux légaux 2026 à jour.",
  alternates: { canonical: "/outils/calcul-penalites-de-retard" },
};

const semesters = (Object.keys(RATES) as Semester[]).sort().reverse();

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Calculateur de pénalités de retard",
          url: absolute("/outils/calcul-penalites-de-retard"),
          applicationCategory: "FinanceApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-5">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Calcul des pénalités de retard de paiement
          </h1>
          <p className="max-w-prose text-lg text-muted">
            Entre professionnels, une facture payée en retard donne droit à des pénalités et à une indemnité forfaitaire
            de 40 €, sans démarche préalable. Voici combien votre client vous doit déjà.
          </p>
          <p className="max-w-prose text-sm text-muted">
            Le calcul se fait dans votre navigateur : aucune donnée n'est envoyée. Taux à jour au {frenchDate(RATES_UPDATED_AT)}.
          </p>
        </div>
        <PenaltyCalculator />
      </div>

      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <div className="max-w-prose space-y-4">
          <h2 className="font-display text-2xl font-bold">Comment le calcul est fait</h2>
          <p>
            L'article L441-10 du Code de commerce prévoit que les pénalités courent dès le lendemain de la date
            d'échéance. Elles se calculent en intérêts simples :
          </p>
          <p className="rounded-lg border border-rule bg-sheet px-4 py-3 font-medium">
            montant TTC × taux annuel × nombre de jours de retard ÷ 365
          </p>
          <p>
            Si vos conditions générales ne fixent pas de taux, on applique le taux de refinancement de la BCE en vigueur au
            1<sup>er</sup> janvier ou au 1<sup>er</sup> juillet, majoré de 10 points. Un taux contractuel ne peut pas être
            inférieur à trois fois le taux d'intérêt légal. Lorsqu'un retard s'étend sur deux semestres, chaque période
            est calculée avec son propre taux.
          </p>
          <p>
            S'y ajoute une indemnité forfaitaire pour frais de recouvrement de 40 € par facture (article D441-5), non
            soumise à TVA.
          </p>
          <p className="text-sm text-muted">
            Ces règles concernent les factures entre professionnels. Pour un client particulier, seuls les intérêts au taux
            légal sont dus, après mise en demeure.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Taux par semestre</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="num w-full text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-rule">
                  <th className="py-2 pr-4 font-medium">Semestre</th>
                  <th className="py-2 pr-4 font-medium">Taux BCE</th>
                  <th className="py-2 pr-4 font-medium">Pénalités (BCE + 10)</th>
                  <th className="py-2 font-medium">Taux minimum contractuel</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((s) => {
                  const r = RATES[s];
                  const [y, h] = s.split("-S");
                  return (
                    <tr key={s} className="border-b border-rule">
                      <td className="py-2 pr-4">{h === "1" ? "1er" : "2e"} semestre {y}</td>
                      <td className="py-2 pr-4">{fmtRate(r.ecb)}</td>
                      <td className="py-2 pr-4 font-semibold">{fmtRate(r.ecb + 10)}</td>
                      <td className="py-2">{fmtRate(Math.round(r.legalPro * 300) / 100)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-6">
            Prêt à réclamer ? <Link href="/modeles/derniere-relance-avant-mise-en-demeure" className="font-semibold underline underline-offset-4">Voir le modèle de dernière relance avec pénalités</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
