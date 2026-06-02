'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const I = {
  bell:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4l2-2z M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const items = [
    { sev: 'danger', t: 'Runaway agent detected', s: 'apps/billing · $24/min for 11 min', time: '2m' },
    { sev: 'warning', t: 'Budget 80% used', s: 'Workspace Acme · $200k cap', time: '24m' },
    { sev: 'success', t: 'Policy applied', s: 'cost-optimal · 312 calls rerouted', time: '1h' },
    { sev: 'neutral', t: 'New API key created', s: 'by Mara H.', time: '3h' },
  ] as const

  const dotC = { danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)', neutral: 'var(--ink-4)' }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line-2)',
          background: 'var(--surface)', cursor: 'pointer', position: 'relative',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-2)', transition: 'border-color .15s var(--ease)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-3)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
        aria-label="Notifications"
      >
        {I.bell}
        <span style={{
          position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 4,
          background: 'var(--danger)', border: '1.5px solid var(--surface)',
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 30,
          width: 360, background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 12, boxShadow: 'var(--sh-pop)', overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Notifications</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--ink-3)' }}>Mark all read</button>
          </div>
          {items.map((n, i) => (
            <div key={i} style={{
              padding: '12px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              display: 'flex', gap: 10,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: dotC[n.sev], marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{n.t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{n.s}</div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', flexShrink: 0 }}>{n.time}</span>
            </div>
          ))}
          <div style={{ padding: 10, background: 'var(--bg)', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <Link href="/intelligence/alerts" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View all alerts →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

interface HeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: string[]
  actions?: React.ReactNode
}

export function Header({ title, subtitle, breadcrumb = [], actions }: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(250,250,248,.82)',
        backdropFilter: 'saturate(160%) blur(14px)',
        WebkitBackdropFilter: 'saturate(160%) blur(14px)',
        borderBottom: '1px solid var(--line)',
        padding: '0 28px', height: 52,
        display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}
    >
      {/* Breadcrumb + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {breadcrumb.map((b, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{b}</span>
            <span style={{ color: 'var(--ink-5)' }}>/</span>
          </span>
        ))}
        <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        {subtitle && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{subtitle}</span>
        )}
      </div>

      {/* Actions */}
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}

      {/* Search */}
      <button style={{
        background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 8,
        padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--ink-3)', fontSize: 12, transition: 'border-color .15s var(--ease)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-3)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}>
        <span style={{ color: 'var(--ink-4)' }}>{I.search}</span>
        <span>Search · jump to…</span>
        <span className="mono" style={{ fontSize: 10, padding: '1px 5px', background: 'var(--surface-2)', borderRadius: 3, color: 'var(--ink-3)' }}>⌘K</span>
      </button>

      <Notifications />

      {/* Avatar */}
      <button style={{
        width: 30, height: 30, borderRadius: 15,
        border: '1px solid var(--line-2)',
        background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)',
        cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 600,
      }}>
        JD
      </button>
    </header>
  )
}
