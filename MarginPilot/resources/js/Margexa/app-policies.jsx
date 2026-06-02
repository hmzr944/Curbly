/* Margexa v2 — Policies Engine page
   List + visual rule builder (conditions → actions)
*/

const { useEffect, useRef, useState } = React;

// ─── Policy row in the list
function PolicyRow({ p, selected, onClick }) {
  const sevC = { active: 'var(--success)', paused: 'var(--ink-4)', warning: 'var(--warning)' }[p.status];
  const sevBg = { active: 'var(--success-tint)', paused: 'var(--surface-2)', warning: 'var(--warning-tint)' }[p.status];
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '14px 16px',
      background: selected ? 'var(--accent-tint)' : 'transparent',
      border: '1px solid', borderColor: selected ? 'var(--accent-soft)' : 'transparent',
      borderRadius: 8, marginBottom: 2,
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center',
      transition: 'all .12s',
    }}
    onMouseEnter={(e) => !selected && (e.currentTarget.style.background = 'var(--surface-2)')}
    onMouseLeave={(e) => !selected && (e.currentTarget.style.background = 'transparent')}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 99, background: sevBg, color: sevC,
            fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: sevC }} />{p.status}
          </span>
          <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: 'var(--ink-4)' }} className="mono">
          <span>scope: {p.scope}</span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink-5)' }} />
          <span>{p.rules} rule{p.rules > 1 ? 's' : ''}</span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink-5)' }} />
          <span>edited {p.edited}</span>
        </div>
      </div>
      <span className="mono tnum" style={{
        fontSize: 11, color: 'var(--success)', fontWeight: 500,
        padding: '4px 10px', background: 'var(--success-tint)', borderRadius: 99,
      }}>
        −${p.saved}/mo
      </span>
    </button>
  );
}

// ─── Visual rule chip (token in the rule builder)
function Chip({ children, kind = 'neutral', removable, onClick }) {
  const kinds = {
    neutral: { bg: 'var(--surface)', color: 'var(--ink)', border: 'var(--line-2)' },
    cond:    { bg: 'var(--accent-tint)', color: 'var(--accent)', border: 'var(--accent-soft)' },
    op:      { bg: 'transparent', color: 'var(--ink-3)', border: 'transparent' },
    action:  { bg: 'var(--success-tint)', color: 'var(--success)', border: 'rgba(14,159,110,.25)' },
    deny:    { bg: 'var(--danger-tint)', color: 'var(--danger)', border: 'rgba(200,52,27,.25)' },
    value:   { bg: 'var(--ink)', color: '#fff', border: 'var(--ink)' },
  };
  const k = kinds[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: kind === 'op' ? '5px 4px' : '5px 10px',
      background: k.bg, color: k.color, border: `1px solid ${k.border}`,
      borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 500,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all .12s',
    }} onClick={onClick}>
      {children}
      {removable && (
        <svg width="9" height="9" viewBox="0 0 10 10" style={{ marginLeft: 2, opacity: .6, cursor: 'pointer' }}>
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      )}
    </span>
  );
}

// ─── Single rule block: IF/THEN code-like row
function RuleBlock({ rule, idx }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${hover ? 'var(--line-3)' : 'var(--line)'}`,
        borderRadius: 10, marginBottom: 6,
        transition: 'all .15s var(--ease)',
        overflow: 'hidden',
      }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid var(--line)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{rule.name}</span>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="7" r="1.2" fill="currentColor"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/></svg>
        </button>
      </div>
      {/* IF row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 18px', borderBottom: '1px solid var(--line)', background: 'var(--accent-tint)', borderTop: 'none' }}>
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', minWidth: 36 }}>IF</span>
        {rule.conditions.map((c, i) => (
          <React.Fragment key={i}>
            <Chip kind="cond" removable>{c}</Chip>
            {i < rule.conditions.length - 1 && <Chip kind="op">AND</Chip>}
          </React.Fragment>
        ))}
        <button style={{
          padding: '4px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
          background: 'transparent', border: '1px dashed var(--accent-soft)', borderRadius: 5,
          color: 'var(--accent)', cursor: 'pointer', opacity: .7,
        }}>+ condition</button>
      </div>
      {/* THEN row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 18px' }}>
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--success)', minWidth: 36 }}>THEN</span>
        {rule.actions.map((a, i) => (
          <Chip key={i} kind={a.kind === 'deny' ? 'deny' : 'action'} removable>{a.label}</Chip>
        ))}
        <button style={{
          padding: '4px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
          background: 'transparent', border: '1px dashed rgba(14,159,110,.3)', borderRadius: 5,
          color: 'var(--success)', cursor: 'pointer', opacity: .7,
        }}>+ action</button>
      </div>
      {/* Plain language preview */}
      {rule.conditions.length > 0 && rule.actions.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--line)',
          padding: '10px 18px',
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
            <circle cx="7" cy="7" r="6" stroke="var(--ink-4)" strokeWidth="1"/>
            <path d="M7 4.5v3M7 9v.5" stroke="var(--ink-4)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>
            <em style={{ fontStyle: 'normal', color: 'var(--ink-2)' }}>When </em>
            {rule.conditions.join(' and ')}
            <em style={{ fontStyle: 'normal', color: 'var(--ink-2)' }}>, </em>
            {rule.actions.map(a => a.label).join(' and ')}
            <em style={{ fontStyle: 'normal', color: 'var(--ink-2)' }}> automatically.</em>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Selected policy detail (right pane)
function PolicyDetail({ p }) {
  return (
    <Spotlight>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Policy · {p.scope}</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(22px, 3vw, 28px)', color: 'var(--ink)', margin: 0, lineHeight: 1.1, wordBreak: 'break-word' }}>{p.name}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, marginBottom: 0, maxWidth: 520 }}>{p.desc}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <Button variant="secondary" size="sm">Duplicate</Button>
            <Button variant="primary" size="sm" onClick={() => window.MARGEXA_TOAST?.show({ message: 'Policy saved.', tone: 'success' })}>Save rule</Button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 24 }}>
          {[
            { k: 'Decisions / day', v: '8,420', d: '+12%' },
            { k: 'Blocked', v: '124', d: '0.4%' },
            { k: 'Avg latency added', v: '0.4ms', d: '−' },
            { k: 'Savings', v: '$184/mo', d: 'enforced' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: 14 }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>{s.k}</div>
              <div className="tnum" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)', marginTop: 4 }}>{s.v}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* Rules builder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Rules</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{p.rules.length} active · evaluated top to bottom</div>
          </div>
          <Button variant="secondary" size="sm" icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}>
            Add rule
          </Button>
        </div>
        {p.rules.map((r, i) => <RuleBlock key={i} rule={r} idx={i} />)}

        {/* Scope card */}
        <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 14 }}>Applies to</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {p.applies.map((a, i) => (
              <Chip key={i} kind="neutral">{a}</Chip>
            ))}
          </div>
        </div>

        {/* Audit footer */}
        <div style={{
          marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)',
        }}>
          <span>Created by {p.owner} · {p.created}</span>
          <span>v{p.version} · <a href="#" style={{ color: 'var(--ink-3)' }}>history</a></span>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Map API policy → display row
function apiPolicyToRow(p) {
  let status = 'paused';
  if (p.is_active && !p.observe_mode) status = 'active';
  else if (p.is_active && p.observe_mode) status = 'paused';

  const relTime = (ts) => {
    if (!ts) return '—';
    const d = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (d < 60)  return `${d}m ago`;
    if (d < 1440) return `${Math.floor(d/60)}h ago`;
    return `${Math.floor(d/1440)}d ago`;
  };

  return {
    id:     p.id,
    name:   p.name,
    status,
    scope:  p.scope ?? 'workspace',
    rules:  1,
    edited: relTime(p.updated_at),
    saved:  0,
    type:   p.type,
    is_active:    p.is_active,
    observe_mode: p.observe_mode,
  };
}

// ─── Policies page — loads from /api/policies
function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const csrf = window.MARGEXA?.csrfToken || '';
  const url  = window.MARGEXA?.routes?.policies;

  useEffect(() => {
    if (!url) { setLoading(false); return; }
    fetch(url, { headers: { 'X-CSRF-TOKEN': csrf } })
      .then((r) => r.ok ? r.json() : { policies: [] })
      .then((json) => {
        const rows = (json.policies ?? json ?? []).map(apiPolicyToRow);
        setPolicies(rows);
        if (rows.length > 0) setSelectedId(rows[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    fetch(`/api/policies/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'X-CSRF-TOKEN': csrf, 'Content-Type': 'application/json' },
    }).then((r) => r.ok ? r.json() : null).then((json) => {
      if (!json) return;
      setPolicies((prev) => prev.map((p) => p.id === id ? apiPolicyToRow(json) : p));
    }).catch(() => {});
  };

  const selected = policies.find((p) => p.id === selectedId);
  const selectedFull = selected ? {
    ...selected,
    desc: 'Production policy enforced on every routed request matching its scope.',
    applies: [`scope:${selected.scope}`, 'workspace:default'],
    owner: '—', created: '—', version: '1',
    rules: [
      { name: 'Allow-list', conditions: ['model ∈ [allowed_models]'], actions: [{ label: 'allow', kind: 'action' }] },
      { name: 'Budget guard', conditions: ['budget_used > 80%'], actions: [{ label: 'notify owner', kind: 'action' }] },
    ],
  } : null;

  const activeCount = policies.filter((p) => p.status === 'active').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--ink-4)', fontSize: 13 }}>
      Loading policies…
    </div>
  );

  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Governance engine</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>Policies</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {policies.length === 0
                ? 'No policies yet — create your first rule'
                : `${activeCount} active polic${activeCount === 1 ? 'y' : 'ies'} · enforced on every request`}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Import from YAML</Button>
          <Button variant="primary" size="sm" icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}>
            New policy
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: 4, background: 'var(--surface-2)', border: '1px solid var(--line)',
        borderRadius: 10, width: 'fit-content',
      }}>
        {[
          { id: 'all', l: 'All', n: policies.length },
          { id: 'budget', l: 'Budget' },
          { id: 'routing', l: 'Routing' },
          { id: 'security', l: 'Security · PII' },
          { id: 'audit', l: 'Audit' },
        ].map((t) => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '6px 12px', fontSize: 12.5, fontWeight: 500,
            background: filter === t.id ? 'var(--surface)' : 'transparent', color: filter === t.id ? 'var(--ink)' : 'var(--ink-3)',
            border: '1px solid', borderColor: filter === t.id ? 'var(--line-2)' : 'transparent',
            borderRadius: 6, cursor: 'pointer',
            boxShadow: filter === t.id ? 'var(--sh-1)' : 'none',
          }}>
            {t.l}
            {t.n && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{t.n}</span>}
          </button>
        ))}
      </div>

      {/* List + Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12, marginTop: 16, alignItems: 'start' }}>
        <Spotlight>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--surface-2)', marginBottom: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--ink-4)" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input placeholder="Search policies…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13 }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{policies.length || 0}</span>
            </div>
            <div style={{ maxHeight: 740, overflowY: 'auto' }}>
              {policies.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                  No policies yet.<br/>
                  <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Create your first rule →</span>
                </div>
              ) : policies.map((p) => (
                <PolicyRow key={p.id} p={p} selected={p.id === selectedId} onClick={() => setSelectedId(p.id)} />
              ))}
            </div>
          </div>
        </Spotlight>

        {selectedFull && <PolicyDetail p={selectedFull} />}
      </div>
    </Stagger>
  );
}

Object.assign(window, { PoliciesPage });
