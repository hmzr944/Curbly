import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { workspaces, type NewWorkspace } from '../db/schema.js'

const workspacesRoute = new Hono()

// Lookup workspace by Supabase user_id (internal — called from Next.js API routes)
workspacesRoute.get('/me', async (c) => {
  const userId = c.req.query('user_id')
  if (!userId) return c.json({ error: 'user_id required' }, 400)
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.user_id, userId))
    .limit(1)
  if (!workspace) return c.json(null, 404)
  return c.json(workspace)
})

workspacesRoute.post('/', async (c) => {
  const { name, user_id, openai_key, anthropic_key, gemini_key } = await c.req.json()
  if (!name || !user_id) return c.json({ error: 'name and user_id required' }, 400)

  const [workspace] = await db.insert(workspaces).values({
    name,
    user_id,
    openai_key:    openai_key    || null,
    anthropic_key: anthropic_key || null,
    gemini_key:    gemini_key    || null,
  }).returning()

  return c.json(workspace, 201)
})

workspacesRoute.get('/:id', async (c) => {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, c.req.param('id')))
    .limit(1)
  if (!workspace) return c.json({ error: 'Not found' }, 404)
  return c.json(workspace)
})

workspacesRoute.patch('/:id', async (c) => {
  const body = await c.req.json()
  const allowed: Record<string, unknown> = {}
  for (const k of ['name', 'openai_key', 'anthropic_key', 'gemini_key'] as const) {
    if (k in body) allowed[k] = body[k]
  }
  if (!Object.keys(allowed).length) return c.json({ error: 'Nothing to update' }, 400)

  const [updated] = await db
    .update(workspaces)
    .set(allowed as Partial<NewWorkspace>)
    .where(eq(workspaces.id, c.req.param('id')))
    .returning()
  return c.json(updated)
})

export default workspacesRoute
