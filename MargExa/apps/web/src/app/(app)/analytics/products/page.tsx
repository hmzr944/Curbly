import { Header } from '@/components/layout/header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SKUTable } from '@/components/skus/sku-table'
import { MetricCard } from '@/components/ui/metric-card'
import { mockSKUs } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

export default function ProductsPage() {
  const totalRevenue  = mockSKUs.reduce((s, x) => s + x.revenue, 0)
  const totalProfit   = mockSKUs.filter((s) => s.hasCogs).reduce((s, x) => s + x.netProfit, 0)
  const negativeSKUs  = mockSKUs.filter((s) => s.hasCogs && s.netProfit < 0).length
  const missingCOGS   = mockSKUs.filter((s) => !s.hasCogs).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Header title="Analytics · Products" subtitle="Ranking by net margin" />

      <div style={{ padding: '24px 28px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricCard label="Active SKUs"        value={mockSKUs.length.toString()} />
          <MetricCard label="Total revenue"      value={formatCurrency(totalRevenue, 'EUR', true)} />
          <MetricCard label="Negative margin"    value={negativeSKUs.toString()} />
          <MetricCard label="Missing COGS"       value={missingCOGS.toString()} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All products — net margin ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <SKUTable skus={mockSKUs} compact={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
