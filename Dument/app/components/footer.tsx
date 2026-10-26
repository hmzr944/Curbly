import Link from "next/link";
import { RATES_UPDATED_AT } from "@/lib/rates";
import { frenchDate } from "@/lib/dates";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="no-print mt-28 bg-night text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-sm sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div className="space-y-4">
          <Logo className="text-white" />
          <p className="max-w-sm">
            Dûment est un logiciel : vos relances partent à votre nom et vous encaissez directement. Nous ne touchons
            jamais aux sommes recouvrées.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-paid" aria-hidden />
            Taux légaux à jour au {frenchDate(RATES_UPDATED_AT)}
          </p>
        </div>
        <div className="space-y-2.5">
          <p className="font-semibold text-white">Outils gratuits</p>
          <FooterLink href="/outils/calcul-penalites-de-retard">Calcul des pénalités de retard</FooterLink>
          <FooterLink href="/outils/lettre-de-relance">Générateur de lettre de relance</FooterLink>
        </div>
        <div className="space-y-2.5">
          <p className="font-semibold text-white">Modèles</p>
          <FooterLink href="/modeles/premiere-relance-facture-impayee">Première relance</FooterLink>
          <FooterLink href="/modeles/derniere-relance-avant-mise-en-demeure">Dernière relance</FooterLink>
          <FooterLink href="/modeles/mise-en-demeure-facture-impayee">Mise en demeure</FooterLink>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block w-fit transition-colors hover:text-late">
      {children}
    </Link>
  );
}
