import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

function money(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function statusLabel(billing) {
    if (billing.is_past_due) return { label: 'Paiement en retard', className: 'border-red-200 bg-red-50 text-red-700' };
    if (billing.is_trial) return { label: 'Essai actif', className: 'border-amber-200 bg-amber-50 text-amber-700' };
    if (billing.is_active) return { label: 'Actif', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
    return { label: 'Sans abonnement', className: 'border-slate-200 bg-slate-50 text-slate-600' };
}

function SummaryCard({ label, value, sub, accent = false }) {
    return (
        <div className={`rounded-2xl border p-5 ${accent ? 'border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white' : 'border-slate-200/60 bg-white/85 backdrop-blur-xl'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-violet-700' : 'text-slate-900'}`}>{value}</p>
            {sub ? <p className="mt-1 text-sm text-slate-500">{sub}</p> : null}
        </div>
    );
}

function PlanCard({ plan, currentPlan, onSubscribe, processing }) {
    const isCurrent = currentPlan === plan.id;

    return (
        <div className={`rounded-2xl border p-5 ${plan.popular ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-white shadow-sm shadow-violet-100' : 'border-slate-200/60 bg-white/88'} backdrop-blur-xl`}>
            {plan.popular ? (
                <span className="inline-flex rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">Recommandé</span>
            ) : null}

            <div className="mt-3">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
            </div>

            <div className="mt-4">
                {plan.price !== null ? (
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-semibold text-slate-900">{money(plan.price)}</span>
                        <span className="pb-1 text-sm text-slate-500">{plan.interval === 'month' ? '/mois' : ''}</span>
                    </div>
                ) : (
                    <span className="text-2xl font-semibold text-slate-900">Sur mesure</span>
                )}
            </div>

            <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                        {feature}
                    </li>
                ))}
            </ul>

            <div className="mt-5">
                {isCurrent ? (
                    <button type="button" disabled className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-400">
                        Plan actuel
                    </button>
                ) : plan.id === 'scale' ? (
                    <a
                        href="mailto:contact@Margexa.app?subject=Margexa Scale"
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Contacter l&apos;équipe
                    </a>
                ) : (
                    <button
                        type="button"
                        onClick={() => onSubscribe(plan.id)}
                        disabled={processing}
                        className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition ${
                            plan.popular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-slate-900 hover:bg-slate-800'
                        } disabled:opacity-50`}
                    >
                        {processing ? 'Chargement...' : plan.cta}
                    </button>
                )}
            </div>
        </div>
    );
}

function InvoiceTable({ invoices }) {
    if (!invoices.length) return null;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/88 shadow-sm backdrop-blur-xl">
            <div className="border-b border-slate-200/60 px-5 py-4">
                <h3 className="font-semibold text-slate-900">Historique des factures</h3>
                <p className="mt-0.5 text-sm text-slate-500">Vos dernières opérations Stripe</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200/60 bg-slate-50/60">
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Date</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Numéro</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Montant</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Statut</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Document</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="px-4 py-3 text-slate-600">{invoice.date}</td>
                                <td className="px-4 py-3 text-slate-700">{invoice.number}</td>
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    {invoice.amount} {invoice.currency}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${invoice.status === 'paid' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-700'}`}>
                                        {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {invoice.pdf_url ? (
                                        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-violet-600 hover:text-violet-800">
                                            PDF
                                        </a>
                                    ) : (
                                        <span className="text-sm text-slate-400">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function BillingIndex({ billing, plans, invoices, checkoutOffer }) {
    const { errors: pageErrors } = usePage().props;
    const subscribeForm = useForm({ plan: '' });
    const portalForm = useForm({});
    const scanForm = useForm({});

    const stripeError = pageErrors?.stripe || subscribeForm.errors?.stripe || scanForm.errors?.stripe || portalForm.errors?.stripe;
    const currentStatus = statusLabel(billing);
    const nextInvoice = invoices?.[0] ?? null;
    const hasFullAccess = ['control', 'scale'].includes(billing.plan);

    useEffect(() => {
        if (checkoutOffer === 'continuous_control') {
            subscribeForm.setData('plan', 'control');
            subscribeForm.post(route('billing.checkout'));
        } else if (checkoutOffer === 'scan') {
            scanForm.post(route('billing.scan-checkout'));
        }
    }, [checkoutOffer]);

    const handleSubscribe = (planId) => {
        subscribeForm.setData('plan', planId);
        subscribeForm.post(route('billing.checkout'));
    };

    const handlePortal = () => {
        portalForm.post(route('billing.portal'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Facturation</h2>
                        <p className="mt-1 max-w-3xl text-sm text-slate-500">
                            Gérez votre formule actuelle, voyez votre prochain jalon de facturation et activez le niveau de contrôle adapté à votre usage.
                        </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${currentStatus.className}`}>
                        {currentStatus.label}
                    </span>
                </div>
            }
        >
            <Head title="Facturation" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {stripeError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {stripeError}
                    </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Plan actuel" value={billing.plan_name} sub="formule active" />
                    <SummaryCard
                        label="Statut"
                        value={currentStatus.label}
                        sub={billing.is_trial ? `${billing.trial_days_remaining} jours d'essai restants` : 'synchronisé avec Stripe'}
                        accent
                    />
                    <SummaryCard
                        label="Prochaine facture"
                        value={nextInvoice ? nextInvoice.date : 'À venir'}
                        sub={nextInvoice ? `${nextInvoice.amount} ${nextInvoice.currency}` : 'aucune facture émise'}
                    />
                    <SummaryCard
                        label="Action"
                        value={billing.has_scan || hasFullAccess ? 'Scan débloqué' : 'Upgrade possible'}
                        sub={billing.has_scan || hasFullAccess ? 'accès audit disponible' : 'choisissez une formule'}
                    />
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white/88 p-6 shadow-sm backdrop-blur-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Résumé</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">{billing.plan_name}</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {billing.is_trial
                                    ? `Votre essai est actif. ${billing.trial_days_remaining} jours restants avant la facturation.`
                                    : billing.is_active
                                      ? 'Votre abonnement est actif et prêt pour un usage continu.'
                                      : 'Aucun abonnement actif. Vous pouvez activer une formule à tout moment.'}
                            </p>
                        </div>
                        {billing.status !== 'none' ? (
                            <button
                                type="button"
                                onClick={handlePortal}
                                disabled={portalForm.processing}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Gérer dans Stripe
                            </button>
                        ) : null}
                    </div>
                </div>

                {!billing.has_scan && !hasFullAccess ? (
                    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">AI Margin Scan</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Débloquez l&apos;audit complet one-shot</h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Rapport approfondi, recommandations activables et plan d&apos;action immédiat sans engagement récurrent.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-semibold text-slate-900">297€</span>
                                <Link
                                    href={route('billing.scan-checkout')}
                                    method="post"
                                    as="button"
                                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                                >
                                    Débloquer l&apos;AI Margin Scan
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-900">
                            {billing.is_active ? 'Changer de formule' : 'Choisir une formule'}
                        </h3>
                        <p className="text-sm text-slate-500">Continuous Control reste mappé au plan interne <span className="font-medium text-slate-700">control</span>.</p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                currentPlan={billing.plan}
                                onSubscribe={handleSubscribe}
                                processing={subscribeForm.processing}
                            />
                        ))}
                    </div>
                </div>

                <InvoiceTable invoices={invoices} />
            </div>
        </AuthenticatedLayout>
    );
}
