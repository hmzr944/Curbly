import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import anthropicLogoAsset from '../../../../img/unnamed-removebg-preview (2).png';
import openAiLogoAsset from '../../../../img/unnamed-removebg-preview (3).png';

function FadeIn({ children, className = '', delay = 0, as: Tag = 'div' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <Tag
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(22px)',
                transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
            }}
        >
            {children}
        </Tag>
    );
}

const SCENARIOS = [
    {
        id: 'chatbot',
        label: 'Chatbot support',
        cost: 'EUR 4 837',
        leak: '-EUR 1 240',
        rule: 'gpt-4o-mini pour les demandes simples',
        impact: '+34%',
        summary: "Le bot support envoie trop de demandes standard vers un modele premium.",
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        bars: ['42%', '70%', '36%', '84%', '56%', '61%', '90%'],
    },
    {
        id: 'sav',
        label: 'Assistant SAV',
        cost: 'EUR 6 120',
        leak: '-EUR 1 880',
        rule: 'fallback sonnet vers haiku',
        impact: '+29%',
        summary: 'Le SAV paie trop cher les tickets repetitifs.',
        provider: 'Anthropic',
        model: 'claude-3-5-haiku',
        bars: ['48%', '74%', '42%', '82%', '58%', '64%', '88%'],
    },
    {
        id: 'tickets',
        label: 'Auto-reponse tickets',
        cost: 'EUR 3 410',
        leak: '-EUR 910',
        rule: 'plafond tokens et routage par intention',
        impact: '+37%',
        summary: 'Les auto-reponses consomment trop de tokens sur des demandes a faible enjeu.',
        provider: 'OpenAI',
        model: 'gpt-4o',
        bars: ['36%', '62%', '34%', '76%', '48%', '58%', '84%'],
    },
    {
        id: 'copilot',
        label: 'Copilote support',
        cost: 'EUR 7 240',
        leak: '-EUR 2 060',
        rule: 'policy runtime par agent',
        impact: '+31%',
        summary: 'Chaque suggestion premium mange la marge.',
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet',
        bars: ['46%', '68%', '40%', '86%', '52%', '60%', '92%'],
    },
];

const OUTPUTS = [
    {
        key: 'gpt-4o',
        provider: 'OpenAI',
        model: 'gpt-4o',
        badge: 'qualite',
        detail: 'Pour les cas a enjeu eleve et les demandes complexes.',
    },
    {
        key: 'gpt-4o-mini',
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        badge: 'economique',
        detail: 'Pour les volumes importants et les demandes recurrentes.',
    },
    {
        key: 'claude-3-5-sonnet',
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet',
        badge: 'fallback premium',
        detail: 'Pour garder une sortie haut de gamme quand le contexte devient plus delicat.',
    },
    {
        key: 'claude-3-5-haiku',
        provider: 'Anthropic',
        model: 'claude-3-5-haiku',
        badge: 'rapide',
        detail: 'Pour les demandes courtes et les workflows de support rapides.',
    },
];

const CSS = `
@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes floatSoft { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes drift { 0%,100%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(10px,-14px,0) scale(1.03)} }
@keyframes glow { 0%,100%{opacity:.2} 50%{opacity:.42} }
@keyframes slideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes orbitSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes orbitCounter { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
.mp-float{animation:floatY 6s ease-in-out infinite}
.mp-float-soft{animation:floatSoft 8s ease-in-out infinite}
.mp-drift{animation:drift 20s ease-in-out infinite}
.mp-glow{animation:glow 4s ease-in-out infinite}
.mp-slide-up{animation:slideUp .8s cubic-bezier(.16,1,.3,1) both}
.mp-marquee{animation:marquee 28s linear infinite}
.mp-marquee:hover{animation-play-state:paused}
.mp-orbit-spin{animation:orbitSpin 22s linear infinite}
.mp-orbit-counter{animation:orbitCounter 22s linear infinite}
.delay-100{animation-delay:.1s}
.delay-200{animation-delay:.2s}
.delay-300{animation-delay:.3s}
.delay-400{animation-delay:.4s}
@media (prefers-reduced-motion: reduce) {
  .mp-float,.mp-float-soft,.mp-drift,.mp-glow,.mp-slide-up,.mp-marquee,.mp-orbit-ring,.mp-orbit-ring-reverse,.mp-orbit-circle { animation:none !important; }
}
`;

function OpenAILogo({ className = 'h-8 w-8' }) {
    return <img src={openAiLogoAsset} alt="" aria-hidden="true" className={`${className} object-contain`} />;
}

function AnthropicLogo({ className = 'h-8 w-8' }) {
    return <img src={anthropicLogoAsset} alt="" aria-hidden="true" className={`${className} object-contain`} />;
}

function StackGhostCard({ scenario, className = '' }) {
    return (
        <div
            className={`pointer-events-none absolute inset-0 rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.10)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${className}`}
        >
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{scenario.label}</p>
                <div className="h-9 w-9 rounded-2xl bg-violet-100/70" />
            </div>

            <div className="mt-5 flex h-16 items-end gap-1.5">
                {scenario.bars.slice(0, 5).map((height, index) => (
                    <div
                        key={`${scenario.id}-ghost-${index}`}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-200 to-violet-100"
                        style={{ height }}
                    />
                ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50/80 px-4 py-3 text-xs font-medium text-slate-400">
                {scenario.rule}
            </div>
        </div>
    );
}

function HeroCardContent({ scenario, className = '' }) {
    return (
        <div className={className}>
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600/80">{scenario.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-900">{scenario.cost}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/20">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 18V9m5 9V6m5 12v-4m5 4V4" />
                    </svg>
                </div>
            </div>

            <div className="mb-5 flex h-24 items-end gap-1.5">
                {scenario.bars.map((height, index) => (
                    <div
                        key={`${scenario.id}-${index}`}
                        className="flex-1 rounded-t-xl bg-gradient-to-t from-violet-500 to-violet-300 transition-all duration-700 ease-out"
                        style={{ height }}
                    />
                ))}
            </div>

            <div className="mb-3 flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 transition-all duration-500">
                <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="text-sm font-medium text-slate-700">Fuite principale detectee</span>
                </div>
                <span className="text-sm font-semibold text-rose-600">{scenario.leak}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3 transition-all duration-500">
                <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                    <span className="text-sm font-medium text-slate-700">Regle active</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-700 shadow-sm">
                    {scenario.rule}
                </span>
            </div>
        </div>
    );
}

function HeroCard({ scenario, previousScenario = null, stackScenario = null, heroPhase = 'idle' }) {
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const targetRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
    const currentRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
    const frameRef = useRef(null);

    useEffect(() => {
        const animate = () => {
            currentRef.current.rx += (targetRef.current.rx - currentRef.current.rx) * 0.1;
            currentRef.current.ry += (targetRef.current.ry - currentRef.current.ry) * 0.1;
            currentRef.current.gx += (targetRef.current.gx - currentRef.current.gx) * 0.1;
            currentRef.current.gy += (targetRef.current.gy - currentRef.current.gy) * 0.1;

            if (cardRef.current) {
                cardRef.current.style.transform = `perspective(1400px) rotateX(${currentRef.current.rx}deg) rotateY(${currentRef.current.ry}deg)`;
            }

            if (glowRef.current) {
                glowRef.current.style.background = `radial-gradient(circle at ${currentRef.current.gx}% ${currentRef.current.gy}%, rgba(255,255,255,0.18), rgba(255,255,255,0.03) 38%, rgba(255,255,255,0.01) 60%)`;
            }

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, []);

    const handleMove = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        targetRef.current = {
            rx: (0.5 - y) * 10,
            ry: (x - 0.5) * 12,
            gx: x * 100,
            gy: y * 100,
        };
    };

    const resetMove = () => {
        targetRef.current = { rx: 0, ry: 0, gx: 50, gy: 50 };
    };

    return (
        <div className="relative flex items-center justify-center lg:justify-end">
            <div className="pointer-events-none absolute -left-14 -top-16 h-64 w-64 rounded-full bg-violet-400/20 blur-[96px] mp-glow" />
            <div className="pointer-events-none absolute -bottom-4 right-0 h-52 w-52 rounded-full bg-violet-200/18 blur-[76px] mp-glow" />
            <div className="pointer-events-none absolute -left-10 top-8 h-20 w-20 rounded-full bg-emerald-300/18 blur-3xl mp-float-soft" />
            <div className="pointer-events-none absolute -right-8 bottom-12 h-24 w-24 rounded-full bg-violet-300/16 blur-3xl mp-float" />

            <div
                ref={cardRef}
                onMouseMove={handleMove}
                onMouseLeave={resetMove}
                className="relative w-full max-w-[430px] rounded-[32px] border border-white/80 bg-white/78 p-6 shadow-[0_30px_80px_rgba(148,163,184,0.18)] backdrop-blur-2xl will-change-transform"
            >
                <div ref={glowRef} className="pointer-events-none absolute inset-0 rounded-[32px]" />

                {stackScenario ? (
                    <StackGhostCard
                        scenario={stackScenario}
                        className="translate-x-9 translate-y-7 rotate-[7deg] scale-[0.95] opacity-45"
                    />
                ) : null}
                <StackGhostCard
                    scenario={scenario}
                    className="translate-x-4 translate-y-4 rotate-[3deg] scale-[0.985] opacity-60"
                />

                <div className="relative z-10 min-h-[278px]">
                    {previousScenario ? (
                        <HeroCardContent
                            scenario={previousScenario}
                            className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                                heroPhase === 'prepare'
                                    ? 'translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100'
                                    : heroPhase === 'animate'
                                      ? '-translate-x-10 translate-y-3 rotate-[-6deg] scale-[0.96] opacity-0 blur-[1px]'
                                      : 'opacity-0'
                            }`}
                        />
                    ) : null}

                    <HeroCardContent
                        scenario={scenario}
                        className={`transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                            heroPhase === 'prepare'
                                ? 'translate-x-12 translate-y-6 rotate-[7deg] scale-[0.95] opacity-0 blur-[1px]'
                                : 'translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100 blur-0'
                        }`}
                    />
                </div>
            </div>
        </div>
    );
}

function UseCasesCarousel() {
    const cases = [
        {
            title: "Support IA multilingue",
            img: "/img/unnamed-removebg-preview (3).png",
            desc: "Un acteur e-commerce réduit ses coûts de support de 32% en routant dynamiquement les tickets simples vers un modèle économique, tout en gardant la qualité premium pour les demandes complexes.",
        },
        {
            title: "SAV automatisé",
            img: "/img/unnamed-removebg-preview (2).png",
            desc: "Un service client automatise la gestion des réclamations courantes, économisant 1 800€/mois grâce à des guardrails intelligents et un fallback automatique.",
        },
        {
            title: "Copilote support IA",
            img: "/img/unnamed-removebg-preview (3).png",
            desc: "Un éditeur SaaS protège sa marge en plafonnant les usages premium et en visualisant l'impact ROI en temps réel.",
        },
    ];
    const [index, setIndex] = useState(0);
    const next = () => setIndex((i) => (i + 1) % cases.length);
    const prev = () => setIndex((i) => (i - 1 + cases.length) % cases.length);
    return (
        <div className="relative flex flex-col items-center">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-violet-100 bg-white/90 shadow-xl">
                <div className="flex items-center justify-between px-6 pt-8">
                    <button onClick={prev} className="rounded-full bg-violet-50 p-2 shadow hover:bg-violet-100 transition">
                        <span className="sr-only">Précédent</span>
                        <svg className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="text-lg font-semibold text-slate-900">{cases[index].title}</div>
                    <button onClick={next} className="rounded-full bg-violet-50 p-2 shadow hover:bg-violet-100 transition">
                        <span className="sr-only">Suivant</span>
                        <svg className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col items-center px-8 pb-8 pt-4">
                    <img src={cases[index].img} alt="" className="h-32 w-auto object-contain mb-6 drop-shadow-xl mp-float" />
                    <p className="text-base text-slate-600 text-center">{cases[index].desc}</p>
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                {cases.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${i === index ? 'bg-violet-500 scale-125' : 'bg-violet-200'}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const [activeScenarioId, setActiveScenarioId] = useState(SCENARIOS[0].id);
    const [activeOutputKey, setActiveOutputKey] = useState(OUTPUTS[0].key);
    const [displayedScenario, setDisplayedScenario] = useState(SCENARIOS[0]);
    const [previousHeroScenario, setPreviousHeroScenario] = useState(null);
    const [heroPhase, setHeroPhase] = useState('idle');

    const scenario = SCENARIOS.find((item) => item.id === activeScenarioId) ?? SCENARIOS[0];
    const output = OUTPUTS.find((item) => item.key === activeOutputKey) ?? OUTPUTS[0];
    const displayedIndex = SCENARIOS.findIndex((item) => item.id === displayedScenario.id);
    const stackScenario = SCENARIOS[(displayedIndex + 1) % SCENARIOS.length] ?? SCENARIOS[0];

    useEffect(() => {
        if (displayedScenario.id === scenario.id) {
            return;
        }

        setPreviousHeroScenario(displayedScenario);
        setDisplayedScenario(scenario);
        setHeroPhase('prepare');

        const animateTimer = setTimeout(() => {
            setHeroPhase('animate');
        }, 30);

        const settleTimer = setTimeout(() => {
            setHeroPhase('idle');
        }, 720);

        const cleanupTimer = setTimeout(() => {
            setPreviousHeroScenario(null);
        }, 760);

        return () => {
            clearTimeout(animateTimer);
            clearTimeout(settleTimer);
            clearTimeout(cleanupTimer);
        };
    }, [scenario, displayedScenario.id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveScenarioId((current) => {
                const currentIndex = SCENARIOS.findIndex((item) => item.id === current);
                return SCENARIOS[(currentIndex + 1) % SCENARIOS.length].id;
            });
        }, 5200);

        return () => clearInterval(timer);
    }, []);

    const providers = [
        { name: 'OpenAI', sub: 'gpt-4o / gpt-4o-mini', Logo: OpenAILogo, halo: 'bg-emerald-200/60' },
        { name: 'Anthropic', sub: 'claude-3-5-sonnet / haiku', Logo: AnthropicLogo, halo: 'bg-orange-200/60' },
    ];

    const orbitItems = [
        { angle: 0,   Logo: OpenAILogo,    name: 'OpenAI' },
        { angle: 90,  Logo: AnthropicLogo, name: 'Anthropic' },
        { angle: 180, Logo: OpenAILogo,    name: 'OpenAI' },
        { angle: 270, Logo: AnthropicLogo, name: 'Anthropic' },
    ];

    return (
        <PublicLayout>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <section className="relative flex min-h-[calc(100vh-96px)] items-center overflow-hidden pt-20 pb-10 lg:pt-24 lg:pb-12">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-[8%] top-[12%] h-[520px] w-[520px] rounded-full bg-violet-300/20 blur-[130px] mp-drift" />
                    <div className="absolute left-[10%] top-[28%] h-[360px] w-[360px] rounded-full bg-violet-200/18 blur-[110px] mp-glow" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="mp-slide-up text-[2.8rem] font-semibold leading-[0.98] tracking-tight text-white sm:text-[3.2rem] md:text-[3.8rem] xl:text-[4.55rem]">
                            Reprenez le controle
                            <br />
                            de vos{' '}
                            <span className="relative inline-block">
                                <span className="text-violet-400">marges</span>
                                {/* Mini bar chart représentant une marge */}
                                <span className="pointer-events-none absolute -right-9 bottom-1 hidden items-end gap-[3px] sm:inline-flex">
                                    {[28, 42, 34, 55, 44, 68, 52, 82].map((h, i) => (
                                        <span
                                            key={i}
                                            className="inline-block w-[3px] rounded-sm bg-violet-400/70"
                                            style={{ height: `${h * 0.22}px`, opacity: 0.4 + i * 0.075 }}
                                        />
                                    ))}
                                </span>
                            </span>{' '}IA
                        </h1>

                        <p className="mp-slide-up delay-100 mt-5 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
                            Auditez et contrôlez la rentabilité de votre support IA en continu.
                        </p>

                        <div className="mp-slide-up delay-300 mt-8">
                            <Link
                                href="/audit"
                                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-9 py-4 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/35"
                            >
                                Commencer
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section simple : promesse de contrôle multi-modèles, wording business, pas de sur-design */}
            <section className="relative py-20">
                <div className="relative mx-auto max-w-3xl px-6 text-center">
                    <FadeIn>
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                            Une seule couche de contrôle<br />pour toute votre IA support
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
                            Orchestration simple : appliquez la bonne règle, au bon moment, sur le bon modèle.<br />
                            OpenAI, Anthropic… tout est piloté pour maximiser la marge, sans complexité technique.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Logique produit : 3 blocs animés, minimalistes, premium, sans mini-titres */}
            <section className="relative py-24">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/20 blur-[90px]" />
                <div className="mx-auto max-w-5xl px-6">
                    <FadeIn className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-slate-950 lg:text-5xl mb-10 tracking-tight" style={{letterSpacing: '-0.01em'}}>3 réflexes pour garder la marge</h2>
                    </FadeIn>
                    <div className="mt-14 grid gap-8 md:grid-cols-3">
                        <FadeIn delay={0} className="rounded-2xl border border-violet-100 bg-white/90 p-10 text-center shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <div className="flex items-center justify-center mb-6">
                                <span className="h-4 w-4 rounded-full bg-rose-400 animate-pulse mr-2" />
                            </div>
                            <div className="text-xl font-semibold text-slate-900 mb-2">Où la marge fuit ?</div>
                            <div className="text-base text-slate-600">Repérez les usages IA qui dégradent la rentabilité : modèles premium mal utilisés, tickets à faible valeur, volume non maîtrisé…</div>
                        </FadeIn>
                        <FadeIn delay={100} className="rounded-2xl border border-violet-100 bg-white/90 p-10 text-center shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <div className="flex items-center justify-center mb-6">
                                <span className="h-4 w-4 rounded-full bg-violet-400 animate-pulse mr-2" />
                            </div>
                            <div className="text-xl font-semibold text-slate-900 mb-2">Quelle règle protège ?</div>
                            <div className="text-base text-slate-600">Activez des guardrails simples : fallback modèle, plafonds de coût, restrictions premium, alertes…</div>
                        </FadeIn>
                        <FadeIn delay={200} className="rounded-2xl border border-violet-100 bg-white/90 p-10 text-center shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <div className="flex items-center justify-center mb-6">
                                <span className="h-4 w-4 rounded-full bg-emerald-400 animate-pulse mr-2" />
                            </div>
                            <div className="text-xl font-semibold text-slate-900 mb-2">Quel impact est prouvé ?</div>
                            <div className="text-base text-slate-600">Montrez le coût évité, le % d’optimisation, les policies déclenchées. Prouvez le ROI, pas la technique.</div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Section animée : exemple visuel, transitions, focus sur la mécanique business, pas de mini-titres */}
            <section className="relative py-24 overflow-hidden">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/20 blur-[90px]" />
                <div className="relative mx-auto max-w-2xl px-6">
                    <FadeIn>
                        <div className="rounded-3xl border border-violet-100 bg-white/90 p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="h-4 w-4 rounded-full bg-rose-400 animate-pulse" />
                                <span className="text-lg font-semibold text-slate-900">Chatbot support</span>
                            </div>
                            <div className="text-base text-slate-600 mb-4">Le bot support envoie trop de demandes standard vers un modèle premium.</div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="h-4 w-4 rounded-full bg-violet-400 animate-pulse" />
                                <span className="text-base font-semibold text-slate-900">gpt-4o-mini pour les demandes simples</span>
                            </div>
                            <div className="text-base text-slate-600 mb-4">Fallback automatique vers un modèle plus économique dès que possible.</div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="h-4 w-4 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-base font-semibold text-slate-900">+34% d’optimisation</span>
                            </div>
                            <div className="text-base text-slate-600">Coût évité : 1 240 € / mois. La marge est protégée, la qualité reste premium.</div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Carrousel premium use cases */}
            <section className="relative py-28 bg-gradient-to-b from-white via-violet-50 to-white overflow-hidden">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-[120px]" />
                <div className="mx-auto max-w-5xl px-6">
                    <FadeIn className="mx-auto max-w-2xl text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-950 mb-4 tracking-tight" style={{letterSpacing: '-0.01em'}}>Cas d’usage réels</h2>
                        <p className="text-lg text-slate-600">Découvrez comment Margexa protège la marge sur des cas concrets, illustrés et animés.</p>
                    </FadeIn>
                    <UseCasesCarousel />
                </div>
            </section>

            {/* Section call-to-action illustrée */}
            <section className="relative py-28">
                <div className="relative mx-auto max-w-4xl px-6 text-center">
                    <FadeIn>
                        <div className="rounded-[36px] border border-white/35 bg-white/20 px-8 py-14 shadow-[0_30px_90px_rgba(148,163,184,0.12)] backdrop-blur-3xl flex flex-col items-center">
                            <img src="/img/unnamed-removebg-preview (2).png" alt="Logo OpenAI" className="mb-8 h-16 w-auto object-contain drop-shadow-xl mp-float" />
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/50 bg-violet-50/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700 backdrop-blur-xl">
                                Audit gratuit / AI Margin Scan / Continuous Control
                            </div>
                            <h2 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                                Empechez que le support IA
                                <br />
                                devienne non rentable
                            </h2>
                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                                Commencez par un audit gratuit, identifiez où la marge fuit, puis activez les règles qui protègent vraiment votre rentabilité.
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/audit"
                                    className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/35"
                                >
                                    Lancer mon audit gratuit
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="rounded-full border border-white/40 bg-white/30 px-8 py-4 text-sm font-semibold text-slate-700 backdrop-blur-xl transition-all duration-300 hover:bg-white/50"
                                >
                                    Commencer le contrôle continu
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </PublicLayout>
    );
}
