# Margexa

Margexa is a B2B SaaS focused on one promise:

**Prevent AI support from becoming unprofitable.**

It helps SaaS teams identify margin leaks across features, customers, and plans, then apply simple business policies to limit losses.

## V1 Scope

Margexa V1 provides:

- **Use case focus:** AI support (chatbot support, support assistant, ticket auto-replies)
- **LLM Providers:** OpenAI and Anthropic
- **V1 Supported Models:**
  - `gpt-4o` (OpenAI premium)
  - `gpt-4o-mini` (OpenAI economy)
  - `claude-3-5-sonnet` (Anthropic premium)
  - `claude-3-5-haiku` (Anthropic economy)

## Core Modules

1. **Margin Leaks** - Identify where AI burn bleeds margin
2. **Plan Policies** - Apply business rules to protect profitability
3. **Margin Impact** - Measure savings from policy enforcement
4. **What-If Simulator** - Project scenarios before deploying policies
5. **CFO Reports** - Finance-friendly metrics and exports
6. **AI Margin Diagnostic** - Public lead generation tool

## LLM Proxy (Drop-in Replacement)

Margexa acts as an OpenAI-compatible proxy. Simply change your base URL:

```javascript
// Before
const response = await fetch('https://api.openai.com/v1/chat/completions', {...})

// After
const response = await fetch('https://your-Margexa.app/api/v1/chat/completions', {
  headers: {
    'Authorization': 'Bearer YOUR_Margexa_TOKEN',
    'X-Customer-Id': '123',      // Optional: for attribution
    'X-Plan-Id': '456',          // Optional: for policy evaluation
    'X-Feature': 'live-chat',    // Optional: for cost tracking
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
})
```

## Tech Stack

- Laravel 11 + PHP 8.2+
- Inertia.js + React
- Tailwind CSS
- SQLite (dev) / PostgreSQL (prod)
- Laravel Sanctum (API tokens)

## Quick Start

1. Install dependencies:

   ```bash
   composer install
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Run migrations + seed demo data:

   ```bash
   php artisan migrate:fresh --seed
   ```

4. Start the app:

   ```bash
   php artisan serve
   npm run dev
   ```

## Demo Data Story

Seed data demonstrates support-first scenarios:

- **Plans:** Free / AI Margin Scan / Continuous Control (different entitlements)
- **Features:** AI Support Assistant / Smart Reply / Document Summary
- **Customers:** Mix of healthy and "whale" high-usage accounts
- **Policies:** Active enforcement showing blocked/fallback triggers

## API Quick Reference

### LLM Proxy (OpenAI-compatible)

#### POST /api/v1/chat/completions

Drop-in replacement for OpenAI's chat completions API.

```bash
curl -X POST https://your-Margexa.app/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: cust_123" \
  -H "X-Feature: live-chat" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

Response includes Margexa enforcement headers:
- `X-Margexa-Cost`: Actual cost of the request
- `X-Margexa-Enforcement`: Policy action (allowed/blocked/fallback)
- `X-Margexa-Attribution-Status`: Data quality indicator

#### GET /api/v1/models

List V1 supported models.

### CFO Reports

- `GET /api/cfo/readout` - Executive summary
- `GET /api/cfo/plan-economics` - AI cost per plan
- `GET /api/cfo/margin-protection` - Savings metrics
- `GET /api/cfo/weekly/csv` - Weekly export

### Simulation

- `GET /api/simulation/templates` - Available scenarios
- `POST /api/simulation/quick` - Run quick scenario
- `POST /api/simulation/compare` - Compare multiple scenarios

### Public Diagnostic

- `POST /api/diagnostic` - Submit diagnostic (no auth)
- `GET /api/diagnostic/{id}` - Get diagnostic result
- `POST /api/diagnostic/{id}/request-audit` - Request full audit

## Environment Variables

Key configuration in `.env.example`:

```env
# LLM Proxy
LLM_PROXY_ENABLED=true

# Policy defaults
POLICY_DEFAULT_MODE=enforce
NOTIFICATION_COOLDOWN_MINUTES=5

# Email
MAIL_SALES_TEAM=contact@Margexa.app

# Stripe Billing
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SCAN=price_xxx        # One-shot AI Margin Scan (€297)
STRIPE_PRICE_OBSERVE=price_xxx     # Observe plan (internal — not in public self-serve funnel)
STRIPE_PRICE_CONTROL=price_xxx     # Continuous Control (€349/month)
STRIPE_PRICE_SCALE=price_xxx       # Scale plan (custom)
```

## Billing & Plans V1

Margexa uses Stripe Checkout for billing with the following public offers:

| Offer | Price | Description |
|-------|-------|-------------|
| **Free** | €0 | Dashboard, demo mode, 100 req/day |
| **AI Margin Scan** | €297 (one-time) | Full audit report, policy recommendations |
| **Continuous Control** | €349/month | Enforcement, policies, routing, CFO reports, webhooks |
| **Scale** | Custom | Multi-org, SLA, SSO, dedicated support |

> Note: The `observe` plan exists as an internal compatibility layer but is not exposed in the public self-serve funnel.

## Running Tests

```bash
php artisan test
```

## Repository Hygiene

Excluded from shareable repo/zip:
- `.env` (secrets)
- `node_modules/`, `vendor/` (dependencies)
- `database/*.sqlite` (local data)

## V1 Readiness

- LLM Proxy with OpenAI-compatible API
- Policy enforcement (block/fallback/observe)
- Attribution tracking (customer/plan/feature)
- CFO-friendly reports with CSV export
- What-if simulation for decision support
- Public diagnostic for lead generation
- Email notifications on policy triggers

