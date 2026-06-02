'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

/* ─── SVG icons (16×16, stroke 1.5) ──────────────────────────────────────── */
const I = {
  dash:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h7V3M14 3h7v7M21 14v7h-7M10 21H3v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gateway: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-4 4 8 2-4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  msg:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v12H8l-4 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  alert:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3z M12 10v4 M12 17v.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  chart:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 21V3 M3 21h18 M7 17v-6 M12 17V7 M17 17v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  team:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5 M17 11a3 3 0 100-6 M16 20c0-2 1-3.5 3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  card:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 10h18 M7 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  cog:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bell:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4l2-2z M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chev:    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>,
  plus:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6l2 2 4-4" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const navWorkspace = [
  { id: 'dashboard',  label: 'Dashboard',       href: '/dashboard',              icon: I.dash },
  { id: 'gateway',    label: 'AI Gateway',       href: '/gateway',                icon: I.gateway, badge: 'Live' as const },
  { id: 'policies',   label: 'Policies',         href: '/policies',               icon: I.shield },
  { id: 'prompts',    label: 'Prompts',           href: '/prompts',                icon: I.msg },
  { id: 'leaks',      label: 'Leak detection',   href: '/intelligence/alerts',    icon: I.alert, dot: 'warning' as const },
  { id: 'alerts',     label: 'Alerts',           href: '/intelligence/alerts',    icon: I.bell, dot: 'danger' as const },
  { id: 'analytics',  label: 'Analytics',        href: '/analytics/margin',       icon: I.chart },
]
const navAccount = [
  { id: 'team',       label: 'Team',             href: '/settings',               icon: I.team },
  { id: 'billing',    label: 'Billing',          href: '/settings',               icon: I.card },
  { id: 'settings',   label: 'Settings',         href: '/settings/integrations',  icon: I.cog },
]

/* ─── WorkspaceSwitcher ─────────────────────────────────────────────────── */
function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const workspaces = [
    { name: 'Acme Inc.', env: 'Production', color: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)', active: true },
    { name: 'Acme Inc.', env: 'Staging',    color: 'linear-gradient(135deg, #0E9F6E, #5B5BD6)' },
  ]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      const t = e.target as Element
      if (!t.closest('[data-ws-switcher]')) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div data-ws-switcher style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 8, padding: '7px 9px 7px 7px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 9,
          transition: 'border-color .15s var(--ease)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-3)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
      >
        <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Acme Inc.</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>Production</div>
        </span>
        <span style={{ color: 'var(--ink-4)' }}>{I.chev}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30,
          background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 10,
          padding: 6, boxShadow: 'var(--sh-pop)',
        }}>
          {workspaces.map((w, i) => (
            <button key={i} style={{
              width: '100%', background: w.active ? 'var(--surface-2)' : 'transparent',
              border: 'none', borderRadius: 6, padding: '7px 8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 9,
            }}>
              <span style={{ width: 20, height: 20, borderRadius: 5, background: w.color, flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: w.active ? 500 : 400 }}>{w.name}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{w.env}</div>
              </span>
              {w.active && I.check}
            </button>
          ))}
          <div style={{ height: 1, background: 'var(--line)', margin: '4px -6px' }} />
          <button style={{
            width: '100%', background: 'transparent', border: 'none', borderRadius: 6,
            padding: '8px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
            color: 'var(--ink-2)', fontSize: 13,
          }}>
            <span style={{ color: 'var(--ink-4)' }}>{I.plus}</span>
            New workspace
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── NavItem ────────────────────────────────────────────────────────────── */
function NavItem({
  item, active, onClick,
}: {
  item: typeof navWorkspace[number]
  active: boolean
  onClick?: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      href={item.href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
        background: active ? 'var(--surface-2)' : hover ? 'var(--surface)' : 'transparent',
        border: '1px solid', borderColor: active ? 'var(--line)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-2)',
        fontWeight: active ? 500 : 400, fontSize: 13,
        transition: 'all .12s var(--ease)',
      }}
      aria-current={active ? 'page' : undefined}
    >
      <span style={{ color: active ? 'var(--accent)' : 'var(--ink-4)', display: 'inline-flex', flexShrink: 0 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {'badge' in item && item.badge && (
        <Badge tone="success" dot style={{ fontSize: 9.5, padding: '2px 7px' }}>{item.badge}</Badge>
      )}
      {'dot' in item && item.dot && (
        <span style={{ width: 6, height: 6, borderRadius: 3, background: `var(--${item.dot})` }} />
      )}
    </Link>
  )
}

/* ─── NavGroup ───────────────────────────────────────────────────────────── */
function NavGroup({
  label, items, pathname,
}: {
  label: string
  items: typeof navWorkspace
  pathname: string
}) {
  return (
    <div>
      <div className="eyebrow" style={{ padding: '0 10px 8px', fontSize: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((it) => (
          <NavItem
            key={it.id}
            item={it}
            active={pathname === it.href || pathname.startsWith(it.href + '/')}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 232, background: 'var(--bg)', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        height: '100vh', position: 'sticky', top: 0,
      }}
      aria-label="Navigation principale"
    >
      {/* Workspace switcher */}
      <div style={{ padding: '16px 14px 8px' }}>
        <WorkspaceSwitcher />
      </div>

      {/* Quick search */}
      <div style={{ padding: '4px 14px 8px' }}>
        <button style={{
          width: '100%', background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--ink-4)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          transition: 'border-color .15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-3)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}>
          <span style={{ color: 'var(--ink-4)' }}>{I.search}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
          <span className="mono" style={{ fontSize: 10.5, padding: '2px 6px', background: 'var(--surface-2)', borderRadius: 4, color: 'var(--ink-3)' }}>⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
        <NavGroup label="Workspace" items={navWorkspace} pathname={pathname} />
        <div style={{ height: 18 }} />
        <NavGroup label="Account" items={navAccount} pathname={pathname} />
      </div>

      {/* Plan card */}
      <div style={{ padding: '8px 14px 16px' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Badge tone="accent">Business</Badge>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>76% used</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: '76%', height: '100%', background: 'var(--accent)', transition: 'width .8s var(--ease)' }} />
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8 }}>
            <span className="tnum">$190k</span>
            <span style={{ color: 'var(--ink-4)' }}> / 250k spend</span>
          </div>
          <button style={{
            width: '100%', background: 'var(--ink)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 500,
            transition: 'background .15s var(--ease)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#27272A')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink)')}>
            Upgrade plan
          </button>
        </div>
      </div>
    </aside>
  )
}
