/* Margexa v2 landing — top sections: Nav, Hero, Trust, Pain */

const { useEffect, useRef, useState } = React;

// ─── NAV
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? '10px 0' : '18px 0',
      background: scrolled ? 'rgba(250,250,248,.78)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(160%) blur(14px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      transition: 'all .25s var(--ease)',
    }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <Mark size={22} />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Margexa</span>
          </a>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {['Pricing', 'Docs'].map((l) => (
              <a key={l} href={l === 'Pricing' ? '#pricing' : '/docs'} style={{
                fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none', fontWeight: 450,
                transition: 'color .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button variant="ghost" size="sm" href="/login">Sign in</Button>
            <Button variant="primary" size="sm" href="/register">Start free</Button>
          </div>
        </div>
      </Container>
    </nav>
  );
}

// ─── HERO — asymmetric 2-column, left-aligned
function Hero() {
  return (
    <section style={{ padding: '130px 0 80px' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px', alignItems: 'start' }}>

          {/* Left: headline + sub + CTA */}
          <div>
            <Reveal>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 'clamp(52px, 5.5vw, 72px)', fontWeight: 400,
                lineHeight: 1.0, letterSpacing: '-0.03em',
                color: 'var(--ink)', margin: 0,
              }}>
                Route every<br />
                LLM call.<br />
                <em style={{ color: 'var(--accent)' }}>Cut the waste.</em>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 28, maxWidth: 420 }}>
                One proxy intercepts every AI call — observed, governed, cost-optimised.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div style={{ marginTop: 36 }}>
                <Button variant="primary" size="lg" href="/register">Start free</Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div style={{ marginTop: 20, display: 'flex', gap: 24 }}>
                {['No credit card', 'SOC 2 Type II', '5-min setup'].map((t, i) => (
                  <span key={i} className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '.04em' }}>{t}</span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: product preview */}
          <Reveal delay={180}>
            <HeroPreview />
          </Reveal>

        </div>
      </Container>
    </section>
  );
}

function HeroPreview() {
  // Animated sparkline data for live feel
  const sp = [14,18,16,22,20,26,24,30,28,36,32,38];
  const spSaved = [4,6,8,10,14,16,20,22,26,28,32,34];
  const W = 420, H = 80;
  const max = Math.max(...sp);
  const pathFor = (data, color) => {
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`);
    return pts.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(' ');
  };
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line-2)',
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 24px 64px -12px rgba(14,14,16,.10), 0 0 0 1px var(--line)',
    }}>
      {/* Browser chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
        borderBottom: '1px solid var(--line)', background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: c, opacity: .8 }} />
          ))}
        </div>
        <div style={{
          flex: 1, maxWidth: 240, margin: '0 auto',
          background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 6,
          padding: '4px 10px', textAlign: 'center',
        }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>app.margexa.io/dashboard</span>
        </div>
        <div style={{ width: 52 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '192px 1fr', minHeight: 520 }}>
        {/* Sidebar */}
        <aside style={{ background: 'var(--bg)', borderRight: '1px solid var(--line)', padding: '14px 10px' }}>
          {/* Workspace pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 7, marginBottom: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', flex: 1 }}>Acme Corp</span>
            <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="var(--ink-4)" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
          </div>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-5)', padding: '0 8px 6px' }}>Workspace</div>
          {[
            { l: 'Dashboard', active: true, dot: 'var(--accent)' },
            { l: 'AI Gateway', dot: 'var(--success)' },
            { l: 'Policies' },
            { l: 'Prompts' },
            { l: 'Leak detection', dot: 'var(--warning)' },
            { l: 'Analytics' },
          ].map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 6, marginBottom: 1,
              background: it.active ? 'var(--surface-2)' : 'transparent',
              border: `1px solid ${it.active ? 'var(--line)' : 'transparent'}`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: it.dot ?? 'var(--ink-5)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: it.active ? 'var(--ink)' : 'var(--ink-3)', fontWeight: it.active ? 500 : 400 }}>{it.l}</span>
            </div>
          ))}
        </aside>

        {/* Main content */}
        <div style={{ padding: 22, background: 'var(--bg)' }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 4 }}>Last 30 days</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>AI spend overview</div>
            </div>
            <Badge tone="success" dot>Saving 38%</Badge>
          </div>

          {/* KPI bande — Instrument Serif */}
          <div style={{
            display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 10, overflow: 'hidden', marginBottom: 16,
          }}>
            {[
              { k: 'Total spend', v: '$12,480', d: '-38%', dc: 'var(--success)' },
              { k: 'Saved', v: '$7,642', d: '+28%', dc: 'var(--success)' },
              { k: 'Requests', v: '1.28M', d: '+12%', dc: 'var(--accent)' },
              { k: 'Avg / req', v: '$0.0097', d: '-44%', dc: 'var(--success)' },
            ].map((c, i) => (
              <div key={i} style={{
                flex: 1, padding: '14px 16px',
                borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
              }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>{c.k}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)', marginBottom: 6 }}>{c.v}</div>
                <div className="mono" style={{ fontSize: 10, color: c.dc }}>{c.d}</div>
              </div>
            ))}
          </div>

          {/* Spend chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>Spend by provider</span>
              <div style={{ display: 'flex', gap: 12 }} className="mono">
                {[{ l: 'OpenAI', c: '#5B5BD6' }, { l: 'Anthropic', c: '#B97A0B' }, { l: 'Gemini', c: '#0E9F6E' }].map((p) => (
                  <span key={p.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--ink-4)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: 3, background: p.c }} />{p.l}
                  </span>
                ))}
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="hpGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#5B5BD6" stopOpacity=".18"/>
                  <stop offset="1" stopColor="#5B5BD6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[0.33, 0.66].map((p) => (
                <line key={p} x1="0" x2={W} y1={H * p} y2={H * p} stroke="var(--line)" strokeDasharray="2 4" />
              ))}
              <path d={`${pathFor(sp, '#5B5BD6')} L${W},${H} L0,${H} Z`} fill="url(#hpGrad)" />
              <path d={pathFor(sp, '#5B5BD6')} fill="none" stroke="#5B5BD6" strokeWidth="1.5" style={{ animation: 'chartIn .9s both' }} />
              <path d={pathFor(spSaved.map((v, i) => v + sp[i] * 0.4), '#B97A0B')} fill="none" stroke="#B97A0B" strokeWidth="1" opacity=".6" />
              <style>{`@keyframes chartIn { from{opacity:0} to{opacity:1} }`}</style>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiAreaChart() {
  const data = [
    { o: 20, a: 12, g: 6,  m: 4 },
    { o: 22, a: 14, g: 7,  m: 4 },
    { o: 18, a: 16, g: 8,  m: 5 },
    { o: 16, a: 18, g: 10, m: 6 },
    { o: 14, a: 20, g: 12, m: 7 },
    { o: 12, a: 22, g: 14, m: 8 },
    { o: 11, a: 24, g: 16, m: 9 },
    { o: 13, a: 22, g: 18, m: 10 },
    { o: 12, a: 26, g: 20, m: 11 },
    { o: 10, a: 28, g: 22, m: 13 },
    { o: 11, a: 30, g: 24, m: 14 },
    { o: 9,  a: 32, g: 26, m: 16 },
  ];
  const W = 820, H = 180;
  const xs = (i) => (i / (data.length - 1)) * W;
  const maxStack = Math.max(...data.map(d => d.o + d.a + d.g + d.m));
  const ys = (v) => H - (v / maxStack) * (H - 12) - 6;

  const layer = (key, colorVar, offsetFn) => {
    const top = data.map((d, i) => [xs(i), ys(offsetFn(d) + d[key])]);
    const bot = data.map((d, i) => [xs(i), ys(offsetFn(d))]).reverse();
    const path = [...top.map(([x,y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)), ...bot.map(([x,y]) => `L${x},${y}`), 'Z'].join(' ');
    const line = top.map(([x,y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
    return { path, line, color: colorVar };
  };

  const L1 = layer('o', 'var(--accent)', () => 0);
  const L2 = layer('a', '#B97A0B', d => d.o);
  const L3 = layer('g', 'var(--success)', d => d.o + d.a);
  const L4 = layer('m', '#8B5CF6', d => d.o + d.a + d.g);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="0" y1={H * p} x2={W} y2={H * p} stroke="var(--line)" strokeDasharray="2 4" />
      ))}
      {[L1, L2, L3, L4].map((L, i) => (
        <g key={i} style={{ animation: `chartFade .9s ${i * 0.12}s both ease-out` }}>
          <path d={L.path} fill={L.color} opacity="0.12" />
          <path d={L.line} fill="none" stroke={L.color} strokeWidth="1.6" />
        </g>
      ))}
      <style>{`@keyframes chartFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </svg>
  );
}

// ─── TRUST / LOGO STRIP
function TrustStrip() {
  const logos = ['NORTHWIND', 'LATTICE', 'MERCURY', 'KIN', 'AETHER', 'OBSIDIAN', 'PARALLEL', 'HALCYON', 'ORBIT', 'VANTAGE'];
  return (
    <section style={{ padding: '64px 0 80px', borderTop: '1px solid var(--line)' }}>
      <Container>
        <Reveal>
          <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 28 }}>
            Trusted by AI teams shipping production systems
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
            {logos.slice(0, 5).map((l, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '24px 16px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--ink-3)', fontSize: 14, letterSpacing: '0.15em' }}>
                {l}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginTop: 1, borderTop: 'none' }}>
            {logos.slice(5).map((l, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '24px 16px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--ink-3)', fontSize: 14, letterSpacing: '0.15em' }}>
                {l}
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// ─── PAIN SECTION — the cost problem
function Pain() {
  return (
    <section style={{ padding: '120px 0' }}>
      <Container max={1100}>
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="h2" style={{ marginTop: 24, color: 'var(--ink)', maxWidth: 820, textWrap: 'balance' }}>
            Your AI bill is up <span className="tnum" style={{ color: 'var(--accent)' }}>340%</span> this year.<br />
            Nobody on your team can tell you exactly why.
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="body-lg" style={{ marginTop: 28, maxWidth: 620 }}>
            Engineers wire prompts directly to OpenAI. Product ships features without budget caps. A new agent loops on GPT-4 for a week before anyone notices. Finance sees the invoice on the 5th of the next month.
          </p>
        </Reveal>

        <Reveal delay={320}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginTop: 64 }}>
            {[
              { stat: '0%', sub: 'prompt attribution', k: 'No visibility', v: 'Spend is invisible per team, feature, and prompt. Finance sees the invoice on day 5.' },
              { stat: '∞', sub: 'budget enforcement', k: 'No control', v: 'Anyone with the API key can run GPT-4 at full rate. No caps. No alerts. No guardrails.' },
              { stat: '60%', sub: 'of calls are over-modeled', k: 'No optimisation', v: 'You pay premium for queries a 5× cheaper model would answer just as well.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '32px 28px' }}>
                <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 40, color: '#D97706', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{c.stat}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4, marginBottom: 18 }}>{c.sub}</div>
                <div style={{ height: 1, background: 'var(--line)', marginBottom: 18 }} />
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>{c.k}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{c.v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

Object.assign(window, { Nav, Hero, HeroPreview, TrustStrip, Pain });
