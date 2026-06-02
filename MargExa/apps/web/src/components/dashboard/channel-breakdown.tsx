'use client'
/*
  Emil: transition exact properties on chart elements.
  redesign: colored tinted shadows matching bg hue.
*/
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { ChannelMetrics } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const COLORS: Record<string, string> = {
  shopify: '#5B5BD6',
  amazon: '#0E9F6E',
  tiktok: '#C8341B',
  etsy:   '#B97A0B',
  walmart:'#8B5CF6',
}

const LABELS: Record<string, string> = {
  shopify: 'Shopify',
  amazon: 'Amazon',
  tiktok: 'TikTok',
  etsy: 'Etsy',
  walmart: 'Walmart',
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as ChannelMetrics
  return (
    <div
      className="rounded-xl p-3 text-xs border shadow-lg"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)', minWidth: '150px' }}
      role="tooltip"
    >
      <p className="font-semibold mb-2" style={{ color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>
        {LABELS[d.platform]}
      </p>
      <div className="space-y-1">
        {[
          ['Revenu', formatCurrency(d.revenue, d.currency)],
          ['Profit net', formatCurrency(d.netProfit, d.currency)],
          ['Marge', `${d.marginPercent.toFixed(1)}%`],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between gap-4">
            <span style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>{l}</span>
            <span className="font-data tabular-nums" style={{ color: 'var(--text)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChannelBreakdown({ data }: { data: ChannelMetrics[] }) {
  const chartData = data.map((d) => ({ ...d, name: LABELS[d.platform] ?? d.platform, fill: COLORS[d.platform] ?? 'var(--accent)' }))

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-subtle)', fontSize: 11, fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'var(--text-subtle)', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,14,16,0.04)' }} />
          <Bar dataKey="netProfit" radius={[4, 4, 0, 0]} fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>

      <div className="space-y-1">
        {data.map((ch) => (
          <div
            key={ch.platform}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg"
            style={{ transition: 'background-color 160ms cubic-bezier(0.23,1,0.32,1)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS[ch.platform] }} aria-hidden="true" />
              <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>{LABELS[ch.platform]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-data tabular-nums" style={{ color: 'var(--text-subtle)' }}>{formatCurrency(ch.revenue, ch.currency)}</span>
              <Badge variant={ch.marginPercent >= 20 ? 'success' : ch.marginPercent >= 10 ? 'warning' : 'danger'}>
                {ch.marginPercent.toFixed(1)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
