import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODELS, modelBySlug } from "@/lib/models";
import { stage } from "@/lib/sequence";
import { absolute } from "@/lib/site";
import { JsonLd } from "../../components/json-ld";
import { LetterGenerator } from "../../components/letter-generator";

export function generateStaticParams() {
  return MODELS.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = modelBySlug(params.slug);
  if (!m) return {};
  return { title: m.title, description: m.description, alternates: { canonical: `/modeles/${m.slug}` } };
}

export default function Page({ params }: { params: { slug: string } }) {
  const m = modelBySlug(params.slug);
  if (!m) notFound();
  const i = MODELS.indexOf(m);
  const prev = MODELS[i - 1];
  const next = MODELS[i + 1];
  const s = stage(m.stage);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Modèles", item: absolute("/modeles") },
                { "@type": "ListItem", position: 2, name: m.h1, item: absolute(`/modeles/${m.slug}`) },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: m.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />
      <nav className="no-print text-sm text-muted">
        <Link href="/modeles" className="hover:text-ink">Modèles</Link> <span aria-hidden>/</span> {s.label}
      </nav>
      <div className="no-print mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="max-w-prose space-y-4">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{m.h1}</h1>
          <p className="text-lg">{m.intro}</p>
        </div>
        <dl className="h-fit rounded-2xl border border-rule bg-sheet p-5 text-sm">
          <dt className="text-muted">Quand l'envoyer</dt>
          <dd className="mb-3 font-semibold">{m.when}</dd>
          <dt className="text-muted">Ton</dt>
          <dd className="mb-3 font-semibold">{s.tone}</dd>
          <dt className="text-muted">Canal</dt>
          <dd className="font-semibold">{m.stage === "formal-notice" ? "Lettre recommandée avec AR" : "Email, dans le fil de la facture"}</dd>
        </dl>
      </div>

      <section className="mt-12">
        <h2 className="no-print mb-5 font-display text-2xl font-bold">Le modèle, prêt à personnaliser</h2>
        <LetterGenerator initialStage={m.stage} />
      </section>

      <section className="no-print mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Ce qui fait la différence</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {m.advice.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Les erreurs à éviter</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {m.mistakes.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </section>

      <section className="no-print mt-16 max-w-prose">
        <h2 className="font-display text-2xl font-bold">Questions fréquentes</h2>
        <div className="mt-4 space-y-5">
          {m.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-1 text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <nav className="no-print mt-16 flex flex-wrap justify-between gap-4 border-t border-rule pt-6 text-sm">
        {prev ? <Link href={`/modeles/${prev.slug}`} className="hover:underline">Étape précédente : {prev.h1}</Link> : <span />}
        {next && <Link href={`/modeles/${next.slug}`} className="hover:underline">Étape suivante : {next.h1}</Link>}
      </nav>
    </div>
  );
}
