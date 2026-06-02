# Margexa - Documentation Complète

## 1. Présentation du Produit

**Margexa** est une plateforme **AI Margin Intelligence** — un cockpit financier pour toute entreprise avec des coûts IA variables.

> **Promesse** : Voir où chaque euro de coût IA va, protéger la marge, et prouver le ROI à votre CFO.

Margexa n'est pas limité au support IA. Il s'adresse à toute organisation qui utilise des LLMs à volume : chatbots, agents, copilotes, automation, génération de contenu, codegen. La plateforme identifie les fuites de marge par workflow, par feature, par équipe — puis applique des règles métier pour les contenir.

### Tunnel Commercial V1

1. **Audit Gratuit** — `/audit` → Diagnostic en 5 minutes avec rapport partageable
2. **AI Margin Scan (297€ one-time)** — Audit approfondi one-shot, rapport complet et plan d'activation
3. **Continuous Control (349€/mois)** — Enforcement runtime, policies, routing intelligent, rapports CFO
4. **Scale (sur mesure)** — Multi-org, SLA, SSO, accompagnement dédié

### Cas d'usage V1

- **Cible** : Toute entreprise avec des coûts IA variables — support IA, agents, automation, copilotes équipes, génération de contenu
- **Providers supportés** : OpenAI et Anthropic (Gemini / Mistral à venir)
- **Modèles supportés** :
  - OpenAI : `gpt-4o-mini`, `gpt-4o`
  - Anthropic : `claude-3-5-haiku`, `claude-3-5-sonnet`

### Différenciation clé

| Concurrent | Positionnement | Margexa |
|---|---|---|
| LangSmith, Langfuse | Observabilité technique (traces, prompts) | **Observabilité financière** (coût, marge, ROI) |
| OpenAI Usage | Consommation par modèle | **Consommation par workflow, feature, équipe** |
| Datadog LLM | Infrastructure-first | **Business-first : P&L IA par ligne de service** |

---

## 2. Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend | Inertia.js + React |
| Styles | Tailwind CSS |
| Base de données | SQLite (dev) / PostgreSQL (prod) |
| Auth | Laravel Breeze + Sanctum |
| Queue | Laravel Jobs |

---

## 3. Modèle de Données

### 3.1 Organization
```
- id, name, slug
- monthly_budget_cap (plafond budget mensuel)
- settings (JSON: currency, timezone, is_demo)
```

### 3.2 User
```
- id, name, email, password
- organization_id (appartenance à une organisation)
```

### 3.3 Plan (Plans tarifaires)
```
- id, organization_id, name
- tier (low/mid/high)
- monthly_price (prix mensuel du plan)
- monthly_ai_budget (budget IA alloué)
- allow_premium_models (booléen)
- fallback_model (modèle de repli)
```

### 3.4 Customer (Clients de l'organisation)
```
- id, organization_id, plan_id
- name, external_id
```

### 3.5 Feature (Fonctionnalités IA)
```
- id, organization_id
- name, code
```

### 3.6 AIRequest (Requêtes IA enregistrées)
```
- id, organization_id
- provider, requested_provider (provider effectif vs demandé)
- model, requested_model (modèle effectif vs demandé)
- feature_id, customer_id, plan_id
- workflow_name
- prompt_tokens, completion_tokens
- estimated_cost
- enforcement_action (allowed/fallback/blocked)
- enforcement_reason
- created_at
```

### 3.7 Policy (Règles métier)
```
- id, organization_id
- name, type, scope
- description, is_active
- conditions (JSON: threshold)
- actions (JSON: fallback_model)
```

### 3.8 PolicyTrigger (Déclenchements de règles)
```
- id, organization_id, policy_id, ai_request_id
- attempt_uuid (pour dédupliquer les blocages)
- reason, target_label
- impacted_cost, estimated_cost_avoided
- metadata (JSON)
- triggered_at
```

### 3.9 ProviderConnection
```
- id, organization_id
- provider (openai/anthropic)
- connection_name, api_key_encrypted
- status (connected/disconnected)
- last_checked_at
```

### 3.10 AuditLog
```
- id, user_id, organization_id
- action, entity_type, entity_id
- payload (JSON), ip_address, user_agent
```

---

## 4. Modules Principaux

### 4.1 Onboarding

**Route** : `/onboarding`

**Deux modes d'entrée** :

1. **Mode Démo** ("Voir la démo")
   - Crée automatiquement l'organisation "Ma Démo Margexa"
   - Génère 3 features : Assistant IA Support, Réponse intelligente, Auto-réponse ticket
   - Génère 3 plans : Starter (29€), Pro (99€), Enterprise (299€)
   - Génère 4 clients : TechSupport SA, NovaCommerce, ServicePro, GrandCompte Inc.
   - Simule 150 requêtes IA avec déclenchement de règles

2. **Mode Configuration**
   - Saisie manuelle du nom d'organisation
   - Clés API optionnelles (OpenAI, Anthropic)
   - Option d'inclure les données de démo

---

### 4.2 Audit Gratuit (Public)

**Routes** :
- `GET /audit` — Formulaire en 5 étapes
- `POST /audit` — Soumission et génération du rapport
- `GET /audit/{token}` — Consultation du rapport (lien partageable)

**Étapes du formulaire** :

| Étape | Contenu |
|-------|---------|
| 1 | Nombre de requêtes IA par mois |
| 2 | Providers utilisés (OpenAI, Anthropic, etc.) |
| 3 | Coordonnées (email, entreprise) |
| 4 | Répartition des plans tarifaires |
| 5 | Fonctionnalités IA actives |

**Rapport généré** :
- Score de risque (0-100) avec jauge visuelle
- Niveau de risque (low/moderate/high/critical)
- Estimations financières :
  - Coût IA mensuel estimé
  - Gaspillage estimé
  - Économie potentielle
- Top 3 fuites de marge détectées
- Recommandations personnalisées
- Points de pression par plan
- Prochaines étapes concrètes

**Lien partageable** : Chaque audit génère un token d'accès unique permettant de consulter le rapport sans authentification.

---

### 4.3 Fuites de Marge (Margin Leaks)

**Route** : `/margin-leaks` (Dashboard principal)

**Métriques affichées** :

| Métrique | Description |
|----------|-------------|
| Coût total IA support | Somme des coûts estimés sur la période |
| Client le plus coûteux | Client avec la plus forte dépense |
| Fonctionnalité la plus coûteuse | Feature avec la plus forte dépense |
| Pics de dépenses suspects | Requêtes > 2x la moyenne |

**Tableaux de ventilation** :
- Coût par fonctionnalité
- Coût par client
- Coût par plan
- Plans sous pression (budget consommé > 80%)
- Part coût IA élevée (coût IA > 30% du prix plan)
- Clients à risque
- Top 5 fuites de marge

**Recommandations automatiques** :
- Plans avec part élevée de coût IA
- Clients dépassant les seuils
- Features génératrices de coûts

---

### 4.4 Règles (Policies)

**Route** : `/policies`

**Types de règles** :

| Type | Description |
|------|-------------|
| `budget_cap` | Plafond budgétaire |
| `alert_threshold` | Seuil d'alerte |
| `fallback_model` | Suggestion de modèle de repli |
| `premium_model_restriction` | Restriction modèles premium par plan |

**Portées** :
- `organization` : Toute l'organisation
- `plan` : Plan spécifique
- `customer` : Client spécifique
- `feature` : Fonctionnalité spécifique

**Modèles prédéfinis** :
1. Basic plan cannot use premium model
2. Alert when one customer exceeds monthly AI threshold (300€)
3. Flag expensive feature usage (250€)
4. Suggest cheaper fallback model after threshold (120€)
5. Restrict premium model usage to Pro/Enterprise
6. Alert if support feature exceeds monthly budget (500€)

---

### 4.5 Impact Marge (Margin Impact)

**Route** : `/margin-impact`

**Affiche** :
- **Tentatives bloquées** : Requêtes interdites par les règles
- **Coût évité** : Économies réalisées grâce aux règles
- **Historique des déclenchements** : Détail de chaque trigger avec :
  - Règle déclenchée
  - Action (allowed/fallback/blocked)
  - Modèle demandé → Modèle effectif
  - Coût avant → Coût après → Coût évité
  - Cible (client/plan/feature)

---

### 4.6 Paramètres (Settings)

**Route** : `/settings`

**Configuration** :
- Nom de l'organisation
- Devise (EUR/USD/GBP)
- Fuseau horaire
- Budget mensuel max
- Connexion OpenAI (clé API)
- Connexion Anthropic (clé API)

---

## 5. API d'Ingestion

### Endpoint

```
POST /api/ingest/ai-request
```

**Authentification** : Bearer Token (Sanctum)

### Payload

```json
{
  "organization_id": 1,
  "provider": "openai",
  "model": "gpt-4o",
  "prompt_tokens": 500,
  "completion_tokens": 200,
  "feature_name": "Assistant IA Support",
  "customer_name": "TechSupport SA",
  "plan_name": "Starter",
  "workflow_name": "ticket-auto-reply",
  "estimated_cost": 0.0045
}
```

### Réponse avec enforcement

```json
{
  "ok": true,
  "id": 42,
  "attempt_uuid": "abc-123",
  "enforcement": {
    "action": "fallback",
    "reason": "Plan Basic cannot use premium models",
    "requested_provider": "openai",
    "requested_model": "gpt-4o",
    "effective_provider": "openai",
    "effective_model": "gpt-4o-mini",
    "requested_cost": 0.0150,
    "effective_cost": 0.0015,
    "cost_avoided": 0.0135,
    "triggered_policies": [...]
  }
}
```

### Actions d'enforcement

| Action | Description |
|--------|-------------|
| `allowed` | Requête autorisée sans modification |
| `fallback` | Modèle remplacé par un modèle moins cher |
| `blocked` | Requête refusée (retourne HTTP 403) |

---

## 6. Services Métier

### 6.1 CostEstimatorService

Calcule le coût estimé d'une requête IA :

```
Coût = (prompt_tokens / 1000) × taux_prompt + (completion_tokens / 1000) × taux_completion
```

**Tarifs ($/1000 tokens)** :

| Modèle | Prompt | Completion |
|--------|--------|------------|
| gpt-4o-mini | 0.00015 | 0.0006 |
| gpt-4o | 0.0025 | 0.01 |
| claude-3-5-haiku | 0.0008 | 0.004 |
| claude-3-5-sonnet | 0.003 | 0.015 |

### 6.2 PolicyEvaluationService

Évalue les règles en deux phases :

1. **Preflight** : Avant création de la requête
   - Vérifie les restrictions de modèle premium
   - Détermine si fallback ou blocage nécessaire

2. **Post-création** : Après enregistrement
   - Évalue les seuils de budget
   - Génère les alerts

### 6.3 MarginMetricsService

Agrège les métriques pour le dashboard :
- Dépenses par feature/customer/plan
- Plans sous pression
- Clients à risque
- Recommandations automatiques

### 6.4 PolicyTemplateService

Fournit les modèles de règles prédéfinis prêts à activer.

### 6.5 DiagnosticService

Génère les audits et diagnostics de marge :
- Calcul du score de risque basé sur les données fournies
- Identification des fuites de marge principales
- Génération de recommandations personnalisées
- Estimation des coûts et économies potentielles
- Création de token d'accès unique pour partage

### 6.6 AttributionService

Gère l'attribution des leads et la validation des tokens d'audit.

---

## 7. User Flow Complet

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE (/)                         │
│                                                                 │
│  "Margexa - Protégez vos marges sur le support IA"         │
│                                                                 │
│  [Se connecter]  [S'inscrire]                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INSCRIPTION (/register)                    │
│                                                                 │
│  Nom, Email, Mot de passe                                      │
│  [Créer mon compte]                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ONBOARDING (/onboarding)                    │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   Voir la démo      │    │    Configurer       │            │
│  │   (30 secondes)     │    │  (configuration)    │            │
│  │                     │    │                     │            │
│  │  → Données auto     │    │  → Nom organisation │            │
│  │  → 150 requêtes     │    │  → Clés API (opt)   │            │
│  │  → Prêt à explorer  │    │  → Données démo?    │            │
│  └─────────────────────┘    └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 FUITES DE MARGE (/margin-leaks)                 │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Coût total│ │Top client│ │Top feature│ │Pics      │          │
│  │ €234.56  │ │ €45.23   │ │  €67.89  │ │   12     │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  [Plus grosse fuite de marge]                                  │
│  [Coût par feature] [Coût par client] [Coût par plan]          │
│  [Plans sous pression] [Clients à risque]                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RÈGLES (/policies)                         │
│                                                                 │
│  [Modèles prédéfinis]                                          │
│  - Basic plan cannot use premium model  [Activer]              │
│  - Alert customer > 300€               [Activer]               │
│  - Fallback après seuil                [Activer]               │
│                                                                 │
│  [Créer une règle personnalisée]                               │
│  Nom, Type, Portée, Seuil, Modèle de repli                    │
│                                                                 │
│  [Liste des règles actives]                                    │
│  - Modifier / Supprimer / Activer-Désactiver                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  IMPACT MARGE (/margin-impact)                  │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Tentatives       │  │ Coût évité       │                   │
│  │ bloquées: 23     │  │ €156.78          │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  [Historique des déclenchements]                               │
│  | Règle | Action | Modèle | Coût évité | Cible | Date |      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARAMÈTRES (/settings)                       │
│                                                                 │
│  Organisation: Ma Démo Margexa                             │
│  Devise: EUR                                                   │
│  Budget max: 1000€                                             │
│                                                                 │
│  [Connexion OpenAI]    ● Connecté    [Déconnecter]             │
│  [Connexion Anthropic] ○ Non connecté [Connecter]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Navigation

| Lien | Route | Description |
|------|-------|-------------|
| Fuites de marge | `/margin-leaks` | Dashboard principal |
| Règles | `/policies` | Gestion des règles |
| Impact marge | `/margin-impact` | Suivi des économies |
| Paramètres | `/settings` | Configuration |
| Profil | `/profile` | Compte utilisateur |

---

## 9. Flux d'Intégration API

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION CLIENT                           │
│                 (Votre app SaaS support)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/ingest/ai-request
                              │ Authorization: Bearer <token>
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Margexa API                            │
│                                                                 │
│  1. Validation du payload                                       │
│  2. Résolution feature/customer/plan                           │
│  3. Estimation du coût                                          │
│  4. Évaluation preflight des règles                            │
│     ├── BLOCKED → 403 + log trigger                            │
│     ├── FALLBACK → swap modèle + recalcul coût                 │
│     └── ALLOWED → continuer                                     │
│  5. Création AIRequest                                          │
│  6. Log des triggers                                            │
│  7. Retour enforcement                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION CLIENT                           │
│                                                                 │
│  - Si action=blocked → ne pas appeler l'IA                     │
│  - Si action=fallback → utiliser effective_model                │
│  - Si action=allowed → utiliser modèle demandé                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Données de Démo

### Plans

| Plan | Prix | Budget IA | Premium | Tier |
|------|------|-----------|---------|------|
| Starter | 29€ | 150€ | Non | low |
| Pro | 99€ | 450€ | Oui | mid |
| Enterprise | 299€ | 1400€ | Oui | high |

### Features

- Assistant IA Support
- Réponse intelligente
- Auto-réponse ticket

### Customers

| Client | Plan |
|--------|------|
| TechSupport SA | Starter |
| NovaCommerce | Starter |
| ServicePro | Pro |
| GrandCompte Inc. | Enterprise |

### Workflows simulés

- `ticket-auto-reply`
- `live-chat-assist`
- `csat-followup`

---

## 11. Structure des Fichiers

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── AIRequestIngestionController.php  # API ingestion
│   │   ├── AuditController.php                   # Audit public
│   │   ├── MarginLeaksController.php             # Dashboard
│   │   ├── PolicyController.php                  # CRUD règles
│   │   ├── MarginImpactController.php            # Impact
│   │   ├── OnboardingController.php              # Onboarding
│   │   └── SettingsController.php                # Paramètres
│   └── Requests/                                 # Validation
├── Jobs/
│   ├── SendPolicyTriggerNotificationJob.php      # Notifications
│   └── SimulateDemoRequestsJob.php               # Simulation démo
├── Models/
│   ├── AIRequest.php
│   ├── Customer.php
│   ├── DiagnosticRequest.php                     # Audits publics
│   ├── Feature.php
│   ├── Organization.php
│   ├── Plan.php
│   ├── Policy.php
│   ├── PolicyTrigger.php
│   └── ProviderConnection.php
└── Services/
    ├── AttributionService.php                    # Attribution leads
    ├── CFOMetricsService.php                     # Métriques CFO
    ├── CostEstimatorService.php                  # Calcul coûts
    ├── DiagnosticService.php                     # Audits/diagnostics
    ├── MarginMetricsService.php                  # Métriques marge
    ├── PolicyEvaluationService.php               # Évaluation règles
    ├── PolicyTemplateService.php                 # Modèles règles
    └── SimulationService.php                     # Simulation données

resources/js/Pages/
├── Welcome.jsx                                   # Landing
├── Auth/                                         # Authentification
├── Onboarding/Index.jsx                          # Onboarding
├── MarginLeaks/Index.jsx                         # Dashboard
├── Policies/Index.jsx                            # Règles
├── MarginImpact/Index.jsx                        # Impact
├── Settings/Index.jsx                            # Paramètres
└── Public/
    ├── Audit.jsx                                 # Formulaire audit
    ├── AuditResult.jsx                           # Rapport audit
    └── Pricing.jsx                               # Page tarifs
```

---

## 12. Résumé Fonctionnel

**Margexa en une phrase** :
> Un outil SaaS qui surveille les coûts IA de votre support, identifie les fuites de marge, et applique automatiquement des règles métier pour éviter que vos features IA ne mangent vos profits.

**Valeur clé** :
1. **Audit** : Diagnostic gratuit en 5 minutes avec rapport partageable
2. **Visibilité** : Voir où part l'argent (par client, par feature, par plan)
3. **Contrôle** : Appliquer des règles (plafonds, restrictions, fallback)
4. **Mesure** : Quantifier les économies réalisées

**Offres** :
| Plan | Prix | Inclus |
|------|------|--------|
| AI Margin Scan | 297€ one-time | Audit complet, rapport, recommandations de policies |
| Continuous Control | 349€/mois | Enforcement, policies, routing, rapports CFO, API |
| Scale | Sur mesure | + SSO, multi-org, SLA premium |

**Pour qui** :
- Équipes produit SaaS avec des features IA (support, chat, tickets)
- Responsables marge / pricing
- Ops qui veulent contrôler les coûts LLM

---

*Documentation mise à jour le 14 mars 2026*
