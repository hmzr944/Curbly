/* Margexa v2 — AI Gateway page
   Provider health · Routing rules · Live request explorer
*/

const { useEffect, useRef, useState } = React;

// ─── Provider health card
function ProviderCard({ p }) {
  const statusC = { healthy: 'var(--success)', degraded: 'var(--warning)', down: 'var(--danger)' }[p.status];
  const statusBg = { healthy: 'var(--success-tint)', degraded: 'var(--warning-tint)', down: 'var(--danger-tint)' }[p.status];
  return (
    <Spotlight>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, background: p.c,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16,
            }}>{p.n[0]}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{p.n}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>{p.region}</div>
            </div>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 8px', borderRadius: 99,
            background: statusBg, color: statusC,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase',
          }}>
            <PulseDot color={statusC} size={5} />{p.status}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>p50</div>
            <div className="tnum mono" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{p.p50}ms</div>
          </div>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>Error rate</div>
            <div className="tnum mono" style={{ fontSize: 14, color: p.err > 1 ? 'var(--danger)' : 'var(--ink)', fontWeight: 500 }}>{p.err}%</div>
          </div>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>Today</div>
            <div className="tnum mono" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{p.req}</div>
          </div>
        </div>
        <Spark data={p.sp} width={280} height={28} color={statusC} fill />
      </div>
    </Spotlight>
  );
}

// ─── Routing rule row (drag-to-reorder, visual)
function RuleRow({ rule, n, dim }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 14px',
        borderTop: '1px solid var(--line)',
        background: hover ? 'var(--surface-2)' : 'transparent',
        transition: 'background .12s',
        opacity: dim ? .55 : 1,
      }}>
      {/* drag handle */}
      <span style={{
        cursor: 'grab', color: hover ? 'var(--ink-3)' : 'var(--ink-5)', flexShrink: 0,
        display: 'inline-flex', flexDirection: 'column', gap: 1,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="3" cy="3" r="1" fill="currentColor"/><circle cx="7" cy="3" r="1" fill="currentColor"/><circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>
      </span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', width: 24, letterSpacing: '.05em' }}>#{String(n).padStart(2, '0')}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{rule.label}</span>
        <span style={{ height: 16, width: 1, background: 'var(--line-2)' }} />
        <span className="mono" style={{
          fontSize: 11, padding: '2px 8px', background: 'var(--surface-2)',
          border: '1px solid var(--line)', borderRadius: 4, color: 'var(--ink-2)',
        }}>{rule.from}</span>
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M1 5h11m-3-3l3 3-3 3" stroke="var(--accent)" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
        <span className="mono" style={{
          fontSize: 11, padding: '2px 8px', background: 'var(--accent-tint)',
          border: '1px solid var(--accent-soft)', borderRadius: 4, color: 'var(--accent)', fontWeight: 500,
        }}>{rule.to}</span>
        {rule.cond && (
          <>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>WHEN</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{rule.cond}</span>
          </>
        )}
      </div>

      <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-4)', width: 80, textAlign: 'right' }}>
        {rule.calls.toLocaleString()} calls
      </span>
      <span className="mono tnum" style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 500, width: 70, textAlign: 'right' }}>
        −${rule.saved}
      </span>
      <button style={{
        width: 30, height: 22, borderRadius: 11, position: 'relative',
        background: rule.on ? 'var(--accent)' : 'var(--surface-2)',
        border: '1px solid', borderColor: rule.on ? 'var(--accent)' : 'var(--line-2)',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: rule.on ? 12 : 2, width: 14, height: 14, borderRadius: 7,
          background: '#fff', transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.15)',
        }} />
      </button>
    </div>
  );
}

// ─── Map API live-request → RequestExplorer row shape
function apiReqToRow(r) {
  const from = r.requested ?? 'unknown';
  const to   = r.routed   ?? r.requested ?? 'unknown';
  return {
    id:   '#' + String(r.id ?? '').slice(-6),
    t:    r.time ?? new Date().toLocaleTimeString('en-GB'),
    src:  r.feature ?? r.workflow ?? r.customer ?? 'api',
    from,
    to,
    tok:  r.tokens ?? 0,
    lat:  r.latency_ms ?? 0,
    cost: r.cost ?? 0,
    st:   r.ok === false ? 'err' : ((r.latency_ms ?? 0) > 3000 ? 'slow' : 'ok'),
  };
}

// ─── Live request explorer (streaming table, polls /api/analytics/live-requests)
function RequestExplorer() {
  const seed = [
    { id: '#8a2k6f', t: '—', src: '—', from: '—', to: '—', tok: 0, lat: 0, cost: 0, st: 'ok' },
  ];
  const [items, setItems] = useState(seed);
  useEffect(() => {
    const url = window.MARGEXA?.routes?.liveRequests;
    if (!url) return;
    const poll = () => {
      fetch(url, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
        .then((r) => r.ok ? r.json() : null)
        .then((json) => {
          if (!json) return;
          const list = Array.isArray(json) ? json : (json.data ?? []);
          if (list.length > 0) setItems(list.map(apiReqToRow));
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Request explorer"
          sub="Live stream of last 10 routed calls"
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{
                padding: '5px 10px', fontSize: 11, background: 'var(--surface)', color: 'var(--ink-2)',
                border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer',
              }}>Filter</button>
              <button style={{
                padding: '5px 10px', fontSize: 11, background: 'var(--surface)', color: 'var(--ink-2)',
                border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer',
              }}>Export</button>
            </div>
          } />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['ID', 'Time', 'Source', 'Requested', 'Routed', 'Tokens', 'Latency', 'Cost', ''].map((h, i) => (
                  <th key={h} className="mono" style={{
                    textAlign: i > 4 ? 'right' : 'left', padding: '8px 8px',
                    fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={r.id + i} style={{
                  borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--line)',
                  animation: i === 0 ? 'rowFlash .35s var(--ease-out) both' : 'none',
                }}>
                  <td className="mono" style={{ padding: '10px 8px', color: 'var(--accent)', cursor: 'pointer' }}>{r.id}</td>
                  <td className="mono" style={{ padding: '10px 8px', color: 'var(--ink-4)' }}>{r.t}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--ink-2)' }}>{r.src}</td>
                  <td className="mono" style={{ padding: '10px 8px', color: 'var(--ink-3)' }}>{r.from}</td>
                  <td className="mono" style={{ padding: '10px 8px', color: r.from !== r.to ? 'var(--accent)' : 'var(--ink-3)', fontWeight: r.from !== r.to ? 500 : 400 }}>
                    {r.from !== r.to && '→ '}{r.to}
                  </td>
                  <td className="mono tnum" style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--ink-2)' }}>{r.tok.toLocaleString()}</td>
                  <td className="mono tnum" style={{ padding: '10px 8px', textAlign: 'right', color: r.st === 'slow' ? 'var(--warning)' : 'var(--ink-2)' }}>{r.lat}ms</td>
                  <td className="mono tnum" style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--ink)', fontWeight: 500 }}>${r.cost.toFixed(4)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <a href="#" style={{ fontSize: 11, color: 'var(--ink-4)', textDecoration: 'none' }}>↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <style>{`@keyframes rowFlash { from{background:var(--accent-tint)} to{background:transparent} }`}</style>
      </div>
    </Spotlight>
  );
}

// ─── Provider color / region meta keyed by provider id
const PROVIDER_META = {
  openai:    { c: '#0E0E10', region: 'global',    sp: [12,14,13,16,15,14,17,18,16,17,18,20] },
  anthropic: { c: '#B97A0B', region: 'us-east',   sp: [22,20,24,22,26,25,28,27,30,32,30,34] },
  google:    { c: '#5B5BD6', region: 'global',    sp: [10,12,14,16,18,22,28,32,34,30,28,32] },
  mistral:   { c: '#8B5CF6', region: 'eu-west',   sp: [8,7,9,8,10,12,11,12,14,12,13,15]    },
  bedrock:   { c: '#0E9F6E', region: 'us-east',   sp: [16,14,18,16,20,18,22,20,24,22,25,24] },
  custom:    { c: 'var(--ink-3)', region: 'self', sp: [4,5,4,6,5,7,6,8,7,9,8,10]           },
};
const PROVIDER_FALLBACK = [
  { n: 'OpenAI',    region: 'global · —',   status: 'healthy', p50: 0, err: 0, req: '—', c: '#0E0E10', sp: [12,14,13,16,15,14,17,18,16,17,18,20] },
  { n: 'Anthropic', region: 'us-east · —',  status: 'healthy', p50: 0, err: 0, req: '—', c: '#B97A0B', sp: [22,20,24,22,26,25,28,27,30,32,30,34] },
];

// ─── Gateway page
function GatewayPage() {
  const [providers, setProviders] = useState(null); // null = loading
  useEffect(() => {
    const url = window.MARGEXA?.routes?.providers;
    if (!url) { setProviders([]); return; }
    fetch(url, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json || !Array.isArray(json)) { setProviders([]); return; }
        const mapped = json.map((p) => {
          const meta = PROVIDER_META[p.id] ?? { c: 'var(--ink-3)', region: 'unknown', sp: [] };
          return {
            n:      p.label ?? p.id,
            region: meta.region,
            status: p.connected ? 'healthy' : 'down',
            p50:    0,
            err:    0,
            req:    '—',
            c:      meta.c,
            sp:     meta.sp,
            connected: p.connected,
          };
        });
        setProviders(mapped);
      })
      .catch(() => setProviders([]));
  }, []);
  const rules = [
    { label: 'Cost-optimal · marketing', from: 'gpt-4o', to: 'claude-haiku', cond: 'team=marketing', calls: 8420, saved: 184, on: true },
    { label: 'Quality preserved · agent', from: 'gpt-4o', to: 'claude-sonnet-4', cond: 'feature=agent', calls: 4210, saved: 92, on: true },
    { label: 'Failover · OpenAI down', from: 'gpt-4o', to: 'claude-sonnet-4', cond: 'provider=down', calls: 312, saved: 18, on: true },
    { label: 'Long context · codegen', from: 'gpt-4o', to: 'gemini-flash', cond: 'tokens>50k', calls: 1840, saved: 64, on: true },
    { label: 'Embedding cache', from: 'text-embedding-3', to: 'cache', cond: 'cached=true', calls: 24800, saved: 124, on: true },
    { label: 'Budget guard · sales', from: 'any', to: 'gpt-4o-mini', cond: 'budget>80%', calls: 0, saved: 0, on: false },
  ];

  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Routing engine</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1,
            margin: 0, color: 'var(--ink)',
          }}>AI Gateway</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Provider routing, fallbacks and health</span>
            {providers !== null && providers.filter((p) => !p.connected).length > 0 && (
              <Badge tone="warning" dot>
                {providers.filter((p) => !p.connected).length} not connected
              </Badge>
            )}
            {providers !== null && providers.every((p) => p.connected) && providers.length > 0 && (
              <Badge tone="success" dot>All providers healthy</Badge>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}>
            Add provider
          </Button>
          <Button variant="primary" size="sm" icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}>
            New routing rule
          </Button>
        </div>
      </div>

      {/* Top KPIs — horizontal strip */}
      <div style={{
        display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {[
          { k: 'Requests today', v: 658293, d: 14, suf: '', color: 'var(--ink)' },
          { k: 'Routed', v: 38, suf: '%', d: 6, color: 'var(--accent)' },
          { k: 'Latency overhead', v: 2.8, dec: 1, suf: 'ms', d: -8, color: 'var(--success)' },
          { k: 'Failovers · 24h', v: 12, suf: '', color: 'var(--warning)' },
        ].map((c, i) => (
          <div key={i} style={{
            flex: 1, padding: '20px 24px',
            borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 12 }}>{c.k}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 34, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)', marginBottom: 8 }}>
              <CountUp to={c.v} decimals={c.dec || 0} />{c.suf}
            </div>
            {c.d != null && (
              <div className="mono" style={{ fontSize: 11, color: c.d < 0 || (c.d > 0 && c.k !== 'Failovers · 24h') ? 'var(--success)' : 'var(--ink-4)' }}>
                {c.d > 0 ? '+' : ''}{c.d}% vs yesterday
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ height: 12 }} />

      {/* Providers — list with status dots, no cards */}
      <Spotlight>
        <div style={{ padding: '20px 22px 0' }}>
          <SectionHead title="Provider health" sub="Real-time status" action={
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge tone="success" dot>Live</Badge>
            </div>
          } />
        </div>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr 90px 80px 80px 100px 60px', gap: 16, padding: '8px 22px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          {['', 'Provider', 'Region', 'p50', 'Errors', 'Reqs today', ''].map((h, i) => (
            <span key={i} className="mono" style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', textAlign: i > 1 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {providers === null ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
        ) : providers.length === 0 ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
            No providers configured — connect a provider in onboarding or settings.
          </div>
        ) : providers.map((p, i) => {
          const statusColor = { healthy: 'var(--success)', degraded: 'var(--warning)', down: 'var(--danger)' }[p.status] ?? 'var(--ink-4)';
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '10px 1fr 90px 80px 80px 100px 60px',
              gap: 16, alignItems: 'center', minHeight: 52, padding: '0 22px',
              borderTop: '1px solid var(--line)',
              transition: 'background .12s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: statusColor, flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: p.c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, flexShrink: 0 }}>{p.n[0]}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{p.n}</div>
                  {!p.connected && (
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1 }}>not connected</div>
                  )}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'right' }}>{p.region ?? '—'}</span>
              <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink-2)', textAlign: 'right' }}>{p.p50 > 0 ? `${p.p50}ms` : '—'}</span>
              <span className="mono tnum" style={{ fontSize: 12, color: p.err > 1 ? 'var(--danger)' : 'var(--ink-3)', textAlign: 'right' }}>{p.err > 0 ? `${p.err}%` : '—'}</span>
              <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink-2)', textAlign: 'right' }}>{p.req !== '—' && p.req > 0 ? Number(p.req).toLocaleString() : p.req}</span>
              <div style={{ textAlign: 'right' }}>
                <Spark data={p.sp} width={60} height={20} color={statusColor} />
              </div>
            </div>
          );
        })}
        <div style={{ height: 8 }} />
      </Spotlight>

      <div style={{ height: 12 }} />

      {/* Rules list */}
      <Spotlight>
        <div style={{ padding: '22px 22px 0' }}>
          <SectionHead
            title="Routing rules"
            sub="Evaluated top to bottom · drag to reorder priority"
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge tone="success" dot>5 active</Badge>
                <Badge tone="outline">1 paused</Badge>
              </div>
            } />
        </div>
        <div>
          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 14px', background: 'var(--bg)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <span style={{ width: 10 }} />
            <span className="mono" style={{ width: 24, fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase' }}>#</span>
            <span className="mono" style={{ flex: 1, fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Rule</span>
            <span className="mono" style={{ width: 80, fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'right' }}>Calls</span>
            <span className="mono" style={{ width: 70, fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'right' }}>Saved</span>
            <span style={{ width: 30 }} />
          </div>
          {rules.map((r, i) => <RuleRow key={i} rule={r} n={i + 1} dim={!r.on} />)}
        </div>
      </Spotlight>

      <div style={{ height: 12 }} />

      <RequestExplorer />
    </Stagger>
  );
}

Object.assign(window, { GatewayPage });
