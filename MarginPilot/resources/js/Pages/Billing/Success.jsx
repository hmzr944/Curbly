import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function BillingSuccess({ type }) {
    const isScan = type === 'scan';

    return (
        <PublicLayout>
            <Head title="Paiement réussi" />

            <section className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    {/* Success Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        {isScan ? 'AI Margin Scan activé' : 'Abonnement activé'}
                    </h1>
                    
                    <p className="mt-3 text-slate-600">
                        {isScan 
                            ? 'Votre AI Margin Scan est maintenant disponible. Accédez à votre rapport complet.'
                            : 'Votre abonnement Margexa est maintenant actif. Bienvenue dans la famille !'
                        }
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={route('dashboard')}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5"
                        >
                            Accéder au dashboard
                        </Link>
                        <Link
                            href={route('billing.index')}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Voir ma facturation
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-slate-500">
                        Un email de confirmation vous a été envoyé.
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}
