import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { apiKeys } from '../db/schema.js'
import { generateApiKey } from '../lib/keygen.js'

const apiKeysRoute = new Hono()

apiKeysRoute.get('/', async (c) => {
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)

  const keys = await db
    .select({
      id:           apiKeys.id,
      name:         apiKeys.name,
      key_preview:  apiKeys.key,
      created_at:   apiKeys.created_at,
      last_used_at: apiKeys.last_used_at,
      is_active:    apiKeys.is_active,
    })
    .from(apiKeys)
    .where(eq(apiKeys.workspace_id, workspaceId))

  // Show only prefix for security after first reveal
  return c.json(keys.map(k => ({
    ...k,
    key_preview: k.key_preview.slice(0, 12) + '…',
  })))
})

apiKeysRoute.post('/', async (c) => {
  const { workspace_id, name } = await c.req.json()
  if (!workspace_id || !name) return c.json({ error: 'workspace_id and name required' }, 400)

  const key = generateApiKey()
  const [created] = await db.insert(apiKeys).values({
    key,
    workspace_id,
    name,
    is_active: true,
  }).returning()

  // Return the full key ONCE
  return c.json({ ...created, key }, 201)
})

apiKeysRoute.delete('/:id', async (c) => {
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, c.req.param('id')), eq(apiKeys.workspace_id, workspaceId)))

  return c.json({ success: true })
})

export default apiKeysRoute
