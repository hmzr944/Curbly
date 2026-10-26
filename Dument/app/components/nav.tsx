"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

const links = [
  { href: "/outils/calcul-penalites-de-retard", label: "Pénalités de retard" },
  { href: "/outils/lettre-de-relance", label: "Lettre de relance" },
  { href: "/modeles", label: "Modèles" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`no-print sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "bg-paper/85 shadow-[0_1px_0_var(--color-rule)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3.5 sm:px-6">
        <Link href="/" className="text-ink">
          <Logo />
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-5 gap-y-1 text-sm sm:order-none sm:w-auto">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap py-1 transition-colors ${active ? "font-semibold text-brand-ink" : "text-muted hover:text-ink"}`}
              >
                {l.label}
                {active && <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-late" />}
              </Link>
            );
          })}
        </nav>
        <Link href="/#acces" className="btn btn-primary btn-sm ml-auto">
          Accès anticipé
        </Link>
      </div>
    </header>
  );
}
