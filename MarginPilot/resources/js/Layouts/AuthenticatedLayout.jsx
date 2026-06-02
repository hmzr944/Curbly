import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function SectionIcon({ path, active = false }) {
    return (
        <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                active
                    ? 'border-violet-200 bg-violet-50 text-violet-600'
                    : 'border-slate-200 bg-white text-slate-400'
            }`}
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
        </span>
    );
}

const NAV_SECTIONS = [
    {
        title: 'Comprendre',
        description: 'Voir la santé économique du support IA.',
        icon: 'M3 13.5l4-4 4 4 8-8M21 7v6h-6',
        groupLabel: "Vue d'ensemble",
        previewTitle: 'Pilotez la santé économique du support IA',
        previewBody: 'Repérez les fuites de marge, lisez les signaux critiques et partagez une lecture claire avec le produit, le support et la finance.',
        items: [
            {
                label: "Vue d'ensemble",
                description: 'KPIs, zones de fuite, actions prioritaires.',
                href: 'margin-leaks.index',
                current: ['margin-leaks.*', 'dashboard'],
                icon: 'M4 19.5h16M6.75 16V9.75m5.25 6.25V6.5m5.25 9.5v-4.75',
            },
        ],
    },
    {
        title: 'Agir',
        description: 'Activer les règles et traiter les zones à risque.',
        icon: 'M12 6v12m6-6H6',
        groupLabel: 'Actions prioritaires',
        previewTitle: "Passez de l'analyse à l'action",
        previewBody: 'Activez les bonnes policies, suivez les clients à risque et vérifiez que vos plans restent rentables sous usage IA.',
        items: [
            {
                label: 'Policies',
                description: 'Templates et règles actives.',
                href: 'policies.index',
                current: ['policies.*'],
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            },
            {
                label: 'Clients',
                description: 'Identifier les clients qui détruisent la marge.',
                href: 'clients.index',
                current: ['clients.*'],
                icon: 'M17 20h5v-1a4 4 0 00-5-3.87M17 20H7m10 0v-1c0-.653-.126-1.276-.356-1.847M7 20H2v-1a4 4 0 015-3.87M7 20v-1c0-.653.126-1.276.356-1.847m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            },
            {
                label: 'Plans',
                description: 'Vérifier la rentabilité de chaque formule.',
                href: 'plans.index',
                current: ['plans.*'],
                icon: 'M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3 .672 3 1.5S13.657 14 12 14m0-6c1.657 0 3-.672 3-1.5S13.657 5 12 5 9 5.672 9 6.5 10.343 8 12 8zm0 6c-1.657 0-3 .672-3 1.5S10.343 17 12 17s3-.672 3-1.5S13.657 14 12 14z',
            },
            {
                label: 'Requêtes IA',
                description: 'Vue opérationnelle des requêtes et des décisions.',
                href: 'ai-requests.index',
                current: ['ai-requests.*'],
                icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-3 3v-3z',
            },
        ],
    },
    {
        title: 'Prouver',
        description: "Mesurer l'impact économique réellement généré.",
        icon: 'M5 17l4-4 4 4 6-8',
        groupLabel: "Preuve d'impact",
        previewTitle: 'Montrez ce que Margexa protège',
        previewBody: 'Transformez chaque garde-fou en preuve business : coût évité, requêtes optimisées et scénarios testés avant activation.',
        items: [
            {
                label: 'Impact marge',
                description: "Coût évité, preuve d'impact et historique.",
                href: 'margin-impact.index',
                current: ['margin-impact.*'],
                icon: 'M3 17l6-6 4 4 8-8M3 7h4v4H3V7z',
            },
            {
                label: 'Simulation',
                description: 'Tester un scénario avant activation.',
                href: 'simulation.index',
                current: ['simulation.*'],
                icon: 'M4.75 4.75l14.5 14.5M9 7.5h6m-7.5 3h9m-10.5 3h12',
            },
            {
                label: 'Audit IA',
                description: 'Retrouver les audits et leurs recommandations.',
                href: 'audit-ia.index',
                current: ['audit-ia.*'],
                icon: 'M9 12h6m-6 4h6M7 4h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z',
            },
        ],
    },
    {
        title: 'Gérer',
        description: "Piloter l'abonnement et la configuration.",
        icon: 'M10.325 4.317a1 1 0 011.35-.936l.108.054 1.06.53a1 1 0 00.894 0l1.06-.53a1 1 0 011.408.845l.087 1.182a1 1 0 00.576.833l1.06.53a1 1 0 01.287 1.59l-.79.892a1 1 0 000 1.324l.79.892a1 1 0 01-.287 1.59l-1.06.53a1 1 0 00-.576.833l-.087 1.182a1 1 0 01-1.408.845l-1.06-.53a1 1 0 00-.894 0l-1.06.53a1 1 0 01-1.408-.845l-.087-1.182a1 1 0 00-.576-.833l-1.06-.53a1 1 0 01-.287-1.59l.79-.892a1 1 0 000-1.324l-.79-.892a1 1 0 01.287-1.59l1.06-.53a1 1 0 00.576-.833l.087-1.182z',
        groupLabel: 'Configuration',
        previewTitle: 'Gardez la maîtrise du compte',
        previewBody: "Centralisez le plan actif, les providers reliés et les réglages d'organisation sans sortir du même espace de pilotage.",
        items: [
            {
                label: 'Facturation',
                description: 'Plan actuel, factures et upgrade.',
                href: 'billing.index',
                current: ['billing.*'],
                icon: 'M3 7.5h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm0 6h4',
            },
            {
                label: 'Paramètres',
                description: 'Organisation, providers et notifications.',
                href: 'settings.index',
                current: ['settings.*'],
                icon: 'M10.325 4.317a1 1 0 011.35-.936l.108.054 1.06.53a1 1 0 00.894 0l1.06-.53a1 1 0 011.408.845l.087 1.182a1 1 0 00.576.833l1.06.53a1 1 0 01.287 1.59l-.79.892a1 1 0 000 1.324l.79.892a1 1 0 01-.287 1.59l-1.06.53a1 1 0 00-.576.833l-.087 1.182a1 1 0 01-1.408.845l-1.06-.53a1 1 0 00-.894 0l-1.06.53a1 1 0 01-1.408-.845l-.087-1.182a1 1 0 00-.576-.833l-1.06-.53a1 1 0 01-.287-1.59l.79-.892a1 1 0 000-1.324l-.79-.892a1 1 0 01.287-1.59l1.06-.53a1 1 0 00.576-.833l.087-1.182z',
            },
        ],
    },
];

const PlanBadge = ({ billing }) => {
    if (!billing) return null;

    const badges = {
        free: { label: 'Gratuit', className: 'border-slate-200 bg-slate-50 text-slate-600' },
        scan: { label: 'AI Margin Scan', className: 'border-violet-200 bg-violet-50 text-violet-700' },
        observe: { label: 'Continuous Control', className: 'border-violet-200 bg-violet-50 text-violet-700' },
        control: { label: 'Continuous Control', className: 'border-violet-200 bg-violet-50 text-violet-700' },
        scale: { label: 'Scale', className: 'border-slate-700 bg-slate-800 text-white' },
    };

    const badge = badges[billing.plan] || badges.free;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
            {billing.is_trial && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />}
            {badge.label}
        </span>
    );
};

function isCurrentRoute(patterns) {
    return patterns.some((pattern) => route().current(pattern));
}

function MegaMenuLink({ item }) {
    const active = isCurrentRoute(item.current);

    return (
        <Link
            href={route(item.href)}
            className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 ${
                active
                    ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-100/60'
                    : 'text-slate-700 hover:bg-violet-50/80 hover:text-slate-950 hover:shadow-sm hover:shadow-slate-200/70'
            }`}
        >
            <span
                className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                    active
                        ? 'border-violet-200 bg-violet-50 text-violet-600'
                        : 'border-slate-200 bg-white text-slate-400 group-hover:border-violet-200 group-hover:bg-white group-hover:text-violet-600'
                }`}
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon ?? 'M4 7h16M4 12h16M4 17h10'} />
                </svg>
            </span>
            <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium transition ${active ? 'text-violet-700' : 'text-slate-900 group-hover:text-slate-950'}`}>{item.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.description}</p>
            </div>
        </Link>
    );
}

function DesktopMegaMenu({ openSection, onOpen, onClose }) {
    const currentSection = NAV_SECTIONS.find((section) => section.title === openSection) || null;
    const closeTimerRef = useRef(null);

    const cancelClose = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const scheduleClose = () => {
        cancelClose();
        closeTimerRef.current = setTimeout(() => {
            onClose();
        }, 180);
    };

    useEffect(() => {
        return () => cancelClose();
    }, []);

    return (
        <div className="hidden min-w-0 flex-1 justify-center xl:flex">
            <div className="relative w-full max-w-[min(54rem,calc(100vw-24rem))] pb-4" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                <div className="flex items-center justify-center gap-12">
                    {NAV_SECTIONS.map((section) => {
                        const sectionActive =
                            section.title === openSection || section.items.some((item) => isCurrentRoute(item.current));

                        const firstItem = section.items[0];

                        return (
                            <Link
                                key={section.title}
                                href={route(firstItem.href)}
                                onMouseEnter={() => {
                                    cancelClose();
                                    onOpen(section.title);
                                }}
                                onFocus={() => {
                                    cancelClose();
                                    onOpen(section.title);
                                }}
                                onClick={() => onClose()}
                                className={`group relative flex items-center justify-center px-1 py-2 text-sm font-medium transition-all duration-200 ${
                                    sectionActive ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {section.title}
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-slate-900 transition-all duration-200 ${
                                        sectionActive ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}
                                />
                            </Link>
                        );
                    })}
                </div>

                {currentSection ? (
                    <div className="absolute left-1/2 top-full z-50 w-full -translate-x-1/2 pt-4" onMouseEnter={cancelClose}>
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
                            <div className="grid gap-0 lg:grid-cols-[0.8fr,1.45fr]">
                                <div className="border-r border-slate-100 bg-slate-50/70 px-6 py-5">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {currentSection.groupLabel}
                                    </p>
                                    <h3 className="mt-3 text-base font-semibold text-slate-900">{currentSection.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">{currentSection.description}</p>
                                </div>
                                <div className="px-6 py-5">
                                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Pages disponibles
                                    </p>
                                    <div className="space-y-1">
                                        {currentSection.items.map((item) => (
                                            <MegaMenuLink key={item.label} item={item} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header = null, children }) {
    const { auth, billing } = usePage().props;
    const user = auth.user;
    const organization = auth.organization;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [openSection, setOpenSection] = useState(null);

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
            <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-white via-slate-50/90 to-violet-50/35" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_-10%,rgba(139,92,246,0.09),transparent)]" />
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none fixed -left-24 top-28 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
            <div className="pointer-events-none fixed right-[-6rem] top-24 h-96 w-96 rounded-full bg-violet-200/20 blur-3xl" />
            <div className="pointer-events-none fixed bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-violet-100/30 blur-3xl" />

            <div className="relative">
                <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/86 shadow-[0_12px_40px_rgba(148,163,184,0.10)] backdrop-blur-2xl">
                    <div className="flex min-h-[74px] w-full items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 flex-[0_0_auto] items-center xl:w-[260px] xl:min-w-[260px]">
                            <Link href={route('margin-leaks.index')} className="group flex min-w-0 items-center gap-3">
                                <div className="relative flex h-12 items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
                                    <ApplicationLogo className="h-[1.08rem] w-auto" gradientId="authenticated-layout-logo" />
                                </div>
                                <div className="hidden min-w-0 lg:block">
                                    <div className="truncate text-base font-semibold text-slate-900">Margexa</div>
                                    <div className="truncate text-xs font-medium text-slate-500">{organization?.name ?? 'Organisation'}</div>
                                </div>
                            </Link>
                        </div>

                        <div className="hidden min-w-0 flex-1 justify-center xl:flex xl:-translate-x-5">
                            <DesktopMegaMenu openSection={openSection} onOpen={setOpenSection} onClose={() => setOpenSection(null)} />
                        </div>

                        <div className="ml-auto flex flex-[0_0_auto] items-center justify-end gap-3 xl:w-[260px] xl:min-w-[260px]">
                            <div className="hidden items-center gap-3 sm:flex">
                                <PlanBadge billing={billing} />

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/72 px-3 py-2.5 text-sm font-medium text-slate-600 backdrop-blur-xl transition-all duration-300 hover:border-violet-200 hover:bg-white hover:shadow-lg"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600 transition-all group-hover:from-violet-100 group-hover:to-violet-50 group-hover:text-violet-700">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden min-w-0 text-left lg:block">
                                                <div className="truncate text-sm font-semibold text-slate-800">{user.name}</div>
                                                <div className="truncate text-[11px] text-slate-400">{user.email}</div>
                                            </div>
                                            <svg className="h-4 w-4 text-slate-400 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="border-b border-slate-100 px-4 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-slate-900">{organization?.name}</div>
                                                    <div className="truncate text-xs text-slate-500">{user.email}</div>
                                                </div>
                                                <PlanBadge billing={billing} />
                                            </div>
                                        </div>
                                        {/* <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link> */}
                                        <Dropdown.Link href={route('billing.index')}>Facturation</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Déconnexion
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="flex items-center xl:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/72 text-slate-500 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-lg"
                                >
                                    {!showingNavigationDropdown ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' border-t border-slate-200/60 bg-white/94 backdrop-blur-2xl xl:hidden'}>
                        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
                            <div className="space-y-4 p-4">
                                {NAV_SECTIONS.map((section) => (
                                    <div key={section.title} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3">
                                        <div className="mb-3 flex items-center gap-3">
                                            <SectionIcon path={section.icon} active={section.items.some((item) => isCurrentRoute(item.current))} />
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                                    {section.title}
                                                </p>
                                                <p className="text-xs text-slate-500">{section.description}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {section.items.map((item) => (
                                                <ResponsiveNavLink
                                                    key={item.label}
                                                    href={route(item.href)}
                                                    active={isCurrentRoute(item.current)}
                                                >
                                                    {item.label}
                                                </ResponsiveNavLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-200/60 p-4">
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 font-semibold text-slate-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-slate-900">{user.name}</div>
                                        <div className="truncate text-sm text-slate-500">{user.email}</div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-1">
                                    {/* <ResponsiveNavLink href={route('profile.edit')}>Profil</ResponsiveNavLink> */}
                                    <ResponsiveNavLink href={route('billing.index')}>Facturation</ResponsiveNavLink>
                                    <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                        Déconnexion
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="relative pb-10 pt-6 sm:pb-14 sm:pt-8">
                    {header && (
                        <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/78 px-5 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.14)] backdrop-blur-2xl sm:px-6 sm:py-6">
                                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-200/35 blur-3xl" />
                                <div className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-violet-200/25 blur-3xl" />
                                <div className="relative">{header}</div>
                            </div>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
