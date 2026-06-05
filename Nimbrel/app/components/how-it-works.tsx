'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'

const STEPS = [
  {
    n: '01',
    title: 'Change the base URL',
    description:
      'Set OPENAI_BASE_URL to your Nimbrel endpoint. OpenAI, Anthropic, and Gemini protocols are supported natively. No other code changes required.',
  },
  {
    n: '02',
    title: 'Every call observed',
    description:
      'Each request is tagged by feature, team, and workflow in real-time. Cost attributed per prompt. Audit log starts immediately.',
  },
  {
    n: '03',
    title: 'Savings applied automatically',
    description:
      'Routing rules downgrade over-modeled calls. Budget caps halt runaway agents. P50 latency overhead: 2.8ms.',
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 20%'],
  })

  const dotX = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-28"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="max-w-5xl mx-auto px-6">

        <div className="mb-16">
          <h2
            style={{
              fontSize: 'clamp(28px, 3vw, 36px)',
              fontWeight: 500,
              letterSpacing: '-0.014em',
              color: 'var(--color-foreground)',
              lineHeight: 1.2,
              textWrap: 'balance',
            } as React.CSSProperties}
          >
            Infrastructure, not another dashboard.
          </h2>
        </div>

        {/* Animated timeline connector */}
        <div className="relative mb-12 hidden md:block" aria-hidden="true">
          <div
            className="w-full h-px"
            style={{ background: 'var(--border-strong)' }}
          />
          {/* Dashed overlay */}
          <svg
            className="absolute inset-0 w-full h-4"
            style={{ top: '-8px', overflow: 'visible' }}
          >
            <line
              x1="0"
              y1="9"
              x2="100%"
              y2="9"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          </svg>
          {/* Animated dot */}
          {!reduce && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2"
              style={{
                backgroundColor: 'var(--color-accent-1)',
                boxShadow: '0 0 8px var(--color-accent-1)',
                left: dotX,
              }}
            />
          )}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{
                duration: 0.45,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="tabular uppercase tracking-[0.10em] mb-3"
                style={{ fontSize: '10px', color: 'var(--color-muted-fg)' }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 500,
                  color: 'var(--color-foreground)',
                  letterSpacing: '-0.012em',
                  marginBottom: '10px',
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-muted-fg)',
                  lineHeight: 1.65,
                }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
