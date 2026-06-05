'use client'

import Link from 'next/link'
import { CheckCircle } from '@phosphor-icons/react'

const PLANS = [
  {
    name: 'Free',
    tagline: 'Observe your first traffic.',
    price: '0',
    period: 'forever',
    features: [
      '5,000 requests per month',
      '1 provider connection',
      '1 workspace',
      'Basic spend dashboard',
      'Community support',
    ],
    cta: 'Start free',
    href: '/register',
    featured: false,
    scale: 1,
  },
  {
    name: 'Audit',
    tagline: 'Full analysis of 30 days of traffic.',
    price: '297',
    period: 'one-time',
    features: [
      '30-day full traffic analysis',
      'Margin waste report',
      'Model swap simulation',
      'Routing recommendations',
      'PDF export for finance',
    ],
    cta: 'Get the audit',
    href: '/register?plan=audit',
    featured: false,
    scale: 0.97,
  },
  {
    name: 'Control',
    tagline: 'Continuous governance for production AI.',
    price: '349',
    period: '/month',
    features: [
      'Unlimited requests',
      'All providers supported',
      'Unlimited policies and teams',
      'Stripe revenue attribution',
      'Priority support',
      'API keys and audit log',
    ],
    cta: 'Start free trial',
    href: '/register?plan=control',
    featured: true,
    scale: 1,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <div className="max-w-5xl mx-auto px-6">

        <div className="mb-16">
          <h2
            style={{
              fontSize: 'clamp(28px, 3vw, 36px)',
              fontWeight: 500,
              letterSpacing: '-0.014em',
              color: 'var(--color-foreground)',
              lineHeight: 1.2,
              maxWidth: '480px',
              textWrap: 'balance',
            } as React.CSSProperties}
          >
            Start free. Scale when it pays for itself.
          </h2>
        </div>

        {/* Asymmetric grid — columns have different visual weights */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
          style={{ gridTemplateColumns: '1fr 0.92fr 1.08fr' }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[10px] p-7 flex flex-col"
              style={{
                background: plan.featured
                  ? 'var(--color-surface-2)'
                  : 'var(--color-surface)',
                border: plan.featured
                  ? '1px solid var(--color-accent-1)'
                  : '1px solid var(--border)',
                marginTop: plan.name === 'Free' ? '24px' : '0',
                transform: `scale(${plan.scale})`,
                transformOrigin: 'top center',
              }}
            >
              {plan.featured && (
                <div
                  className="mb-5 text-[10px] uppercase tracking-[0.08em] font-medium"
                  style={{ color: 'var(--color-accent-1)' }}
                >
                  Recommended
                </div>
              )}

              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-foreground)',
                  letterSpacing: '-0.01em',
                }}
              >
                {plan.name}
              </div>
              <div
                className="mt-1 mb-6"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-muted-fg)',
                  lineHeight: 1.45,
                }}
              >
                {plan.tagline}
              </div>

              {/* Price */}
              <div
                className="mb-6 pb-6"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="tabular"
                    style={{
                      fontSize: '44px',
                      fontWeight: 600,
                      color: 'var(--color-foreground)',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {plan.price === '0' ? (
                      <span style={{ color: 'var(--color-muted)' }}>Free</span>
                    ) : (
                      <>
                        <span
                          style={{
                            fontSize: '22px',
                            verticalAlign: 'super',
                            color: 'var(--color-muted)',
                          }}
                        >
                          {'€'}
                        </span>
                        {plan.price}
                      </>
                    )}
                  </span>
                  {plan.price !== '0' && (
                    <span
                      className="tabular"
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'var(--color-muted-fg)',
                      }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle
                      size={15}
                      weight="fill"
                      className="flex-shrink-0 mt-[2px]"
                      style={{
                        color: plan.featured
                          ? 'var(--color-accent-1)'
                          : 'var(--color-muted-fg)',
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-muted)',
                        lineHeight: 1.45,
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="w-full h-9 flex items-center justify-center rounded-[6px] text-[13px] font-medium"
                style={
                  plan.featured
                    ? {
                        backgroundColor: 'var(--color-accent-1)',
                        color: '#fff',
                        transition:
                          'background-color 120ms cubic-bezier(0.16,1,0.3,1)',
                      }
                    : {
                        border: '1px solid var(--border-strong)',
                        color: 'var(--color-muted)',
                        transition:
                          'border-color 120ms cubic-bezier(0.16,1,0.3,1), color 120ms cubic-bezier(0.16,1,0.3,1)',
                      }
                }
                onMouseEnter={(e) => {
                  if (plan.featured) {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-accent-1-hover)'
                  } else {
                    e.currentTarget.style.color = 'var(--color-foreground)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.featured) {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-accent-1)'
                  } else {
                    e.currentTarget.style.color = 'var(--color-muted)'
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                  }
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p
          className="mt-8 text-center tabular"
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-muted-fg)',
          }}
        >
          Free plan includes full platform access · No credit card required
        </p>
      </div>
    </section>
  )
}
