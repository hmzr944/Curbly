import { Hono } from 'hono'
import { eq, and, gte, sql, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { requests } from '../db/schema.js'

const analytics = new Hono()

// Middleware: extract workspace_id from query param (set by Next.js API proxy after auth)
analytics.use('*', async (c, next) => {
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)
  c.set('workspaceId' as never, workspaceId)
  await next()
})

analytics.get('/overview', async (c) => {
  const workspaceId = c.get('workspaceId' as never) as string
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [row] = await db
    .select({
      total_requests: sql<number>`count(*)::int`,
      total_cost:     sql<number>`coalesce(sum(cost_usd), 0)`,
      avg_latency:    sql<number>`coalesce(avg(latency_ms), 0)`,
      error_count:    sql<number>`count(*) filter (where status >= 400)::int`,
    })
    .from(requests)
    .where(and(eq(requests.workspace_id, workspaceId), gte(requests.created_at, since)))

  return c.json({
    total_requests: row?.total_requests ?? 0,
    total_cost_usd: Number((row?.total_cost ?? 0).toFixed(4)),
    avg_latency_ms: Math.round(row?.avg_latency ?? 0),
    error_rate: row?.total_requests
      ? Number(((row.error_count / row.total_requests) * 100).toFixed(1))
      : 0,
  })
})

analytics.get('/spend-chart', async (c) => {
  const workspaceId = c.get('workspaceId' as never) as string
  const days = Number(c.req.query('days') ?? '30')
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      day:  sql<string>`date_trunc('day', created_at)::date::text`,
      cost: sql<number>`coalesce(sum(cost_usd), 0)`,
    })
    .from(requests)
    .where(and(eq(requests.workspace_id, workspaceId), gte(requests.created_at, since)))
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`)

  return c.json(rows.map(r => ({ date: r.day, cost: Number(r.cost.toFixed(4)) })))
})

analytics.get('/providers', async (c) => {
  const workspaceId = c.get('workspaceId' as never) as string
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      model: requests.model,
      count: sql<number>`count(*)::int`,
      cost:  sql<number>`coalesce(sum(cost_usd), 0)`,
    })
    .from(requests)
    .where(and(eq(requests.workspace_id, workspaceId), gte(requests.created_at, since)))
    .groupBy(requests.model)
    .orderBy(desc(sql`sum(cost_usd)`))

  return c.json(rows.map(r => ({
    model: r.model,
    count: r.count,
    cost_usd: Number(r.cost.toFixed(4)),
  })))
})

analytics.get('/live-requests', async (c) => {
  const workspaceId = c.get('workspaceId' as never) as string

  const rows = await db
    .select()
    .from(requests)
    .where(eq(requests.workspace_id, workspaceId))
    .orderBy(desc(requests.created_at))
    .limit(20)

  return c.json(rows)
})

export default analytics
