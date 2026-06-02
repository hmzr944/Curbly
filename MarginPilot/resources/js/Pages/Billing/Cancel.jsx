import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function BillingCancel() {
    return (
        <PublicLayout>
            <Head title="Paiement annulé" />

            <section className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    {/* Cancel Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Paiement annulé
                    </h1>
                    
                    <p className="mt-3 text-slate-600">
                        Vous avez annulé le processus de paiement. Aucun montant n'a été débité.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={route('billing.index')}
                            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Réessayer
                        </Link>
                        <Link
                            href={route('dashboard')}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Retour au dashboard
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-slate-500">
                        Une question ? <a href="mailto:support@Margexa.app" className="text-violet-600 hover:underline">Contactez-nous</a>
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}
