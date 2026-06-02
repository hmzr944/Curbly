import { useEffect, useRef } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { track } from '@/lib/track';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const ANIM_CSS = `
@keyframes mp-slide-up {
  from { opacity:0; transform:translateY(28px); }
  to   { opacity:1; transform:translateY(0);    }
}
@keyframes mp-glow-drift {
  0%,100% { transform:translate(0,0)   scale(1);    opacity:.18; }
  33%      { transform:translate(18px,-14px) scale(1.06); opacity:.26; }
  66%      { transform:translate(-10px,20px) scale(.97); opacity:.20; }
}
@keyframes mp-orb-b {
  0%,100% { transform:translate(0,0)   scale(1);    }
  40%      { transform:translate(-22px,16px) scale(1.08); }
  70%      { transform:translate(14px,-8px)  scale(.95); }
}
@keyframes mp-ring-pulse {
  0%   { box-shadow:0 0 0 0   rgba(139,92,246,.45); }
  70%  { box-shadow:0 0 0 6px rgba(139,92,246,0);   }
  100% { box-shadow:0 0 0 0   rgba(139,92,246,0);   }
}
@keyframes mp-badge-float {
  0%,100% { transform:translateX(-50%) translateY(0);   }
  50%      { transform:translateX(-50%) translateY(-3px); }
}
@keyframes mp-shimmer {
  from { transform:translateX(-220%) skewX(-12deg); }
  to   { transform:translateX(360%)  skewX(-12deg); }
}
@keyframes mp-arrow-nudge {
  0%,100% { transform:translateX(0);   }
  50%      { transform:translateX(4px); }
}
@keyframes mp-spin-slow {
  to { transform:rotate(360deg); }
}

/* Hero entrance */
.mp-slide-up { animation:mp-slide-up .75s cubic-bezier(.16,1,.3,1) both; }
.mp-d1 { animation-delay:  0ms; }
.mp-d2 { animation-delay: 90ms; }
.mp-d3 { animation-delay:180ms; }
.mp-d4 { animation-delay:270ms; }
.mp-d5 { animation-delay:360ms; }

/* Orbs */
.mp-orb-a { animation:mp-glow-drift 14s ease-in-out infinite; }
.mp-orb-b { animation:mp-orb-b     18s ease-in-out infinite; }

/* Scroll reveal */
.mp-reveal {
  opacity:0; transform:translateY(20px);
  transition:opacity .65s cubic-bezier(.16,1,.3,1),
             transform .65s cubic-bezier(.16,1,.3,1);
}
.mp-visible { opacity:1; transform:translateY(0); }
.mp-td1 { transition-delay: 60ms; }
.mp-td2 { transition-delay:140ms; }
.mp-td3 { transition-delay:220ms; }
.mp-td4 { transition-delay:300ms; }

/* Glass card base */
.mp-glass {
  background:rgba(255,255,255,.68);
  backdrop-filter:blur(24px) saturate(1.6);
  -webkit-backdrop-filter:blur(24px) saturate(1.6);
  border:1px solid rgba(255,255,255,.65);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.55) inset,
    0 4px 16px rgba(0,0,0,.06),
    0 14px 44px rgba(0,0,0,.10);
  transition:transform .25s cubic-bezier(.16,1,.3,1),
             box-shadow .25s ease;
}
.mp-glass:hover {
  transform:translateY(-4px);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.55) inset,
    0 8px 24px rgba(0,0,0,.08),
    0 20px 60px rgba(0,0,0,.13);
}

/* Glass highlighted (Maîtrise) */
.mp-glass-hl {
  background:linear-gradient(145deg,rgba(245,243,255,.82),rgba(237,233,254,.78));
  backdrop-filter:blur(28px) saturate(2);
  -webkit-backdrop-filter:blur(28px) saturate(2);
  border:1px solid rgba(167,139,250,.38);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.65) inset,
    0 4px 24px rgba(139,92,246,.12),
    0 16px 56px rgba(139,92,246,.17),
    0 32px 80px rgba(139,92,246,.08);
  transition:transform .25s cubic-bezier(.16,1,.3,1),
             box-shadow .25s ease;
}
.mp-glass-hl:hover {
  transform:translateY(-6px);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.65) inset,
    0 8px 32px rgba(139,92,246,.18),
    0 24px 72px rgba(139,92,246,.22),
    0 40px 100px rgba(139,92,246,.10);
}

/* Shimmer sweep */
.mp-card-hl .mp-shimmer-line {
  position:absolute; top:0; left:0; width:45%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);
  transform:translateX(-220%) skewX(-12deg);
  pointer-events:none;
}
.mp-card-hl:hover .mp-shimmer-line {
  animation:mp-shimmer .7s cubic-bezier(.4,0,.2,1) forwards;
}

/* Badge float + ring */
.mp-badge-float { animation:mp-badge-float 3.2s ease-in-out infinite; }
.mp-ring-pulse  { animation:mp-ring-pulse  2.4s ease-out     infinite; }

/* Feature check bounce */
.mp-offer-card .mp-feat-check {
  transition:transform .18s cubic-bezier(.34,1.56,.64,1);
}
.mp-offer-card:hover .mp-feat-check { transform:scale(1.18); }

/* CTA arrow */
.mp-arrow-live { animation:mp-arrow-nudge 1.9s ease-in-out infinite; }

/* CTA shimmer */
.mp-cta-primary { position:relative; overflow:hidden; }
.mp-cta-primary::after {
  content:''; position:absolute; inset:0;
  background:rgba(255,255,255,.10);
  transform:translateX(-100%);
  transition:transform .4s cubic-bezier(.4,0,.2,1);
}
.mp-cta-primary:hover::after { transform:translateX(0); }

/* Pill hover */
.mp-pill {
  transition:transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease;
}
.mp-pill:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,.09); }

/* Table row hover */
.mp-tr { transition:background .12s ease; }
.mp-tr:hover { background:rgba(249,250,251,.9); }

/* Spin decoration */
.mp-spin-slow { animation:mp-spin-slow 40s linear infinite; }
`;

// ─── SVG helpers ─────────────────────────────────────────────────────────────
const Ico = ({ d, w = 1.8, cls = 'h-5 w-5' }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth={w}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);
const IcoCheck = () => <Ico w={2.5} d="M4.5 12.75l6 6 9-13.5"                  cls="h-3.5 w-3.5" />;
const IcoArrow = () => <Ico w={2}   d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"  cls="h-4 w-4" />;
const IcoChev  = () => <Ico w={2}   d="M8.25 4.5l7.5 7.5-7.5 7.5"             cls="h-3 w-3" />;

// ─── Background orbs ─────────────────────────────────────────────────────────
function PageOrbs() {
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            {/* Violet haut-centre */}
            <div className="mp-orb-a absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-400/[0.14] blur-[120px]" />
            {/* Indigo bas-droite */}
            <div className="mp-orb-b absolute -bottom-24 -right-16 h-[480px] w-[480px] rounded-full bg-violet-300/[0.10] blur-[100px]" />
            {/* Purple bas-gauche */}
            <div className="mp-orb-a absolute bottom-1/4 -left-24 h-[360px] w-[360px] rounded-full bg-purple-300/[0.09] blur-[90px]" style={{ animationDelay: '4s' }} />
        </div>
    );
}

// ─── TypeBadge ────────────────────────────────────────────────────────────────
const TYPE_CFG = {
    free:         { label: 'Gratuit',         cls: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700' },
    product:      { label: 'Paiement unique', cls: 'border-amber-200/80   bg-amber-50/80   text-amber-700'   },
    subscription: { label: 'Abonnement',      cls: 'border-violet-200/80  bg-violet-50/80  text-violet-700'  },
    contact:      { label: 'Sur invitation',  cls: 'border-slate-200/80   bg-white/60      text-slate-600'   },
};

function TypeBadge({ offer }) {
    if (offer.badge_label) {
        return (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm ${TYPE_CFG.subscription.cls}`}>
                {offer.badge_label}
            </span>
        );
    }
    const cfg = offer.kind === 'contact' && offer.price === null
        ? { label: 'Sur devis', cls: 'border-slate-200/80 bg-white/60 text-slate-600' }
        : (TYPE_CFG[offer.kind] ?? TYPE_CFG.contact);
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

// ─── Section eyebrow ─────────────────────────────────────────────────────────
function SectionEye({ label, title, sub }) {
    return (
        <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-slate-200/70 bg-white/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-sm">
                <span className="h-1 w-4 rounded-full bg-gradient-to-r from-violet-400 to-transparent" />
                {label}
                <span className="h-1 w-4 rounded-full bg-gradient-to-l from-violet-400 to-transparent" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
            {sub && <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{sub}</p>}
        </div>
    );
}

// ─── AuditCard ────────────────────────────────────────────────────────────────
function AuditCard({ offer, ctas }) {
    const label = ctas[offer.id] ?? offer.cta;
    return (
        <Link href={offer.free_href ?? '/audit'} onClick={() => track('Audit CTA Clicked', { source: 'pricing_audit_card' })} className="group block">
            <div className="mp-glass relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8 md:flex-row md:items-center">
                {/* Décor spinning ring */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-dashed border-slate-200/50 mp-spin-slow" />
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-dashed border-slate-200/30 mp-spin-slow" style={{ animationDirection: 'reverse' }} />

                <div className="flex-1">
                    <TypeBadge offer={offer} />
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{offer.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">{offer.tagline}</p>
                    <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
                        {offer.features.map(f => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                                <span className="mp-feat-check mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-transform">
                                    <IcoCheck />
                                </span>
                                <span className="text-slate-600">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bloc prix */}
                <div className="flex shrink-0 flex-col items-center gap-5 rounded-2xl border border-white/70 bg-white/50 px-8 py-6 shadow-sm backdrop-blur-md">
                    <div className="text-center">
                        <div className="text-4xl font-extrabold tracking-tight text-slate-900">Gratuit</div>
                        <div className="mt-1 text-xs text-slate-400">sans carte bancaire</div>
                    </div>
                    <span className="mp-cta-primary inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 group-hover:shadow-md">
                        {label}
                        <span className="mp-arrow-live"><IcoArrow /></span>
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ─── OfferCard ────────────────────────────────────────────────────────────────
function OfferCard({ offer, ctas, highlighted = false }) {
    const label      = ctas[offer.id] ?? offer.cta ?? 'En savoir plus';
    const isSurDevis = offer.kind === 'contact' && offer.price === null;
    const href       = offer.kind === 'contact'
        ? offer.contact_href
        : route('register', { offer: offer.register_offer ?? offer.id });

    const card = (
        <div className={[
            'mp-offer-card relative flex h-full flex-col overflow-hidden rounded-3xl',
            highlighted ? 'mp-card-hl mp-glass-hl p-7' : 'mp-glass p-6',
        ].join(' ')}>

            {/* Halo interne (HL) */}
            {highlighted && (
                <>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="absolute -top-12 left-1/2 h-52 w-72 -translate-x-1/2 rounded-full bg-violet-400/[0.08] blur-2xl" />
                        <div className="mp-shimmer-line" />
                        {/* Ring décoratif */}
                        <div className="mp-spin-slow absolute -right-20 -top-20 h-64 w-64 rounded-full border border-dashed border-violet-300/20" />
                    </div>
                    <div className="mp-badge-float absolute -top-3.5 left-1/2 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold tracking-wide text-violet-700 shadow-md shadow-violet-500/10 backdrop-blur-md">
                            <span className="mp-ring-pulse h-1.5 w-1.5 rounded-full bg-violet-500" />
                            Recommandé
                        </div>
                    </div>
                </>
            )}

            {/* Header */}
            <div>
                <TypeBadge offer={offer} />
                <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">{offer.name}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{offer.tagline}</p>
            </div>

            {/* Divider */}
            <div className={`my-4 h-px ${highlighted ? 'bg-gradient-to-r from-violet-200/60 via-violet-300/40 to-transparent' : 'bg-gradient-to-r from-slate-200/80 to-transparent'}`} />

            {/* Prix */}
            <div className={`rounded-2xl px-4 py-3.5 ${highlighted ? 'border border-violet-200/50 bg-violet-50/50' : 'border border-white/80 bg-white/50'} shadow-sm backdrop-blur-sm`}>
                {isSurDevis ? (
                    <div className="text-xl font-bold tracking-tight text-slate-900">Sur devis</div>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold tracking-tight ${highlighted ? 'text-violet-900' : 'text-slate-900'}`}>{offer.price}</span>
                        <span className="text-sm font-medium text-slate-400">EUR</span>
                        {offer.price_note && <span className="text-sm text-slate-400">{offer.price_note}</span>}
                    </div>
                )}
                <p className="mt-1 text-xs leading-4 text-slate-500">{offer.description}</p>
            </div>

            {/* Features */}
            <ul className="mt-4 flex-1 space-y-2">
                {offer.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className="mp-feat-check mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-sm backdrop-blur-sm">
                            <IcoCheck />
                        </span>
                        <span className="text-slate-600">{f}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <div className="mt-5">
                <span className={[
                    'mp-cta-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                    highlighted
                        ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                        : 'border border-white/80 bg-white/70 text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white/90 hover:shadow-md',
                ].join(' ')}>
                    {label}
                    {highlighted && <span className="mp-arrow-live"><IcoArrow /></span>}
                </span>
            </div>
        </div>
    );

    const handleClick = () => {
        const eventName = offer.id === 'scan' ? 'Scan Checkout Clicked' : 'Plan CTA Clicked';
        track(eventName, { plan: offer.id });
    };
    if (offer.kind === 'contact') return <Link href={href} onClick={handleClick} className="relative block h-full">{card}</Link>;
    return <Link href={href} onClick={handleClick} className="relative block h-full">{card}</Link>;
}

// ─── Données comparatif ───────────────────────────────────────────────────────
const COMPARE_COLS = [
    { name: 'Diagnostic', price: '490', note: 'EUR · unique', hl: false },
    { name: 'Essentiel',  price: '149', note: 'EUR / mois',   hl: false },
    { name: 'Maîtrise',   price: '349', note: 'EUR / mois',   hl: true  },
    { name: 'Sur mesure', price: '—',   note: 'Sur devis',    hl: false },
];
const COMPARE_GROUPS = [
    { group: 'Analyse', rows: [
        { label: 'Rapport one-shot',    cols: [true,  false, false, true]  },
        { label: "Plan d'activation",   cols: [true,  false, false, true]  },
        { label: "Simulation d'impact", cols: [true,  false, true,  true]  },
    ]},
    { group: 'Visibilité', rows: [
        { label: 'Monitoring runtime',    cols: [false, true,  true,  true] },
        { label: 'Alertes email',         cols: [true,  true,  true,  true] },
        { label: 'Exports CFO (CSV/PDF)', cols: [true,  true,  true,  true] },
    ]},
    { group: 'Contrôle actif', rows: [
        { label: 'Policies actives',   cols: [false, true,  true,  true] },
        { label: 'Routage économique', cols: [false, false, true,  true] },
        { label: 'API & webhooks',     cols: [false, false, true,  true] },
    ]},
    { group: 'Entreprise', rows: [
        { label: 'Multi-organisations',  cols: [false, false, false, true] },
        { label: 'SSO',                  cols: [false, false, false, true] },
        { label: 'SLA garanti',          cols: [false, false, false, true] },
        { label: 'Accompagnement dédié', cols: [false, false, false, true] },
    ]},
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Pricing() {
    const { catalog } = usePage().props;
    const allOffers   = catalog?.public_offers ?? [];
    const ctas        = catalog?.public_ctas   ?? {};

    const auditOffer     = allOffers.find(o => o.id === 'audit_free');
    const gridOffers     = [
        allOffers.find(o => o.id === 'scan'),
        allOffers.find(o => o.id === 'essential'),
        allOffers.find(o => o.id === 'continuous_control'),
        allOffers.find(o => o.id === 'scale'),
    ].filter(Boolean);

    const pageRef = useRef(null);
    useEffect(() => {
        if (!pageRef.current) return;
        const els = pageRef.current.querySelectorAll('.mp-reveal');
        const io  = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('mp-visible'); io.unobserve(e.target); }
            }),
            { threshold: 0.07 },
        );
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <PublicLayout>
            <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
            <Head>
                <title>Tarifs — Margexa</title>
                <meta name="description" content="Audit IA gratuit, Diagnostic, Essentiel, Maîtrise — contrôlez votre marge support IA." />
            </Head>

            {/* Orbs de fond fixes */}
            <PageOrbs />

            <div ref={pageRef} className="relative" style={{ zIndex: 1 }}>

                {/* ══════ 1. HERO ══════════════════════════════════ */}
                <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:px-6 sm:pt-48">

                    {/* Grid pattern */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
                         style={{ backgroundImage: 'linear-gradient(rgba(109,40,217,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(109,40,217,.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                    {/* Déco : grand "TARIFS" fantôme */}
                    <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 select-none text-[11rem] font-black uppercase leading-none tracking-tighter text-slate-900/[0.025] sm:text-[16rem]">
                        TARIFS
                    </div>

                    <div className="relative mx-auto max-w-2xl text-center">
                        <div className="mp-slide-up mp-d1 inline-flex items-center gap-2.5 rounded-full border border-violet-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                            </span>
                            Tarification simple et progressive
                        </div>

                        <h1 className="mp-slide-up mp-d2 mt-7 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl" style={{ lineHeight: 1.08 }}>
                            Commencez par{' '}
                            <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 bg-clip-text text-transparent">
                                comprendre.
                            </span>
                        </h1>

                        <p className="mp-slide-up mp-d3 mx-auto mt-6 max-w-lg text-lg leading-8 text-slate-500">
                            Audit gratuit d'abord. Diagnostic si vous avez besoin d'un cadrage approfondi.
                            Puis l'abonnement qui vous donne le bon niveau de contrôle en continu.
                        </p>

                        {/* Stats glassmorphic */}
                        <div className="mp-slide-up mp-d4 mt-10 flex flex-wrap items-stretch justify-center gap-3">
                            {[
                                { value: '−34%',    label: 'coût IA récupéré' },
                                { value: '< 5 min', label: 'pour démarrer'    },
                                { value: 'EU',      label: 'données hébergées' },
                            ].map(s => (
                                <div key={s.value} className="mp-glass flex items-center gap-3 rounded-2xl px-5 py-3">
                                    <span className="text-xl font-extrabold text-slate-900">{s.value}</span>
                                    <span className="text-xs text-slate-500">{s.label}</span>
                                </div>
                            ))}
                        </div>

                        <p className="mp-slide-up mp-d5 mt-5 text-xs text-slate-400">
                            Sans carte bancaire · Résultats immédiats · Données isolées par organisation
                        </p>
                    </div>
                </section>

                {/* ══════ 2. PARCOURS ══════════════════════════════ */}
                <section className="px-4 pb-16 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mp-reveal mp-glass overflow-hidden rounded-2xl">
                            <div className="border-b border-white/50 bg-white/30 px-6 py-3 backdrop-blur-md">
                                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">Parcours recommandé</p>
                            </div>
                            <div className="p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
                                    {[
                                        { num: '01', label: 'Audit gratuit',        meta: 'Gratuit',          hl: false },
                                        { num: '02', label: 'Diagnostic',           meta: '490 EUR · unique', hl: false },
                                        { num: '03', label: 'Essentiel · Maîtrise', meta: 'Abonnement',       hl: true  },
                                        { num: '04', label: 'Sur mesure',           meta: 'Sur devis',        hl: false },
                                    ].map((s, i, arr) => (
                                        <div key={s.num} className="flex items-center sm:flex-1">
                                            <div className={`mp-pill flex flex-1 flex-col rounded-xl border px-4 py-3.5 sm:mx-1.5 ${s.hl ? 'border-violet-200/70 bg-violet-50/70 shadow-sm shadow-violet-500/[0.07]' : 'border-white/60 bg-white/50'} backdrop-blur-sm`}>
                                                <span className={`text-[9px] font-bold uppercase tracking-[0.22em] ${s.hl ? 'text-violet-400' : 'text-slate-400'}`}>{s.num}</span>
                                                <span className={`mt-1 text-sm font-semibold ${s.hl ? 'text-violet-900' : 'text-slate-800'}`}>{s.label}</span>
                                                <span className="mt-0.5 text-xs text-slate-400">{s.meta}</span>
                                            </div>
                                            {i < arr.length - 1 && (
                                                <div className="hidden shrink-0 text-slate-300 sm:flex">
                                                    <IcoChev />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════ 3. AUDIT GRATUIT ═════════════════════════ */}
                <section className="px-4 pb-16 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mp-reveal">
                            <SectionEye
                                label="Point d'entrée"
                                title="Commencer sans engagement"
                                sub="Aucune carte bancaire. Premier diagnostic en moins de 5 minutes."
                            />
                        </div>
                        <div className="mp-reveal mp-td1">
                            {auditOffer && <AuditCard offer={auditOffer} ctas={ctas} />}
                        </div>
                    </div>
                </section>

                {/* ══════ 4. BENTO OFFRES ══════════════════════════ */}
                <section className="px-4 pb-28 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mp-reveal">
                            <SectionEye
                                label="Offres"
                                title="Choisissez votre niveau de contrôle"
                                sub="One-shot ou abonnement continu — à chaque équipe son niveau."
                            />
                        </div>

                        {/* Bento grid — Maîtrise élevée */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:items-start">
                            {gridOffers.map((offer, i) => {
                                const isHL  = offer.id === 'continuous_control';
                                const delay = ['mp-td1','mp-td2','mp-td3','mp-td4'][i] ?? 'mp-td4';
                                return (
                                    <div key={offer.id} className={['mp-reveal', delay, isHL ? 'xl:-mt-6' : ''].join(' ')}>
                                        <OfferCard offer={offer} ctas={ctas} highlighted={isHL} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Note bas de grille */}
                        <div className="mp-reveal mt-8 flex items-center justify-center gap-2">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-200" />
                            <span className="text-xs text-slate-400">Hébergement EU · Données isolées · Support inclus</span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-200" />
                        </div>
                    </div>
                </section>

                {/* ══════ 5. TABLEAU COMPARATIF ════════════════════ */}
                <section className="px-4 py-20 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="mp-reveal">
                            <SectionEye
                                label="Comparatif"
                                title="Ce qui est inclus dans chaque formule"
                            />
                        </div>

                        <div className="mp-reveal mp-glass overflow-hidden rounded-2xl">

                            {/* Header colonnes */}
                            <div className="grid grid-cols-5 border-b border-white/50">
                                <div className="bg-white/20 px-5 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Fonctionnalité
                                </div>
                                {COMPARE_COLS.map(({ name, price, note, hl }) => (
                                    <div key={name} className={`flex flex-col items-center justify-center border-l border-white/50 px-2 py-4 text-center ${hl ? 'bg-violet-100/40' : 'bg-white/10'}`}>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{name}</span>
                                        <span className={`mt-1 text-sm font-extrabold ${hl ? 'text-violet-700' : 'text-slate-900'}`}>{price}</span>
                                        <span className="text-[9px] text-slate-400">{note}</span>
                                        {hl && <div className="mt-1.5 h-0.5 w-8 rounded-full bg-violet-400/60" />}
                                    </div>
                                ))}
                            </div>

                            {/* Groupes */}
                            {COMPARE_GROUPS.map(({ group, rows }, gi) => (
                                <div key={group} className={gi < COMPARE_GROUPS.length - 1 ? 'border-b border-white/40' : ''}>
                                    <div className="grid grid-cols-5 border-b border-white/30 bg-white/20">
                                        <div className="col-span-5 px-5 py-2">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">{group}</span>
                                        </div>
                                    </div>
                                    {rows.map(({ label, cols }, ri) => (
                                        <div key={label} className={`mp-tr grid grid-cols-5 ${ri < rows.length - 1 ? 'border-b border-white/30' : ''}`}>
                                            <div className="px-5 py-3.5 text-sm text-slate-700">{label}</div>
                                            {cols.map((has, ci) => (
                                                <div key={ci} className={`flex items-center justify-center border-l border-white/40 py-3.5 ${ci === 2 ? 'bg-violet-50/30' : ''}`}>
                                                    {has ? (
                                                        <svg className="h-4 w-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Footer tableau */}
                            <div className="grid grid-cols-5 border-t border-white/50 bg-white/10">
                                <div className="px-5 py-3.5 text-xs text-slate-400">Support & hébergement EU</div>
                                {COMPARE_COLS.map(({ name, hl }) => (
                                    <div key={name} className={`flex items-center justify-center border-l border-white/40 py-3.5 ${hl ? 'bg-violet-50/20' : ''}`}>
                                        <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mp-reveal mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <svg className="h-3.5 w-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Inclus
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Non inclus
                            </span>
                        </div>
                    </div>
                </section>

                {/* ══════ 6. CTA FINAL ═════════════════════════════ */}
                <section className="px-4 py-24 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mp-reveal relative overflow-hidden rounded-3xl p-[1px]">
                            {/* Gradient border */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-300/60 via-white/20 to-violet-200/40" />
                            <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-white/70 p-10 text-center backdrop-blur-2xl sm:p-14"
                                 style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.09), 0 0 0 1px rgba(255,255,255,0.6) inset' }}>

                                {/* Orb interne */}
                                <div className="pointer-events-none absolute left-1/2 -top-24 h-56 w-80 -translate-x-1/2 rounded-full bg-violet-400/[0.09] blur-3xl" />
                                {/* Spinning ring décoratif */}
                                <div className="mp-spin-slow pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-dashed border-violet-200/40" />
                                <div className="mp-spin-slow pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full border border-dashed border-slate-200/40" style={{ animationDirection: 'reverse' }} />

                                <div className="relative">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-violet-700 shadow-sm backdrop-blur-sm">
                                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                        Commencez gratuitement
                                    </div>

                                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                        Commencez par comprendre
                                        <br className="hidden sm:block" />
                                        <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                                            où la marge fuit.
                                        </span>
                                    </h2>

                                    <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-500">
                                        L'audit gratuit valide le risque. Le Diagnostic affine le cadrage.
                                        Les abonnements activent le contrôle en continu.
                                    </p>

                                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                        {[
                                            { d: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',                                                                                     t: 'Résultats en 5 min'   },
                                            { d: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', t: 'Données hébergées EU' },
                                            { d: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z', t: 'Sans carte bancaire'  },
                                        ].map(({ d, t }) => (
                                            <div key={t} className="mp-glass flex items-center gap-2 rounded-full px-4 py-2">
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                                                </svg>
                                                <span className="text-xs font-medium text-slate-600">{t}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Link
                                            href="/audit"
                                            className="mp-cta-primary inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-violet-500/45 hover:-translate-y-0.5"
                                        >
                                            {ctas.audit ?? 'Lancer mon audit gratuit'}
                                            <span className="mp-arrow-live"><IcoArrow /></span>
                                        </Link>
                                        <Link
                                            href="/contact"
                                            className="mp-glass inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5"
                                        >
                                            Parler à l'équipe
                                            <IcoArrow />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}
