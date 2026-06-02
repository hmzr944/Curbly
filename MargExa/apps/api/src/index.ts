import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import proxy from './routes/proxy.js'
import analytics from './routes/analytics.js'
import workspacesRoute from './routes/workspaces.js'
import apiKeysRoute from './routes/api-keys.js'

const app = new Hono()

app.use('*', cors({
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.get('/health', (c) => c.json({ ok: true }))

app.route('/', proxy)
app.route('/api/analytics', analytics)
app.route('/api/workspaces', workspacesRoute)
app.route('/api/api-keys', apiKeysRoute)

const port = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port }, () => {
  console.log(`Margexa API running on http://localhost:${port}`)
})
