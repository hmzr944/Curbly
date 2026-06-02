import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { apiKeys, workspaces, requests } from '../db/schema.js'
import { computeCost } from '../lib/pricing.js'

const proxy = new Hono()

async function resolveWorkspace(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer mrg_')) return null
  const key = authHeader.slice(7)
  const [row] = await db
    .select({ workspace: workspaces, keyId: apiKeys.id })
    .from(apiKeys)
    .innerJoin(workspaces, eq(apiKeys.workspace_id, workspaces.id))
    .where(eq(apiKeys.key, key))
    .limit(1)
  if (!row || !row.workspace) return null
  // fire-and-forget: update last_used_at
  db.update(apiKeys)
    .set({ last_used_at: new Date() })
    .where(eq(apiKeys.id, row.keyId))
    .execute()
    .catch(() => {})
  return row.workspace
}

proxy.get('/v1/models', async (c) => {
  const workspace = await resolveWorkspace(c.req.header('authorization'))
  if (!workspace) return c.json({ error: { message: 'Invalid API key', type: 'authentication_error' } }, 401)

  return c.json({
    object: 'list',
    data: [
      { id: 'gpt-4o',        object: 'model', created: 1706745600, owned_by: 'openai' },
      { id: 'gpt-4o-mini',   object: 'model', created: 1721174400, owned_by: 'openai' },
      { id: 'gpt-4-turbo',   object: 'model', created: 1706745600, owned_by: 'openai' },
      { id: 'gpt-3.5-turbo', object: 'model', created: 1677610602, owned_by: 'openai' },
    ],
  })
})

proxy.post('/v1/chat/completions', async (c) => {
  const workspace = await resolveWorkspace(c.req.header('authorization'))
  if (!workspace) return c.json({ error: { message: 'Invalid API key', type: 'authentication_error' } }, 401)
  if (!workspace.openai_key) return c.json({ error: { message: 'No OpenAI key configured for this workspace', type: 'configuration_error' } }, 400)

  const body = await c.req.json()
  const model: string = body.model ?? 'gpt-4o'
  const isStream: boolean = body.stream === true
  const startMs = Date.now()

  const upstreamRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workspace.openai_key}`,
    },
    body: JSON.stringify(body),
  })

  const latency_ms = Date.now() - startMs
  const status = upstreamRes.status

  if (!isStream) {
    const data = await upstreamRes.json()
    const promptTokens: number = data.usage?.prompt_tokens ?? 0
    const completionTokens: number = data.usage?.completion_tokens ?? 0
    const cost_usd = computeCost(model, promptTokens, completionTokens)

    db.insert(requests).values({
      model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost_usd,
      latency_ms,
      workspace_id: workspace.id,
      status,
    }).execute().catch(() => {})

    return c.json(data, status as 200)
  }

  // Streaming: pass through SSE and log after stream ends
  const encoder = new TextEncoder()
  let promptTokens = 0
  let completionTokens = 0

  const stream = new ReadableStream({
    async start(controller) {
      if (!upstreamRes.body) { controller.close(); return }
      const reader = upstreamRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        controller.enqueue(value)
        buffer += decoder.decode(value, { stream: true })

        // Extract usage from [DONE] chunk if present
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload)
            if (parsed.usage) {
              promptTokens = parsed.usage.prompt_tokens ?? 0
              completionTokens = parsed.usage.completion_tokens ?? 0
            }
            // count completion tokens from deltas as fallback
            if (parsed.choices?.[0]?.delta?.content) {
              completionTokens++
            }
          } catch { /* ignore */ }
        }
      }

      controller.close()

      const cost_usd = computeCost(model, promptTokens, completionTokens)
      db.insert(requests).values({
        model,
        prompt_tokens: promptTokens || null,
        completion_tokens: completionTokens || null,
        cost_usd,
        latency_ms: Date.now() - startMs,
        workspace_id: workspace.id,
        status,
      }).execute().catch(() => {})
    },
  })

  return new Response(stream, {
    status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})

export default proxy
