import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

type SnapshotRow = Database['public']['Tables']['margin_snapshots']['Row']

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('margin_snapshots')
    .select('*')
    .gte('snapshot_date', from)
    .lte('snapshot_date', to)
    .is('sku', null)
    .is('platform', null)
    .order('snapshot_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []) as SnapshotRow[]
  const totals = rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue_cents,
      netProfit: acc.netProfit + row.net_profit_cents,
      orders: acc.orders + row.orders_count,
      units: acc.units + row.units_sold,
      cogs: acc.cogs + row.cogs_cents,
      platformFees: acc.platformFees + row.platform_fees_cents,
      shipping: acc.shipping + row.shipping_cents,
      advertising: acc.advertising + row.advertising_cents,
      returns: acc.returns + row.returns_cents,
    }),
    { revenue: 0, netProfit: 0, orders: 0, units: 0, cogs: 0, platformFees: 0, shipping: 0, advertising: 0, returns: 0 }
  )

  return NextResponse.json({
    period: { from, to },
    revenue: totals.revenue / 100,
    netProfit: totals.netProfit / 100,
    marginPercent: totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0,
    ordersCount: totals.orders,
    unitsSold: totals.units,
    timeSeries: rows.map((row) => ({
      date: row.snapshot_date,
      revenue: row.revenue_cents / 100,
      netProfit: row.net_profit_cents / 100,
      marginPercent: row.revenue_cents > 0 ? (row.net_profit_cents / row.revenue_cents) * 100 : 0,
    })),
  })
}
