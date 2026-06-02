import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';

const FaqItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-slate-200 last:border-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-slate-900 transition hover:text-violet-700"
            >
                <span>{question}</span>
                <svg
                    className={`ml-4 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <p className="pb-5 text-sm leading-7 text-slate-600">{answer}</p>
            )}
        </div>
    );
};

const sidebarItems = [
    { id: 'intro',      label: 'Introduction' },
    { id: 'comment',    label: 'Comment ça fonctionne' },
    { id: 'pages',      label: 'Guide des pages' },
    { id: 'usecases',   label: "Cas d'usage V1" },
    { id: 'providers',  label: 'Providers & modèles' },
    { id: 'faq',        label: 'FAQ' },
];

export default function Docs() {
    return (
        <PublicLayout>
            <Head title="Documentation — Margexa" />

            {/* Hero */}
            <div className="pt-32 pb-12">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-600">
                        Documentation
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Comprendre Margexa
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                        Tout ce qu'il faut savoir pour auditer votre marge IA, poser des règles intelligentes et mesurer leur impact sur votre rentabilité.
                    </p>
                </div>
            </div>

            {/* Main layout */}
            <div className="mx-auto max-w-6xl px-6 pb-32">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16">

                    {/* Sticky sidebar */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-32">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Sur cette page
                            </p>
                            <nav className="space-y-0.5">
                                {sidebarItems.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                                <p className="text-sm font-semibold text-slate-900">Prêt à commencer ?</p>
                                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                    Lancez votre audit gratuit en 5 minutes, sans compte.
                                </p>
                                <Link
                                    href="/audit"
                                    className="mt-4 block rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5"
                                >
                                    Lancer l'audit
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="lg:col-span-9 space-y-20">

                        {/* 1. Introduction */}
                        <section id="intro" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900">Introduction</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                Margexa aide les équipes SaaS à garder leur support IA rentable. À mesure que l'IA s'intègre dans le support client, les coûts LLM augmentent — souvent sans visibilité, et sans garde-fous pour les maîtriser.
                            </p>

                            <div className="mt-8 grid gap-5 sm:grid-cols-3">
                                {[
                                    {
                                        step: '01',
                                        title: 'Où fuit la marge',
                                        desc: 'Identifiez quels clients, features ou plans consomment le plus et creusent votre rentabilité.',
                                    },
                                    {
                                        step: '02',
                                        title: 'Quelle règle protège',
                                        desc: 'Posez des règles métier simples : cap de tokens, fallback vers un modèle économique, blocage au seuil.',
                                    },
                                    {
                                        step: '03',
                                        title: 'Quel impact est prouvé',
                                        desc: 'Mesurez les économies réalisées grâce aux règles actives. Exportez des rapports lisibles par un CFO.',
                                    },
                                ].map((item) => (
                                    <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <div className="text-xs font-bold uppercase tracking-widest text-violet-500">{item.step}</div>
                                        <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                                <h3 className="text-sm font-semibold text-slate-900">À qui s'adresse Margexa ?</h3>
                                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                    {[
                                        "Équipes SaaS qui intègrent de l'IA dans leur support client",
                                        "Heads of Product ou Engineering responsables des coûts LLM",
                                        "CFO ou Finance qui veulent visibilité et contrôle sur les coûts IA",
                                        "Tout SaaS facturant des plans où le support IA est inclus à prix fixe",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* 2. Comment ça fonctionne */}
                        <section id="comment" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900">Comment ça fonctionne</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                De l'audit au contrôle continu en cinq étapes claires.
                            </p>
                            <div className="mt-8 space-y-4">
                                {[
                                    {
                                        n: '1',
                                        title: 'Lancez un audit gratuit',
                                        desc: 'Répondez à quelques questions sur votre usage IA actuel. Prend environ 5 minutes. Aucun compte requis.',
                                    },
                                    {
                                        n: '2',
                                        title: 'Recevez votre diagnostic de marge',
                                        desc: "Margexa calcule votre exposition au risque, identifie les fuites potentielles et génère un rapport de diagnostic personnalisé.",
                                    },
                                    {
                                        n: '3',
                                        title: "Débloquez l'AI Margin Scan",
                                        desc: "Pour un audit approfondi avec recommandations de règles personnalisées, passez à l'AI Margin Scan (297 EUR, one-time).",
                                    },
                                    {
                                        n: '4',
                                        title: 'Activez le Continuous Control',
                                        desc: "Branchez Margexa comme proxy LLM drop-in. Vos règles s'appliquent en temps réel sur chaque appel IA.",
                                    },
                                    {
                                        n: '5',
                                        title: 'Suivez l\'impact sur votre rentabilité',
                                        desc: "Consultez les rapports CFO, mesurez les économies réalisées, ajustez vos règles. Votre marge IA est sous contrôle.",
                                    },
                                ].map((step) => (
                                    <div key={step.n} className="flex gap-5 rounded-2xl border border-slate-100 bg-white p-5">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
                                            {step.n}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Guide des pages */}
                        <section id="pages" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900">Guide des pages</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                Ce que vous trouverez dans chaque section de Margexa.
                            </p>
                            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 divide-y divide-slate-100">
                                {[
                                    {
                                        route: '/',
                                        label: 'Accueil',
                                        desc: "Présentation de la promesse produit. Point d'entrée vers l'audit gratuit.",
                                    },
                                    {
                                        route: '/audit',
                                        label: 'Audit gratuit',
                                        desc: "Formulaire guidé en quelques étapes. Génère un diagnostic de marge IA personnalisé, sans compte requis.",
                                    },
                                    {
                                        route: '/audit/:token',
                                        label: "Résultat d'audit",
                                        desc: "Rapport de diagnostic avec score de risque, fuites identifiées et recommandations d'action. Accessible via lien unique.",
                                    },
                                    {
                                        route: '/pricing',
                                        label: 'Tarifs',
                                        desc: "Comparaison des offres : Audit gratuit, AI Margin Scan (297 EUR), Continuous Control (349 EUR/mois), Scale.",
                                    },
                                    {
                                        route: '/margin-leaks',
                                        label: 'Fuites de marge',
                                        desc: "Vue d'ensemble des coûts LLM par feature, client et plan. Identifie les combinaisons qui drainent la rentabilité.",
                                        auth: true,
                                    },
                                    {
                                        route: '/policies',
                                        label: 'Règles',
                                        desc: "Création et gestion des règles de contrôle : plafond de tokens, fallback automatique, blocage au seuil.",
                                        auth: true,
                                    },
                                    {
                                        route: '/margin-impact',
                                        label: 'Impact',
                                        desc: "Mesure des économies réalisées grâce aux règles actives. Vue de l'impact cumulé sur la marge.",
                                        auth: true,
                                    },
                                    {
                                        route: '/simulation',
                                        label: 'Simulation',
                                        desc: "Projetez l'impact d'une règle avant de l'activer. Compare plusieurs scénarios pour choisir la meilleure option.",
                                        auth: true,
                                    },
                                    {
                                        route: '/settings',
                                        label: 'Réglages',
                                        desc: "Configuration du proxy LLM, clés API, headers d'attribution et paramètres d'organisation.",
                                        auth: true,
                                    },
                                ].map((page) => (
                                    <div key={page.route} className="flex items-start gap-4 bg-white px-6 py-5">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-900">{page.label}</span>
                                                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{page.route}</code>
                                                {page.auth && (
                                                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
                                                        Compte requis
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{page.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. Cas d'usage */}
                        <section id="usecases" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900">Cas d'usage couverts en V1</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                Margexa V1 est conçu pour les équipes SaaS qui intègrent de l'IA dans leur support client.
                            </p>
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        title: 'Chatbot support',
                                        desc: "Chatbot IA intégré dans l'interface client. Coûts directs liés aux conversations initiées par les utilisateurs.",
                                    },
                                    {
                                        title: 'Assistant SAV',
                                        desc: "Assistant IA qui aide les agents support à répondre plus vite. Coûts variables selon le volume de tickets.",
                                    },
                                    {
                                        title: 'Auto-réponse tickets',
                                        desc: "Réponses automatiques générées par IA sur les tickets entrants. Économies opérationnelles, mais coûts LLM à surveiller.",
                                    },
                                    {
                                        title: 'Copilote support',
                                        desc: "Suggestions de réponse en temps réel pour les agents. Coûts à la suggestion, difficiles à prévoir sans monitoring.",
                                    },
                                ].map((uc) => (
                                    <div key={uc.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <h3 className="text-sm font-semibold text-slate-900">{uc.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{uc.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 5. Providers & modèles */}
                        <section id="providers" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900">Providers et modèles supportés</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                Margexa V1 supporte les deux providers principaux du marché et leurs modèles les plus utilisés en support IA.
                            </p>
                            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                                {[
                                    {
                                        provider: 'OpenAI',
                                        models: [
                                            { id: 'gpt-4o',      tier: 'Premium', desc: 'Meilleure qualité de réponse' },
                                            { id: 'gpt-4o-mini', tier: 'Economy', desc: 'Rapport qualité / coût optimal' },
                                        ],
                                    },
                                    {
                                        provider: 'Anthropic',
                                        models: [
                                            { id: 'claude-3-5-sonnet', tier: 'Premium', desc: 'Haute précision, raisonnement avancé' },
                                            { id: 'claude-3-5-haiku',  tier: 'Economy', desc: 'Rapide et économique' },
                                        ],
                                    },
                                ].map((p) => (
                                    <div key={p.provider} className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <h3 className="text-sm font-semibold text-slate-900">{p.provider}</h3>
                                        <div className="mt-4 space-y-3">
                                            {p.models.map((m) => (
                                                <div key={m.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                                                    <div>
                                                        <code className="text-sm font-semibold text-slate-800">{m.id}</code>
                                                        <p className="mt-0.5 text-xs text-slate-500">{m.desc}</p>
                                                    </div>
                                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                                                        {m.tier}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 6. FAQ */}
                        <section id="faq" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900">Questions fréquentes</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                Les réponses aux questions les plus courantes avant de se lancer.
                            </p>
                            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6">
                                {[
                                    {
                                        question: "Quelle différence entre l'Audit gratuit et l'AI Margin Scan ?",
                                        answer: "L'Audit gratuit est un diagnostic rapide (5 min, sans compte) qui évalue votre exposition au risque de fuite de marge IA. L'AI Margin Scan (297 EUR one-time) va plus loin : il analyse votre situation réelle, modélise vos coûts par feature et par plan, et livre des recommandations de règles personnalisées avec estimation d'impact.",
                                    },
                                    {
                                        question: "À quoi sert Continuous Control ?",
                                        answer: "Continuous Control (349 EUR/mois) est l'abonnement d'enforcement actif. Margexa s'intègre comme proxy LLM drop-in : chaque appel IA passe par Margexa, qui applique vos règles en temps réel (fallback automatique, blocage au seuil, observabilité). Inclut les rapports CFO, l'historique d'impact et les alertes.",
                                    },
                                    {
                                        question: "Combien de temps prend l'audit gratuit ?",
                                        answer: "5 minutes environ. Vous répondez à quelques questions sur votre stack IA, votre volume de requêtes et votre modèle de pricing. Le diagnostic est généré instantanément.",
                                    },
                                    {
                                        question: "Quels types de support IA sont couverts en V1 ?",
                                        answer: "Chatbot support, assistant SAV, auto-réponse tickets, copilote support. Tout usage IA qui génère des appels LLM dans un contexte de support client.",
                                    },
                                    {
                                        question: "Quels providers et modèles sont supportés ?",
                                        answer: "En V1 : OpenAI (gpt-4o, gpt-4o-mini) et Anthropic (claude-3-5-sonnet, claude-3-5-haiku). D'autres providers seront ajoutés dans les versions suivantes.",
                                    },
                                    {
                                        question: "Comment s'intègre Margexa à mon code existant ?",
                                        answer: "Margexa fonctionne comme un proxy OpenAI-compatible. Changez simplement votre base URL et ajoutez votre token Margexa dans les headers. Aucune refonte de code nécessaire.",
                                    },
                                ].map((item) => (
                                    <FaqItem key={item.question} question={item.question} answer={item.answer} />
                                ))}
                            </div>
                        </section>

                        {/* CTA bottom */}
                        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-violet-50/40 px-8 py-12 text-center">
                            <h2 className="text-2xl font-bold text-slate-900">Prêt à auditer votre marge IA ?</h2>
                            <p className="mt-3 text-slate-600">L'audit est gratuit, prend 5 minutes, et ne nécessite aucun compte.</p>
                            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href="/audit"
                                    className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    Lancer mon audit gratuit
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="rounded-full border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                                >
                                    Voir les tarifs
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
