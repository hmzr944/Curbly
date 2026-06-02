/* Margexa v2 — Leak Detection page
   Active incidents · timeline · investigation drawer · circuit breakers
   Data: GET /api/incidents · GET /api/circuit-breakers
*/

const { useEffect, useRef, useState } = React;

// ─── Incident card (in feed)
function IncidentCard({ inc, selected, onClick }) {
  const sevC = { danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)', info: 'var(--ink-4)' }[inc.sev];
  const sevBg = { danger: 'var(--danger-tint)', warning: 'var(--warning-tint)', success: 'var(--success-tint)', info: 'var(--surface-2)' }[inc.sev];
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '14px 16px',
      background: selected ? 'var(--accent-tint)' : 'transparent',
      border: '1px solid', borderColor: selected ? 'var(--accent-soft)' : 'transparent',
      borderRadius: 8, marginBottom: 2, display: 'flex', alignItems: 'flex-start', gap: 12,
      transition: 'all .12s',
    }}
    onMouseEnter={(e) => !selected && (e.currentTarget.style.background = 'var(--surface-2)')}
    onMouseLeave={(e) => !selected && (e.currentTarget.style.background = 'transparent')}>
      <span style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: sevBg, color: sevC,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {inc.sev === 'danger' && <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2l8 14H1L9 2z M9 7v4 M9 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>}
        {inc.sev === 'warning' && <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5v4 M9 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        {inc.sev === 'success' && <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M5 9l2 2 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {inc.sev === 'info' && <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 8v4 M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        {inc.live && <span style={{ position: 'absolute', top: -2, right: -2 }}><PulseDot color={sevC} size={7} /></span>}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{inc.t}</span>
          {inc.status && <Badge tone={inc.status === 'ACTIVE' ? 'danger' : 'outline'} style={{ fontSize: 9 }}>{inc.status}</Badge>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{inc.s}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', display: 'flex', gap: 8 }}>
          <span>{inc.time}</span>
          <span>·</span>
          <span>{inc.scope}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Big spend anomaly chart (static — illustrative)
function AnomalyChart() {
  const data = Array.from({ length: 24 }, (_, i) => {
    const base = 80 + Math.sin(i / 3) * 20 + Math.random() * 15;
    if (i >= 17 && i <= 20) return base * (i === 18 || i === 19 ? 6 : 3);
    return base;
  });
  const W = 760, H = 200;
  const max = Math.max(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - 20 - (v / max) * (H - 30);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');
  const baseline = data.map((_, i) => {
    const x = (i / (data.length - 1)) * W;
    return { x, top: H - 20 - (140 / max) * (H - 30), bot: H - 20 - (60 / max) * (H - 30) };
  });
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Spend anomaly · last 24h"
          sub="Runaway agent detected at 13:42 · investigating"
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge tone="danger" dot>1 active</Badge>
              <Badge tone="success" dot>2 resolved</Badge>
            </div>
          } />
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
          <path d={`M${baseline[0].x},${baseline[0].top} ${baseline.slice(1).map(p => `L${p.x},${p.top}`).join(' ')} ${baseline.slice().reverse().map(p => `L${p.x},${p.bot}`).join(' ')} Z`}
                fill="var(--success)" opacity=".06" />
          {[0.5, 0.75].map((p, i) => (
            <line key={i} x1="0" x2={W} y1={H * p} y2={H * p} stroke="var(--line)" strokeDasharray="2 4" />
          ))}
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.8" style={{ animation: 'chartIn 1s var(--ease-out) both' }} />
          {[18, 19].map((i) => {
            const x = (i / (data.length - 1)) * W;
            const y = H - 20 - (data[i] / max) * (H - 30);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="6" fill="var(--danger)" opacity=".15">
                  <animate attributeName="r" values="6;14;6" dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".4;0;.4" dur="1.8s" repeatCount="indefinite"/>
                </circle>
                <circle cx={x} cy={y} r="4" fill="var(--danger)" />
              </g>
            );
          })}
          <text x={(19 / (data.length - 1)) * W + 10} y={H - 20 - (data[19] / max) * (H - 30) - 8} fontSize="11" fill="var(--danger)" fontFamily="var(--font-mono)">+412% vs baseline</text>
          <style>{`@keyframes chartIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10.5, color: 'var(--ink-4)' }} className="mono">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Investigation panel (right)
function InvestigationPanel({ inc }) {
  if (!inc) return (
    <Spotlight>
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
        Select an incident to investigate.
      </div>
    </Spotlight>
  );
  return (
    <Spotlight>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <Badge tone={inc.status === 'ACTIVE' ? 'danger' : 'success'} dot>{inc.status || 'ACTIVE'}</Badge>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>#{inc.id} · {inc.time}</span>
            </div>
            <h2 className="h-display" style={{ fontSize: 'clamp(18px, 3vw, 26px)', color: 'var(--ink)', margin: 0, lineHeight: 1.1, wordBreak: 'break-word' }}>{inc.t}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, marginBottom: 0, maxWidth: 580 }}>{inc.s}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <Button variant="secondary" size="sm">Snooze</Button>
            <Button variant="primary" size="sm">Acknowledge</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 24 }}>
          {[
            { k: 'Severity',  v: inc.sev?.toUpperCase() ?? '—', c: inc.sev === 'danger' ? 'var(--danger)' : inc.sev === 'warning' ? 'var(--warning)' : 'var(--ink)' },
            { k: 'Scope',     v: inc.scope ?? '—',  c: 'var(--ink)' },
            { k: 'Detected',  v: inc.time  ?? '—',  c: 'var(--ink)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: 14 }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>{s.k}</div>
              <div className="tnum" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.02em', color: s.c, marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <SectionHead title="Suggested actions" sub="Apply now to stop the bleeding" />
        {[
          { t: 'Investigate related policy triggers', s: 'Review policy logs for this scope in the Policies tab', primary: true },
          { t: 'Add rate limit for this agent / workflow', s: 'Apply a circuit-breaker or spend-cap policy' },
          { t: 'Check provider status', s: 'High spend can be caused by retry loops on provider degradation' },
        ].map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: 12, flexShrink: 0,
              background: 'var(--accent-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{a.t}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.s}</div>
            </div>
            <Button variant={a.primary ? 'primary' : 'secondary'} size="sm">{a.primary ? 'Investigate' : 'Apply'}</Button>
          </div>
        ))}
      </div>
    </Spotlight>
  );
}

// ─── Circuit Breaker panel (fetches /api/circuit-breakers)
function CircuitBreakerPanel() {
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirmId, setConfirmId] = useState(null); // agentId pending confirmation
  const [resetting, setResetting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/circuit-breakers', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setAgents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmReset = (agentId) => setConfirmId(agentId);

  const doReset = () => {
    if (!confirmId) return;
    setResetting(true);
    fetch(`/api/circuit-breakers/${encodeURIComponent(confirmId)}/reset`, {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '', 'Content-Type': 'application/json' },
    })
      .then(() => {
        setResetting(false);
        setConfirmId(null);
        window.MARGEXA_TOAST?.show({ message: `Circuit reset — agent ${confirmId} is CLOSED.`, tone: 'success' });
        load();
      })
      .catch(() => { setResetting(false); setConfirmId(null); });
  };

  const stateColor = { OPEN: 'var(--danger)', HALF: 'var(--warning)', CLOSED: 'var(--success)' };
  const stateTone  = { OPEN: 'danger', HALF: 'warning', CLOSED: 'success' };

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Agent circuit breakers"
          sub="Rate-limit protection per agent · 60-second sliding window"
          action={<Button variant="secondary" size="sm" onClick={load}>Refresh</Button>} />
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-4)' }}>Loading…</div>
        ) : agents.length === 0 ? (
          <div style={{
            padding: '28px 20px', textAlign: 'center',
            background: 'var(--surface-2)', borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 6 }}>No agents detected yet.</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>
              Circuits appear automatically once requests flow through the proxy.<br/>
              Set the <span className="mono" style={{ color: 'var(--accent)' }}>X-Agent-Id</span> header in your calls to scope breakers per agent.
            </div>
          </div>
        ) : (
          <div>
            {agents.map((a, i) => (
              <div key={a.agentId} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}>
                <span style={{
                  width: 9, height: 9, borderRadius: 5, flexShrink: 0,
                  background: stateColor[a.state] ?? 'var(--ink-4)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.agentId}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>
                    {a.count} calls · last 60s
                  </div>
                </div>
                <Badge tone={stateTone[a.state] ?? 'outline'}>{a.state}</Badge>
                {a.state !== 'CLOSED' && (
                  <Button variant="secondary" size="sm" onClick={() => resetAgent(a.agentId)}>Reset</Button>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 11.5, color: 'var(--ink-4)' }}>
          <span className="mono" style={{ color: 'var(--danger)' }}>OPEN</span> &gt; 20 req/60s · blocked with 429 &nbsp;·&nbsp;
          <span className="mono" style={{ color: 'var(--warning)' }}>HALF</span> &gt; 10 req/60s · allowed, alerted &nbsp;·&nbsp;
          <span className="mono" style={{ color: 'var(--success)' }}>CLOSED</span> normal
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Leaks page — wired to /api/incidents
function LeaksPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter]       = useState('All');

  useEffect(() => {
    fetch('/api/incidents', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setIncidents(list);
        setSelectedId(list[0]?.id ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? incidents
    : filter === 'Active' ? incidents.filter((i) => i.status === 'ACTIVE')
    : incidents.filter((i) => i.status !== 'ACTIVE');

  const activeCount   = incidents.filter((i) => i.status === 'ACTIVE').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;
  const totalCostAvoided = incidents.reduce((s, i) => {
    const n = parseFloat((i.s || '').match(/Avoided: \$([0-9.]+)/)?.[1] ?? 0);
    return s + n;
  }, 0);

  const selected = incidents.find((i) => i.id === selectedId);

  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Anomaly engine</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>Leak detection</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Real-time anomaly detection across spend, latency and outputs</span>
            {activeCount > 0 && <Badge tone="danger" dot>{activeCount} active</Badge>}
            {activeCount === 0 && !loading && <Badge tone="success" dot>All clear</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Tune sensitivity</Button>
          <Button variant="primary" size="sm">Investigations →</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {[
          { k: 'Active incidents',      v: loading ? '…' : activeCount,   c: activeCount > 0 ? 'var(--danger)' : 'var(--ink)' },
          { k: 'Resolved · session',    v: loading ? '…' : resolvedCount, c: 'var(--success)' },
          { k: 'Total incidents',       v: loading ? '…' : incidents.length, c: 'var(--ink)' },
          { k: 'Cost avoided · session',v: loading ? '…' : `$${totalCostAvoided.toFixed(2)}`, c: 'var(--accent)', raw: true },
        ].map((c, i) => (
          <Spotlight key={i}>
            <div style={{ padding: 18 }}>
              <div className="eyebrow">{c.k}</div>
              <div className="tnum" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 6, color: c.c }}>
                {c.raw || typeof c.v !== 'number' ? c.v : <CountUp to={c.v} />}
              </div>
            </div>
          </Spotlight>
        ))}
      </div>

      <div style={{ height: 12 }} />

      <AnomalyChart />

      <div style={{ height: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12, alignItems: 'start' }}>
        <Spotlight>
          <div style={{ padding: 14 }}>
            <SectionHead
              title="Incident feed"
              sub={loading ? 'Loading…' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`}
              action={
                <div style={{ display: 'flex', gap: 4 }}>
                  {['All', 'Active', 'Resolved'].map((t) => (
                    <button key={t} onClick={() => setFilter(t)} style={{
                      padding: '3px 9px', fontSize: 11, fontWeight: 500,
                      background: filter === t ? 'var(--ink)' : 'transparent',
                      color: filter === t ? '#fff' : 'var(--ink-3)',
                      border: 'none', borderRadius: 5, cursor: 'pointer',
                    }}>{t}</button>
                  ))}
                </div>
              } />
            <div style={{ maxHeight: 800, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading incidents…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '32px 10px', textAlign: 'center', fontSize: 12, color: 'var(--ink-4)' }}>
                  {filter === 'All'
                    ? 'No incidents yet — policy triggers will appear here in real time.'
                    : `No ${filter.toLowerCase()} incidents.`}
                </div>
              ) : filtered.map((inc) => (
                <IncidentCard key={inc.id} inc={inc} selected={inc.id === selectedId} onClick={() => setSelectedId(inc.id)} />
              ))}
            </div>
          </div>
        </Spotlight>

        <InvestigationPanel inc={selected} />
      </div>

      <div style={{ height: 12 }} />

      <CircuitBreakerPanel />
    </Stagger>
  );
}

Object.assign(window, { LeaksPage });
