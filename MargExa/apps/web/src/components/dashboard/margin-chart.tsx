'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TimeSeriesPoint } from '@/types'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl p-3 text-xs border shadow-lg"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)', minWidth: '160px' }}
      role="tooltip"
    >
      <p className="font-medium mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>{label}</p>
      {payload.map((e: any) => (
        <div key={e.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: e.color }} aria-hidden="true" />
            <span style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>{e.name}</span>
          </div>
          <span className="font-data font-medium tabular-nums" style={{ color: 'var(--text)' }}>
            {e.dataKey === 'marginPercent' ? `${e.value.toFixed(1)}%` : `€${e.value.toLocaleString('fr-FR')}`}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MarginChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <div role="img" aria-label="Graphique évolution marge et profit 30 jours">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-subtle)', fontSize: 11, fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="rev" orientation="left" tick={{ fill: 'var(--text-subtle)', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
          <YAxis yAxisId="marg" orientation="right" tick={{ fill: 'var(--text-subtle)', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-subtle)', paddingTop: 8, fontFamily: 'Outfit' }} iconSize={6} iconType="circle" />
          <Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenu" stroke="var(--info)" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: 'var(--info)', strokeWidth: 0 }} />
          <Line yAxisId="rev" type="monotone" dataKey="netProfit" name="Profit net" stroke="var(--success)" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: 'var(--success)', strokeWidth: 0 }} />
          <Line yAxisId="marg" type="monotone" dataKey="marginPercent" name="Marge %" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} activeDot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
