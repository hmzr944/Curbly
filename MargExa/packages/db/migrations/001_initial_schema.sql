-- ============================================================
-- MARGEXA — Migration 001 : Schéma initial
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'starter'
                    CHECK (plan IN ('starter','growth','scale','agency')),
  currency        TEXT NOT NULL DEFAULT 'EUR',
  clerk_org_id    TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_clerk_org_id ON tenants(clerk_org_id);

-- ============================================================
-- INTEGRATIONS (connexions API par plateforme)
-- ============================================================
CREATE TABLE integrations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform                TEXT NOT NULL
                            CHECK (platform IN ('shopify','amazon','tiktok','etsy','walmart')),
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','active','syncing','error','disconnected')),
  shop_domain             TEXT,
  access_token_encrypted  TEXT,
  refresh_token_encrypted TEXT,
  scopes                  TEXT,
  last_sync_at            TIMESTAMPTZ,
  error_message           TEXT,
  metadata                JSONB NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, platform, shop_domain)
);

CREATE INDEX idx_integrations_tenant_id ON integrations(tenant_id);
CREATE INDEX idx_integrations_status ON integrations(status);

-- ============================================================
-- SKUs / PRODUITS (avec COGS)
-- ============================================================
CREATE TABLE skus (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku                 TEXT NOT NULL,
  name                TEXT NOT NULL,
  platform            TEXT NOT NULL,
  cogs_per_unit_cents INTEGER NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'EUR',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sku, platform)
);

CREATE INDEX idx_skus_tenant_id ON skus(tenant_id);
CREATE INDEX idx_skus_sku ON skus(tenant_id, sku);

-- ============================================================
-- ORDERS (commandes normalisées)
-- ============================================================
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  integration_id      UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  platform            TEXT NOT NULL,
  external_id         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'completed',
  total_amount_cents  INTEGER NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'EUR',
  items               JSONB NOT NULL DEFAULT '[]',
  fees                JSONB NOT NULL DEFAULT '[]',
  occurred_at         TIMESTAMPTZ NOT NULL,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, platform, external_id)
);

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_occurred_at ON orders(tenant_id, occurred_at DESC);
CREATE INDEX idx_orders_platform ON orders(tenant_id, platform);

-- ============================================================
-- MARGE EVENTS (événements financiers normalisés)
-- ============================================================
CREATE TABLE marge_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL
                  CHECK (event_type IN ('order','return','fee','refund','adjustment')),
  platform      TEXT NOT NULL,
  external_id   TEXT NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  amount_cents  INTEGER NOT NULL,
  sku           TEXT,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  fee_type      TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, platform, external_id, event_type)
);

CREATE INDEX idx_marge_events_tenant ON marge_events(tenant_id);
CREATE INDEX idx_marge_events_occurred ON marge_events(tenant_id, occurred_at DESC);
CREATE INDEX idx_marge_events_sku ON marge_events(tenant_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_marge_events_type ON marge_events(tenant_id, event_type);

-- ============================================================
-- MARGIN SNAPSHOTS (aggregats journaliers pour perf dashboard)
-- ============================================================
CREATE TABLE margin_snapshots (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku                   TEXT,
  platform              TEXT,
  snapshot_date         DATE NOT NULL,
  revenue_cents         INTEGER NOT NULL DEFAULT 0,
  cogs_cents            INTEGER NOT NULL DEFAULT 0,
  platform_fees_cents   INTEGER NOT NULL DEFAULT 0,
  shipping_cents        INTEGER NOT NULL DEFAULT 0,
  advertising_cents     INTEGER NOT NULL DEFAULT 0,
  returns_cents         INTEGER NOT NULL DEFAULT 0,
  other_fees_cents      INTEGER NOT NULL DEFAULT 0,
  net_profit_cents      INTEGER NOT NULL DEFAULT 0,
  orders_count          INTEGER NOT NULL DEFAULT 0,
  units_sold            INTEGER NOT NULL DEFAULT 0,
  currency              TEXT NOT NULL DEFAULT 'EUR',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, snapshot_date, sku, platform)
);

CREATE INDEX idx_snapshots_tenant_date ON margin_snapshots(tenant_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_sku ON margin_snapshots(tenant_id, sku) WHERE sku IS NOT NULL;

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'info'
                CHECK (severity IN ('info','warning','critical')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_tenant_id ON alerts(tenant_id, is_read, created_at DESC);

-- ============================================================
-- SYNC JOBS (suivi des synchronisations)
-- ============================================================
CREATE TABLE sync_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued','running','completed','failed')),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  records_synced  INTEGER DEFAULT 0,
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_tenant ON sync_jobs(tenant_id, created_at DESC);
CREATE INDEX idx_sync_jobs_integration ON sync_jobs(integration_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marge_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE margin_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Politique d'isolation par tenant_id
-- Le claim JWT 'tenant_id' est injecté via Clerk session token

CREATE POLICY tenants_isolation ON tenants
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY integrations_isolation ON integrations
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY skus_isolation ON skus
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY orders_isolation ON orders
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY marge_events_isolation ON marge_events
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY margin_snapshots_isolation ON margin_snapshots
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY alerts_isolation ON alerts
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY sync_jobs_isolation ON sync_jobs
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER skus_updated_at
  BEFORE UPDATE ON skus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
