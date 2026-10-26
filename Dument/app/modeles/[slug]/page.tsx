import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODELS, modelBySlug } from "@/lib/models";
import { stage } from "@/lib/sequence";
import { absolute } from "@/lib/site";
import { JsonLd } from "../../components/json-ld";
import { LetterGenerator } from "../../components/letter-generator";
import { PageHeader } from "../../components/page-header";

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
      <div className="no-print grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <PageHeader
          tone={m.stage === "formal-notice" ? "paid" : m.stage === "courtesy" ? "brand" : "late"}
          eyebrow={
            <nav>
              <Link href="/modeles" className="link">Modèles</Link> <span aria-hidden>/</span> {s.label}
            </nav>
          }
          title={m.h1}
          intro={m.intro}
        />
        <dl className="fade-up card h-fit self-end p-5 text-sm" style={{ "--i": 2 } as React.CSSProperties}>
          <dt className="text-muted">Quand l'envoyer</dt>
          <dd className="mb-3 font-semibold">{m.when}</dd>
          <dt className="text-muted">Ton</dt>
          <dd className="mb-3 font-semibold">{s.tone}</dd>
          <dt className="text-muted">Canal</dt>
          <dd className="font-semibold">{m.stage === "formal-notice" ? "Lettre recommandée avec AR" : "Email, dans le fil de la facture"}</dd>
        </dl>
      </div>

      <section className="mt-12">
        <h2 data-reveal className="no-print mb-6 font-display text-3xl font-bold">Le modèle, prêt à personnaliser</h2>
        <LetterGenerator initialStage={m.stage} />
      </section>

      <section className="no-print mt-16 grid gap-10 md:grid-cols-2">
        <div data-reveal className="card border-t-4 border-t-paid p-6">
          <h2 className="font-display text-2xl font-bold">Ce qui fait la différence</h2>
          <ul className="mt-4 space-y-3">
            {m.advice.map((a) => (
              <li key={a} className="flex gap-3">
                <span aria-hidden className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paid-soft text-xs font-bold text-paid-ink">✓</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal style={{ "--i": 1 } as React.CSSProperties} className="card border-t-4 border-t-late p-6">
          <h2 className="font-display text-2xl font-bold">Les erreurs à éviter</h2>
          <ul className="mt-4 space-y-3">
            {m.mistakes.map((a) => (
              <li key={a} className="flex gap-3">
                <span aria-hidden className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-late-soft text-xs font-bold text-late-ink">✕</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-reveal className="no-print mt-16 max-w-prose">
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
        {prev ? <Link href={`/modeles/${prev.slug}`} className="link">Étape précédente : {prev.h1}</Link> : <span />}
        {next && <Link href={`/modeles/${next.slug}`} className="link">Étape suivante : {next.h1}</Link>}
      </nav>
    </div>
  );
}
