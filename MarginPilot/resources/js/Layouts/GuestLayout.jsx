import { Link } from '@inertiajs/react';

const ANIM_CSS = `
@keyframes mp-guest-float-a {
  0%,100% { transform: translate(0,0) scale(1); opacity:.10; }
  33%      { transform: translate(18px,-14px) scale(1.06); opacity:.18; }
  66%      { transform: translate(-10px,20px) scale(.97); opacity:.12; }
}
@keyframes mp-guest-float-b {
  0%,100% { transform: translate(0,0) scale(1); }
  40%      { transform: translate(-22px,16px) scale(1.08); }
  70%      { transform: translate(14px,-8px) scale(.95); }
}
@keyframes mp-guest-slide-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.mp-guest-float-a { animation: mp-guest-float-a 18s ease-in-out infinite; }
.mp-guest-float-b { animation: mp-guest-float-b 22s ease-in-out infinite; }
.mp-slide-up { animation: mp-guest-slide-up 0.65s cubic-bezier(0.16,1,0.3,1) both; }
.delay-100 { animation-delay: 0.10s; }
.delay-200 { animation-delay: 0.20s; }
.delay-300 { animation-delay: 0.30s; }
.delay-400 { animation-delay: 0.40s; }
.delay-500 { animation-delay: 0.50s; }
`;

const FEATURES = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
        ),
        title: 'Analyse des coûts IA',
        desc: "Identifiez en temps réel où vos marges s'érodent sur chaque appel LLM.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: 'Politiques intelligentes',
        desc: 'Déployez des règles automatiques pour réduire les coûts sans impacter la qualité.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        title: 'ROI mesurable',
        desc: 'Suivez vos économies réalisées et prouvez la valeur de chaque optimisation.',
    },
];

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen overflow-hidden">
            <style>{ANIM_CSS}</style>

            {/* ─── Left panel — branding (desktop only) ─────────────────────────── */}
            <div className="relative hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-12">
                {/* Animated background orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="mp-guest-float-a absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/12 blur-3xl" />
                    <div className="mp-guest-float-b absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-purple-500/15 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/8 blur-3xl" />
                </div>

                {/* Subtle grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                {/* Logo */}
                <div className="relative">
                    <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30">
                            <span className="text-sm font-bold text-white">MP</span>
                        </div>
                        <span className="text-xl font-bold text-white">Margexa</span>
                    </Link>
                </div>

                {/* Main copy */}
                <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-xs font-medium text-violet-300">Plateforme d'optimisation IA</span>
                    </div>

                    <h2 className="mt-5 text-3xl font-bold leading-tight text-white">
                        Maîtrisez vos coûts IA,{' '}
                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                            maximisez vos marges
                        </span>
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                        Margexa vous offre une visibilité complète sur chaque euro dépensé
                        en IA et vous aide à récupérer jusqu'à 40&nbsp;% de vos coûts.
                    </p>

                    {/* Feature list */}
                    <ul className="mt-8 space-y-5">
                        {FEATURES.map((f, i) => (
                            <li
                                key={i}
                                className="mp-slide-up flex items-start gap-4"
                                style={{ animationDelay: `${i * 0.12 + 0.15}s` }}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{f.title}</p>
                                    <p className="mt-0.5 text-sm text-slate-400">{f.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom stats */}
                <div className="relative border-t border-white/10 pt-6">
                    <p className="text-xs text-slate-500 mb-4">Adopté par des équipes produit & SaaS</p>
                    <div className="flex items-center gap-6">
                        {[
                            { value: '40%', label: "d'économies moyennes" },
                            { value: '14j', label: "d'essai gratuit" },
                            { value: '24/7', label: 'monitoring actif' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-6">
                                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                                <div>
                                    <p className="text-2xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-slate-400">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Right panel — form ───────────────────────────────────────────── */}
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/30 px-6 py-12">
                {/* Subtle background radials */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.06),transparent_55%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.04),transparent_50%)]" />
                <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-200/15 blur-3xl" />

                {/* Logo — mobile only */}
                <div className="relative mb-8 lg:hidden">
                    <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/25">
                            <span className="text-sm font-bold text-white">MP</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900">Margexa</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="relative w-full max-w-md mp-slide-up">
                    {/* Outer glow */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet-100/50 to-purple-100/40 blur-xl" />

                    <div className="relative overflow-hidden rounded-2xl border border-violet-100/80 bg-white/90 px-8 py-10 shadow-2xl shadow-violet-200/30 backdrop-blur-xl">
                        {/* Top accent line */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className="relative mt-8 text-sm text-slate-500">
                    <Link href="/" className="font-medium text-violet-600 transition hover:text-violet-700">
                        ← Retour à l'accueil
                    </Link>
                </p>
            </div>
        </div>
    );
}
