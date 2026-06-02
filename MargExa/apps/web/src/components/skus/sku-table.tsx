'use client'
import { WarningCircle, CheckCircle, Question } from '@phosphor-icons/react'
import type { SKUMetrics } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const PLATFORM_LABELS: Record<string, string> = { shopify: 'Shopify', amazon: 'Amazon', tiktok: 'TikTok', etsy: 'Etsy' }

function RiskIcon({ score }: { score?: number }) {
  if (score === 2) return <WarningCircle size={14} weight="duotone" style={{ color: 'var(--danger)' }} aria-label="Risque critique" />
  if (score === 1) return <WarningCircle size={14} weight="duotone" style={{ color: 'var(--warning)' }} aria-label="Risque modéré" />
  return <CheckCircle size={14} weight="duotone" style={{ color: 'var(--success)' }} aria-label="Sain" />
}

export function SKUTable({ skus, compact = false }: { skus: SKUMetrics[]; compact?: boolean }) {
  const sorted = [...skus].sort((a, b) => b.netProfit - a.netProfit)
  const displayed = compact ? sorted.slice(0, 5) : sorted

  return (
    <div className="overflow-x-auto" role="region" aria-label="Performance produits">
      <table className="w-full" style={{ fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Produit', 'Canal', 'Revenu', 'Profit net', 'Marge', ''].map((h, i) => (
              <th
                key={h + i}
                className={`py-2 pr-3 font-semibold uppercase tracking-wide ${i > 1 ? 'text-right' : 'text-left'}`}
                style={{ color: 'var(--text-subtle)', letterSpacing: '0.06em', fontFamily: 'Outfit, sans-serif' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((sku) => (
            <tr
              key={sku.sku}
              className="transition-colors duration-150 cursor-default"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="py-2.5 pr-3">
                <p className="font-medium truncate max-w-[160px]" style={{ color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{sku.name}</p>
                <p className="font-data text-[10px]" style={{ color: 'var(--text-subtle)' }}>{sku.sku}</p>
              </td>
              <td className="py-2.5 pr-3">
                <Badge variant="muted" style={{ fontFamily: 'Outfit, sans-serif' }}>{PLATFORM_LABELS[sku.platform] ?? sku.platform}</Badge>
              </td>
              <td className="py-2.5 pr-3 text-right font-data tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(sku.revenue, sku.currency)}
              </td>
              <td className="py-2.5 pr-3 text-right font-data tabular-nums">
                {!sku.hasCogs ? (
                  <span style={{ color: 'var(--text-subtle)' }}>—</span>
                ) : (
                  <span style={{ color: sku.netProfit > 0 ? 'var(--success)' : sku.netProfit < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {formatCurrency(sku.netProfit, sku.currency)}
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-3 text-right">
                {!sku.hasCogs ? (
                  <span className="flex items-center justify-end gap-1 text-xs" style={{ color: 'var(--text-subtle)' }} title="COGS manquant">
                    <Question size={13} aria-hidden="true" /> COGS?
                  </span>
                ) : (
                  <Badge variant={sku.marginPercent >= 20 ? 'success' : sku.marginPercent >= 10 ? 'warning' : 'danger'}>
                    {sku.marginPercent.toFixed(1)}%
                  </Badge>
                )}
              </td>
              <td className="py-2.5 text-right">
                <div className="flex justify-end">
                  <RiskIcon score={sku.riskScore} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
