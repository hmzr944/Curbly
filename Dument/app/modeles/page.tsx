import type { Metadata } from "next";
import Link from "next/link";
import { MODELS } from "@/lib/models";
import { stage } from "@/lib/sequence";
import { PageHeader } from "../components/page-header";

export const metadata: Metadata = {
  title: "Modèles de relance de facture impayée, de la première relance à la mise en demeure",
  description:
    "Cinq modèles gratuits pour relancer une facture impayée, du rappel avant échéance à la mise en demeure, avec le bon moment et le bon ton pour chacun.",
  alternates: { canonical: "/modeles" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
      <PageHeader
        title="Modèles de relance de facture"
        intro="Une relance efficace dépend du moment où elle part. Voici les cinq messages d'une séquence complète, dans l'ordre où les envoyer."
      />
      <ol className="mt-12 space-y-3">
        {MODELS.map((m, i) => {
          const s = stage(m.stage);
          return (
            <li key={m.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={`/modeles/${m.slug}`}
                className="card group grid gap-3 p-5 transition-[transform,border-color] duration-200 hover:border-brand sm:grid-cols-[5rem_1fr] sm:gap-6 sm:p-6 [@media(hover:hover)]:hover:-translate-y-0.5"
              >
                <span
                  className={`num h-fit w-fit rounded-full px-3 py-1 text-sm font-bold text-white ${
                    s.requiresApproval ? "bg-paid" : s.offset < 0 ? "bg-brand" : "bg-late"
                  }`}
                >
                  {s.offset < 0 ? `J${s.offset}` : `J+${s.offset}`}
                </span>
                <span>
                  <span className="font-display text-xl font-bold transition-colors group-hover:text-brand-ink">{m.h1}</span>
                  <span className="mt-1 block text-muted">{m.description}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
