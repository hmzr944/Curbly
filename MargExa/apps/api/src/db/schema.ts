import {
  pgTable, uuid, text, timestamp, integer, real, boolean, index,
} from 'drizzle-orm/pg-core'

/* ─── Workspaces ──────────────────────────────────────────────────────────── */
export const workspaces = pgTable('workspaces', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          text('name').notNull(),
  user_id:       text('user_id').notNull(), // Supabase auth.users.id
  openai_key:    text('openai_key'),        // stored encrypted (AES-256)
  anthropic_key: text('anthropic_key'),
  gemini_key:    text('gemini_key'),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

/* ─── API keys ────────────────────────────────────────────────────────────── */
export const apiKeys = pgTable('api_keys', {
  id:           uuid('id').primaryKey().defaultRandom(),
  key:          text('key').notNull().unique(),   // mrg_ prefix + 32 random chars
  workspace_id: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  name:         text('name').notNull(),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  last_used_at: timestamp('last_used_at', { withTimezone: true }),
  is_active:    boolean('is_active').default(true).notNull(),
}, (t) => [
  index('api_keys_key_idx').on(t.key),
  index('api_keys_workspace_idx').on(t.workspace_id),
])

/* ─── Requests ────────────────────────────────────────────────────────────── */
export const requests = pgTable('requests', {
  id:                uuid('id').primaryKey().defaultRandom(),
  created_at:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  model:             text('model').notNull(),
  prompt_tokens:     integer('prompt_tokens'),
  completion_tokens: integer('completion_tokens'),
  cost_usd:          real('cost_usd'),
  latency_ms:        integer('latency_ms'),
  workspace_id:      uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  status:            integer('status'),  // HTTP status (200 | 429 | 500)
}, (t) => [
  index('requests_workspace_created_idx').on(t.workspace_id, t.created_at),
])

/* ─── Types ───────────────────────────────────────────────────────────────── */
export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
export type Request = typeof requests.$inferSelect
export type NewRequest = typeof requests.$inferInsert
