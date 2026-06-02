import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function PublicFooter() {
    return (
        <footer className="relative overflow-hidden border-t border-slate-200/70 bg-gradient-to-b from-slate-50 to-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(139,92,246,0.06),transparent_60%)]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <ApplicationLogo className="h-5 w-auto" gradientId="public-footer-logo" />
                            <span className="text-base font-bold text-slate-900">Margexa</span>
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                            Controle de marge pour support IA. Identifiez ou fuit votre marge, posez des garde-fous intelligents et mesurez l'impact sur votre rentabilite.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {['OpenAI', 'Anthropic', 'Audit gratuit'].map((item) => (
                                <div
                                    key={item}
                                    className="inline-flex items-center rounded-lg border border-slate-200/80 bg-white/85 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-violet-200 hover:bg-violet-50/50"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Navigation</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link href="/" className="text-sm text-slate-500 transition hover:text-slate-900">Accueil</Link></li>
                            <li><Link href="/audit" className="text-sm text-slate-500 transition hover:text-slate-900">Audit gratuit</Link></li>
                            <li><Link href="/pricing" className="text-sm text-slate-500 transition hover:text-slate-900">Tarifs</Link></li>
                            <li><Link href="/docs" className="text-sm text-slate-500 transition hover:text-slate-900">Documentation</Link></li>
                            <li><Link href="/contact" className="text-sm text-slate-500 transition hover:text-slate-900">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Légal</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link href="/legal/mentions-legales" className="text-sm text-slate-500 transition hover:text-slate-900">Mentions légales</Link></li>
                            <li><Link href="/legal/cgu" className="text-sm text-slate-500 transition hover:text-slate-900">CGU</Link></li>
                            <li><Link href="/legal/cgv" className="text-sm text-slate-500 transition hover:text-slate-900">CGV</Link></li>
                            <li><Link href="/legal/confidentialite" className="text-sm text-slate-500 transition hover:text-slate-900">Confidentialité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 Margexa. Tous droits réservés.</p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/legal/mentions-legales" className="transition hover:text-slate-600">Mentions légales</Link>
                        <Link href="/legal/confidentialite" className="transition hover:text-slate-600">Confidentialité</Link>
                        <Link href="/legal/cgu" className="transition hover:text-slate-600">CGU</Link>
                        <Link href="/legal/cgv" className="transition hover:text-slate-600">CGV</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
