/* Margexa v2 landing — middle: How it works, Features, Architecture */

const { useEffect, useRef, useState } = React;

// ─── HOW IT WORKS — 3 étapes
function HowItWorks() {
  const steps = [
    {
      n: '01',
      t: 'Change one line',
      d: 'Set OPENAI_BASE_URL to your Margexa endpoint. No other code changes. OpenAI, Anthropic, Gemini and Mistral protocols supported natively.',
    },
    {
      n: '02',
      t: 'Every call observed',
      d: 'Each request tagged by feature, team, and workflow in real-time. Prompt audit log starts immediately. Cost attributed per prompt, not per invoice.',
    },
    {
      n: '03',
      t: 'Savings unlocked automatically',
      d: 'Routing rules downgrade over-modeled calls. Budget caps block runaway agents before they burn. P50 latency overhead: 2.8ms.',
    },
  ];
  return (
    <section style={{ padding: '120px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80, alignItems: 'start' }}>
          <div>
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h2" style={{ marginTop: 20, color: 'var(--ink)', textWrap: 'balance' }}>
                Infrastructure,<br />
                not another <em style={{ color: 'var(--accent)' }}>dashboard.</em>
              </h2>
            </Reveal>
            {steps.map((s, i) => (
              <Reveal key={i} delay={160 + i * 100}>
                <div style={{
                  marginTop: 32, paddingTop: 24,
                  borderTop: '1px solid var(--line)',
                }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--ink-5)', marginBottom: 6 }}>{s.n}</div>
                  <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <CodeBlock />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function CodeBlock() {
  const lines = [
    { p: 'import', t: 'from openai import OpenAI', c: 'kw' },
    { t: '' },
    { t: 'client = OpenAI(', c: 'fn' },
    { t: '    api_key=os.environ["OPENAI_API_KEY"],', c: '' },
    { t: '    base_url="https://api.margexa.com/v1",', c: 'hi' },
    { t: ')', c: '' },
    { t: '' },
    { t: 'reply = client.chat.completions.create(', c: 'fn' },
    { t: '    model="gpt-4o",  # Margexa may downgrade safely', c: 'cm' },
    { t: '    messages=[{"role": "user", "content": prompt}],', c: '' },
    { t: '    extra_headers={"x-margexa-policy": "cost-optimal"},', c: 'hi' },
    { t: ')', c: '' },
  ];
  return (
    <div style={{
      background: 'var(--ink)', color: '#E6E6EC', borderRadius: 12,
      padding: '14px 0 18px', boxShadow: 'var(--sh-pop)', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 14px', borderBottom: '1px solid #232328' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: ['#FF5F57','#FEBC2E','#28C840'][i], opacity: .7 }} />)}
        </div>
        <span className="mono" style={{ fontSize: 11, color: '#6B6B76' }}>chat.py</span>
        <button style={{ background: 'transparent', border: '1px solid #2C2C32', color: '#9A9AA4', fontSize: 11, padding: '3px 9px', borderRadius: 6, cursor: 'pointer' }} className="mono">
          Copy
        </button>
      </div>
      <pre className="mono" style={{ margin: 0, padding: '14px 22px', fontSize: 12.5, lineHeight: 1.65, overflowX: 'auto' }}>
{lines.map((l, i) => (
  <div key={i} style={{
    background: l.c === 'hi' ? 'rgba(91,91,214,.12)' : 'transparent',
    margin: '0 -22px', padding: '0 22px',
    borderLeft: l.c === 'hi' ? '2px solid var(--accent)' : '2px solid transparent',
    color: l.c === 'cm' ? '#6B6B76' : l.c === 'kw' ? '#C7C5F3' : '#E6E6EC',
  }}>{l.t || '\u00A0'}</div>
))}
      </pre>
    </div>
  );
}

// ─── FEATURE GRID — 6 pillars
function FeatureGrid() {
  const items = [
    {
      title: 'AI Gateway',
      desc: 'Single endpoint, all providers. Smart routing by cost, latency, model capability.',
      mock: <GatewayMock />,
      span: 2,
    },
    {
      title: 'Policies engine',
      desc: 'Allow-lists, budget caps, PII guards, enforced before the request leaves your network.',
      mock: <PolicyMock />,
    },
    {
      title: 'Prompt observability',
      desc: 'Every call indexed. Replay, compare, diff outputs side-by-side.',
      mock: <PromptMock />,
    },
    {
      title: 'Leak detection',
      desc: 'Anomalous spend, runaway agents, exfiltration patterns, flagged in real time.',
      mock: <LeakMock />,
    },
    {
      title: 'Spend analytics',
      desc: 'Attribute cost to a team, a feature, a prompt, down to the token.',
      mock: <AnalyticsMock />,
      span: 2,
    },
  ];
  return (
    <section style={{ padding: '120px 0' }}>
      <Container>
        <Reveal><Eyebrow>The platform</Eyebrow></Reveal>
        <Reveal delay={100}>
          <h2 className="h2" style={{ marginTop: 24, marginBottom: 8, color: 'var(--ink)', maxWidth: 820, textWrap: 'balance' }}>
            One platform.<br />Every problem AI <span style={{ color: 'var(--accent)' }}>creates</span> in production.
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <p className="body-lg" style={{ maxWidth: 540, marginBottom: 64 }}>
            From the first request a developer makes locally, to the dashboards your CFO opens on Monday morning.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '320px', gap: 12 }}>
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 80} style={{ gridColumn: `span ${it.span || 1}` }}>
              <Spotlight style={{ height: '100%' }}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px 24px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{it.title}</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.55, maxWidth: 380 }}>{it.desc}</div>
                  </div>
                  <div style={{ flex: 1, padding: 24, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {it.mock}
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

// Feature mockups (small)
function GatewayMock() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Badge tone="accent" dot>Routing live</Badge>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>p50 · 1.8s</span>
      </div>
      {[
        { from: 'gpt-4o', to: 'claude-sonnet-4', save: '$0.04/req', pct: 78 },
        { from: 'gpt-4o', to: 'gpt-4o-mini', save: '$0.018/req', pct: 56 },
        { from: 'claude-opus', to: 'claude-sonnet-4', save: '$0.21/req', pct: 92 },
      ].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', width: 110 }}>{r.from}</span>
          <svg width="14" height="10" viewBox="0 0 14 10"><path d="M1 5h11m-3-3l3 3-3 3" stroke="var(--accent)" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink)', width: 120, fontWeight: 500 }}>{r.to}</span>
          <span className="mono tnum" style={{ fontSize: 11, color: 'var(--success)', marginLeft: 'auto' }}>−{r.save}</span>
        </div>
      ))}
    </div>
  );
}

function PolicyMock() {
  return (
    <div style={{ width: '100%', maxWidth: 260, fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.7 }}>
      <div style={{ color: 'var(--ink-4)' }}># policy: marketing-team</div>
      <div><span style={{ color: 'var(--accent)' }}>allow_models</span>: ["gpt-4o-mini", "claude-haiku"]</div>
      <div><span style={{ color: 'var(--accent)' }}>budget_daily</span>: <span style={{ color: 'var(--success)' }}>$50</span></div>
      <div><span style={{ color: 'var(--accent)' }}>max_tokens</span>: <span style={{ color: 'var(--success)' }}>4000</span></div>
      <div><span style={{ color: 'var(--accent)' }}>pii_guard</span>: <span style={{ color: 'var(--success)' }}>true</span></div>
      <div><span style={{ color: 'var(--accent)' }}>fallback</span>: gemini-flash</div>
    </div>
  );
}

function PromptMock() {
  return (
    <div style={{ width: '100%', maxWidth: 260 }}>
      {[
        { p: 'classify_intent', n: '12,840', c: 8.4 },
        { p: 'extract_invoice', n: '4,210', c: 28.9 },
        { p: 'summarize_call', n: '1,805', c: 14.2 },
      ].map((r, i) => (
        <div key={i} style={{ padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink)' }}>{r.p}</span>
            <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-3)' }}>${r.c}</span>
          </div>
          <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(r.c / 30) * 100}%`, height: '100%', background: 'var(--accent)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeakMock() {
  return (
    <div style={{ width: '100%', maxWidth: 260 }}>
      {[
        { sev: 'danger', t: 'Runaway agent', sub: '$24/min · 11min', dot: 'var(--danger)' },
        { sev: 'warning', t: 'Spike · acme/billing', sub: '+412% vs 7d avg', dot: 'var(--warning)' },
        { sev: 'success', t: 'Resolved', sub: 'gpt-4o → mini', dot: 'var(--success)' },
      ].map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: a.dot }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{a.t}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{a.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsMock() {
  const teams = [
    { t: 'Product',     v: 4820, c: 'var(--accent)', pct: 78 },
    { t: 'Engineering', v: 3420, c: 'var(--success)', pct: 56 },
    { t: 'Sales/CS',    v: 2810, c: '#B97A0B', pct: 46 },
    { t: 'Marketing',   v: 1230, c: '#8B5CF6', pct: 20 },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Spend per team · 30d</span>
        <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink-3)' }}>$12,280 total</span>
      </div>
      <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', background: 'var(--surface-2)' }}>
        {teams.map((t, i) => (
          <div key={i} style={{ width: `${t.pct}%`, background: t.c }} />
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {teams.map((t, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: t.c }} />
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.t}</span>
            </div>
            <div className="tnum" style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>${t.v.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ARCHITECTURE PREVIEW
function Architecture() {
  return (
    <section style={{ padding: '120px 0', background: 'var(--ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: .25, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />
      <Container max={1100} style={{ position: 'relative' }}>
        <Reveal>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="h2" style={{ marginTop: 24, color: '#fff', maxWidth: 720, textWrap: 'balance' }}>
            Sits between your apps and every model provider.
          </h2>
        </Reveal>

        <div style={{ marginTop: 72, position: 'relative' }}>
          <ArchDiagram />
        </div>
      </Container>
    </section>
  );
}

function ArchDiagram() {
  const nodeStyle = {
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 13, color: '#fff',
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 32, alignItems: 'center', position: 'relative' }}>
      {/* Left: your apps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,.45)', marginBottom: 6 }}>Your apps</div>
        {['Backend API', 'Background workers', 'Agent runtime', 'Internal tools'].map((l) => (
          <div key={l} style={nodeStyle}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)' }} />
            {l}
          </div>
        ))}
      </div>

      {/* Center: Margexa */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(91,91,214,.18), rgba(91,91,214,.04))',
        border: '1px solid rgba(199,197,243,.25)',
        borderRadius: 14, padding: 28, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <Mark size={22} />
          <span style={{ fontWeight: 500, fontSize: 16 }}>Margexa Platform</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['Router', 'Policy engine', 'Cache', 'Observer', 'Cost meter', 'Anomaly det.'].map((l) => (
            <div key={l} style={{
              padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)', fontSize: 12, color: '#fff', textAlign: 'center',
              fontFamily: 'var(--font-mono)', letterSpacing: '.01em',
            }}>{l}</div>
          ))}
        </div>
        <div className="mono" style={{ marginTop: 18, fontSize: 10.5, color: 'rgba(255,255,255,.5)', letterSpacing: '.05em' }}>
          edge.margexa.com · 12 regions · &lt;3ms p50
        </div>
      </div>

      {/* Right: providers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,.45)', marginBottom: 6, textAlign: 'right' }}>Providers</div>
        {['OpenAI', 'Anthropic', 'Google AI', 'Mistral', 'AWS Bedrock', 'Self-hosted'].map((l) => (
          <div key={l} style={{ ...nodeStyle, justifyContent: 'flex-end' }}>
            {l}
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-soft)' }} />
          </div>
        ))}
      </div>

      {/* Animated flowing connections */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} preserveAspectRatio="none" viewBox="0 0 1000 460">
        {/* apps -> margexa */}
        {[0,1,2,3].map((i) => (
          <Flow key={`l${i}`} from={{ x: 240, y: 80 + i * 60 }} to={{ x: 380, y: 230 }} color="var(--success)" duration={3 + i * 0.4} delay={i * 0.6} curve={-30} />
        ))}
        {/* margexa -> providers */}
        {[0,1,2,3,4,5].map((i) => (
          <Flow key={`r${i}`} from={{ x: 620, y: 230 }} to={{ x: 760, y: 60 + i * 60 }} color="var(--accent-soft)" duration={2.6 + i * 0.3} delay={1.2 + i * 0.4} curve={30} />
        ))}
      </svg>
    </div>
  );
}

Object.assign(window, { HowItWorks, FeatureGrid, Architecture });
