import ApplicationLogo from '@/Components/ApplicationLogo';
import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function PublicNavbar() {
    const page = usePage();
    const currentUrl = typeof page?.url === 'string' ? page.url : '';
    const [scrolled, setScrolled] = useState(false);
    const [navExpanded, setNavExpanded] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setNavExpanded(true), 350);
        return () => clearTimeout(timer);
    }, []);

    const isActive = (href) => {
        if (!currentUrl) return href === '/';
        return href === '/' ? currentUrl === '/' : currentUrl.startsWith(href);
    };

    const isHome = currentUrl === '/';
    const isDark = isHome && !scrolled;

    const mainLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Audit gratuit', href: '/audit' },
        { name: 'Tarifs', href: '/pricing' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Contact', href: '/contact' },
    ];

    const linkClasses = (active) =>
        `group relative shrink-0 px-3 pb-3 pt-2 text-sm font-medium transition-all duration-300 ${
            active
                ? isDark ? 'text-white' : 'text-slate-900'
                : isDark
                    ? 'text-white/65 hover:scale-105 hover:text-white'
                    : 'text-slate-600 hover:scale-105 hover:text-slate-900'
        }`;

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled ? 'bg-white/82 backdrop-blur-2xl' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                <div className="relative hidden h-14 lg:flex lg:items-center">

                    {/* Spacer invisible — maintient la place du logo dans le flex */}
                    <div className="w-[220px] min-w-[220px] flex-shrink-0" aria-hidden="true" />

                    {/* Logo — seul élément présent au départ, glisse du centre vers la gauche */}
                    <div
                        className="absolute top-1/2"
                        style={{
                            left: navExpanded ? '0' : '50%',
                            transform: navExpanded ? 'translate(0, -50%)' : 'translate(-50%, -50%)',
                            transition: 'left 600ms cubic-bezier(.16,1,.3,1), transform 600ms cubic-bezier(.16,1,.3,1)',
                        }}
                    >
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 items-center">
                                <ApplicationLogo className="h-4 w-auto sm:h-5" gradientId="public-navbar-logo" />
                            </div>
                            <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Margexa</span>
                        </Link>
                    </div>

                    {/* Liens centre — apparaissent après que le logo ait glissé */}
                    <div
                        className="flex min-w-0 flex-1 items-center justify-center"
                        style={{
                            opacity: navExpanded ? 1 : 0,
                            transform: navExpanded ? 'translateX(0)' : 'translateX(-10px)',
                            transition: 'opacity 400ms cubic-bezier(.16,1,.3,1), transform 400ms cubic-bezier(.16,1,.3,1)',
                            transitionDelay: navExpanded ? '320ms' : '0ms',
                        }}
                    >
                        <nav className="flex items-center justify-center gap-8">
                            {mainLinks.map((link) => (
                                <Link key={link.href} href={link.href} className={linkClasses(isActive(link.href))}>
                                    {link.name}
                                    <span
                                        className={`absolute bottom-[-2px] left-0 h-0.5 rounded-full transition-all duration-300 ${
                                            isActive(link.href)
                                                ? 'w-full bg-violet-500'
                                                : 'w-0 group-hover:w-full bg-slate-300'
                                        }`}
                                    />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Boutons droite — apparaissent légèrement après les liens */}
                    <div
                        className="flex w-[220px] min-w-[220px] items-center justify-end gap-4"
                        style={{
                            opacity: navExpanded ? 1 : 0,
                            transform: navExpanded ? 'translateX(0)' : 'translateX(10px)',
                            transition: 'opacity 400ms cubic-bezier(.16,1,.3,1), transform 400ms cubic-bezier(.16,1,.3,1)',
                            transitionDelay: navExpanded ? '370ms' : '0ms',
                        }}
                    >
                        <Link
                            href={route('login')}
                            className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${isDark ? 'text-white/65 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/audit"
                            className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-105"
                        >
                            Lancer mon audit gratuit
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 lg:hidden">
                    <Link href="/" className="flex min-w-0 items-center gap-2">
                        <ApplicationLogo className="h-4 w-auto" gradientId="public-navbar-logo-mobile" />
                        <span className="truncate text-sm font-semibold text-slate-900">Margexa</span>
                    </Link>

                    <Link
                        href="/audit"
                        className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-105"
                    >
                        Audit
                    </Link>
                </div>

                <nav className="mt-3 flex items-center gap-6 overflow-x-auto pb-1 lg:hidden">
                    {mainLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClasses(isActive(link.href))}>
                            {link.name}
                            <span
                                className={`absolute bottom-[-2px] left-0 h-0.5 rounded-full transition-all duration-300 ${
                                    isActive(link.href)
                                        ? 'w-full bg-violet-500'
                                        : 'w-0 group-hover:w-full bg-slate-300'
                                }`}
                            />
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
