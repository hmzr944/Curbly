import type { Metadata } from "next";
import Link from "next/link";
import { MODELS } from "@/lib/models";
import { stage } from "@/lib/sequence";

export const metadata: Metadata = {
  title: "Modèles de relance de facture impayée, de la première relance à la mise en demeure",
  description:
    "Cinq modèles gratuits pour relancer une facture impayée, du rappel avant échéance à la mise en demeure, avec le bon moment et le bon ton pour chacun.",
  alternates: { canonical: "/modeles" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Modèles de relance de facture</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">
        Une relance efficace dépend du moment où elle part. Voici les cinq messages d'une séquence complète, dans l'ordre où
        les envoyer.
      </p>
      <ol className="mt-10 border-t border-rule">
        {MODELS.map((m) => {
          const s = stage(m.stage);
          return (
            <li key={m.slug} className="border-b border-rule">
              <Link href={`/modeles/${m.slug}`} className="grid gap-1 py-5 hover:bg-sheet sm:grid-cols-[9rem_1fr] sm:gap-6 sm:px-2">
                <span className="num text-sm font-semibold text-muted">
                  {s.offset < 0 ? `J${s.offset}` : `J+${s.offset}`}
                </span>
                <span>
                  <span className="font-display text-xl font-bold">{m.h1}</span>
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
