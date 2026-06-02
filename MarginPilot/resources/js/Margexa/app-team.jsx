/* Margexa v2 — Team & access page
   Members · Roles (RBAC) · Invites · API keys · Activity log
*/

const { useEffect, useRef, useState } = React;

// ─── Avatar
function Avatar({ name, size = 32, c }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  return (
    <span style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0,
      background: c || 'linear-gradient(135deg, #5B5BD6, #8B5CF6)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'var(--font-sans)', fontSize: size * 0.36, fontWeight: 600,
      letterSpacing: '-0.02em',
    }}>{initials}</span>
  );
}

// ─── Role chip
function RoleChip({ role }) {
  const map = {
    Owner:     { c: 'var(--accent)', bg: 'var(--accent-tint)' },
    Admin:     { c: 'var(--ink)', bg: 'var(--surface-2)' },
    Developer: { c: 'var(--ink-2)', bg: 'var(--surface-2)' },
    Viewer:    { c: 'var(--ink-3)', bg: 'var(--surface-2)' },
    Billing:   { c: 'var(--success)', bg: 'var(--success-tint)' },
  };
  const m = map[role];
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 99, background: m.bg, color: m.c,
      fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 500, letterSpacing: '.03em',
    }}>{role}</span>
  );
}

// ─── Member row
function MemberRow({ m }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--line)' }}>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={m.name} c={m.c} />
          <div>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{m.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>{m.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <RoleChip role={m.role} />
      </td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {m.teams.map((t, i) => (
            <span key={i} className="mono" style={{
              fontSize: 10.5, padding: '2px 7px', background: 'var(--surface-2)',
              border: '1px solid var(--line)', borderRadius: 4, color: 'var(--ink-2)',
            }}>{t}</span>
          ))}
        </div>
      </td>
      <td className="mono" style={{ padding: '14px 16px', fontSize: 11.5, color: 'var(--ink-3)' }}>{m.last}</td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: m.mfa ? 'var(--success)' : 'var(--warning)' }} />
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{m.mfa ? 'enabled' : 'missing'}</span>
        </span>
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="3" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="13" cy="8" r="1.2" fill="currentColor"/></svg>
        </button>
      </td>
    </tr>
  );
}

// ─── Permission matrix (RBAC visual)
function PermissionMatrix() {
  const perms = ['View', 'Edit policies', 'Approve spend', 'Manage team', 'Billing'];
  const roles = [
    { r: 'Owner',     vals: [1, 1, 1, 1, 1] },
    { r: 'Admin',     vals: [1, 1, 1, 1, 0] },
    { r: 'Developer', vals: [1, 1, 0, 0, 0] },
    { r: 'Viewer',    vals: [1, 0, 0, 0, 0] },
    { r: 'Billing',   vals: [1, 0, 1, 0, 1] },
  ];
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Permissions"
          sub="Role-based access — fine-grained scopes available on Enterprise"
          action={<a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Customize roles →</a>} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th className="mono" style={{ textAlign: 'left', padding: '10px 8px', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>Role</th>
                {perms.map((p) => (
                  <th key={p} className="mono" style={{ textAlign: 'center', padding: '10px 8px', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r, i) => (
                <tr key={i} style={{ borderBottom: i === roles.length - 1 ? 'none' : '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 8px' }}><RoleChip role={r.r} /></td>
                  {r.vals.map((v, j) => (
                    <td key={j} style={{ textAlign: 'center', padding: '12px 8px' }}>
                      {v ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}><circle cx="8" cy="8" r="7" fill="var(--success-tint)"/><path d="M5 8l2 2 4-4" stroke="var(--success)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}><circle cx="8" cy="8" r="7" fill="var(--surface-2)" stroke="var(--line)"/></svg>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Create-key modal
function CreateKeyModal({ onClose, onCreated }) {
  const [name, setName]     = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);
  const [newKey, setNewKey] = useState(null);   // set once after creation
  const [copied, setCopied] = useState(false);
  const csrf = window.MARGEXA?.csrfToken || '';

  const submit = () => {
    if (!name.trim()) { setErr('Please enter a name for this key.'); return; }
    setSaving(true); setErr(null);
    fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then(r => r.json())
      .then(json => {
        setSaving(false);
        if (json.success) {
          setNewKey(json);
          onCreated({ id: json.id, name: json.name, prefix: json.prefix, created_at: json.created_at, is_active: true, last_used_at: null });
        } else {
          setErr(json.message ?? 'Failed to create key.');
        }
      })
      .catch(() => { setSaving(false); setErr('Network error — please try again.'); });
  };

  const copyKey = () => {
    if (!newKey?.key) return;
    navigator.clipboard.writeText(newKey.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={newKey ? undefined : onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 14,
        padding: 28, width: 430, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }} onClick={e => e.stopPropagation()}>

        {newKey ? (
          /* ── Key reveal screen — shown once ── */
          <>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>API key created ✓</div>
            <div style={{ fontSize: 12.5, color: 'var(--danger)', marginBottom: 18, fontWeight: 500 }}>
              Copy it now — this is the only time it will be shown.
            </div>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--line-2)', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <code style={{ flex: 1, fontSize: 11.5, color: 'var(--ink)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                {newKey.key}
              </code>
              <button onClick={copyKey} style={{
                flexShrink: 0, padding: '5px 12px', fontSize: 11.5,
                background: copied ? 'var(--success-tint)' : 'var(--surface)',
                border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer',
                color: copied ? 'var(--success)' : 'var(--ink-2)', fontWeight: 500,
                transition: 'all 200ms',
              }}>{copied ? 'Copied ✓' : 'Copy'}</button>
            </div>
            <button onClick={onClose} style={{
              width: '100%', padding: '9px 16px', fontSize: 13, border: 'none',
              background: 'var(--accent)', color: '#fff', borderRadius: 7, cursor: 'pointer', fontWeight: 500,
            }}>Done — I've saved my key</button>
          </>
        ) : (
          /* ── Name form ── */
          <>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 18, color: 'var(--ink)' }}>Create API key</div>
            <label style={{ fontSize: 12, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Key name</label>
            <input
              autoFocus
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="e.g. Production · Backend"
              style={{
                width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 7,
                border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--ink)',
                outline: 'none', boxSizing: 'border-box', marginBottom: 18,
              }} />
            {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{
                padding: '8px 16px', fontSize: 13, border: '1px solid var(--line-2)',
                background: 'var(--surface)', borderRadius: 7, cursor: 'pointer', color: 'var(--ink-2)',
              }}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{
                padding: '8px 16px', fontSize: 13, border: 'none',
                background: saving ? 'var(--ink-5)' : 'var(--accent)', color: '#fff',
                borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500,
              }}>{saving ? 'Creating…' : 'Create key'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── API keys panel — live data from GET /api/api-keys
function APIKeys() {
  const [keys, setKeys]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const csrf = window.MARGEXA?.csrfToken || '';

  useEffect(() => {
    fetch('/api/api-keys', { headers: { 'X-CSRF-TOKEN': csrf } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setKeys(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreated = (key) => setKeys(prev => [key, ...prev]);

  const revokeKey = (id) => {
    if (!confirm('Permanently revoke this API key? Apps using it will stop working immediately.')) return;
    fetch(`/api/api-keys/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf } })
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.success) setKeys(prev => prev.filter(k => k.id !== id)); });
  };

  return (
    <>
      {showCreate && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated} />
      )}
      <Spotlight>
        <div style={{ padding: 22 }}>
          <SectionHead
            title="API keys"
            sub="Used by your apps to call the Margexa gateway"
            action={<Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>Create key</Button>} />

          {loading ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
          ) : keys.length === 0 ? (
            <div style={{
              padding: '36px 0', textAlign: 'center', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 9a2 2 0 110-4 2 2 0 010 4zM9 9l5 5v3h-3v-2h-2v-2H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>No API keys yet</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', maxWidth: 240 }}>
                Create your first key to start routing LLM calls through Margexa.
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              {keys.map((k, i) => (
                <div key={k.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M7 9a2 2 0 110-4 2 2 0 010 4zM9 9l5 5v3h-3v-2h-2v-2H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{k.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                      {k.prefix}{'•'.repeat(10)} · created {k.created_at}
                      {k.last_used_at ? ` · last used ${k.last_used_at}` : ' · never used'}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10.5, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                    background: k.is_active ? 'var(--success-tint)' : 'var(--surface-2)',
                    color: k.is_active ? 'var(--success)' : 'var(--ink-4)',
                    fontFamily: 'var(--font-mono)', fontWeight: 500,
                  }}>{k.is_active ? 'active' : 'revoked'}</span>
                  <button
                    onClick={() => revokeKey(k.id)}
                    style={{
                      flexShrink: 0, padding: '4px 10px', fontSize: 11.5,
                      background: 'var(--surface)', border: '1px solid var(--line-2)',
                      borderRadius: 6, cursor: 'pointer', color: 'var(--danger)',
                    }}>Revoke</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Spotlight>
    </>
  );
}

// ─── Audit log / activity — fetches from /api/audit-logs
function AuditLog() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (Array.isArray(json)) setEvents(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Activity log"
          sub="All actions across this workspace · last 30 days"
          action={<a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Export audit trail →</a>} />
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>No activity recorded yet.</div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'var(--line)' }} />
            {events.map((e, i) => (
              <div key={e.id ?? i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '8px 0', position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: -20, top: 10,
                  width: 11, height: 11, borderRadius: 6,
                  background: 'var(--bg)', border: '1.5px solid var(--line-3)',
                }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{e.who}</span>
                  <span style={{ color: 'var(--ink-3)' }}>{e.what}</span>
                  <span className="mono" style={{
                    fontSize: 11.5, padding: '1px 7px', background: 'var(--surface-2)',
                    border: '1px solid var(--line)', borderRadius: 4, color: 'var(--ink-2)',
                  }}>{e.target}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>{e.when}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Spotlight>
  );
}

// ─── Pending invites
function PendingInvites({ invites, onResend, onRevoke }) {
  if (!invites.length) return null;
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Pending invites"
          sub={`${invites.length} invitation${invites.length > 1 ? 's' : ''} awaiting acceptance`} />
        {invites.map((inv, i) => (
          <div key={inv.id ?? i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
          }}>
            <Avatar name={inv.email} c="var(--surface-2)" size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>{inv.email}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>sent {inv.sent}</div>
            </div>
            <RoleChip role={inv.role} />
            <button
              onClick={() => onResend(inv.id)}
              style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer', color: 'var(--ink-2)' }}>
              Resend
            </button>
            <button
              onClick={() => onRevoke(inv.id)}
              style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer', color: 'var(--ink-3)' }}>
              Revoke
            </button>
          </div>
        ))}
      </div>
    </Spotlight>
  );
}

// ─── Invite modal
function InviteModal({ onClose, onInvited }) {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState('member');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);

  const submit = () => {
    if (!email.trim()) { setErr('Please enter an email address.'); return; }
    setSaving(true); setErr(null);
    fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' },
      body: JSON.stringify({ email: email.trim(), role }),
    })
      .then(r => r.json())
      .then(json => {
        setSaving(false);
        if (json.success) {
          window.MARGEXA_TOAST?.show({ message: `Invitation sent to ${email}`, tone: 'success' });
          onInvited(json.invitation);
          onClose();
        } else {
          setErr(json.message ?? 'Failed to send invite.');
          window.MARGEXA_TOAST?.show({ message: json.message ?? 'Failed to send invite.', tone: 'danger' });
        }
      })
      .catch(() => {
        setSaving(false);
        setErr('Network error — please try again.');
        window.MARGEXA_TOAST?.show({ message: 'Network error — invitation not sent.', tone: 'danger' });
      });
  };

  const ROLES = ['member', 'admin', 'developer', 'viewer', 'billing'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 14,
        padding: 28, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 18, color: 'var(--ink)' }}>Invite team member</div>

        <label style={{ fontSize: 12, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Email</label>
        <input
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 7,
            border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--ink)',
            outline: 'none', boxSizing: 'border-box', marginBottom: 14,
          }} />

        <label style={{ fontSize: 12, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Role</label>
        <select
          value={role} onChange={e => setRole(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 7,
            border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--ink)',
            outline: 'none', boxSizing: 'border-box', marginBottom: 18,
          }}>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>

        {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', fontSize: 13, border: '1px solid var(--line-2)',
            background: 'var(--surface)', borderRadius: 7, cursor: 'pointer', color: 'var(--ink-2)',
          }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{
            padding: '8px 16px', fontSize: 13, border: 'none',
            background: saving ? 'var(--ink-5)' : 'var(--accent)', color: '#fff',
            borderRadius: 7, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500,
          }}>{saving ? 'Sending…' : 'Send invite'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page
function TeamPage() {
  const [members, setMembers]       = useState([]);
  const [invites, setInvites]       = useState([]);
  const [apiKeyCount, setApiKeyCount] = useState(null); // null = loading
  const [loadingM, setLoadingM]     = useState(true);
  const [loadingI, setLoadingI]     = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch]         = useState('');

  const csrf = window.MARGEXA?.csrfToken || '';
  const hdrs = { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf };

  // Load API key count for the header stat
  useEffect(() => {
    fetch('/api/api-keys', { headers: { 'X-CSRF-TOKEN': csrf } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setApiKeyCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setApiKeyCount(0));
  }, []);

  // Load members
  useEffect(() => {
    fetch('/api/team/members', { headers: hdrs })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoadingM(false); })
      .catch(() => setLoadingM(false));
  }, []);

  // Load pending invites
  useEffect(() => {
    fetch('/api/team/invites', { headers: hdrs })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setInvites(Array.isArray(data) ? data : []); setLoadingI(false); })
      .catch(() => setLoadingI(false));
  }, []);

  const handleInvited = (inv) => {
    setInvites(prev => [inv, ...prev.filter(i => i.email !== inv.email)]);
  };

  const handleResend = (id) => {
    fetch(`/api/team/invites/${id}`, { method: 'PATCH', headers: hdrs })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.success) {
          window.MARGEXA_TOAST?.show({ message: 'Invitation resent.', tone: 'success' });
        }
      });
  };

  const handleRevoke = (id) => {
    if (!confirm('Revoke this invitation?')) return;
    fetch(`/api/team/invites/${id}`, { method: 'DELETE', headers: hdrs })
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.success) setInvites(prev => prev.filter(i => i.id !== id)); });
  };

  const filtered = search
    ? members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  return (
    <Stagger gap={50}>
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={handleInvited} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>Team & access</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {loadingM ? '…' : members.length} members
              {' · '}
              {loadingI ? '…' : invites.length} pending invite{invites.length !== 1 ? 's' : ''}
              {' · '}
              {apiKeyCount === null ? '…' : apiKeyCount} API key{apiKeyCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">SCIM provisioning</Button>
          <Button
            variant="primary" size="sm"
            onClick={() => setShowInvite(true)}
            icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}>
            Invite member
          </Button>
        </div>
      </div>

      {/* Members table */}
      <Spotlight>
        <div style={{ padding: '22px 22px 0' }}>
          <SectionHead
            title="Members"
            sub={`${loadingM ? '…' : filtered.length} active member${filtered.length !== 1 ? 's' : ''}`}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding: '5px 10px', fontSize: 12, background: 'var(--surface)',
                    border: '1px solid var(--line-2)', borderRadius: 6, outline: 'none', color: 'var(--ink)',
                  }} />
                <button style={{
                  padding: '5px 10px', fontSize: 11, background: 'var(--surface)', color: 'var(--ink-2)',
                  border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer',
                }}>Role: All</button>
              </div>
            } />
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loadingM ? (
            <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading members…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
              {search ? 'No members match your search.' : 'No members yet.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
                  {['Member', 'Role', 'Teams', 'Last active', '2FA', ''].map((h, i) => (
                    <th key={h} className="mono" style={{
                      textAlign: i === 5 ? 'right' : 'left', padding: '10px 16px',
                      fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => <MemberRow key={m.id ?? i} m={m} />)}
              </tbody>
            </table>
          )}
        </div>
      </Spotlight>

      <div style={{ height: 12 }} />

      {!loadingI && (
        <PendingInvites
          invites={invites}
          onResend={handleResend}
          onRevoke={handleRevoke} />
      )}

      <div style={{ height: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 12 }}>
        <PermissionMatrix />
        <APIKeys />
      </div>

      <div style={{ height: 12 }} />

      <AuditLog />
    </Stagger>
  );
}

Object.assign(window, { TeamPage });
