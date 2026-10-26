import Link from "next/link";
import { Logo } from "./logo";

const links = [
  { href: "/outils/calcul-penalites-de-retard", label: "Pénalités de retard" },
  { href: "/outils/lettre-de-relance", label: "Lettre de relance" },
  { href: "/modeles", label: "Modèles" },
];

export function Nav() {
  return (
    <header className="no-print border-b border-rule">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 sm:px-6">
        <Link href="/" className="text-ink">
          <Logo />
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-5 gap-y-1 text-sm text-muted sm:order-none sm:w-auto">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#acces"
          className="ml-auto rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:opacity-90"
        >
          Accès anticipé
        </Link>
      </div>
    </header>
  );
}
