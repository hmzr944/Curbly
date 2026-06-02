'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ─── Spotlight hook ─────────────────────────────────────────────────────── */
function useSpotlight(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])
}

function SpotCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useSpotlight(ref)
  return <div ref={ref} className="spotlight" style={style}>{children}</div>
}

/* ─── Reveal on scroll ───────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: seen ? 1 : 0, transform: seen ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity .7s ${delay}ms var(--ease-out), transform .7s ${delay}ms var(--ease-out)`,
      ...style,
    }}>{children}</div>
  )
}

/* ─── Container ──────────────────────────────────────────────────────────── */
function Container({ children, max = 1200, style = {} }: { children: React.ReactNode; max?: number; style?: React.CSSProperties }) {
  return <div style={{ maxWidth: max, margin: '0 auto', padding: '0 32px', ...style }}>{children}</div>
}

/* ─── Mark logo ──────────────────────────────────────────────────────────── */
function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="var(--ink)" />
      <path d="M7 16V8L12 14L17 8V16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="19" r="2.5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.2" />
    </svg>
  )
}

/* ─── Nav ────────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? '10px 0' : '14px 0',
      background: scrolled ? 'rgba(255,255,255,.95)' : '#fff',
      backdropFilter: scrolled ? 'saturate(160%) blur(14px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(14px)' : 'none',
      borderBottom: '1px solid #EBEBEF',
      transition: 'padding .25s ease',
    }}>
      <Container max={1280}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="7" fill="url(#navLogoGrad)"/>
              <path d="M8 22V10l7 8 7-8v12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="navLogoGrad" x1="0" y1="0" x2="30" y2="30">
                  <stop stopColor="#4F46E5"/><stop offset="1" stopColor="#7C3AED"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 16, fontWeight: 700, color: '#0F0F1A', letterSpacing: '-0.02em' }}>Margexa</span>
          </Link>

          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[
              { label: 'Product', drop: true },
              { label: 'Solutions', drop: true },
              { label: 'Pricing', drop: false },
              { label: 'Resources', drop: true },
              { label: 'Company', drop: true },
            ].map((item) => (
              <a key={item.label} href="#" style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '7px 12px', borderRadius: 6,
                fontSize: 14, color: '#374151', textDecoration: 'none', fontWeight: 500,
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                {item.label}
                {item.drop && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginTop: 1 }}>
                    <path d="M3 5l3.5 3.5L10 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link href="/sign-in" style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              padding: '8px 16px', fontSize: 14, color: '#374151', textDecoration: 'none', fontWeight: 500,
              borderRadius: 6, transition: 'color .12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#111' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#374151' }}>
              Sign in
            </Link>
            <Link href="/sign-up" style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              padding: '9px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              background: '#4F46E5', color: '#fff', borderRadius: 8,
              display: 'inline-flex', alignItems: 'center',
              boxShadow: '0 2px 6px rgba(79,70,229,.3)',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4338CA' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#4F46E5' }}>
              Book a demo
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ position: 'relative', padding: '130px 0 80px', background: '#F7F8FB', overflow: 'hidden' }}>
      <Container max={1280}>
        {/* Badge */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px 6px 10px', borderRadius: 100,
              border: '1px solid #DDD8FB',
              background: 'linear-gradient(90deg,#F3F0FF,#EDE9FE)',
              fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
              color: '#6D28D9', textTransform: 'uppercase',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.6 4.4H13L9.2 7.9l1.4 4.4L7 9.7l-3.6 2.6 1.4-4.4L.9 5.4H5.4z" fill="#8B5CF6"/>
              </svg>
              AI Margin Intelligence Platform
            </span>
          </div>
        </Reveal>

        {/* Headline — explicitly Inter so the global h1 { font-family: Instrument Serif } doesn't win */}
        <Reveal delay={80}>
          <h1 style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            textAlign: 'center', margin: '0 auto 20px',
            fontSize: 'clamp(46px, 5.2vw, 72px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.06, color: '#0F0F1A',
            maxWidth: 820,
          }}>
            Maximize AI profit.<br/>
            Eliminate{' '}
            <span style={{
              background: 'linear-gradient(100deg,#7C3AED,#4F46E5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>margin leaks.</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={160}>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            textAlign: 'center', fontSize: 16.5, color: '#6B7280',
            maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.65,
            fontWeight: 400,
          }}>
            Margexa turns AI usage into measurable profit with real-time intelligence, policy enforcement, and automated cost optimization.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={240}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 72 }}>
            <Link href="/sign-up" style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 26px', borderRadius: 9,
              background: '#4F46E5', color: '#fff',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 3px 12px rgba(79,70,229,.35)',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4338CA' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#4F46E5' }}>
              Book a demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m-4-4l4 4-4 4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <button style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '13px 24px', borderRadius: 9, cursor: 'pointer',
              background: '#fff', color: '#111', fontSize: 15, fontWeight: 500,
              border: '1px solid #E0E0E8', transition: 'background .15s, border-color .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F9FB'; e.currentTarget.style.borderColor = '#C7C7D4' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E0E0E8' }}>
              <span style={{
                width: 22, height: 22, borderRadius: 11, background: '#F3F4F6',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                  <path d="M1.5 1.5l5 3-5 3V1.5z" fill="#374151"/>
                </svg>
              </span>
              Explore platform
            </button>
          </div>
        </Reveal>

        {/* ── Three-panel product preview ─────────────────────────────────── */}
        <Reveal delay={380}>
          <div style={{
            display: 'grid', gridTemplateColumns: '280px 1fr 252px',
            gap: 14, alignItems: 'start',
          }}>

            {/* ── LEFT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Runtime Policy Engine */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E8EF', boxShadow: '0 2px 16px rgba(0,0,0,.06)', padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 7, background: '#EEF2FF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L2 4.2V7.5c0 3.2 2.4 6.1 5.5 7 3.1-.9 5.5-3.8 5.5-7V4.2z" stroke="#4F46E5" strokeWidth="1.3" fill="none"/></svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F0F1A', lineHeight: 1.2 }}>Runtime Policy Engine</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>Enforce business rules in real-time</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { n: 'Model Access Control', d: 'Restrict model usage by team/tier' },
                    { n: 'Cost Guardrails', d: 'Prevent budget overruns' },
                    { n: 'Data Security', d: 'PII detection & data masking' },
                    { n: 'Output Validation', d: 'Ensure safe, compliant responses' },
                  ].map((item) => (
                    <div key={item.n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 9px', borderRadius: 7, background: '#FAFAFA', border: '1px solid #F0F0F5' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#1F2937' }}>{item.n}</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{item.d}</div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>✓ Active</span>
                    </div>
                  ))}
                </div>
                <a href="#" style={{ display: 'block', marginTop: 12, fontSize: 11, color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>View all policies →</a>
              </div>

              {/* AI Provider Orchestration */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E8EF', boxShadow: '0 2px 16px rgba(0,0,0,.06)', padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F0F1A', marginBottom: 2 }}>AI Provider Orchestration</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 16 }}>Intelligent multi-provider routing</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2" width="12" height="13" rx="2" stroke="#9CA3AF" strokeWidth="1.2"/><line x1="4" y1="6" x2="11" y2="6" stroke="#9CA3AF" strokeWidth="1.1"/><line x1="4" y1="9" x2="11" y2="9" stroke="#9CA3AF" strokeWidth="1.1"/></svg>
                    </div>
                    <div style={{ fontSize: 8.5, color: '#9CA3AF', marginTop: 3 }}>Request</div>
                  </div>
                  <div style={{ flex: 1, height: 1, borderTop: '1.5px dashed #D1D5DB' }} />
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 2px 8px rgba(79,70,229,.3)' }}>
                      <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>M</span>
                    </div>
                    <div style={{ fontSize: 8.5, color: '#9CA3AF', marginTop: 3 }}>Margexa</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[{ n: 'OpenAI', c: '#10B981' }, { n: 'Anthropic', c: '#F59E0B' }, { n: 'Google', c: '#3B82F6' }, { n: 'Mistral', c: '#EC4899' }].map((p) => (
                      <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                        <div style={{ flex: 1, height: 1, borderTop: '1px dashed #D1D5DB' }} />
                        <span style={{ fontSize: 9, color: '#374151', fontWeight: 500 }}>{p.n}</span>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: p.c, flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
                <a href="#" style={{ display: 'block', marginTop: 12, fontSize: 11, color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>View orchestration rules →</a>
              </div>
            </div>

            {/* ── CENTER: Live AI Cost Tracking ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8EF', boxShadow: '0 6px 32px rgba(0,0,0,.09)', overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0F1A' }}>Live AI Cost Tracking</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: '#374151' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: '#10B981', boxShadow: '0 0 0 2px rgba(16,185,129,.2)' }} />
                  Live
                </span>
              </div>

              {/* 3 metric columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #F3F4F6' }}>
                {[
                  { label: 'Margin Health', value: '94%', delta: '↑ 8.2% vs last 7 days', pts: '0,28 12,22 24,25 36,15 48,18 60,12 72,14 84,9 96,11 108,7' },
                  { label: 'Cost per Request', value: '$0.023', delta: '↑ 12.4% vs last 7 days', pts: '0,22 12,18 24,20 36,12 48,14 60,9 72,11 84,7 96,9 108,5' },
                  { label: 'Token Efficiency', value: '98.2%', delta: '↑ 5.7% vs last 7 days', pts: '0,24 12,20 24,22 36,14 48,16 60,11 72,13 84,9 96,11 108,7' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '14px 18px', borderRight: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F0F1A', letterSpacing: '-0.025em', lineHeight: 1 }}>{m.value}</div>
                    <div style={{ fontSize: 9.5, color: '#10B981', marginTop: 4 }}>{m.delta}</div>
                    <svg width="100%" height="28" viewBox="0 0 108 30" style={{ marginTop: 8, overflow: 'visible' }} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`sparkGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <polyline points={m.pts} fill="none" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>

              {/* Chart area */}
              <div style={{ padding: '16px 20px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Margin Over Time</span>
                  <div style={{ display: 'flex', gap: 14, fontSize: 9.5, color: '#9CA3AF' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 18, height: 2, background: '#4F46E5', borderRadius: 1, display: 'inline-block' }}/>Gross Margin %</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 18, height: 0, border: 'none', borderTop: '2px dashed #F59E0B', display: 'inline-block' }}/>Cost per Request</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 18, height: 0, border: 'none', borderTop: '2px dashed #10B981', display: 'inline-block' }}/>Token Efficiency %</span>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <svg width="100%" height="130" viewBox="0 0 540 130" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18"/>
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.01"/>
                      </linearGradient>
                    </defs>
                    {/* Y labels */}
                    {['100%','75%','50%','25%','0%'].map((t, i) => (
                      <text key={i} x="0" y={i * 30 + 8} fontSize="7.5" fill="#D1D5DB">{t}</text>
                    ))}
                    {/* Grid */}
                    {[0, 30, 60, 90, 120].map((y, i) => (
                      <line key={i} x1="30" y1={y} x2="540" y2={y} stroke="#F3F4F6" strokeWidth="1"/>
                    ))}
                    {/* X labels */}
                    {['00:00','04:00','08:00','12:00','16:00','20:00','24:00'].map((t, i) => (
                      <text key={i} x={30 + (i / 6) * 510} y="128" fontSize="7" fill="#9CA3AF" textAnchor="middle">{t}</text>
                    ))}
                    {/* Gross Margin area */}
                    <path d="M30,12 L115,16 L175,18 L235,14 L295,12 L340,28 L385,20 L450,16 L540,13 L540,118 L30,118 Z" fill="url(#heroAreaGrad)"/>
                    <path d="M30,12 L115,16 L175,18 L235,14 L295,12 L340,28 L385,20 L450,16 L540,13" fill="none" stroke="#4F46E5" strokeWidth="1.8"/>
                    {/* Cost per Request dashed */}
                    <path d="M30,72 L115,68 L175,70 L235,64 L295,62 L340,78 L385,68 L450,63 L540,60" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,2.5"/>
                    {/* Token Efficiency dashed */}
                    <path d="M30,90 L115,86 L175,88 L235,82 L295,80 L340,96 L385,86 L450,81 L540,78" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,2.5"/>
                    {/* Margin Leak marker */}
                    <line x1="340" y1="0" x2="340" y2="112" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="3,2"/>
                    <circle cx="340" cy="28" r="5" fill="#EF4444"/>
                    {/* Tooltip */}
                    <rect x="350" y="6" width="138" height="50" rx="7" fill="white" stroke="#E8E8EF" strokeWidth="1"/>
                    <text x="359" y="20" fontSize="8" fontWeight="700" fill="#EF4444">Margin Leak Detected</text>
                    <text x="359" y="31" fontSize="7.5" fill="#6B7280">14:23</text>
                    <text x="359" y="41" fontSize="7.5" fill="#6B7280">High token usage in</text>
                    <text x="359" y="51" fontSize="7.5" fill="#6B7280">customer-support-agent</text>
                  </svg>
                </div>
              </div>

              {/* Bottom stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid #F3F4F6', padding: '12px 20px', gap: 8 }}>
                {[
                  { label: 'Total Requests', value: '2.45M', delta: '↑ 15.3%' },
                  { label: 'Total Cost', value: '$56,350', delta: '↑ 8.7%' },
                  { label: 'Total Tokens', value: '1.24B', delta: '↑ 13.2%' },
                  { label: 'Total Savings', value: '$18,420', delta: '↑ 24.1%' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 9.5, color: '#9CA3AF', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0F1A', letterSpacing: '-0.01em' }}>{s.value}</div>
                    <div style={{ fontSize: 9.5, color: '#10B981', marginTop: 2, fontWeight: 500 }}>{s.delta}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Model Routing */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E8EF', boxShadow: '0 2px 16px rgba(0,0,0,.06)', padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F0F1A', marginBottom: 2 }}>Model Routing</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 16 }}>AI selects optimal model for each request</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {/* User */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="#9CA3AF" strokeWidth="1.2"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#9CA3AF" strokeWidth="1.2"/></svg>
                    </div>
                    <div style={{ fontSize: 8.5, color: '#9CA3AF', marginTop: 3 }}>User</div>
                  </div>
                  <div style={{ flex: 1, height: 1, borderTop: '1.5px dashed #D1D5DB' }} />
                  {/* M Gateway */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 2px 8px rgba(79,70,229,.3)' }}>
                      <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>M</span>
                    </div>
                    <div style={{ fontSize: 8.5, color: '#9CA3AF', marginTop: 3 }}>AI Gateway</div>
                  </div>
                  {/* Models */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      { n: 'GPT-4o', d: 'High capability', bg: '#000', l: 'G' },
                      { n: 'Claude 3.5', d: 'Balanced', bg: '#D97706', l: 'A' },
                      { n: 'Llama 3.1', d: 'Cost optimized', bg: '#6B7280', l: 'L' },
                    ].map((m) => (
                      <div key={m.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 1, borderTop: '1px dashed #D1D5DB' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{m.l}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 600, color: '#1F2937', lineHeight: 1.2 }}>{m.n}</div>
                            <div style={{ fontSize: 8, color: '#9CA3AF' }}>{m.d}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #F3F4F6', fontSize: 9.5, color: '#9CA3AF', letterSpacing: '.02em' }}>
                  Auto-route · Cost-aware · Policy-driven
                </div>
              </div>

              {/* Security & Compliance */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E8EF', boxShadow: '0 2px 16px rgba(0,0,0,.06)', padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F0F1A' }}>Security &amp; Compliance</div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: 5 }}>All Clear</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[
                    { n: 'SOC 2 Type II', v: 'Compliant', ok: true },
                    { n: 'GDPR', v: 'Compliant', ok: true },
                    { n: 'Data Encryption', v: 'AES-256', ok: false },
                    { n: 'Regional Hosting', v: 'Multi-region', ok: false },
                  ].map((item) => (
                    <div key={item.n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3.5" stroke="#9CA3AF" strokeWidth="1"/></svg>
                        </div>
                        <span style={{ fontSize: 10.5, color: '#374151', fontWeight: 500 }}>{item.n}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 9.5, color: '#6B7280' }}>{item.v}</span>
                        {item.ok && <span style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#" style={{ display: 'block', marginTop: 14, fontSize: 11, color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>View security details →</a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ─── Trust strip ────────────────────────────────────────────────────────── */
function TrustStrip() {
  return (
    <section style={{ padding: '40px 0 60px', background: '#F7F8FB', borderTop: '1px solid #EBEBEF' }}>
      <Container max={1280}>
        <Reveal>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            textAlign: 'center', fontSize: 12, fontWeight: 500,
            color: '#9CA3AF', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 32,
          }}>
            Trusted by leading AI-first companies
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 52, flexWrap: 'wrap' }}>

            {/* retool */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.55 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect width="20" height="20" rx="5" fill="#111"/>
                <rect x="3.5" y="4" width="5" height="12" rx="1.2" fill="white"/>
                <rect x="10.5" y="4" width="5" height="7" rx="1.2" fill="white"/>
              </svg>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.025em' }}>retool</span>
            </div>

            {/* ramp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, opacity: 0.55 }}>
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d="M1 15L11 1L21 15" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 15L11 7L16 15" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.025em' }}>ramp</span>
            </div>

            {/* Vercel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.55 }}>
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M9 0L18 16H0L9 0Z" fill="#000"/>
              </svg>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.025em' }}>Vercel</span>
            </div>

            {/* linear */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.55 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M0.9 10.8C0.3 9.7 0 8.4 0 9C0 4.03 4.03 0 9 0C13.97 0 18 4.03 18 9C18 13.97 13.97 18 9 18C7.5 18 6.1 17.6 4.9 16.9L0.9 10.8Z" fill="url(#linearGrad)"/>
                <path d="M1.3 13.2L5.5 17.4C4 16.7 2.6 15.3 1.3 13.2Z" fill="#5E6AD2"/>
                <path d="M0.4 11.4L7.3 18.3C6.6 18.1 5.9 17.8 5.3 17.4L1.3 13.4C0.9 12.8 0.6 12.1 0.4 11.4Z" fill="#5E6AD2"/>
                <defs>
                  <linearGradient id="linearGrad" x1="0" y1="0" x2="18" y2="18">
                    <stop stopColor="#5E6AD2"/>
                    <stop offset="1" stopColor="#5E6AD2" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.025em' }}>linear</span>
            </div>

            {/* Raycast */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.55 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M0 9L9 0L18 9L9 18L0 9Z" fill="url(#rayGrad)"/>
                <path d="M5 9L9 5L13 9L9 13L5 9Z" fill="white"/>
                <defs>
                  <linearGradient id="rayGrad" x1="0" y1="0" x2="18" y2="18">
                    <stop stopColor="#FF6363"/>
                    <stop offset="1" stopColor="#FF4D4D"/>
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.025em' }}>Raycast</span>
            </div>

          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ─── Pain ───────────────────────────────────────────────────────────────── */
function Pain() {
  return (
    <section style={{ padding: '120px 0' }}>
      <Container max={1100}>
        <Reveal><div className="overline" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--accent)' }}>01</span>The problem</div></Reveal>
        <Reveal delay={100}>
          <h2 className="h2" style={{ marginTop: 24, color: 'var(--ink)', maxWidth: 820 }}>
            Your AI bill is up <span className="tnum" style={{ color: 'var(--accent)' }}>340%</span> this year.<br />
            Nobody on your team can tell you exactly why.
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="body-lg" style={{ marginTop: 28, maxWidth: 620 }}>
            Engineers wire prompts directly to OpenAI. Product ships features without budget caps. A new agent loops on GPT-4 for a week before anyone notices. Finance sees the invoice on the 5th of the next month.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 64 }}>
          {[
            { k: 'No visibility', v: 'Spend is invisible per team, per feature, per prompt.', stat: '0', sub: 'lines of attribution today' },
            { k: 'No control', v: 'Anyone with the API key can spin up GPT-4 at $0.06 / 1k tokens.', stat: '∞', sub: 'budget enforcement' },
            { k: 'No optimisation', v: 'You pay premium for queries a 5× cheaper model would answer.', stat: '60%', sub: 'of calls are over-modeled' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 120}>
              <SpotCard style={{ padding: 28, height: '100%' }}>
                <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--accent)', fontWeight: 500, letterSpacing: '-0.02em' }}>{c.stat}</div>
                <div className="eyebrow" style={{ marginTop: 4 }}>{c.sub}</div>
                <div style={{ height: 1, background: 'var(--line)', margin: '18px 0' }} />
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>{c.k}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.55 }}>{c.v}</div>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ─── Features ───────────────────────────────────────────────────────────── */
function Features() {
  const feats = [
    { icon: '◐', t: 'AI Gateway', s: 'Route every LLM call through a smart proxy. Automatic failover, load balancing, and cost routing across all providers.' },
    { icon: '§', t: 'Policies & Budgets', s: 'Set spend caps per team, per model, per environment. Auto-pause when thresholds are reached.' },
    { icon: '!', t: 'Leak Detection', s: 'Spot runaway agents, prompt loops, and anomalous spend spikes before they become $50k surprises.' },
    { icon: '$', t: 'Smart Routing', s: 'Auto-downgrade to the cheapest model that meets your quality bar. Average 38% cost reduction.' },
    { icon: '▦', t: 'Prompt Explorer', s: 'Search, replay, and analyse every prompt. Find expensive duplicates and cache candidates instantly.' },
    { icon: '↯', t: 'Alerts & Webhooks', s: 'Real-time alerts via Slack, PagerDuty, or webhook. Never be surprised by an invoice again.' },
  ]
  return (
    <section id="features" style={{ padding: '120px 0', borderTop: '1px solid var(--line)' }}>
      <Container>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginBottom: 56, flexWrap: 'wrap' }}>
            <div>
              <div className="overline" style={{ marginBottom: 16 }}>Platform</div>
              <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                Everything you need to <em style={{ color: 'var(--accent)' }}>govern AI spend.</em>
              </h2>
            </div>
            <Link href="/sign-up" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
              See all features →
            </Link>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
          {feats.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <SpotCard style={{ padding: 28 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--accent-tint)', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic',
                  marginBottom: 18,
                }}>{f.icon}</span>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.t}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>{f.s}</div>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ─── How it works ───────────────────────────────────────────────────────── */
function How() {
  return (
    <section id="how" style={{ padding: '120px 0', borderTop: '1px solid var(--line)' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 80, alignItems: 'start', flexWrap: 'wrap' }}>
          <Reveal>
            <div>
              <div className="overline" style={{ marginBottom: 16 }}>Setup</div>
              <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                Running in <em style={{ color: 'var(--accent)' }}>5 minutes.</em>
              </h2>
              <p style={{ marginTop: 20, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.65 }}>
                Change one line. Replace your OpenAI base URL with Margexa&apos;s endpoint. That&apos;s it.
              </p>
            </div>
          </Reveal>
          <div>
            {[
              { n: '01', t: 'Point your SDK at Margexa', b: 'Change base_url to api.margexa.com. Every provider, zero code changes.' },
              { n: '02', t: 'Connect your providers', b: 'Add your OpenAI, Anthropic, and Gemini API keys. Encrypted with a per-workspace KMS key.' },
              { n: '03', t: 'Set your policies', b: 'Budget caps, model allow-lists, PII guards. Your workspace is live in under 5 minutes.' },
            ].map((s, i, arr) => (
              <Reveal key={s.n} delay={i * 100}>
                <div style={{ display: 'flex', gap: 28, padding: '28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--line-3)', letterSpacing: '-0.02em', lineHeight: 1, flexShrink: 0, width: 40 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.015em' }}>{s.t}</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.65 }}>{s.b}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ─── Testimonial ────────────────────────────────────────────────────────── */
function Testimonial() {
  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--line)' }}>
      <Container max={900}>
        <Reveal>
          <SpotCard style={{ padding: 56, textAlign: 'center' }}>
            <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.2, letterSpacing: '-0.015em', color: 'var(--ink)', margin: 0 }}>
              &ldquo;Margexa paid for itself in week two. We found a $14k/month spend leak we didn&apos;t know we had — a runaway agent nobody noticed.&rdquo;
            </blockquote>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>Mara Halvorsen</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>VP Engineering · Lattice AI</div>
              </div>
            </div>
          </SpotCard>
        </Reveal>
      </Container>
    </section>
  )
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    { name: 'Starter', price: '$49', desc: 'For individuals', features: ['Up to $10k/mo spend', '3 providers', 'Basic routing', 'Slack alerts', 'Email support'], hot: false },
    { name: 'Business', price: '$199', desc: 'Most popular', features: ['Up to $250k/mo spend', 'Unlimited providers', 'Smart routing', 'PII guard', 'Policies & budgets', 'Priority support'], hot: true },
    { name: 'Enterprise', price: 'Custom', desc: 'For large teams', features: ['Unlimited spend', 'Custom SLA', 'SSO & SAML', 'Dedicated infra', 'White-glove onboarding', 'SLA guarantees'], hot: false },
  ]
  const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 12 12"><path d="M3 6l2 2 4-4" stroke="var(--success)" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
  return (
    <section id="pricing" style={{ padding: '120px 0', borderTop: '1px solid var(--line)' }}>
      <Container>
        <Reveal>
          <div style={{ marginBottom: 56 }}>
            <div className="overline" style={{ marginBottom: 16 }}>Pricing</div>
            <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>Simple, transparent pricing.</h2>
            <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-3)' }}>14-day free trial on all plans. No credit card required.</p>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 80}>
              <SpotCard style={{
                padding: 32,
                display: 'flex', flexDirection: 'column',
                ...(plan.hot ? { boxShadow: '0 0 0 2px var(--accent), var(--sh-3)', borderRadius: 14 } : {}),
              }}>
                {plan.hot && (
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 6, fontFamily: 'var(--font-mono)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Most popular</span>
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>{plan.desc}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
                  {plan.price !== 'Custom' && <span style={{ fontSize: 14, color: 'var(--ink-4)', marginLeft: 4 }}>/mo</span>}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
                      <CheckIcon />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" style={{
                  display: 'block', width: '100%', textAlign: 'center', padding: '10px 20px',
                  borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  background: plan.hot ? 'var(--ink)' : 'var(--surface)',
                  color: plan.hot ? '#fff' : 'var(--ink)',
                  border: plan.hot ? 'none' : '1px solid var(--line-2)',
                  transition: 'background .15s, border-color .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = plan.hot ? '#27272A' : 'var(--surface-2)'; if (!plan.hot) e.currentTarget.style.borderColor = 'var(--line-3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = plan.hot ? 'var(--ink)' : 'var(--surface)'; if (!plan.hot) e.currentTarget.style.borderColor = 'var(--line-2)' }}>
                  {plan.price === 'Custom' ? 'Contact us' : 'Get started'}
                </Link>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--line)' }}>
      <Container max={900}>
        <Reveal>
          <SpotCard style={{ padding: '72px 64px', textAlign: 'center', background: 'var(--ink)', borderRadius: 20, overflow: 'visible' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-60px', pointerEvents: 'none', overflow: 'hidden', borderRadius: 28 }}>
                <div className="blob-a" style={{ position: 'absolute', width: '60%', height: '80%', left: '-10%', top: '-10%', borderRadius: '50%', background: 'rgba(91,91,214,.4)', filter: 'blur(80px)' }} />
                <div className="blob-b" style={{ position: 'absolute', width: '50%', height: '70%', right: '-5%', bottom: '-10%', borderRadius: '50%', background: 'rgba(139,92,246,.3)', filter: 'blur(80px)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="h2" style={{ color: '#fff', margin: 0 }}>
                  Stop guessing. Start <em style={{ color: 'var(--accent-soft)' }}>knowing.</em>
                </h2>
                <p style={{ marginTop: 20, fontSize: 17, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, maxWidth: 500, margin: '20px auto 0' }}>
                  Join 300+ AI teams who stopped being surprised by their LLM bill.
                </p>
                <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/sign-up" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                    background: '#fff', color: 'var(--ink)', borderRadius: 'var(--r-md)',
                    fontSize: 15, fontWeight: 600, textDecoration: 'none',
                    transition: 'background .15s, transform .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}>
                    Start free — no CC
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m-4-4l4 4-4 4" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <Link href="/sign-in" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                    background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', borderRadius: 'var(--r-md)',
                    border: '1px solid rgba(255,255,255,.15)', fontSize: 15, fontWeight: 500, textDecoration: 'none',
                    transition: 'background .15s, border-color .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.14)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)' }}>
                    Sign in
                  </Link>
                </div>
                <div className="mono" style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.05em' }}>
                  Free 14-day trial · SOC 2 Type II · 99.99% uptime SLA
                </div>
              </div>
            </div>
          </SpotCard>
        </Reveal>
      </Container>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '40px 0' }}>
      <Container>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <Mark size={20} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Margexa</span>
          </Link>
          <p className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>© 2026 Margexa · Route, govern, observe.</p>
          <nav style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Security', 'Contact'].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}>{l}</a>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
        style={{ background: 'var(--accent)', color: '#fff', fontWeight: 500 }}>
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <TrustStrip />
        <Pain />
        <Features />
        <How />
        <Testimonial />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
