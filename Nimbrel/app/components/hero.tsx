'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1] as const

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function GridBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Fine grid SVG — slightly isometric perspective via CSS */}
      <div
        className="absolute inset-0"
        style={{
          perspective: '1200px',
        }}
      >
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0"
          style={{
            transform: 'rotateX(5deg) scale(1.08)',
            transformOrigin: 'center 35%',
            opacity: 0.85,
          }}
        >
          <defs>
            <pattern
              id="nimbrel-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="rgba(255,255,255,0.065)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nimbrel-grid)" />
        </svg>
      </div>

      {/* Accent-1 radial — top-right, infrastructure trust */}
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          right: '8%',
          width: '42%',
          height: '58%',
          background:
            'radial-gradient(ellipse at center, rgba(76,127,160,0.06) 0%, transparent 68%)',
        }}
      />

      {/* Accent-2 radial — bottom-left, economic signal */}
      <div
        style={{
          position: 'absolute',
          bottom: '-4%',
          left: '-4%',
          width: '36%',
          height: '52%',
          background:
            'radial-gradient(ellipse at center, rgba(196,137,58,0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

function CodeSnippet() {
  return (
    <div
      className="rounded-[10px] overflow-hidden text-[12.5px]"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--border-strong)',
        fontFamily: 'var(--font-family-mono)',
      }}
    >
      {/* Top chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex gap-1.5">
          {['#3D3D3D', '#3D3D3D', '#3D3D3D'].map((c, i) => (
            <span
              key={i}
              className="w-[9px] h-[9px] rounded-full"
              style={{ background: c }}
            />
          ))}
        </div>
        <span
          className="text-[11px] ml-2"
          style={{ color: 'var(--color-muted-fg)' }}
        >
          integration.py
        </span>
      </div>

      {/* Code */}
      <pre className="p-5 leading-[1.65] overflow-x-auto">
        <code>
          <span style={{ color: 'var(--color-muted-fg)' }}>
            {'from openai import OpenAI\n\n'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {'client = OpenAI(\n'}
          </span>
          <span style={{ color: 'var(--color-muted-fg)' }}>
            {'    # one line change:\n'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {'    base_url='}
          </span>
          <span style={{ color: 'var(--color-accent-2)' }}>
            {'"https://acme.nimbrel.io/v1"'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {',\n    api_key=os.environ['}
          </span>
          <span style={{ color: 'var(--color-accent-2)' }}>
            {'"OPENAI_API_KEY"'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {']\n)\n\n'}
          </span>
          <span style={{ color: 'var(--color-muted-fg)' }}>
            {'# every call is now observed, routed, governed\n'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {'response = client.chat.completions.create(\n'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {'    model='}
          </span>
          <span style={{ color: 'var(--color-accent-2)' }}>
            {'"gpt-4o"'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            {',\n    messages=[...]'}
          </span>
          <span style={{ color: 'var(--color-muted-fg)' }}>
            {'  # unchanged\n'}
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>{')'}</span>
        </code>
      </pre>

      {/* Metrics strip */}
      <div
        className="flex items-center gap-6 px-5 py-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {[
          { label: 'cost intercepted', value: '$0.0041', accent: false },
          { label: 'routed to', value: 'gpt-4o-mini', accent: true },
          { label: 'saved', value: '$0.0033', accent: false },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: m.accent
                  ? 'var(--color-accent-1)'
                  : 'var(--color-muted-fg)',
              }}
            />
            <span
              className="text-[11px] tabular"
              style={{
                color: m.accent
                  ? 'var(--color-accent-1)'
                  : 'var(--color-muted-fg)',
              }}
            >
              {m.value}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.06em]"
              style={{ color: 'var(--color-muted-fg)', opacity: 0.6 }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section
      className="relative min-h-[100dvh] flex flex-col justify-center pt-24"
      style={{ overflow: 'hidden' }}
    >
      <GridBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-x-16 gap-y-12 items-center">

          {/* Left column */}
          <div>
            <FadeUp delay={0.05}>
              <h1
                className="font-sans text-foreground"
                style={{
                  fontSize: 'clamp(44px, 5.5vw, 68px)',
                  fontWeight: 500,
                  lineHeight: 1.0,
                  letterSpacing: '-0.022em',
                }}
              >
                Route every LLM call.
                <br />
                <span style={{ color: 'var(--color-accent-1)' }}>
                  Pay for what you need.
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p
                className="mt-6 max-w-[420px]"
                style={{
                  fontSize: '17px',
                  color: 'var(--color-muted-fg)',
                  lineHeight: 1.55,
                  textWrap: 'pretty',
                } as React.CSSProperties}
              >
                One proxy endpoint. Every AI request measured, governed, and
                cost-optimised without changing your code.
              </p>
            </FadeUp>

            <FadeUp delay={0.25}>
              <div className="mt-9 flex items-center gap-3">
                <Link
                  href="/register"
                  className="h-10 px-5 rounded-[7px] text-[14px] font-medium text-white flex items-center"
                  style={{
                    backgroundColor: 'var(--color-accent-1)',
                    transition:
                      'background-color var(--duration-micro) var(--ease-spring)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--color-accent-1-hover)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--color-accent-1)')
                  }
                >
                  Start free trial
                </Link>
                <Link
                  href="#how-it-works"
                  className="h-10 px-5 rounded-[7px] text-[14px] font-medium flex items-center"
                  style={{
                    color: 'var(--color-muted)',
                    border: '1px solid var(--border-strong)',
                    transition: [
                      'color var(--duration-micro) var(--ease-spring)',
                      'border-color var(--duration-micro) var(--ease-spring)',
                    ].join(', '),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-foreground)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-muted)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  }}
                >
                  See how it works
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.35}>
              <p
                className="mt-5 tabular"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted-fg)',
                }}
              >
                14-day free trial · No credit card required
              </p>
            </FadeUp>
          </div>

          {/* Right column — code snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          >
            <CodeSnippet />
          </motion.div>

        </div>
      </div>

      {/* Bottom fade gradient into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-background))',
        }}
        aria-hidden="true"
      />
    </section>
  )
}
