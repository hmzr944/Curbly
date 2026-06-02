import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const riskStyles = {
    critical: 'border-red-200 bg-red-50 text-red-700',
    high: 'border-amber-200 bg-amber-50 text-amber-700',
    moderate: 'border-violet-200 bg-violet-50 text-violet-700',
    low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

function money(amount) {
    if (amount === null || amount === undefined) {
        return '-';
    }

    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

function OfferCta({ offer }) {
    const href = offer.kind === 'contact'
        ? offer.contact_href
        : route('register', { offer: offer.register_offer ?? offer.id });

    const body = (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{offer.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{offer.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">
                        {offer.price === null ? 'Sur mesure' : `${offer.price} EUR`}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{offer.price_note}</div>
                </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {offer.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            ✓
                        </span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">
                {offer.cta}
            </div>
        </div>
    );

    // contact_href is now an internal /contact path — use Inertia Link for all
    return <Link href={href}>{body}</Link>;
}

export default function AuditResult({ audit }) {
    const { catalog } = usePage().props;
    const offers = catalog?.public_offers ?? [];

    if (!audit) {
        return (
            <PublicLayout>
                <Head title="Audit non trouvé - Margexa" />
                <section className="px-4 pb-20 pt-32 sm:px-6">
                    <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-900">Audit non trouvé</h1>
                        <p className="mt-3 text-slate-600">Ce lien d'audit n'existe pas ou a expiré.</p>
                        <Link href="/audit" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                            Refaire un audit
                        </Link>
                    </div>
                </section>
            </PublicLayout>
        );
    }

    const riskClass = riskStyles[audit.riskLevel] ?? riskStyles.moderate;

    return (
        <PublicLayout>
            <Head title={`Audit - ${audit.company} - Margexa`} />

            <section className="px-4 pb-10 pt-32 sm:px-6 sm:pt-36">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                                    Audit généré le {audit.generatedAt}
                                </div>
                                <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    Audit de marge IA - {audit.company}
                                </h1>
                                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
                                    Résultat instantané sur votre exposition actuelle et les protections à activer en premier.
                                </p>
                            </div>

                            <div className={`rounded-3xl border px-5 py-4 ${riskClass}`}>
                                <div className="text-sm font-medium">Niveau de risque</div>
                                <div className="mt-1 text-3xl font-bold">{audit.riskScore}</div>
                                <div className="mt-1 text-sm capitalize">{audit.riskLevel}</div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="text-sm text-slate-500">Coût IA mensuel estimé</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">
                                    {money(audit.financials?.estimatedMonthlyCost)}
                                </div>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="text-sm text-slate-500">Gaspillage estimé</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">
                                    {money(audit.financials?.estimatedWaste)}
                                </div>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="text-sm text-slate-500">Économie potentielle</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">
                                    {money(audit.financials?.potentialSavings)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {audit.topLeaks?.length > 0 && (
                <section className="px-4 py-8 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">Où la marge fuit</h2>
                            <div className="mt-6 grid gap-4">
                                {audit.topLeaks.map((leak) => (
                                    <div key={`${leak.source}-${leak.description}`} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="text-base font-semibold text-slate-900">{leak.source}</div>
                                                <div className="mt-2 text-sm leading-7 text-slate-600">{leak.description}</div>
                                            </div>
                                            <div className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                                                {money(leak.estimatedLeak)}/mois
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {audit.recommendations?.length > 0 && (
                <section className="px-4 py-8 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">Quelle règle protège</h2>
                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {audit.recommendations.map((recommendation) => (
                                    <div key={recommendation.number} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                                                {recommendation.number}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">{recommendation.title}</h3>
                                                <p className="mt-2 text-sm leading-7 text-slate-600">{recommendation.description}</p>
                                                {recommendation.impact && (
                                                    <p className="mt-3 text-sm font-medium text-violet-700">
                                                        Impact estimé : {recommendation.impact}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="px-4 py-8 sm:px-6 sm:pb-20">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl shadow-slate-900/10">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-bold">Quel impact peut être prouvé ensuite</h2>
                            <p className="mt-4 text-base leading-8 text-slate-300">
                                L'étape suivante consiste à débloquer le bon niveau d'activation :
                                AI Margin Scan pour approfondir, puis Continuous Control pour protéger la marge en continu.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-5 lg:grid-cols-3">
                            {offers.map((offer) => (
                                <OfferCta key={offer.id} offer={offer} />
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                            >
                                Voir le pricing
                            </Link>
                            <Link
                                href="/audit"
                                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                            >
                                Refaire un audit
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
