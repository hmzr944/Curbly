'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

interface CountUpProps {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
}

function CountUp({ to, prefix = '', suffix = '', decimals = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    if (reduce) { setValue(to); return }

    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) =>
        setValue(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, to, reduce, decimals])

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : value.toLocaleString('en-US')

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

const STATS = [
  {
    value: 0,
    suffix: '%',
    label: 'prompt attribution',
    context:
      'Your AI spend is invisible by feature, team, and workflow. Finance sees the invoice on day 5 of next month.',
    reverse: false,
  },
  {
    value: 14,
    suffix: 'k',
    prefix: '$',
    label: 'average monthly waste',
    context:
      'The median Nimbrel customer finds a recurring cost leak in their first 30 days — runaway agents, duplicate calls, or over-modeled tasks.',
    reverse: true,
  },
  {
    value: 60,
    suffix: '%',
    label: 'of calls are over-modeled',
    context:
      'A model 5x cheaper answers just as well for most of your traffic. Without a routing layer, you pay the premium every time.',
    reverse: false,
  },
]

export function Pain() {
  return (
    <section className="py-28" id="pain">
      <div className="max-w-5xl mx-auto px-6">

        <div className="mb-20">
          <h2
            style={{
              fontSize: 'clamp(28px, 3vw, 36px)',
              fontWeight: 500,
              letterSpacing: '-0.014em',
              color: 'var(--color-foreground)',
              lineHeight: 1.2,
              maxWidth: '580px',
              textWrap: 'balance',
            } as React.CSSProperties}
          >
            Three things your AI bill is hiding from you.
          </h2>
        </div>

        <div className="flex flex-col">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="py-10"
              style={{
                borderTop: '1px solid var(--border)',
                borderBottom: i === STATS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                className={`grid grid-cols-1 md:grid-cols-[${stat.reverse ? '55fr_45fr' : '45fr_55fr'}] gap-x-16 gap-y-6 items-center`}
                style={{
                  gridTemplateColumns: stat.reverse
                    ? '55fr 45fr'
                    : '45fr 55fr',
                }}
              >
                {/* Number side */}
                <div className={stat.reverse ? 'md:order-last' : ''}>
                  <div
                    className="tabular leading-none"
                    style={{
                      fontSize: 'clamp(52px, 7vw, 80px)',
                      fontWeight: 600,
                      color: 'var(--color-accent-2)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    <CountUp
                      to={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div
                    className="mt-2 tabular uppercase tracking-[0.07em]"
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-muted-fg)',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>

                {/* Context side */}
                <div className={stat.reverse ? '' : ''}>
                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--color-muted)',
                      lineHeight: 1.6,
                      maxWidth: '360px',
                    }}
                  >
                    {stat.context}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
