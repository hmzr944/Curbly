-- Seed data de démonstration (dev uniquement)

INSERT INTO tenants (id, name, slug, plan, currency, clerk_org_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Store',
  'demo-store',
  'growth',
  'EUR',
  'org_demo'
);

INSERT INTO integrations (tenant_id, platform, status, shop_domain)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'shopify', 'active', 'demo-store.myshopify.com'),
  ('00000000-0000-0000-0000-000000000001', 'amazon', 'active', NULL);

INSERT INTO skus (tenant_id, sku, name, platform, cogs_per_unit_cents, currency)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'SKU-001', 'Produit Alpha 500ml', 'shopify', 1200, 'EUR'),
  ('00000000-0000-0000-0000-000000000001', 'SKU-002', 'Produit Beta Pack x3', 'shopify', 2800, 'EUR'),
  ('00000000-0000-0000-0000-000000000001', 'SKU-003', 'Produit Gamma Premium', 'amazon', 4500, 'EUR'),
  ('00000000-0000-0000-0000-000000000001', 'SKU-004', 'Produit Delta Basique', 'amazon', 800, 'EUR'),
  ('00000000-0000-0000-0000-000000000001', 'SKU-005', 'Produit Epsilon (sans marge)', 'shopify', 0, 'EUR');

INSERT INTO alerts (tenant_id, type, severity, title, message, metadata)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'fee_spike',
    'warning',
    'Fees Amazon +23% sur SKU-003',
    'Les frais FBA sur Produit Gamma Premium ont augmenté de 23% cette semaine sans changement de volume.',
    '{"sku": "SKU-003", "previous_fees_cents": 650, "current_fees_cents": 800}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'cogs_missing',
    'critical',
    'COGS manquants — 1 SKU affecté',
    'SKU-005 n''a pas de coût produit configuré. La marge calculée sera inexacte.',
    '{"sku": "SKU-005"}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'negative_margin_sku',
    'critical',
    'Marge négative détectée — SKU-004',
    'Produit Delta Basique génère une perte nette de -4.2% après fees et shipping.',
    '{"sku": "SKU-004", "margin_percent": -4.2}'
  );
