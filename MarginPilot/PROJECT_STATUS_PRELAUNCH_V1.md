# Margexa — Status post-fusion

_Dernière mise à jour : 2026-05-28_

---

## Ce qui est en place

### Architecture
- **Backend** : Laravel 11 + Sanctum + Breeze (auth → margexa-auth.blade.php)
- **Frontend** : Margexa SPA (React 18 UMD + Babel Standalone, `public/js/margexa/`)
- **Proxy OpenAI-compatible** : `/api/v1` → `LLMProxyController`
- **Billing Stripe** : `BillingController` + webhooks + entitlement middleware
- **Tests** : **106/106 passent** (PHPUnit Feature + Unit)

### Frontend SPA — état des fichiers
| Fichier | État |
|---|---|
| `tokens.css`, `components.jsx`, `fx.jsx` | Design system complet ✅ |
| `app-shell.jsx` | Sidebar + Topbar + CommandPalette ✅ |
| `app-entry.jsx` | Router + MargexaContext (window.MARGEXA) ✅ |
| `app-dashboard.jsx` | KPIs + Chart + LiveActivity → API réelle ✅ |
| `app-policies.jsx` | CRUD policies → /api/policies ✅ |
| `app-alerts.jsx` | Policy triggers → /api/policy-triggers ✅ |
| `app-docs.jsx` | Quick Start, Attribution, Policies, CFO Report ✅ |
| `app-gateway.jsx`, `app-analytics.jsx` | UI complète, données à brancher |
| `app-billing.jsx`, `app-team.jsx` | UI complète |
| `auth-pages.jsx` | LoginScreen + RegisterScreen ✅ |

---

## Ce qui reste à faire

1. **app-gateway.jsx** — Brancher sur `/api/providers/status`
2. **app-analytics.jsx** — Brancher sur `/api/analytics` (graphiques)
3. **app-team.jsx** — Invitations + gestion membres
4. **WorkspaceSwitcher** — Remplacer "Acme Inc." par `window.MARGEXA.organization.name`
5. **Topbar avatar** — Remplacer "JD" par les initiales de `window.MARGEXA.user.name`
6. **Onboarding in-app** — Rendre `onboarding.jsx` fonctionnel

---

## Lancer en local

```bash
composer install
npm install
cp .env.example .env && php artisan key:generate
php artisan migrate
npm run copy-margexa   # sync resources/js/Margexa/ → public/js/margexa/
npm run build          # Vite build
php artisan serve      # http://localhost:8000
```

## Variables d'environnement requises

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_DATABASE=margexa
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CONTROL=price_...
MAIL_FROM_ADDRESS=hello@margexa.com
```

---

## Ancien contenu (archivé)

> Le contenu ci-dessous est conservé à titre d'historique.

---

## Positioning (original)

Margexa is a B2B SaaS for AI support margin control.

Core promise:
- Prevent AI support from becoming unprofitable.

Product logic:
1. Where margin leaks
2. Which rule protects it
3. Which impact is proven

## Current V1 Scope

Supported use cases:
- chatbot support
- assistant SAV
- auto-reply tickets
- support copilot

Supported providers:
- OpenAI
- Anthropic

Supported models:
- gpt-4o-mini
- gpt-4o
- claude-3-5-haiku
- claude-3-5-sonnet

## Important Prelaunch Changes Implemented

### Public funnel
- Public funnel simplified to:
  - Free audit
  - AI Margin Scan
  - Continuous Control
- Dead links removed from public navigation and footer
- Public wording aligned with launch V1
- All public founder offer mentions removed

### Pricing and plans
- Single source of truth added in `config/Margexa.php`
- Public marketing label `Continuous Control` mapped to internal plan `control`
- Billing, registration, entitlements and public offers aligned on the same catalog

### Runtime scope tightening
- Model/provider scope reduced to the real V1 everywhere
- Audit, validation, diagnostic, proxy, routing and ingestion aligned
- Unsupported models are rejected instead of silently drifting

### Reliability
- Fatal runtime issues fixed in diagnostic and policy evaluation flows
- PHPUnit config now runs with SQLite in memory by default
- Critical feature tests added and updated

## Current Validation Status

Latest local result:
- `php artisan test`
- Result: `77 passed`, `11 skipped`

Skipped tests are older V1-alignment tickets already marked as pending in:
- Policy evaluation
- Simulation

## Lightweight Archive Intent

This archive is meant to be shareable and lighter than a full dev workspace.

Excluded from the lightweight package:
- `vendor/`
- `node_modules/`
- `.git/`
- runtime logs and caches
- generated frontend build artifacts

Included:
- application source
- config
- migrations
- tests
- frontend source
- this project status note
