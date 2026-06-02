import { Header } from '@/components/layout/header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'
import { ChannelBreakdown } from '@/components/dashboard/channel-breakdown'
import { mockChannels } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify', amazon: 'Amazon', tiktok: 'TikTok Shop',
  etsy: 'Etsy', walmart: 'Walmart',
}

export default function ChannelsPage() {
  const totalRevenue = mockChannels.reduce((s, c) => s + c.revenue, 0)
  const totalProfit  = mockChannels.reduce((s, c) => s + c.netProfit, 0)
  const avgMargin    = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Header title="Analytics · Channels" subtitle="Performance by platform" />

      <div style={{ padding: '24px 28px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <MetricCard label="Total revenue"    value={formatCurrency(totalRevenue, 'EUR', true)} />
          <MetricCard label="Total net profit" value={formatCurrency(totalProfit, 'EUR', true)} />
          <MetricCard label="Average margin"   value={`${avgMargin.toFixed(1)}%`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 12 }}>
          {mockChannels.map((ch) => (
            <Card key={ch.platform}>
              <CardHeader>
                <CardTitle>{PLATFORM_LABELS[ch.platform] ?? ch.platform}</CardTitle>
                <Badge tone={ch.marginPercent >= 20 ? 'success' : ch.marginPercent >= 10 ? 'warning' : 'danger'}>
                  {ch.marginPercent.toFixed(1)}% margin
                </Badge>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Revenue',   value: formatCurrency(ch.revenue, ch.currency),   color: 'var(--ink)' },
                    { label: 'Net profit', value: formatCurrency(ch.netProfit, ch.currency), color: 'var(--success)' },
                    { label: 'Orders',    value: ch.ordersCount.toLocaleString('fr-FR'),      color: 'var(--ink)' },
                    { label: 'Change',    value: `${ch.change >= 0 ? '+' : ''}${ch.change.toFixed(1)}%`, color: ch.change >= 0 ? 'var(--success)' : 'var(--danger)' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="eyebrow" style={{ marginBottom: 4 }}>{item.label}</div>
                      <div className="tnum" style={{ fontSize: 18, fontWeight: 500, color: item.color, letterSpacing: '-0.02em' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Net profit by channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelBreakdown data={mockChannels} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
