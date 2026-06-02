/* Margexa v2 — Alerts Center page
   Live alerts feed · severity filter · acknowledgment workflow
*/

const { useEffect, useRef, useState } = React;

// ─── Single alert row (timeline-style)
function AlertItem({ a, index, resolved = false, onResolve }) {
  const [open, setOpen] = useState(index === 0);
  const sevC = { critical: 'var(--danger)', high: 'var(--warning)', medium: 'var(--accent)', low: 'var(--ink-4)' }[a.sev];
  const sevBg = { critical: 'var(--danger-tint)', high: 'var(--warning-tint)', medium: 'var(--accent-tint)', low: 'var(--surface-2)' }[a.sev];
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid', borderColor: open ? 'var(--line-2)' : 'var(--line)',
      borderRadius: 'var(--r-lg)', overflow: 'hidden',
      transition: 'all .15s',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
        padding: '14px 18px', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: sevBg, color: sevC,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            {a.sev === 'critical' && <path d="M9 2l8 14H1L9 2z M9 7v4 M9 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>}
            {a.sev === 'high' && <><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5v4 M9 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>}
            {(a.sev === 'medium' || a.sev === 'low') && <><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 8v4 M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>}
          </svg>
          {a.live && <span style={{ position: 'absolute', top: -2, right: -2 }}><PulseDot color={sevC} size={7} /></span>}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{a.title}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 7px', borderRadius: 99, background: sevBg, color: sevC,
              fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 4, height: 4, borderRadius: 2, background: sevC }} />{a.sev}
            </span>
            {a.acked && <Badge tone="outline">acked by {a.acked}</Badge>}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', display: 'flex', gap: 8 }}>
            <span>{a.time}</span>
            <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink-5)', marginTop: 6 }} />
            <span>{a.source}</span>
            <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink-5)', marginTop: 6 }} />
            <span>#{a.id}</span>
          </div>
        </div>
        <span style={{ color: 'var(--ink-4)', transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? 600 : 0, overflow: 'hidden', transition: 'max-height .25s var(--ease)' }}>
        <div style={{ padding: '0 18px 16px 64px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 14px' }}>{a.desc}</p>
          {a.meta && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, padding: 14, background: 'var(--bg)', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid var(--line)' }}>
              {a.meta.map((m, i) => (
                <div key={i}>
                  <div className="eyebrow" style={{ fontSize: 9.5 }}>{m.k}</div>
                  <div className="tnum mono" style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>{m.v}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {a.actions?.map((act, i) => (
              <Button key={i} variant={i === 0 ? 'primary' : 'secondary'} size="sm">{act}</Button>
            ))}
            {!resolved && onResolve && (
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onResolve(); }}>
                Resolve
              </Button>
            )}
            {resolved && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="var(--success)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Resolved
              </span>
            )}
            <a href="#" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'none', alignSelf: 'center' }}>View full incident →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map policyTrigger → AlertItem shape
function triggerToAlert(t, idx) {
  const sevMap = {
    budget_cap:                'high',
    premium_model_restriction: 'medium',
    fallback_model:            'low',
    alert_threshold:           'medium',
  };
  const sev   = sevMap[t.policy?.type] ?? 'medium';
  const relTime = (ts) => {
    if (!ts) return '—';
    const d = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (d < 60)  return `${d}m ago`;
    if (d < 1440) return `${Math.floor(d/60)}h ago`;
    return `${Math.floor(d/1440)}d ago`;
  };
  return {
    id:     String(t.id ?? idx),
    sev,
    live:   idx === 0,
    title:  t.reason ?? `Policy trigger — ${t.policy?.name ?? 'Unknown'}`,
    time:   relTime(t.triggered_at ?? t.created_at),
    source: t.policy?.name ?? 'policy engine',
    acked:  t.is_observed ? 'observe mode' : null,
    desc:   t.reason ?? 'A policy condition was triggered on a proxied request.',
    actions: t.is_observed ? ['View policy'] : ['Review policy', 'Open audit log'],
  };
}

// ─── Alerts page — loads from /api/policy-triggers
function AlertsPage() {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [resolved, setResolved] = useState(new Set()); // locally-resolved alert IDs
  const [filter, setFilter]     = useState('active');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    const url = window.MARGEXA?.routes?.policyTriggers;
    if (!url) { setLoading(false); return; }
    fetch(url, { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : [])
      .then((json) => {
        const list = Array.isArray(json) ? json : (json.data ?? json.triggers ?? []);
        setAlerts(list.map(triggerToAlert));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleResolve = (id) => {
    setResolved((prev) => new Set([...prev, id]));
    window.MARGEXA_TOAST?.show({ message: 'Alert resolved.', tone: 'success' });
  };

  const isResolved = (a) => resolved.has(a.id) || a.acked;

  const filtered = alerts.filter((a) => {
    if (filter === 'active' && isResolved(a)) return false;
    if (filter === 'resolved' && !isResolved(a)) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount   = alerts.filter((a) => !isResolved(a)).length;
  const resolvedCount = alerts.filter((a) => isResolved(a)).length;
  const critCount     = alerts.filter((a) => a.sev === 'critical' && !isResolved(a)).length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--ink-4)', fontSize: 13 }}>
      Loading alerts…
    </div>
  );

  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Policy alerts</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>Alerts</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {alerts.length === 0 ? 'No policy triggers — all rules running clean' : `${activeCount} active · ${resolvedCount} resolved`}
            </span>
            {critCount > 0 && <Badge tone="danger" dot>{critCount} critical</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Notification rules</Button>
          {activeCount > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setResolved(new Set(alerts.map(a => a.id)))}>
              Resolve all
            </Button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {[
          { k: 'Active', v: activeCount, c: activeCount > 0 ? 'var(--danger)' : 'var(--success)', id: 'active' },
          { k: 'Critical', v: alerts.filter(a => a.sev === 'critical' && !isResolved(a)).length, c: 'var(--danger)', id: 'active' },
          { k: 'High', v: alerts.filter(a => a.sev === 'high' && !isResolved(a)).length, c: 'var(--warning)', id: 'active' },
          { k: 'Resolved', v: resolvedCount, c: 'var(--success)', id: 'resolved' },
        ].map((s, i) => (
          <button key={i} onClick={() => setFilter(s.id)} style={{
            background: filter === s.id && s.id !== 'all' ? 'var(--surface-2)' : 'var(--surface)',
            padding: '14px 18px', textAlign: 'left', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 10, color: s.c }}>{s.k}</div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 2, color: 'var(--ink)' }}>{s.v}</div>
            </div>
            <span style={{ width: 4, height: 24, borderRadius: 2, background: s.c, opacity: s.v > 0 ? 1 : 0.25 }} />
          </button>
        ))}
      </div>

      <div style={{ height: 12 }} />

      {/* Filter tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10,
        }}>
          {[
            { id: 'all',      l: 'All',      n: alerts.length },
            { id: 'active',   l: 'Active',   n: activeCount },
            { id: 'resolved', l: 'Resolved', n: resolvedCount },
          ].map((t) => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '6px 12px', fontSize: 12.5, fontWeight: 500,
              background: filter === t.id ? 'var(--surface)' : 'transparent',
              color: filter === t.id ? 'var(--ink)' : 'var(--ink-3)',
              border: '1px solid', borderColor: filter === t.id ? 'var(--line-2)' : 'transparent',
              borderRadius: 6, cursor: 'pointer',
              boxShadow: filter === t.id ? 'var(--sh-1)' : 'none',
            }}>
              {t.l}
              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{t.n}</span>
            </button>
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 8, flex: 1, maxWidth: 320,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--ink-4)" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alerts…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink)' }} />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((a, i) => (
          <AlertItem
            key={a.id}
            a={a}
            index={i}
            resolved={isResolved(a)}
            onResolve={() => handleResolve(a.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '56px 32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--success-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l3 3 6-6" stroke="var(--success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
              {alerts.length === 0 ? 'All clear' : filter === 'active' ? 'No active alerts' : filter === 'resolved' ? 'Nothing resolved yet' : 'No alerts match'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {alerts.length === 0
                ? 'No policy triggers yet. Alerts appear here when policies fire on proxied requests.'
                : 'Change the filter or search term.'}
            </div>
          </div>
        )}
      </div>
    </Stagger>
  );
}

Object.assign(window, { AlertsPage });
