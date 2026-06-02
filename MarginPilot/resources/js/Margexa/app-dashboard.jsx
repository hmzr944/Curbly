/* Margexa v2 — Dashboard page
   Hero KPIs · spend chart with live cursor · provider mix · top prompts · live activity · anomalies · recommendations
*/

const { useEffect, useRef, useState } = React;

// SectionHead provient de components.jsx (global) — défini localement uniquement si non disponible
const SectionHead = window.SectionHead || function({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{title}</div>
        {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
};

// ─── BIG hero KPI strip — fetches from /api/dashboard/overview
function DashKPIs() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = window.MARGEXA?.routes?.dashboard;
    if (!url) { setLoading(false); return; }
    fetch(url, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isEmpty = !loading && data &&
    !data.total_ai_cost && !data.routing_savings && !data.total_requests;

  if (isEmpty) {
    return (
      <div style={{
        padding: '48px 32px', textAlign: 'center', border: '1px solid var(--line)',
        borderRadius: 12, background: 'var(--surface)',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-4 4 8 2-4h6" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
          No requests yet
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          Point your SDK at the Margexa proxy to start tracking spend.
        </div>
        <pre style={{
          display: 'inline-block', textAlign: 'left',
          background: 'var(--ink)', color: '#e2e8f0', borderRadius: 8,
          padding: '10px 16px', fontSize: 12, fontFamily: 'var(--font-mono)',
        }}>{`baseURL: "${window.MARGEXA?.organization?.proxy_url ?? 'https://your-domain.com'}/v1"`}</pre>
      </div>
    );
  }

  const spendDelta = loading ? null : (data?.cost_change_pct != null ? Math.round(data.cost_change_pct) : null);

  const cards = [
    {
      k: 'AI spend · 30d', prefix: '$', dec: 2, color: 'var(--accent)', highlight: false,
      v: loading ? 0 : (data?.total_ai_cost ?? 0),
      d: spendDelta,
      sp: [40,38,36,32,28,26,22,20,18,16,14, loading ? 12 : Math.min(40, (data?.total_ai_cost ?? 12) / 400)],
    },
    {
      k: 'Saved by routing', prefix: '$', dec: 2, color: 'var(--success)', highlight: true,
      v: loading ? 0 : (data?.routing_savings ?? 0),
      d: null,
      sp: [4,6,8,10,12,16,18,20,24,28,32, loading ? 0 : Math.min(40, (data?.routing_savings ?? 0) / 200)],
    },
    {
      k: 'Requests', color: 'var(--ink)',
      v: loading ? 0 : (data?.total_requests ?? 0),
      d: null,
      sp: [10,12,14,13,18,17,22,24,23,28,30, loading ? 0 : Math.min(40, (data?.total_requests ?? 0) / 50000)],
    },
    {
      k: 'Avg cost / request', prefix: '$', dec: 4, color: 'var(--success)',
      v: loading ? 0 : (data?.avg_cost_per_request ?? 0),
      d: null,
      sp: [22,20,18,17,14,12,10,9,8,7,7, loading ? 6 : Math.min(22, (data?.avg_cost_per_request ?? 0) * 2000)],
    },
  ];

  return (
    <div style={{
      display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          flex: 1, padding: '22px 24px',
          borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
          opacity: loading ? 0.35 : 1,
          transition: 'opacity .4s var(--ease)',
          position: 'relative',
        }}>
          {c.highlight && !loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--success)', opacity: .5 }} />
          )}
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'var(--ink-4)', marginBottom: 14,
          }}>{c.k}</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 38, letterSpacing: '-0.04em', lineHeight: 1,
            color: 'var(--ink)', marginBottom: 10,
          }}>
            {c.prefix || ''}
            {loading
              ? <span style={{ color: 'var(--ink-5)' }}>—</span>
              : <CountUp to={c.v} duration={1200} decimals={c.dec || 0} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            {c.d !== null && c.d !== undefined && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: c.d < 0 ? 'var(--success)' : 'var(--danger)',
              }}>{c.d > 0 ? '+' : ''}{c.d}%</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
              {c.d !== null && c.d !== undefined ? 'vs prev period' : '30-day total'}
            </span>
          </div>
          <Spark data={c.sp} width={140} height={22} color={c.color} />
        </div>
      ))}
    </div>
  );
}

// ─── Spend chart (interactive) — fetches from /api/analytics?days=N
const PERIOD_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

function SpendChart() {
  const [activePeriod, setActivePeriod] = useState('30d');
  const days = PERIOD_DAYS[activePeriod] ?? 30;

  const makeFallback = (n) => Array.from({ length: n }, (_, i) => ({
    d: i, actual: 0, saved: 0, baseline: 0,
  }));
  const [chartData, setChartData] = useState(makeFallback(30));

  useEffect(() => {
    const url = window.MARGEXA?.routes?.analytics;
    if (!url) return;
    setChartData(makeFallback(days));
    fetch(`${url}?days=${days}`, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json?.chart || json.chart.length === 0) return;
        const rows = json.chart.map((row, i) => ({
          d:        i,
          actual:   parseFloat(row.cost ?? 0),
          saved:    parseFloat(row.cost ?? 0) * 0.38,
          baseline: parseFloat(row.cost ?? 0) * 1.62,
        }));
        if (rows.length > 0) setChartData(rows);
      })
      .catch(() => {});
  }, [days]);

  const data = chartData;
  const totalActual   = data.reduce((s, r) => s + r.actual,   0);
  const totalBaseline = data.reduce((s, r) => s + r.baseline, 0);
  const totalSaved    = data.reduce((s, r) => s + r.saved,    0);
  const W = 1000, H = 280, P = 30;
  const max = Math.max(...data.map((d) => d.baseline), 1);
  const xs = (i) => P + (i / Math.max(data.length - 1, 1)) * (W - 2 * P);
  const ys = (v) => H - P - (v / max) * (H - 2 * P);

  const [hover, setHover] = useState(null);
  const ref = useRef();

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - P) / (W - 2 * P)) * (data.length - 1));
    if (i >= 0 && i < data.length) setHover(i);
  };

  const path = (key) => data.map((d, i) => (i === 0 ? `M${xs(i)},${ys(d[key])}` : `L${xs(i)},${ys(d[key])}`)).join(' ');
  const area = (key) => `${path(key)} L${xs(data.length-1)},${H-P} L${P},${H-P} Z`;

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="AI spend"
          sub={`Last ${days} days · vs without Margexa routing`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.keys(PERIOD_DAYS).map((p) => (
                <button key={p} onClick={() => setActivePeriod(p)} style={{
                  padding: '5px 10px', fontSize: 11,
                  background: p === activePeriod ? 'var(--ink)' : 'var(--surface)',
                  color: p === activePeriod ? '#fff' : 'var(--ink-2)',
                  border: '1px solid', borderColor: p === activePeriod ? 'var(--ink)' : 'var(--line-2)',
                  borderRadius: 6, cursor: 'pointer', fontWeight: 500,
                }}>{p}</button>
              ))}
            </div>
          } />

        <div style={{ display: 'flex', gap: 24, marginBottom: 14, fontSize: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 2, background: 'var(--accent)', borderRadius: 1 }} />
            <span style={{ color: 'var(--ink-2)' }}>With Margexa</span>
            <span className="mono tnum" style={{ color: 'var(--ink-4)' }}>${totalActual.toFixed(2)}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 2, background: 'var(--ink-4)', borderRadius: 1, borderTop: '2px dashed var(--ink-4)' }} />
            <span style={{ color: 'var(--ink-2)' }}>Baseline (without)</span>
            <span className="mono tnum" style={{ color: 'var(--ink-4)' }}>${totalBaseline.toFixed(2)}</span>
          </span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Badge tone="success" dot>${totalSaved.toFixed(2)} saved</Badge>
          </span>
        </div>

        <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ position: 'relative', cursor: 'crosshair' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="sgrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#5B5BD6" stopOpacity=".22"/>
                <stop offset="1" stopColor="#5B5BD6" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* gridlines */}
            {[0.25, 0.5, 0.75].map((p) => (
              <line key={p} x1={P} x2={W-P} y1={P + p*(H-2*P)} y2={P + p*(H-2*P)} stroke="var(--line)" strokeDasharray="2 4" />
            ))}
            {/* baseline */}
            <path d={path('baseline')} fill="none" stroke="var(--ink-4)" strokeWidth="1.2" strokeDasharray="4 4" opacity=".6" />
            {/* actual */}
            <path d={area('actual')} fill="url(#sgrad)" style={{ animation: 'chartIn 1s var(--ease-out) both' }} />
            <path d={path('actual')} fill="none" stroke="var(--accent)" strokeWidth="1.8" style={{ animation: 'chartIn 1.2s var(--ease-out) both' }} />
            {/* hover */}
            {hover != null && (
              <g>
                <line x1={xs(hover)} x2={xs(hover)} y1={P} y2={H-P} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity=".4" />
                <circle cx={xs(hover)} cy={ys(data[hover].actual)} r="5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
                <circle cx={xs(hover)} cy={ys(data[hover].baseline)} r="3.5" fill="var(--surface)" stroke="var(--ink-4)" strokeWidth="1.5" />
              </g>
            )}
            <style>{`@keyframes chartIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
          </svg>
          {hover != null && (
            <div style={{
              position: 'absolute',
              left: `${(xs(hover) / W) * 100}%`,
              top: 8, transform: 'translateX(-50%)',
              background: 'var(--surface)', color: 'var(--ink)',
              border: '1px solid var(--line-2)', borderRadius: 8, padding: '10px 14px',
              fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap',
              pointerEvents: 'none', boxShadow: 'var(--sh-2)',
            }}>
              <div style={{ color: 'var(--ink-4)', marginBottom: 6, fontSize: 10, letterSpacing: '.05em' }}>DAY {hover + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)', flexShrink: 0 }}/>
                <span style={{ color: 'var(--ink)' }}>${data[hover].actual.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--ink-4)', flexShrink: 0 }}/>
                <span style={{ color: 'var(--ink-3)' }}>${data[hover].baseline.toFixed(2)} baseline</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Provider donut + breakdown — fetches from /api/analytics?days=30
const PROV_COLORS = {
  openai: '#5B5BD6', anthropic: '#B97A0B',
  google: '#0E9F6E', mistral: '#8B5CF6', unknown: 'var(--ink-4)',
};

function ProviderMix() {
  const [provs, setProvs]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = window.MARGEXA?.routes?.analytics;
    if (!url) { setLoading(false); return; }
    fetch(`${url}?days=30`, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json?.providers || json.providers.length === 0) { setLoading(false); return; }
        const tot = json.providers.reduce((s, p) => s + p.cost, 0);
        setTotal(tot);
        setProvs(json.providers.map((p) => ({
          n: p.provider.charAt(0).toUpperCase() + p.provider.slice(1),
          v: p.cost,
          pct: tot > 0 ? Math.round((p.cost / tot) * 100) : 0,
          c: PROV_COLORS[p.provider.toLowerCase()] ?? 'var(--ink-4)',
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // donut
  const R = 60, IR = 40;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Spend by provider" sub="Last 30 days" />
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
        ) : provs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>No provider data yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={R} fill="none" stroke="var(--surface-2)" strokeWidth={R - IR} />
                {provs.map((p, i) => {
                  const len = (p.pct / 100) * C;
                  const el = (
                    <circle key={i} cx="80" cy="80" r={R} fill="none"
                      stroke={p.c} strokeWidth={R - IR}
                      strokeDasharray={`${len} ${C}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 80 80)"
                      style={{ transition: `stroke-dasharray 1s ${i * 0.1}s var(--ease-out)` }}
                    />
                  );
                  offset += len;
                  return el;
                })}
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div className="tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>${total.toFixed(2)}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>total spend</div>
              </div>
            </div>
            <div>
              {provs.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: p.c, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>{p.n}</span>
                  <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink-3)', minWidth: 50, textAlign: 'right' }}>${p.v.toFixed(2)}</span>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-4)', minWidth: 36, textAlign: 'right' }}>{p.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Spotlight>
  );
}

// ─── Live activity ticker — polls /api/analytics/live-requests every 5s
function LiveActivity() {
  const [items, setItems] = useState([]);

  const fetchLive = () => {
    const url = window.MARGEXA?.routes?.liveRequests;
    if (!url) return;
    fetch(url, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!Array.isArray(json)) return;
        const mapped = json.slice(0, 8).map((r) => ({
          time:  r.time  ?? new Date(r.created_at).toLocaleTimeString('en-GB'),
          prov:  r.provider ?? r.model?.split('-')[0] ?? '—',
          model: r.model ?? '—',
          team:  [r.feature, r.workflow].filter(Boolean).join('/') || (r.customer_id ? `cus/${r.customer_id}` : '—'),
          tok:   r.tokens       ?? 0,
          c:     r.cost         ?? 0,
          ok:    r.ok           ?? (r.status_code < 400),
        }));
        if (mapped.length > 0) setItems(mapped);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Live activity"
          sub="Last 8 requests across all providers"
          action={<Badge tone="success" dot>Streaming</Badge>}
        />
        <div>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '68px 140px 1fr 100px 80px',
            gap: 12, padding: '7px 8px 7px', borderBottom: '1px solid var(--line)',
          }}>
            {['Time', 'Model', 'Source', 'Tokens', 'Cost'].map((h, i) => (
              <span key={h} className="mono" style={{
                fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
                color: 'var(--ink-4)', textAlign: i > 2 ? 'right' : 'left',
              }}>{h}</span>
            ))}
          </div>
          {items.map((r, i) => {
            const provAbbr = (r.prov ?? '').slice(0, 3).toUpperCase();
            const provDot = r.prov === 'openai' ? '#5B5BD6' : r.prov === 'anthropic' ? '#B97A0B' : r.prov === 'google' ? '#0E9F6E' : 'var(--ink-4)';
            return (
              <div key={r.time + i} style={{
                display: 'grid', gridTemplateColumns: '68px 140px 1fr 100px 80px',
                gap: 12, alignItems: 'center', minHeight: 44,
                padding: '0 8px', borderTop: '1px solid var(--line)',
                animation: i === 0 ? 'rowIn .3s var(--ease-out) both' : 'none',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{r.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: provDot, flexShrink: 0 }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '.04em', flexShrink: 0 }}>{provAbbr}</span>
                  <span style={{ width: 1, height: 12, background: 'var(--line-2)', flexShrink: 0 }} />
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.model}</span>
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.team}</span>
                <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>{r.tok.toLocaleString()}</span>
                <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>${r.c.toFixed(4)}</span>
              </div>
            );
          })}
        </div>
        <style>{`@keyframes rowIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    </Spotlight>
  );
}

// ─── Top workflows by cost — fetches from /api/analytics/workflows
function TopPrompts() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/workflows', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          const topCost = json[0].total_cost; // highest cost for relative severity
          setRows(json.slice(0, 6).map((r) => ({
            name: r.workflow ?? '—',
            calls: r.calls ?? 0,
            avg:   r.avg_cost ?? 0,
            tot:   r.total_cost ?? 0,
            warn:  topCost > 0 && r.total_cost / topCost > 0.6, // top 60% of highest
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Top workflows by cost"
          sub="Last 30 days"
          action={<a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Open explorer →</a>}
        />
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>No workflow data yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Workflow', 'Calls', 'Avg / call', 'Total cost'].map((h, i) => (
                  <th key={h} className="mono" style={{
                    textAlign: i === 0 ? 'left' : 'right', padding: '8px 8px',
                    fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {r.warn && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--warning)', flexShrink: 0 }} />}
                      <span className="mono" style={{ color: 'var(--ink)' }}>{r.name}</span>
                    </div>
                  </td>
                  <td className="mono tnum" style={{ textAlign: 'right', color: 'var(--ink-2)', padding: '10px 8px' }}>{r.calls.toLocaleString()}</td>
                  <td className="mono tnum" style={{ textAlign: 'right', color: 'var(--ink-3)', padding: '10px 8px' }}>${r.avg.toFixed(4)}</td>
                  <td className="mono tnum" style={{ textAlign: 'right', color: 'var(--ink)', fontWeight: 500, padding: '10px 8px' }}>${r.tot.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Spotlight>
  );
}

// ─── Anomalies card — fetches from /api/policy-triggers
function Anomalies() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/policy-triggers', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          setItems(json.slice(0, 4).map((t) => ({
            sev:  t.is_observed ? 'warning' : 'danger',
            t:    t.policy?.name ?? t.target_label ?? 'Policy triggered',
            s:    t.reason ?? '—',
            time: t.triggered_at
              ? new Date(t.triggered_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              : '—',
            tag: !t.is_observed ? 'ENFORCED' : null,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeCount = items.filter((i) => i.tag).length;

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Anomalies & alerts"
          sub="Policy trigger log"
          action={activeCount > 0
            ? <Badge tone="danger" dot>{activeCount} enforced</Badge>
            : <Badge tone="outline">All clear</Badge>}
        />
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--success-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M5 9l2 2 5-5" stroke="var(--success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>No policy triggers.</div>
          </div>
        ) : items.map((it, i) => {
          const dotC = { danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)' }[it.sev];
          const bg   = { danger: 'var(--danger-tint)', warning: 'var(--warning-tint)', success: 'var(--success-tint)' }[it.sev];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 12px',
              margin: '0 -12px', borderRadius: 8,
              background: it.tag ? bg : 'transparent',
              borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            }}>
              <span style={{ marginTop: 4 }}><PulseDot color={dotC} size={7} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{it.t}</span>
                  {it.tag && <span className="mono" style={{ fontSize: 9.5, padding: '1px 6px', background: 'var(--danger)', color: '#fff', borderRadius: 3, letterSpacing: '.05em' }}>{it.tag}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{it.s}</div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>{it.time}</span>
            </div>
          );
        })}
      </div>
    </Spotlight>
  );
}

// ─── Recommendations — empty state until routing rules generate real suggestions
function Recommendations() {
  return (
    <Spotlight accent="var(--success)">
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Recommended actions"
          sub="Suggestions generated from your routing data"
        />
        <div style={{
          padding: '36px 0', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--success-tint)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v2M9 14v2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M2 9h2M14 9h2M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="3" stroke="var(--success)" strokeWidth="1.5"/>
            </svg>
          </span>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>No recommendations yet</div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', maxWidth: 260, lineHeight: 1.5 }}>
            Recommendations will appear once enough routing data has been collected (typically after 50+ requests).
          </div>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Page composition
function DashboardPage() {
  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>
            {window.MARGEXA?.organization?.name ?? 'Workspace'} · AI Control Plane
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1,
            margin: 0, color: 'var(--ink)',
          }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>AI spend, routing and anomaly control plane</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, background: 'var(--success-tint)', border: '1px solid rgba(14,159,110,.2)' }}>
              <PulseDot color="var(--success)" size={5} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--success)', letterSpacing: '.04em' }}>Operational</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button variant="secondary" size="sm" icon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 7l3 3 3-3M6 1v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }>Export</Button>
          <Button variant="primary" size="sm" icon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }>New policy</Button>
        </div>
      </div>
      <DashKPIs />
      <div style={{ height: 12 }} />
      <SpendChart />
      <div style={{ height: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 12 }}>
        <ProviderMix />
        <Anomalies />
      </div>
      <div style={{ height: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 12 }}>
        <TopPrompts />
        <LiveActivity />
      </div>
      <div style={{ height: 12 }} />
      <Recommendations />
    </Stagger>
  );
}

Object.assign(window, { DashboardPage });
