'use client'
import { WarningCircle, Info, CheckCircle, CaretRight } from '@phosphor-icons/react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Alert } from '@/types'

interface AlertFeedProps { alerts: Alert[]; compact?: boolean }

const CFG = {
  critical: { icon: WarningCircle, color: 'var(--danger)', bg: 'var(--danger-muted)', border: 'rgba(220,38,38,0.2)' },
  warning:  { icon: WarningCircle, color: 'var(--warning)', bg: 'var(--warning-muted)', border: 'rgba(202,138,4,0.2)' },
  info:     { icon: Info,          color: 'var(--info)',    bg: 'var(--info-muted)',    border: 'rgba(2,132,199,0.2)' },
}

export function AlertFeed({ alerts, compact = false }: AlertFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="py-8 text-center" role="status">
        <CheckCircle size={28} style={{ color: 'var(--success)', margin: '0 auto 8px' }} weight="duotone" />
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
          Aucune alerte — tout est normal
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2" role="list" aria-label="Alertes">
      {alerts.slice(0, compact ? 4 : undefined).map((a) => {
        const cfg = CFG[a.severity]
        const Icon = cfg.icon
        return (
          <li
            key={a.id}
            className="flex items-start gap-3 p-3 rounded-xl border"
            style={{ background: cfg.bg, borderColor: cfg.border }}
          >
            <Icon size={15} weight="duotone" style={{ color: cfg.color, marginTop: '1px', flexShrink: 0 }} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>
                  {a.title}
                </p>
                {!a.isRead && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} aria-label="Non lu" />
                )}
              </div>
              {!compact && (
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
                  {a.message}
                </p>
              )}
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)', fontFamily: 'Outfit, sans-serif' }}>
                <time dateTime={new Date(a.createdAt).toISOString()}>
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: fr })}
                </time>
              </p>
            </div>
          </li>
        )
      })}
      {compact && alerts.length > 4 && (
        <li>
          <Link
            href="/intelligence/alerts"
            className="flex items-center justify-center gap-1 py-2 text-xs transition-colors duration-150"
            style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          >
            Voir toutes ({alerts.length})
            <CaretRight size={12} weight="bold" aria-hidden="true" />
          </Link>
        </li>
      )}
    </ul>
  )
}
