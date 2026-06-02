/* Margexa v2 — Analytics page
   Advanced trends · breakdown · cohort heatmap · profitability per workflow
*/

const { useEffect, useRef, useState } = React;

// ─── Provider colour palette (by provider id)
const PROVIDER_COLORS = {
  openai: '#5B5BD6', anthropic: '#B97A0B',
  google: '#0E9F6E', mistral: '#8B5CF6', unknown: 'var(--ink-4)',
};

// ─── Time-series chart (multi-line, fetches /api/analytics?days=30)
function TrendChart() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState({});
  const W = 980, H = 240, P = 30;

  useEffect(() => {
    const url = window.MARGEXA?.routes?.analytics;
    if (!url) { setLoading(false); return; }
    fetch(`${url}?days=30`, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json) { setLoading(false); return; }
        if (json.provider_chart?.length > 0) {
          // Build per-provider daily series from {date, provider, cost}[]
          const daySet = new Set();
          const byProv = {};
          json.provider_chart.forEach(({ date, provider, cost }) => {
            daySet.add(date);
            if (!byProv[provider]) byProv[provider] = {};
            byProv[provider][date] = cost;
          });
          const sortedDates = Array.from(daySet).sort();
          const built = Object.entries(byProv).map(([p, dayMap]) => ({
            id:   p,
            name: p.charAt(0).toUpperCase() + p.slice(1),
            c:    PROVIDER_COLORS[p] ?? PROVIDER_COLORS.unknown,
            data: sortedDates.map((d) => dayMap[d] ?? 0),
          }));
          if (built.length > 0) setSeries(built);
        } else if (json.chart?.length > 0) {
          // Fallback: single aggregate series
          setSeries([{
            id: 'total', name: 'Total',
            c: 'var(--accent)',
            data: json.chart.map((r) => r.cost),
          }]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Spend trend by provider" sub="Daily cost · last 30 days" />
        <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
      </div>
    </Spotlight>
  );

  if (series.length === 0) return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Spend trend by provider" sub="Daily cost · last 30 days" />
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 6 }}>No cost data yet</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', maxWidth: 340, margin: '0 auto', lineHeight: 1.5 }}>
            Route your first AI call through your Margexa proxy URL to see spend trends here.
          </div>
        </div>
      </div>
    </Spotlight>
  );

  const days = Math.max(series[0].data.length, 2);
  const visibleData = series.filter((s) => !hidden[s.id]);
  const max = Math.max(...visibleData.flatMap((s) => s.data), 1);
  const xs = (i) => P + (i / (days - 1)) * (W - 2 * P);
  const ys = (v) => H - P - (v / max) * (H - 2 * P);
  const [hover, setHover] = useState(null);
  const ref = useRef();
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - P) / (W - 2 * P)) * (days - 1));
    if (i >= 0 && i < days) setHover(i);
  };
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Spend trend by provider"
          sub="Daily cost · last 30 days"
          action={
            <div style={{ display: 'flex', gap: 4 }}>
              {['7d', '30d', '90d', 'YTD'].map((p) => (
                <button key={p} style={{
                  padding: '5px 10px', fontSize: 11,
                  background: p === '30d' ? 'var(--ink)' : 'var(--surface)', color: p === '30d' ? '#fff' : 'var(--ink-2)',
                  border: '1px solid', borderColor: p === '30d' ? 'var(--ink)' : 'var(--line-2)',
                  borderRadius: 6, cursor: 'pointer', fontWeight: 500,
                }}>{p}</button>
              ))}
            </div>
          } />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
          {series.map((s) => {
            const off = hidden[s.id];
            return (
              <button key={s.id} onClick={() => setHidden({ ...hidden, [s.id]: !off })} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px',
                background: 'transparent', border: '1px solid', borderColor: off ? 'var(--line)' : 'var(--line-2)',
                borderRadius: 6, cursor: 'pointer', fontSize: 12, color: off ? 'var(--ink-4)' : 'var(--ink-2)',
                opacity: off ? .5 : 1,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: off ? 'var(--ink-5)' : s.c }} />
                {s.name}
              </button>
            );
          })}
        </div>
        <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ position: 'relative', cursor: 'crosshair' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
            {[0.25, 0.5, 0.75].map((p, i) => (
              <line key={i} x1={P} x2={W - P} y1={P + p * (H - 2 * P)} y2={P + p * (H - 2 * P)} stroke="var(--line)" strokeDasharray="2 4" />
            ))}
            {visibleData.map((s, i) => {
              const path = s.data.map((v, idx) => (idx === 0 ? `M${xs(idx)},${ys(v)}` : `L${xs(idx)},${ys(v)}`)).join(' ');
              return (
                <g key={s.id} style={{ animation: `tIn 1s ${i * 0.1}s var(--ease-out) both` }}>
                  <path d={path} fill="none" stroke={s.c} strokeWidth="1.8" />
                </g>
              );
            })}
            {hover != null && (
              <g>
                <line x1={xs(hover)} x2={xs(hover)} y1={P} y2={H - P} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity=".4" />
                {visibleData.map((s) => (
                  <circle key={s.id} cx={xs(hover)} cy={ys(s.data[hover])} r="4" fill="var(--surface)" stroke={s.c} strokeWidth="2" />
                ))}
              </g>
            )}
            <style>{`@keyframes tIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
          </svg>
          {hover != null && (
            <div style={{
              position: 'absolute', left: `${(xs(hover) / W) * 100}%`, top: 8,
              transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff',
              borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: 'var(--sh-pop)',
            }}>
              <div style={{ color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>Day {hover + 1}</div>
              {visibleData.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: s.c }} />
                  <span>${s.data[hover].toFixed(0)}</span>
                  <span style={{ color: 'rgba(255,255,255,.5)', marginLeft: 4 }}>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Heatmap: hour × day of week (fetches /api/analytics/heatmap if available,
//     otherwise renders a stable placeholder based on typical SaaS traffic patterns)
function Heatmap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/heatmap', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          setData(json.data); // expect 7×24 normalised values [0..1]
        }
      })
      .catch(() => {}); // fall through to placeholder
  }, []);

  // Deterministic placeholder: weekday business-hours peak, no Math.random()
  const placeholder = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      // Business hours on weekdays
      if (d < 5 && h >= 9 && h <= 18) {
        const peak = (h === 10 || h === 14) ? 0.95 : 0.6 + (d === 2 ? 0.1 : 0);
        return Math.min(1, peak - Math.abs(h - 13) * 0.04);
      }
      // Early morning / late night
      if (h < 6 || h > 21) return 0.05;
      return 0.2;
    })
  );

  const heatData = data ?? placeholder;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Activity heatmap"
          sub="Calls per hour · last 7 days"
          action={<Badge tone="outline">UTC+1 (Paris)</Badge>} />
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 4 }}>
          <div /> {/* spacer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2, fontSize: 9, color: 'var(--ink-4)' }} className="mono">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ textAlign: 'center', visibility: h % 3 === 0 ? 'visible' : 'hidden' }}>{h}h</div>
            ))}
          </div>
          {heatData.map((row, d) => (
            <React.Fragment key={d}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>{days[d]}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
                {row.map((v, h) => (
                  <div key={h} style={{
                    aspectRatio: '1', borderRadius: 3,
                    background: `rgba(91,91,214,${0.05 + v * 0.75})`,
                    border: '1px solid', borderColor: `rgba(91,91,214,${v * 0.2})`,
                    transition: 'transform .1s',
                    cursor: 'pointer',
                  }}
                  title={`${days[d]} ${h}h · ${Math.round(v * 1200)} calls`}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--ink-4)' }} className="mono">
          <span>fewer</span>
          {[0.1, 0.25, 0.45, 0.65, 0.85].map((v, i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(91,91,214,${0.05 + v * 0.75})`, border: '1px solid var(--line)' }} />
          ))}
          <span>more</span>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Stripe connect modal
function StripeConnectModal({ onClose, onConnected }) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);
  const csrf = window.MARGEXA?.csrfToken || '';

  const submit = () => {
    if (!apiKey.trim().startsWith('sk_')) {
      setErr('Key must start with sk_ (live or test).');
      return;
    }
    setSaving(true); setErr(null);
    fetch('/api/stripe/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
      body: JSON.stringify({ stripe_api_key: apiKey.trim() }),
    })
      .then(r => r.json())
      .then(json => {
        setSaving(false);
        if (json.connected) { onConnected(); onClose(); }
        else setErr(json.error ?? 'Connection failed. Check your key and try again.');
      })
      .catch(() => { setSaving(false); setErr('Network error — please try again.'); });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 14,
        padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>Connect Stripe</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 20 }}>
          Margexa will sync your Stripe revenue to calculate per-workflow margins.
          Your key is encrypted at rest and never logged.
        </div>
        <label style={{ fontSize: 12, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Stripe secret key</label>
        <input
          autoFocus
          type="password"
          value={apiKey} onChange={e => setApiKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="sk_live_… or sk_test_…"
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 7,
            border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--ink)',
            outline: 'none', boxSizing: 'border-box', marginBottom: 18, fontFamily: 'var(--font-mono)',
          }} />
        {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', fontSize: 13, border: '1px solid var(--line-2)',
            background: 'var(--surface)', borderRadius: 7, cursor: 'pointer', color: 'var(--ink-2)',
          }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{
            padding: '8px 16px', fontSize: 13, border: 'none',
            background: saving ? 'var(--ink-5)' : '#635BFF', color: '#fff',
            borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500,
          }}>{saving ? 'Connecting…' : 'Connect Stripe'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Workflow profitability table (fetches /api/analytics/workflows)
// Includes Stripe connect + sync controls so the Revenue column shows real data.
function WorkflowProfitability() {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [stripe, setStripe]         = useState(null);   // null=loading, { connected: bool }
  const [syncing, setSyncing]       = useState(false);
  const [syncMsg, setSyncMsg]       = useState(null);
  const [showStripe, setShowStripe] = useState(false);
  const csrf = window.MARGEXA?.csrfToken || '';
  const hdrs = { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf };

  // Load Stripe status + workflow data in parallel
  useEffect(() => {
    fetch('/api/stripe/status', { headers: hdrs })
      .then(r => r.ok ? r.json() : { connected: false })
      .then(json => setStripe(json))
      .catch(() => setStripe({ connected: false }));

    fetch('/api/analytics/workflows', { headers: { 'X-CSRF-TOKEN': csrf } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          setRows(json.map((r) => ({
            wf:     r.workflow ?? '—',
            team:   r.team ?? '—',
            calls:  r.calls ?? 0,
            cost:   r.total_cost ?? 0,
            rev:    r.revenue ?? null,
            margin: r.revenue != null && r.revenue > 0
              ? ((r.revenue - r.total_cost) / r.revenue * 100)
              : null,
            status: (r.revenue ?? 1) <= 0 ? 'danger' : 'success',
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSync = () => {
    setSyncing(true); setSyncMsg(null);
    fetch('/api/stripe/sync', { method: 'POST', headers: hdrs })
      .then(r => r.json())
      .then(json => {
        setSyncing(false);
        if (json.success) {
          setSyncMsg(`Synced ${json.customers?.synced ?? 0} customers · revenue updated`);
          // Reload workflow rows to pick up new revenue figures
          fetch('/api/analytics/workflows', { headers: { 'X-CSRF-TOKEN': csrf } })
            .then(r => r.ok ? r.json() : null)
            .then(json2 => {
              if (Array.isArray(json2)) {
                setRows(json2.map((r) => ({
                  wf:     r.workflow ?? '—',
                  team:   r.team ?? '—',
                  calls:  r.calls ?? 0,
                  cost:   r.total_cost ?? 0,
                  rev:    r.revenue ?? null,
                  margin: r.revenue != null && r.revenue > 0
                    ? ((r.revenue - r.total_cost) / r.revenue * 100)
                    : null,
                  status: (r.revenue ?? 1) <= 0 ? 'danger' : 'success',
                })));
              }
            });
        } else {
          setSyncMsg('Sync failed — check your Stripe key in settings.');
        }
      })
      .catch(() => { setSyncing(false); setSyncMsg('Network error during sync.'); });
  };

  // Stripe connect action in header
  const stripeAction = stripe === null ? null : stripe.connected ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {syncMsg && <span style={{ fontSize: 11.5, color: 'var(--success)' }}>{syncMsg}</span>}
      <button onClick={handleSync} disabled={syncing} style={{
        padding: '5px 12px', fontSize: 11.5, border: '1px solid var(--line-2)',
        background: 'var(--surface)', borderRadius: 6, cursor: syncing ? 'not-allowed' : 'pointer',
        color: syncing ? 'var(--ink-4)' : 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1112 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M14 8l-2-2M14 8l-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {syncing ? 'Syncing…' : 'Sync Stripe'}
      </button>
    </div>
  ) : (
    <button onClick={() => setShowStripe(true)} style={{
      padding: '5px 12px', fontSize: 11.5, border: '1px solid #635BFF33',
      background: '#635BFF11', borderRadius: 6, cursor: 'pointer',
      color: '#635BFF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#635BFF"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/></svg>
      Connect Stripe
    </button>
  );

  const headerSection = (
    <div style={{ padding: '22px 22px 0' }}>
      <SectionHead
        title="Workflow profitability"
        sub="Revenue attributed vs AI cost · last 30 days"
        action={stripeAction ?? <Button variant="secondary" size="sm">Configure attribution</Button>} />
      {stripe && !stripe.connected && (
        <div style={{
          margin: '0 0 16px', padding: '10px 14px', borderRadius: 8,
          background: '#635BFF0D', border: '1px dashed #635BFF44',
          fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#635BFF" style={{ flexShrink: 0 }}><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/></svg>
          <span>Connect Stripe to populate the <strong>Revenue</strong> and <strong>Margin</strong> columns with real billing data.</span>
        </div>
      )}
    </div>
  );

  if (loading) return (
    <Spotlight>
      {showStripe && <StripeConnectModal onClose={() => setShowStripe(false)} onConnected={() => setStripe({ connected: true })} />}
      {headerSection}
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading workflows…</div>
    </Spotlight>
  );

  if (rows.length === 0) return (
    <Spotlight>
      {showStripe && <StripeConnectModal onClose={() => setShowStripe(false)} onConnected={() => setStripe({ connected: true })} />}
      {headerSection}
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
        No workflows tagged yet — add <span className="mono">X-Workflow</span> headers to your API calls.
      </div>
    </Spotlight>
  );

  return (
    <Spotlight>
      {showStripe && <StripeConnectModal onClose={() => setShowStripe(false)} onConnected={() => setStripe({ connected: true })} />}
      {headerSection}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
              {['Workflow', 'Team', 'Calls', 'AI cost', 'Revenue', 'Margin'].map((h, i) => (
                <th key={h} className="mono" style={{
                  textAlign: i < 2 ? 'left' : 'right', padding: '10px 16px',
                  fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: `var(--${r.status})`, flexShrink: 0 }} />
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.wf}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>
                  <span className="mono" style={{ padding: '2px 8px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, fontSize: 11 }}>{r.team}</span>
                </td>
                <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--ink-2)' }}>{r.calls.toLocaleString()}</td>
                <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--ink-3)' }}>${r.cost.toFixed(2)}</td>
                <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--ink-2)' }}>
                  {r.rev != null ? `$${Number(r.rev).toLocaleString()}` : (
                    <span style={{ color: 'var(--ink-5)', fontStyle: 'italic', fontSize: 11 }}>
                      {stripe?.connected ? '—' : 'needs Stripe'}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                  <span className="mono tnum" style={{
                    fontSize: 12, fontWeight: 500,
                    padding: '3px 9px', borderRadius: 99,
                    background: r.margin == null ? 'var(--surface-2)' : r.margin > 90 ? 'var(--success-tint)' : r.margin > 50 ? 'var(--surface-2)' : 'var(--danger-tint)',
                    color: r.margin == null ? 'var(--ink-4)' : r.margin > 90 ? 'var(--success)' : r.margin > 50 ? 'var(--ink-2)' : 'var(--danger)',
                  }}>
                    {r.margin == null ? '—' : r.margin < 0 ? 'unprofitable' : `${r.margin.toFixed(1)}%`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Spotlight>
  );
}

// ─── Cost breakdown sunburst — fetches /api/analytics?days=30 and uses providers array
function CostBreakdown() {
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const url = window.MARGEXA?.routes?.analytics;
    if (!url) { setLoading(false); return; }
    fetch(`${url}?days=30`, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.providers?.length > 0) {
          setBreakdown(json.providers.map((p) => ({
            provider: p.provider,
            label:    p.provider.charAt(0).toUpperCase() + p.provider.slice(1),
            cost:     p.cost,
            reqs:     p.reqs,
            c:        PROVIDER_COLORS[p.provider] ?? PROVIDER_COLORS.unknown,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Cost breakdown" sub="By provider · last 30 days" />
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
      </div>
    </Spotlight>
  );

  if (breakdown.length === 0) return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Cost breakdown" sub="By provider · last 30 days" />
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 6 }}>No requests yet</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
            Send calls through your Margexa proxy to see provider cost breakdown.
          </div>
        </div>
      </div>
    </Spotlight>
  );

  const totalCost = breakdown.reduce((s, p) => s + p.cost, 0);
  const totalLabel = totalCost >= 1000
    ? `$${(totalCost / 1000).toFixed(1)}k`
    : `$${totalCost.toFixed(2)}`;

  let cum = 0;
  const arcs = breakdown.map((p) => {
    const start = totalCost > 0 ? cum / totalCost : 0;
    cum += p.cost;
    const end = totalCost > 0 ? cum / totalCost : 1;
    return { ...p, start, end };
  });

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Cost breakdown" sub="By provider · last 30 days" />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              {arcs.map((p, i) => (
                <SunArc key={i} cx={110} cy={110} ri={70} ro={100} start={p.start} end={p.end} fill={p.c} />
              ))}
              <circle cx="110" cy="110" r="66" fill="var(--surface)" />
              <text x="110" y="106" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill="var(--ink)">{totalLabel}</text>
              <text x="110" y="124" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-4)" letterSpacing=".05em">TOTAL · 30D</text>
            </svg>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>By provider</div>
            {breakdown.map((p, i) => {
              const pct = totalCost > 0 ? Math.round((p.cost / totalCost) * 100) : 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: p.c, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink)' }}>{p.label}</span>
                  <span className="mono tnum" style={{ fontSize: 11.5, color: 'var(--ink-3)', minWidth: 60, textAlign: 'right' }}>${p.cost.toFixed(2)}</span>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-4)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Spotlight>
  );
}

function SunArc({ cx, cy, ri, ro, start, end, fill }) {
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = end * Math.PI * 2 - Math.PI / 2;
  const x0i = cx + ri * Math.cos(a0), y0i = cy + ri * Math.sin(a0);
  const x1i = cx + ri * Math.cos(a1), y1i = cy + ri * Math.sin(a1);
  const x0o = cx + ro * Math.cos(a0), y0o = cy + ro * Math.sin(a0);
  const x1o = cx + ro * Math.cos(a1), y1o = cy + ro * Math.sin(a1);
  const large = (end - start) > 0.5 ? 1 : 0;
  const d = `M${x0o},${y0o} A${ro},${ro} 0 ${large} 1 ${x1o},${y1o} L${x1i},${y1i} A${ri},${ri} 0 ${large} 0 ${x0i},${y0i} Z`;
  return <path d={d} fill={fill} stroke="var(--surface)" strokeWidth="2" />;
}

// ─── Margin at risk — top customers destroying margin (fetches /api/cfo/margin-destroyers)
function MarginDestroyers() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked]   = useState(false); // 403 = entitlement gate

  useEffect(() => {
    fetch('/api/cfo/margin-destroyers?limit=5', {
      headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' },
    })
      .then((r) => {
        if (r.status === 403) { setLocked(true); setLoading(false); return null; }
        return r.ok ? r.json() : null;
      })
      .then((json) => {
        if (!json) { setLoading(false); return; }
        const list = json.data ?? (Array.isArray(json) ? json : []);
        setRows(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const RISK_STYLE = {
    critical: { bg: 'var(--danger-tint)',  c: 'var(--danger)'  },
    high:     { bg: 'var(--warning-tint)', c: 'var(--warning)' },
    moderate: { bg: 'var(--accent-tint)',  c: 'var(--accent)'  },
    low:      { bg: 'var(--surface-2)',    c: 'var(--ink-3)'   },
    unknown:  { bg: 'var(--surface-2)',    c: 'var(--ink-4)'   },
  };

  return (
    <Spotlight>
      <div style={{ padding: '22px 22px 0' }}>
        <SectionHead
          title="Margin at risk"
          sub="Top customers where AI cost exceeds safe % of plan revenue · last 30 days"
          action={<Badge tone="outline">CFO view</Badge>} />
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
      )}

      {!loading && locked && (
        <div style={{ padding: '20px 22px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>CFO reports — Continuous Control plan</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Upgrade to unlock margin analytics, weekly PDF exports and revenue attribution.</div>
          </div>
          <Button variant="primary" size="sm" style={{ marginLeft: 'auto' }}>Upgrade</Button>
        </div>
      )}

      {!loading && !locked && rows.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>
          No margin destroyers detected — customers are within healthy cost/revenue ratios.
        </div>
      )}

      {!loading && !locked && rows.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 4 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
                {['Customer', 'Plan', 'AI cost / mo', 'Revenue', 'Ratio', 'Risk', 'Action'].map((h, i) => (
                  <th key={h} className="mono" style={{
                    textAlign: i > 1 ? 'right' : 'left', padding: '10px 16px',
                    fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const rs = RISK_STYLE[r.risk_level] ?? RISK_STYLE.unknown;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{r.customer_name}</div>
                      {r.external_id && <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 1 }}>{r.external_id}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="mono" style={{ fontSize: 11, padding: '2px 7px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--ink-2)' }}>
                        {r.plan_name ?? '—'}
                      </span>
                    </td>
                    <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--danger)', fontWeight: 500 }}>
                      ${(r.ai_cost ?? 0).toFixed(2)}
                    </td>
                    <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--ink-2)' }}>
                      {r.plan_revenue > 0 ? `$${r.plan_revenue}` : '—'}
                    </td>
                    <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--ink-2)' }}>
                      {r.cost_revenue_ratio_pct != null ? `${r.cost_revenue_ratio_pct}%` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 99, background: rs.bg, color: rs.c, fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 500 }}>
                        {r.risk_level ?? 'unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{r.recommendation ?? '—'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Spotlight>
  );
}

// ─── Industry Benchmarks (fetches /api/benchmarks)
function IndustryBenchmarks() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/benchmarks', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const metrics = data?.metrics ?? [];

  // For a metric, decide a colour relative to p50 (taking lower_is_better into account)
  const positionColor = (metric) => {
    if (!metric.p50) return 'var(--ink-3)';
    const ratio = metric.org_value / metric.p50;
    if (metric.lower_is_better) return ratio < 1 ? 'var(--success)' : ratio < 1.3 ? 'var(--warning)' : 'var(--danger)';
    return ratio > 1 ? 'var(--success)' : ratio > 0.7 ? 'var(--warning)' : 'var(--danger)';
  };

  // Width percentage for the org bar relative to p75 (capped at 100%)
  const orgBarW = (metric) => {
    const scale = metric.p75 > 0 ? metric.p75 : metric.org_value;
    return scale > 0 ? Math.min(100, Math.round((metric.org_value / scale) * 100)) : 50;
  };

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Industry benchmarks"
          sub={data?.period ?? 'Last 30 days · anonymous cross-client percentiles'}
          action={data && !data.has_benchmark_data
            ? <Badge tone="outline">First data Sunday</Badge>
            : <Badge tone="success" dot>Live</Badge>
          } />

        {loading && (
          <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
        )}

        {!loading && metrics.length === 0 && (
          <div style={{ padding: '24px 20px', background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', fontSize: 13, color: 'var(--ink-3)' }}>
            Not enough data to compute benchmarks yet. Benchmarks are computed weekly — first figures appear Sunday night.
          </div>
        )}

        {!loading && metrics.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
            {metrics.map((m) => {
              const orgColor = positionColor(m);
              const p50label = m.p50 > 0 ? `${m.unit === '$' ? '$' : ''}${m.p50.toFixed(m.decimals)}${m.unit !== '$' ? m.unit : ''}` : '—';
              const orgLabel = `${m.unit === '$' ? '$' : ''}${m.org_value.toFixed(m.decimals)}${m.unit !== '$' ? m.unit : ''}`;
              return (
                <div key={m.metric}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{m.label}</span>
                    <span className="mono tnum" style={{ fontSize: 13, color: orgColor, fontWeight: 600 }}>{orgLabel}</span>
                  </div>

                  {/* Percentile track: p25 ── p50 ── p75 with org dot */}
                  <div style={{ position: 'relative', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'visible' }}>
                    {/* coloured fill up to org value */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0,
                      width: `${orgBarW(m)}%`, height: '100%',
                      background: orgColor, borderRadius: 3, transition: 'width .6s var(--ease)',
                    }} />
                    {/* p50 marker */}
                    {m.p50 > 0 && (
                      <span style={{
                        position: 'absolute', left: '66.6%', top: -3,
                        width: 2, height: 12, background: 'var(--line-2)', borderRadius: 1,
                      }} title={`Median (p50): ${p50label}`} />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }} className="mono">
                    {m.p25 > 0 ? (
                      <>
                        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>p25 {m.unit === '$' ? '$' : ''}{m.p25.toFixed(m.decimals)}{m.unit !== '$' ? m.unit : ''}</span>
                        <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>p50 {p50label}</span>
                        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>p75 {m.unit === '$' ? '$' : ''}{m.p75.toFixed(m.decimals)}{m.unit !== '$' ? m.unit : ''}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>Benchmark data computed weekly · {m.sample_size ?? 0} orgs in sample</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data?.note && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ink-4)' }}>
            {data.note}
          </div>
        )}
      </div>
    </Spotlight>
  );
}

// ─── Model Swap Simulation (fetches /api/simulation/preview)
const MODELS = [
  { id: 'gpt-4o',                        label: 'gpt-4o (OpenAI)'               },
  { id: 'gpt-4o-mini',                   label: 'gpt-4o-mini (OpenAI)'          },
  { id: 'claude-3-5-sonnet-20241022',    label: 'claude-3-5-sonnet (Anthropic)' },
  { id: 'claude-3-5-haiku-20241022',     label: 'claude-3-5-haiku (Anthropic)'  },
];

function ModelSwapSimulation() {
  const [fromModel, setFromModel] = useState('gpt-4o');
  const [toModel,   setToModel]   = useState('gpt-4o-mini');
  const [period,    setPeriod]    = useState('30d');
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const simulate = () => {
    if (fromModel === toModel) { setError('Source and target models must differ.'); return; }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ from_model: fromModel, to_model: toModel, period });
    fetch(`/api/simulation/preview?${params}`, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : r.json().then((e) => { throw new Error(e.message ?? 'Preview failed'); }))
      .then((json) => { setResult(json); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };

  const selectStyle = {
    padding: '7px 10px', borderRadius: 7, fontSize: 12.5, fontFamily: 'var(--font-mono)',
    background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)',
    cursor: 'pointer', outline: 'none',
  };

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Model swap simulation"
          sub="What would I have paid if I used a different model for the last N days?" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>From model</div>
            <select value={fromModel} onChange={(e) => setFromModel(e.target.value)} style={selectStyle}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 18, color: 'var(--ink-4)', paddingBottom: 4 }}>→</div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>To model</div>
            <select value={toModel} onChange={(e) => setToModel(e.target.value)} style={selectStyle}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Period</div>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={selectStyle}>
              {['7d','14d','30d','60d','90d'].map((p) => <option key={p} value={p}>{p.replace('d',' days')}</option>)}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={simulate} style={{ marginBottom: 1 }}>
            {loading ? 'Simulating…' : 'Simulate →'}
          </Button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-tint)', borderRadius: 'var(--r-md)', fontSize: 12.5, color: 'var(--danger)', marginBottom: 14 }}>
            {error}
          </div>
        )}

        {result && result.success && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            {[
              { k: 'Requests affected', v: result.requests_affected?.toLocaleString() ?? '0',  c: 'var(--ink)' },
              { k: 'Current cost',      v: `$${parseFloat(result.current_cost   ?? 0).toFixed(4)}`, c: 'var(--ink)' },
              { k: 'Simulated cost',    v: `$${parseFloat(result.simulated_cost ?? 0).toFixed(4)}`, c: 'var(--ink)' },
              { k: 'Savings',           v: `$${parseFloat(result.savings        ?? 0).toFixed(4)}`, c: 'var(--success)' },
              { k: 'Savings %',         v: `${result.savings_pct ?? 0}%`,           c: parseFloat(result.savings_pct ?? 0) > 0 ? 'var(--success)' : 'var(--ink)' },
              { k: 'Quality delta',     v: result.quality_delta >= 0 ? `+${result.quality_delta}%` : `${result.quality_delta}%`,
                                         c: result.quality_delta >= 0 ? 'var(--success)' : 'var(--warning)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--surface)', padding: 16 }}>
                <div className="eyebrow" style={{ fontSize: 10 }}>{s.k}</div>
                <div className="tnum" style={{ fontSize: 18, fontWeight: 500, color: s.c, marginTop: 5, letterSpacing: '-0.02em' }}>{s.v}</div>
              </div>
            ))}
          </div>
        )}

        {result && result.success && parseFloat(result.savings ?? 0) > 0 && (
          <div style={{
            marginTop: 14, padding: '14px 16px',
            background: 'var(--success-tint)', borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}><path d="M5 9l2 2 5-5" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="9" r="8" stroke="var(--success)" strokeWidth="1.4"/></svg>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>
                Switching to <span className="mono">{result.to_model}</span> would save <span style={{ color: 'var(--success)' }}>${parseFloat(result.savings ?? 0).toFixed(2)}</span> ({result.savings_pct}%) over the last {period.replace('d',' days')}.
              </div>
              {result.quality_delta < 0 && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>
                  Estimated quality delta: {result.quality_delta}% — verify with A/B tests before switching.
                </div>
              )}
            </div>
            <Button variant="primary" size="sm">Add routing rule</Button>
          </div>
        )}

        {result && result.success && result.requests_affected === 0 && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 12.5, color: 'var(--ink-4)' }}>
            No requests from <span className="mono">{result.from_model}</span> in the last {period.replace('d',' days')}. Try a different source model or period.
          </div>
        )}
      </div>
    </Spotlight>
  );
}

// ─── Page
function AnalyticsPage() {
  const exportCSV = () => {
    // Direct browser download — Sanctum session auth is forwarded automatically
    window.location.href = '/api/cfo/weekly/csv';
  };
  const exportPDF = () => {
    window.open('/api/cfo/weekly/pdf', '_blank');
  };

  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Cost intelligence</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1,
            margin: 0, color: 'var(--ink)',
          }}>Analytics</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Deep dive across providers, teams, workflows and time</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Filters · 0</Button>
          <Button variant="secondary" size="sm" onClick={exportCSV}
            icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v7M3 6l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
            CFO CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={exportPDF}
            icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M7 1H3a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V4L7 1zM7 1v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
            CFO PDF
          </Button>
        </div>
      </div>

      <TrendChart />

      <div style={{ height: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 12 }}>
        <Heatmap />
        <CostBreakdown />
      </div>

      <div style={{ height: 12 }} />

      <WorkflowProfitability />

      <div style={{ height: 12 }} />

      <MarginDestroyers />

      <div style={{ height: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 12 }}>
        <IndustryBenchmarks />
        <ModelSwapSimulation />
      </div>
    </Stagger>
  );
}

Object.assign(window, { AnalyticsPage });
