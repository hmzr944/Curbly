import PublicNavbar from '@/Components/Public/PublicNavbar';
import PublicFooter from '@/Components/Public/PublicFooter';
import { usePage } from '@inertiajs/react';

export default function PublicLayout({ children }) {
    const page = usePage();
    const currentUrl = typeof page?.url === 'string' ? page.url : '';
    const isHome = currentUrl === '/';

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#F7F8FC] text-slate-900">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700;800&display=swap');

                html { scroll-behavior: smooth; }
                body { background: #F7F8FC; }

                .mp-display,
                .mp-ui,
                .mp-mono,
                .institutional-display,
                .institutional-body,
                .pilot-display,
                .pilot-ui,
                .pilot-mono {
                    font-family: "Inter", sans-serif;
                }

                ::selection {
                    background: rgba(110,124,255,0.18);
                    color: #1C2440;
                }
            `}</style>

            <div
                className="pointer-events-none absolute"
                style={{
                    top: '-12%',
                    right: '-8%',
                    width: 760,
                    height: 760,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 66%)',
                    filter: 'blur(100px)',
                }}
            />
            <div
                className="pointer-events-none absolute"
                style={{
                    top: '18%',
                    left: '-10%',
                    width: 640,
                    height: 640,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 72%)',
                    filter: 'blur(110px)',
                }}
            />
            <div
                className="pointer-events-none absolute"
                style={{
                    bottom: '4%',
                    right: '10%',
                    width: 520,
                    height: 520,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(226,232,240,0.95) 0%, transparent 74%)',
                    filter: 'blur(90px)',
                }}
            />
            {isHome && (
                <>
                    {/* Gradient vertical : noir en haut → couleur page en bas */}
                    <div
                        className="pointer-events-none absolute left-0 right-0 top-0 z-0"
                        style={{
                            height: '160vh',
                            background: 'linear-gradient(to bottom, #08080e 0%, #0e1020 18%, rgba(12,12,28,0.35) 48%, rgba(12,12,28,0.08) 75%, transparent 100%)',
                        }}
                    />
                    <div
                        className="pointer-events-none absolute"
                        style={{
                            top: '42%',
                            left: '50%',
                            width: 720,
                            height: 720,
                            transform: 'translateX(-50%)',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(192,132,252,0.10) 0%, transparent 70%)',
                            filter: 'blur(120px)',
                        }}
                    />
                </>
            )}

            <div className="relative z-10">
                <PublicNavbar />
                <main>{children}</main>
                <PublicFooter />
            </div>
        </div>
    );
}
