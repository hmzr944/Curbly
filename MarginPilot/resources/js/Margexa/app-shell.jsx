/* Margexa v3 — App Shell
   Sidebar 220px · Topbar 52px · Command palette · Notifications
   Nav groups: Monitor / Control / Optimize / Settings
   Active: 2px left border accent + accent-tint bg
*/

const { useEffect, useRef, useState } = React;

// ─── Name → initials
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase().slice(0, 2) || '?';
}

// ─── Name → deterministic avatar color (cold palette-matched)
function avatarColor(name) {
  const palette = [
    'linear-gradient(135deg,#0057FF,#4A90FF)',
    'linear-gradient(135deg,#059669,#34D399)',
    'linear-gradient(135deg,#D97706,#FCD34D)',
    'linear-gradient(135deg,#7C3AED,#A78BFA)',
    'linear-gradient(135deg,#0891B2,#22D3EE)',
    'linear-gradient(135deg,#DC2626,#F87171)',
  ];
  let h = 0;
  for (const c of (name || '')) h = (h << 5) - h + c.charCodeAt(0);
  return palette[Math.abs(h) % palette.length];
}

// ─── Icon set — 16px, 1.5 stroke
const I = {
  dash:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h7V3M14 3h7v7M21 14v7h-7M10 21H3v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gateway: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-4 4 8 2-4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chart:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 21V3M3 21h18M7 17v-6M12 17V7M17 17v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  bell:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4l2-2z M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  alert:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3zM12 10v4M12 17v.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  msg:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v12H8l-4 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  team:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M17 11a3 3 0 100-6M16 20c0-2 1-3.5 3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  card:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 10h18M7 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  cog:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  book:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chev:    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>,
  plus:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  enter:   <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M9 2v4H3m0 0l2-2m-2 2l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
};

// ─── Nav item — with 2px left border when active
function NavItem({ item, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '6px 10px 6px 14px', borderRadius: 'var(--r-sm)',
        color: active ? 'var(--accent)' : hover ? 'var(--ink)' : 'var(--ink-3)',
        background: active ? 'var(--accent-tint)' : hover ? 'var(--surface-2)' : 'transparent',
        fontWeight: active ? 500 : 400, fontSize: 13,
        transition: 'all var(--dur-micro) var(--ease)',
        position: 'relative',
        marginBottom: 1,
      }}>
      {/* 2px left accent bar for active */}
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 2, borderRadius: 1, background: 'var(--accent)',
        }} />
      )}
      <span style={{ color: active ? 'var(--accent)' : 'var(--ink-4)', display: 'inline-flex', flexShrink: 0 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.l}</span>
      {item.badge && <Badge tone="success" dot style={{ fontSize: 9.5, padding: '1px 6px' }}>{item.badge}</Badge>}
      {item.dot && <span style={{ width: 5, height: 5, borderRadius: 3, background: `var(--${item.dot})`, flexShrink: 0 }} />}
    </button>
  );
}

// ─── Nav group
function NavGroup({ label, items, active, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.10em',
        textTransform: 'uppercase', color: 'var(--ink-5)',
        padding: '0 14px 6px',
      }}>{label}</div>
      {items.map((it) => (
        <NavItem key={it.id} item={it} active={active === it.id} onClick={() => onChange?.(it.id)} />
      ))}
    </div>
  );
}

// ─── Workspace switcher
function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const orgName = window.MARGEXA?.organization?.name ?? 'Workspace';
  const orgPlan = window.MARGEXA?.organization?.plan ?? 'free';

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', padding: '12px 12px 8px' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', background: 'var(--surface-2)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-sm)', padding: '7px 9px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 9,
        transition: 'border-color var(--dur-micro) var(--ease)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}>
        <span style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{orgName}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{orgPlan}</div>
        </span>
        <span style={{ color: 'var(--ink-4)' }}>{I.chev}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 12, right: 12, zIndex: 30,
          background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-2)', padding: 4,
        }}>
          <button style={{
            width: '100%', background: 'var(--surface-2)', border: 'none',
            borderRadius: 'var(--r-sm)', padding: '7px 9px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 9, marginBottom: 2,
          }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--accent)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{orgName}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{orgPlan}</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 12 12"><path d="M3 6l2 2 4-4" stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
          </button>
          <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }} />
          <button style={{
            width: '100%', background: 'transparent', border: 'none',
            borderRadius: 'var(--r-sm)', padding: '7px 9px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 9, color: 'var(--ink-3)', fontSize: 13,
            transition: 'background var(--dur-micro) var(--ease)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <span style={{ color: 'var(--ink-4)' }}>{I.plus}</span>
            New workspace
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar
function Sidebar({ active = 'dashboard', onChange, onCmdK }) {
  // Nav groups per the redesign brief
  const groups = [
    {
      label: 'Monitor',
      items: [
        { id: 'dashboard', l: 'Dashboard', icon: I.dash },
        { id: 'gateway',   l: 'AI Gateway', icon: I.gateway, badge: 'Live' },
        { id: 'analytics', l: 'Analytics',  icon: I.chart },
      ],
    },
    {
      label: 'Control',
      items: [
        { id: 'policies', l: 'Policies',       icon: I.shield },
        { id: 'alerts',   l: 'Alerts',         icon: I.bell, dot: 'danger' },
        { id: 'leaks',    l: 'Leak detection', icon: I.alert, dot: 'warning' },
      ],
    },
    {
      label: 'Optimize',
      items: [
        { id: 'prompts', l: 'Prompts', icon: I.msg },
      ],
    },
    {
      label: 'Settings',
      items: [
        { id: 'team',    l: 'Team',    icon: I.team },
        { id: 'billing', l: 'Billing', icon: I.card },
        { id: 'docs',    l: 'Docs',    icon: I.book },
        { id: 'settings',l: 'Settings',icon: I.cog },
      ],
    },
  ];

  const plan = (window.MARGEXA?.organization?.plan ?? 'free').toLowerCase();
  const isFree = plan === 'free' || plan === 'starter';

  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', borderRight: '1px solid var(--line)',
    }}>
      {/* Workspace switcher */}
      <WorkspaceSwitcher />

      {/* Search */}
      <div style={{ padding: '0 12px 10px' }}>
        <button onClick={onCmdK} style={{
          width: '100%', background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm)', padding: '6px 10px', cursor: 'pointer',
          color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5,
          transition: 'border-color var(--dur-micro) var(--ease)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}>
          <span>{I.search}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 5px', background: 'var(--surface-3)', borderRadius: 'var(--r-xs)', color: 'var(--ink-4)' }}>
            K
          </span>
        </button>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {groups.map((g) => (
          <NavGroup key={g.label} label={g.label} items={g.items} active={active} onChange={onChange} />
        ))}
      </nav>

      {/* Plan strip */}
      {isFree && (
        <div style={{ padding: '0 12px 14px' }}>
          <div style={{
            padding: '12px 14px',
            background: 'var(--accent-tint)', border: '1px solid var(--accent-soft)',
            borderRadius: 'var(--r-md)',
          }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 8 }}>
              Upgrade to Business
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 10, lineHeight: 1.4 }}>
              Unlock benchmarks, unlimited policies, and SSO.
            </div>
            <Button variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              View plans
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Notifications panel
function Notifications() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (!open || loaded) return;
    fetch('/api/policy-triggers', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (Array.isArray(json)) {
          setNotifs(json.slice(0, 5).map((t) => ({
            sev:  t.is_observed ? 'warning' : 'danger',
            t:    t.policy?.name ?? 'Policy triggered',
            s:    t.reason ?? (t.target_label ? `Scope: ${t.target_label}` : '—'),
            time: t.triggered_at
              ? new Date(t.triggered_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              : '—',
          })));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open]);

  const hasActive = notifs.some((n) => n.sev === 'danger');
  const dotColor  = { danger: 'var(--danger)', warning: 'var(--warning)' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 32, height: 32, borderRadius: 'var(--r-sm)',
        border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-3)', position: 'relative',
        transition: 'border-color var(--dur-micro) var(--ease), background var(--dur-micro) var(--ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}>
        {I.bell}
        {hasActive && (
          <span style={{
            position: 'absolute', top: 5, right: 5, width: 6, height: 6,
            borderRadius: 3, background: 'var(--danger)', border: '1.5px solid var(--surface)',
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50,
          width: 360, background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-2)', overflow: 'hidden',
          animation: 'modalIn var(--dur-standard) var(--ease) both',
        }}>
          <div style={{
            padding: '11px 16px', borderBottom: '1px solid var(--line)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Notifications</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--accent)' }}>
              Mark all read
            </button>
          </div>

          {!loaded ? (
            <div style={{ padding: 20 }}>
              {[100, 80, 70].map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                  <Skeleton circle height={8} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width={`${w}%`} height={12} style={{ marginBottom: 6 }} />
                    <Skeleton width="60%" height={10} />
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--success-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 8l2 2 5-5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>All clear</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 3 }}>No recent policy triggers</div>
            </div>
          ) : notifs.map((n, i) => (
            <div key={i} style={{
              padding: '11px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor[n.sev] ?? 'var(--ink-4)', marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, marginBottom: 2 }}>{n.t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.s}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', flexShrink: 0 }}>{n.time}</span>
            </div>
          ))}

          <div style={{ padding: '9px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', textAlign: 'center' }}>
            <a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View all alerts
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topbar — 52px strict
function Topbar({ title, breadcrumb = [], onCmdK }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20, height: 52,
      background: 'rgba(247,248,250,.9)',
      backdropFilter: 'saturate(180%) blur(12px)',
      WebkitBackdropFilter: 'saturate(180%) blur(12px)',
      borderBottom: '1px solid var(--line)',
      padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12,
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        {breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            <span style={{ fontSize: 13, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{b}</span>
            <span style={{ color: 'var(--ink-5)', fontSize: 12 }}>/</span>
          </React.Fragment>
        ))}
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{title}</span>
      </div>

      {/* Search */}
      <button onClick={onCmdK} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-sm)', padding: '5px 10px', cursor: 'pointer',
        fontSize: 12.5, color: 'var(--ink-4)',
        transition: 'border-color var(--dur-micro) var(--ease)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}>
        {I.search}
        <span>Search</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 5px', background: 'var(--surface-2)', borderRadius: 'var(--r-xs)', color: 'var(--ink-4)' }}>
          K
        </span>
      </button>

      {/* Notifications */}
      <Notifications />

      {/* Avatar */}
      <button style={{
        width: 28, height: 28, borderRadius: '50%',
        border: 'none', cursor: 'pointer',
        background: avatarColor(window.MARGEXA?.user?.name),
        color: '#fff', fontSize: 10.5, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {initials(window.MARGEXA?.user?.name)}
      </button>
    </div>
  );
}

// ─── Command palette
function CommandPalette({ open, onClose }) {
  const [q, setQ]     = useState('');
  const [sel, setSel] = useState(0);
  const inputRef      = useRef();

  const groups = [
    {
      l: 'Navigate', items: [
        { t: 'Dashboard',       s: 'KPIs, spend, live requests', icon: I.dash },
        { t: 'AI Gateway',      s: 'Routing rules, provider health', icon: I.gateway },
        { t: 'Policies',        s: 'Budget caps, allow-lists, PII', icon: I.shield },
        { t: 'Analytics',       s: 'Cost trends, margin destroyers', icon: I.chart },
        { t: 'Leak detection',  s: 'Anomalies, circuit breakers', icon: I.alert },
        { t: 'Prompts',         s: 'Workflow observability', icon: I.msg },
      ],
    },
    {
      l: 'Actions', items: [
        { t: 'Create policy',    s: 'Budget cap, model allowlist', icon: I.shield },
        { t: 'Invite teammate',  s: 'Send invitation email', icon: I.team },
        { t: 'Export CSV',       s: 'Last 30 days, current workspace', icon: I.chart },
      ],
    },
  ];

  const flat     = groups.flatMap((g) => g.items);
  const filtered = q
    ? flat.filter((i) => i.t.toLowerCase().includes(q.toLowerCase()) || i.s.toLowerCase().includes(q.toLowerCase()))
    : flat;
  const filteredSet = new Set(filtered);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 30);
    setSel(0);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % filtered.length); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel((s) => (s - 1 + filtered.length) % filtered.length); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered.length, onClose]);

  if (!open) return null;

  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,17,23,.4)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 110,
      animation: 'fadeIn var(--dur-micro) var(--ease) both',
    }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{
        width: 580, maxWidth: '90vw', background: 'var(--surface)',
        border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)',
        overflow: 'hidden', boxShadow: 'var(--sh-3)',
        animation: 'modalIn var(--dur-standard) var(--ease) both',
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderBottom: '1px solid var(--line)',
        }}>
          <span style={{ color: 'var(--ink-4)' }}>{I.search}</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            placeholder="Search pages, actions, policies…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13.5, color: 'var(--ink)', fontFamily: 'var(--font-sans)',
            }} />
          <button onClick={onClose} style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '2px 7px',
            background: 'var(--surface-2)', borderRadius: 'var(--r-xs)',
            color: 'var(--ink-3)', border: '1px solid var(--line)', cursor: 'pointer',
          }}>esc</button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '4px 6px' }}>
          {groups.map((g) => {
            const gItems = g.items.filter((it) => filteredSet.has(it));
            if (!gItems.length) return null;
            return (
              <div key={g.l}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em',
                  textTransform: 'uppercase', color: 'var(--ink-4)',
                  padding: '8px 10px 4px',
                }}>{g.l}</div>
                {gItems.map((it) => {
                  const i = filtered.findIndex((x) => x === it);
                  const isActive = sel === i;
                  return (
                    <div
                      key={it.t}
                      onMouseEnter={() => setSel(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                        background: isActive ? 'var(--surface-2)' : 'transparent',
                        transition: 'background var(--dur-micro) var(--ease)',
                      }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 'var(--r-sm)',
                        background: isActive ? 'var(--accent-tint)' : 'var(--surface-2)',
                        border: '1px solid var(--line)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: isActive ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0,
                      }}>{it.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{it.t}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 1 }}>{it.s}</div>
                      </div>
                      {isActive && <span style={{ color: 'var(--ink-4)' }}>{I.enter}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
              No results for <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>"{q}"</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 12px', borderTop: '1px solid var(--line)',
          background: 'var(--surface-2)', display: 'flex', gap: 16,
          fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)',
        }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['esc', 'Dismiss']].map(([k, l]) => (
            <span key={l}>
              <span style={{ padding: '1px 5px', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-xs)', marginRight: 5 }}>{k}</span>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shell
function AppShell({ active, onChange, title, breadcrumb, children }) {
  const [cmd, setCmd] = useState(false);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setCmd((v) => !v);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active={active} onChange={onChange} onCmdK={() => setCmd(true)} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title={title} breadcrumb={breadcrumb} onCmdK={() => setCmd(true)} />
        <div style={{ flex: 1, padding: '24px 28px 80px' }}>
          {children}
        </div>
      </main>
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <ToastContainer />
    </div>
  );
}

Object.assign(window, { AppShell, Sidebar, Topbar, CommandPalette, I });
