/* Margexa v2 landing — bottom: ROI, testimonial, pricing, FAQ, CTA, footer */

const { useEffect, useRef, useState } = React;

// ─── ROI section
function ROI() {
  return (
    <section style={{ padding: '120px 0' }}>
      <Container>
        <Reveal delay={100}>
          <h2 className="h2" style={{ marginTop: 24, color: 'var(--ink)', maxWidth: 760, textWrap: 'balance' }}>
            A typical mid-market AI team pays back Margexa in <span style={{ color: 'var(--accent)' }}>11 days</span>.
          </h2>
        </Reveal>

        <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card padding={32} hover>
            <div className="eyebrow">Before Margexa</div>
            <div style={{ marginTop: 24 }}>
              {[
                { l: 'Monthly AI spend', v: '$28,400', muted: true },
                { l: 'Visibility', v: 'Provider dashboards', muted: true },
                { l: 'Governance', v: 'None', muted: true },
                { l: 'Engineering time on cost', v: '~6h / week', muted: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                  <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{r.l}</span>
                  <span className="tnum" style={{ fontSize: 14, color: 'var(--ink-2)' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={32} hover style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}>
            <div className="eyebrow" style={{ color: 'var(--accent-soft)' }}>After Margexa</div>
            <div style={{ marginTop: 24 }}>
              {[
                { l: 'Monthly AI spend', v: '$11,360', delta: '−60%' },
                { l: 'Visibility', v: 'Per-prompt, per-feature' },
                { l: 'Governance', v: '14 policies enforced' },
                { l: 'Engineering time on cost', v: '~30 min / week', delta: '−92%' },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,.08)',
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>{r.l}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.delta && <span className="mono" style={{ fontSize: 11, color: 'var(--success)', background: 'rgba(14,159,110,.12)', padding: '2px 8px', borderRadius: 99 }}>{r.delta}</span>}
                    <span className="tnum" style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{r.v}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Big stat row */}
        <Reveal delay={200}>
          <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              { v: 38, suf: '%', l: 'avg spend reduction' },
              { v: 11, suf: ' days', l: 'median payback period' },
              { v: 240, pref: '$', suf: 'k+', l: 'annual savings · mid-market' },
              { v: 2.8, suf: 'ms', l: 'p50 added latency' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '32px 24px' }}>
                <div className="tnum h-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                  {s.pref || ''}<CountUp to={s.v} decimals={s.v % 1 ? 1 : 0} duration={1800} />{s.suf || ''}
                </div>
                <div className="eyebrow" style={{ marginTop: 10 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// ─── TESTIMONIAL
function Testimonial() {
  return (
    <section style={{ padding: '120px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <Container max={920}>
        <Reveal>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 60, lineHeight: 1, color: 'var(--accent)', marginBottom: -8 }}>"</div>
        </Reveal>
        <Reveal delay={100}>
          <blockquote style={{
            fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 400, lineHeight: 1.3,
            letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0, textWrap: 'balance',
          }}>
            We had three engineers manually auditing prompts. Margexa replaced that and showed us a $14k/month leak we didn't know existed. The platform paid for itself in week two.
          </blockquote>
        </Reveal>
        <Reveal delay={240}>
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Mara Halvorsen</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>VP Engineering · Lattice AI · 80 engineers</div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// ─── PRICING
function Pricing() {
  const plans = [
    {
      name: 'Free',
      desc: 'Observe your first traffic. No card, no commitment.',
      priceLabel: '€0',
      period: 'forever',
      bullets: [
        '5 000 requests / month',
        '1 provider connection',
        '1 workspace',
        'Basic spend dashboard',
        'Community support',
      ],
      cta: 'Start free',
      ctaHref: '/register',
      featured: false,
    },
    {
      name: 'Audit',
      desc: 'Deep one-time analysis of your AI spend. No subscription.',
      priceLabel: '€297',
      period: 'one-time',
      bullets: [
        '30-day full traffic analysis',
        'Margin destroyer report',
        'Model swap simulation',
        'Routing recommendations',
        'PDF export for CFO',
      ],
      cta: 'Get audit',
      ctaHref: '/register',
      featured: false,
    },
    {
      name: 'Control',
      desc: 'Continuous governance for AI teams in production.',
      priceLabel: '€349',
      period: '/ mois',
      bullets: [
        'Unlimited requests',
        'All providers supported',
        'Unlimited policies',
        'Team management + RBAC',
        'Stripe revenue attribution',
        'Priority support',
      ],
      cta: 'Start free trial',
      ctaHref: '/register',
      featured: true,
    },
  ];
  return (
    <section id="pricing" style={{ padding: '120px 0' }}>
      <Container>
        <Reveal>
          <Eyebrow>Pricing</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="h2" style={{ marginTop: 20, color: 'var(--ink)', maxWidth: 640, textWrap: 'balance' }}>
            Start free.<br />Scale when it pays for itself.
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 56 }}>
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{
                height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
                background: 'var(--surface)',
                border: `1px solid ${p.featured ? 'var(--accent)' : 'var(--line)'}`,
                borderRadius: 'var(--r-lg)', padding: 28,
                boxShadow: p.featured ? '0 0 0 3px var(--accent-tint)' : 'none',
              }}>
                {p.featured && (
                  <div style={{ position: 'absolute', top: -10, left: 20 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 99,
                      background: 'var(--accent)', color: '#fff',
                      fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase',
                    }}>Recommended</span>
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{p.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 5, marginBottom: 24, lineHeight: 1.5 }}>{p.desc}</div>
                <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="tnum mono" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>{p.priceLabel}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '.04em' }}>{p.period}</span>
                  </span>
                </div>
                <ul style={{ flex: 1, listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {p.bullets.map((b, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M3 7l3 3 5-6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 28 }}>
                  <a href={p.ctaHref} style={{
                    display: 'block', textAlign: 'center', padding: '10px 16px',
                    background: p.featured ? 'var(--accent)' : 'var(--ink)',
                    color: '#fff', borderRadius: 'var(--r-sm)',
                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    transition: 'opacity .15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                    {p.cta}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <p className="mono" style={{ marginTop: 32, fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', letterSpacing: '.05em' }}>
            Free plan includes full platform access · No credit card required
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

// ─── FAQ
function FAQ() {
  const faqs = [
    {
      q: 'How does Margexa cut AI cost without changing model behaviour?',
      a: 'We route each call to the cheapest model that meets your quality bar, measured continuously by running shadow traffic. When confidence drops, we automatically escalate to a more capable model. You set the quality threshold, we handle the routing.',
    },
    {
      q: 'Do you store our prompts and completions?',
      a: 'By default we store metadata only (latency, tokens, cost, provider). Full prompt and completion payloads are opt-in per workspace, encrypted at rest, and retained according to your plan. Enterprise customers can run in private cloud with zero data leaving their VPC.',
    },
    {
      q: 'What happens if Margexa is down?',
      a: 'Our SDK falls back to your direct provider URL automatically. Margexa has a 99.99% uptime SLA on Business and Enterprise plans. We publish real-time status at status.margexa.com.',
    },
    {
      q: 'How are you different from LangSmith or Helicone?',
      a: 'LangSmith focuses on debugging traces. Helicone is great observability. Margexa is the governance and control plane. We enforce policies before requests leave your network and we route to optimise cost in real time. Many of our customers run all three.',
    },
    {
      q: 'Can we self-host?',
      a: 'Yes, on the Enterprise plan. We ship a Helm chart and Terraform modules. Deploy in your AWS, GCP, or Azure account with full control plane parity.',
    },
    {
      q: 'How do you handle PII?',
      a: 'Optional PII guard runs locally in our edge. Detection and redaction happen before the prompt reaches the provider. We never see your sensitive payloads in cleartext when the guard is enabled.',
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section style={{ padding: '120px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <Container max={920}>
        <Reveal delay={100}>
          <h2 className="h2" style={{ marginTop: 24, marginBottom: 64, color: 'var(--ink)' }}>
            Frequently asked.
          </h2>
        </Reveal>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textAlign: 'left', color: 'var(--ink)',
                }}>
                <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{f.q}</span>
                <span style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: open === i ? 'var(--ink)' : 'var(--surface)',
                  border: '1px solid var(--line-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s var(--ease)',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform .25s' }}>
                    <path d="M5 1v8M1 5h8" stroke={open === i ? '#fff' : 'var(--ink-2)'} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <div style={{
                maxHeight: open === i ? 240 : 0, overflow: 'hidden',
                transition: 'max-height .35s var(--ease)',
              }}>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-3)', margin: '0 0 24px', maxWidth: 720 }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── CTA FINAL
function FinalCTA() {
  return (
    <section style={{ padding: '140px 0', position: 'relative', overflow: 'hidden' }}>
      <AnimatedMesh palette="indigo" intensity={0.4} />
      <Container max={920} style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <Reveal>
          <h2 className="h1" style={{ color: 'var(--ink)', margin: 0, textWrap: 'balance' }}>
            Take control of your AI spend.<br />
            <span style={{ color: 'var(--accent)' }}>Today.</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="body-lg" style={{ marginTop: 24, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Free trial. No credit card. Setup in 5 minutes, without rewriting a single function.
          </p>
        </Reveal>
        <Reveal delay={280}>
          <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Magnetic strength={0.25}>
              <Button variant="primary" size="lg" iconRight={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m-4-4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }>Start free</Button>
            </Magnetic>
            <Button variant="ghost" size="lg" href="#">Book a 20-min demo →</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// ─── FOOTER
function Footer() {
  const cols = [
    { t: 'Product', items: ['AI Gateway', 'Policies', 'Prompt observability', 'Analytics', 'Pricing', 'Changelog'] },
    { t: 'Platform', items: ['Documentation', 'API reference', 'SDKs', 'Integrations', 'Security', 'Status'] },
    { t: 'Company', items: ['About', 'Customers', 'Careers', 'Blog', 'Press', 'Contact'] },
    { t: 'Legal', items: ['Privacy', 'Terms', 'DPA', 'Subprocessors', 'Trust center'] },
  ];
  return (
    <footer style={{ background: 'var(--ink)', color: '#fff', padding: '80px 0 32px', position: 'relative', overflow: 'hidden' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 56 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <Mark size={22} />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Margexa</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, maxWidth: 260, margin: 0 }}>
              The control plane for your company's AI spend.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              {['𝕏', 'in', 'gh', 'rss'].map((s, i) => (
                <a key={i} href="#" style={{
                  width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(255,255,255,.1)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none', color: 'rgba(255,255,255,.6)', fontSize: 11, fontFamily: 'var(--font-mono)',
                }}>{s}</a>
              ))}
            </div>
          </div>
          {cols.map((c, i) => (
            <div key={i}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>{c.t}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {c.items.map((it, j) => (
                  <a key={j} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', textDecoration: 'none' }}>{it}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Giant wordmark */}
        <div style={{
          marginTop: 80, fontSize: 'clamp(80px, 22vw, 280px)', fontWeight: 600,
          letterSpacing: '-0.06em', lineHeight: 0.9, color: 'transparent',
          background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,0))',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          textAlign: 'center',
        }}>margexa</div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.08)',
          fontSize: 11, color: 'rgba(255,255,255,.5)',
        }} className="mono">
          <span>© 2025 Margexa, Inc.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
            All systems operational
          </span>
        </div>
      </Container>
    </footer>
  );
}

Object.assign(window, { ROI, Testimonial, Pricing, FAQ, FinalCTA, Footer });
