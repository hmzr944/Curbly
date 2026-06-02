'use client'
import { useEffect, useState } from 'react'

interface MetricCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  accent?: boolean
  loading?: boolean
}

export function MetricCard({ label, value, change, changeLabel, icon, accent = false, loading = false }: MetricCardProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 20 }} aria-hidden>
        <div className="skeleton" style={{ height: 11, width: 80, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 28, width: 110, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: 60 }} />
      </div>
    )
  }

  const up = change !== undefined && change > 0
  const down = change !== undefined && change < 0

  return (
    <div
      style={{
        background: accent ? 'var(--accent-tint)' : 'var(--surface)',
        border: `1px solid ${accent ? 'rgba(91,91,214,.2)' : 'var(--line)'}`,
        borderRadius: 'var(--r-lg)', padding: 20,
        transition: 'border-color .2s var(--ease), box-shadow .2s var(--ease)',
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(5px)',
        ...(visible ? { animation: 'fadeUp 400ms var(--ease-out) both' } : {}),
      }}
      role="figure"
      aria-label={`${label}: ${value}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="eyebrow">{label}</span>
        {icon && <span style={{ color: 'var(--ink-4)' }} aria-hidden>{icon}</span>}
      </div>
      <div className="tnum" style={{ fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
        {value}
      </div>
      {change !== undefined && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <span style={{
            padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            background: up ? 'var(--success-tint)' : down ? 'var(--danger-tint)' : 'var(--surface-2)',
            color: up ? 'var(--success)' : down ? 'var(--danger)' : 'var(--ink-4)',
          }}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && <span style={{ color: 'var(--ink-4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
