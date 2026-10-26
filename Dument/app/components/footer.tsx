import Link from "next/link";
import { RATES_UPDATED_AT } from "@/lib/rates";
import { frenchDate } from "@/lib/dates";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="no-print mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-muted sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div className="space-y-3">
          <Logo className="text-ink" />
          <p className="max-w-sm">
            Dûment est un logiciel : vos relances partent à votre nom et vous encaissez directement. Nous ne
            touchons jamais aux sommes recouvrées.
          </p>
          <p>Taux légaux à jour au {frenchDate(RATES_UPDATED_AT)}.</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-ink">Outils gratuits</p>
          <Link className="block hover:text-ink" href="/outils/calcul-penalites-de-retard">Calcul des pénalités de retard</Link>
          <Link className="block hover:text-ink" href="/outils/lettre-de-relance">Générateur de lettre de relance</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-ink">Modèles</p>
          <Link className="block hover:text-ink" href="/modeles/premiere-relance-facture-impayee">Première relance</Link>
          <Link className="block hover:text-ink" href="/modeles/derniere-relance-avant-mise-en-demeure">Dernière relance</Link>
          <Link className="block hover:text-ink" href="/modeles/mise-en-demeure-facture-impayee">Mise en demeure</Link>
        </div>
      </div>
    </footer>
  );
}
