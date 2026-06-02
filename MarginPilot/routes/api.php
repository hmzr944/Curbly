<?php

use App\Http\Controllers\Api\AIRequestIngestionController;
use App\Http\Controllers\Api\ApiKeyController;
use App\Http\Controllers\Api\AttributionMetricsController;
use App\Http\Controllers\Api\BillingApiController;
use App\Http\Controllers\Api\CFOReportController;
use App\Http\Controllers\Api\CircuitBreakerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiagnosticController;
use App\Http\Controllers\Api\LLMProxyController;
use App\Http\Controllers\Api\OnboardingApiController;
use App\Http\Controllers\Api\PolicyApiController;
use App\Http\Controllers\Api\RoutingController;
use App\Http\Controllers\Api\SimulationController;
use App\Http\Controllers\Api\StripeSyncController;
use App\Http\Controllers\Api\TeamApiController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Margexa API routes:
| - /api/diagnostic/* - Public diagnostic (commercial entry point)
| - /api/cfo/* - CFO-friendly metrics and exports
| - /api/simulation/* - What-if simulator for decision making
| - /api/ingest/* - Legacy ingestion endpoints
| - /api/metrics/* - Attribution & cost metrics (KPIs)
| - /api/routing/* - Economic router (THE BUSINESS CONTROL PLANE)
| - /v1/* - OpenAI-compatible proxy endpoints
|
*/

/*
|--------------------------------------------------------------------------
| Public Diagnostic API - COMMERCIAL ENTRY POINT
|--------------------------------------------------------------------------
|
| Public endpoints for the AI Margin Diagnostic - no auth required.
| This is the top-of-funnel lead generation tool that bridges to
| the full "AI Margin Audit" service.
|
| Endpoints:
|   POST /api/diagnostic              - Submit diagnostic and get instant audit
|   GET  /api/diagnostic/{token}      - Retrieve diagnostic result (by access_token)
|   POST /api/diagnostic/{token}/request-audit - Request full audit or demo
|
| Security: {token} is a 64-char random access_token, never the numeric ID.
|
*/
Route::prefix('diagnostic')->middleware('throttle:20,1')->group(function () {
    // Public endpoints (no auth) — throttled: 20 req/min/IP
    Route::post('/', [DiagnosticController::class, 'submit'])
        ->name('api.diagnostic.submit');

    Route::get('/{token}', [DiagnosticController::class, 'show'])
        ->name('api.diagnostic.show');

    Route::post('/{token}/request-audit', [DiagnosticController::class, 'requestAudit'])
        ->name('api.diagnostic.request-audit');
});

// Admin diagnostic endpoints (require admin role)
Route::prefix('admin/diagnostics')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [DiagnosticController::class, 'index'])
        ->name('api.admin.diagnostics.index');
    
    Route::patch('/{id}', [DiagnosticController::class, 'update'])
        ->name('api.admin.diagnostics.update');
    
    Route::get('/analytics', [DiagnosticController::class, 'analytics'])
        ->name('api.admin.diagnostics.analytics');
});

/*
|--------------------------------------------------------------------------
| CFO Reports API - FINANCE-FRIENDLY VIEWS
|--------------------------------------------------------------------------
|
| Finance-optimized endpoints for executive consumption:
| - Unit economics per plan (AI cost vs revenue)
| - Margin protection summary (savings, blocked waste)
| - Top margin-destroying customers
| - Weekly readout with PDF/CSV export
|
| Endpoints:
|   GET /api/cfo/readout          - Executive summary
|   GET /api/cfo/plan-economics   - AI cost per plan vs revenue
|   GET /api/cfo/margin-protection - Savings and blocked waste
|   GET /api/cfo/margin-destroyers - Top 5 problematic customers
|   GET /api/cfo/weekly           - Weekly readout (JSON)
|   GET /api/cfo/weekly/csv       - Weekly readout export (CSV)
|   GET /api/cfo/weekly/pdf       - Weekly readout export (printable HTML)
|   GET /api/cfo/trend            - Cost trend for charting
|
*/
Route::prefix('cfo')->middleware(['auth:sanctum', 'entitlement:cfo_reports'])->group(function () {
    // Executive summary
    Route::get('/readout', [CFOReportController::class, 'executiveReadout'])
        ->name('api.cfo.readout');
    
    // Plan unit economics
    Route::get('/plan-economics', [CFOReportController::class, 'planEconomics'])
        ->name('api.cfo.plan-economics');
    
    // Margin protection metrics
    Route::get('/margin-protection', [CFOReportController::class, 'marginProtection'])
        ->name('api.cfo.margin-protection');
    
    // Top margin destroyers
    Route::get('/margin-destroyers', [CFOReportController::class, 'marginDestroyers'])
        ->name('api.cfo.margin-destroyers');
    
    // Weekly readout
    Route::get('/weekly', [CFOReportController::class, 'weeklyReadout'])
        ->name('api.cfo.weekly');
    
    // Weekly exports (sanctum-bearer path — kept for API clients)
    // NOTE: SPA session downloads use the routes in the middleware('auth') group below.
    
    // Cost trend
    Route::get('/trend', [CFOReportController::class, 'costTrend'])
        ->name('api.cfo.trend');
});

/*
|--------------------------------------------------------------------------
| Simulation API - "BEFORE OPENING THE FLOODGATES"
|--------------------------------------------------------------------------
|
| What-if simulator for strategic decision making:
| - Volume scaling impact (usage x2, x3, etc.)
| - Model routing changes (shift % to cheaper models)
| - Plan-level policy changes (enable fallback)
| - Feature rollout projections (open to all)
| - Budget cap simulations
|
| Endpoints:
|   GET  /api/simulation/templates - Available scenario templates
|   GET  /api/simulation/quick     - Pre-built quick scenarios
|   POST /api/simulation/run       - Run a custom simulation
|   POST /api/simulation/compare   - Compare multiple scenarios
|
*/
Route::prefix('simulation')->middleware(['auth:sanctum', 'entitlement:simulation'])->group(function () {
    // Scenario templates
    Route::get('/templates', [SimulationController::class, 'templates'])
        ->name('api.simulation.templates');
    
    // Quick pre-built scenarios
    Route::get('/quick', [SimulationController::class, 'quickScenarios'])
        ->name('api.simulation.quick');
    
    // Run custom simulation
    Route::post('/run', [SimulationController::class, 'run'])
        ->name('api.simulation.run');
    
    // Compare scenarios
    Route::post('/compare', [SimulationController::class, 'compare'])
        ->name('api.simulation.compare');
});

// Legacy ingestion endpoint (for SDK backward compatibility)
Route::middleware(['auth:sanctum', 'throttle:ai-ingestion'])->group(function () {
    Route::post('/ingest/ai-request', [AIRequestIngestionController::class, 'store'])
        ->name('api.ingest.ai-request');
});

/*
|--------------------------------------------------------------------------
| Attribution & Metrics API - CENTRAL KPIs
|--------------------------------------------------------------------------
|
| Attribution quality is a core business metric, not a technical detail.
| These endpoints expose tagging quality for dashboard display.
|
*/
Route::prefix('metrics')->middleware(['auth:sanctum'])->group(function () {
    // Full attribution metrics
    Route::get('/attribution', [AttributionMetricsController::class, 'index'])
        ->name('api.metrics.attribution');
    
    // Compact summary for dashboard widgets
    Route::get('/attribution/summary', [AttributionMetricsController::class, 'summary'])
        ->name('api.metrics.attribution.summary');
});

/*
|--------------------------------------------------------------------------
| Economic Router API - THE BUSINESS CONTROL PLANE
|--------------------------------------------------------------------------
|
| The economic router makes explainable routing decisions:
| - "Ce plan a droit à tel niveau de modèle"
| - "Ce workflow escaladé a droit au premium"
| - "Ce segment reste sur modèle cheap"
| - "Voici pourquoi"
|
| Endpoints:
|   POST /api/routing/explain - Dry-run routing decision with explanation
|   GET  /api/routing/metrics - Routing analytics and KPIs
|   GET  /api/routing/rules   - List routing rules
|   POST /api/routing/rules   - Create routing rule
|   PUT  /api/routing/rules/{id} - Update routing rule
|   DELETE /api/routing/rules/{id} - Delete routing rule
|   GET  /api/routing/tiers   - Model tier classifications
|
*/
Route::prefix('routing')->middleware(['auth:sanctum'])->group(function () {
    // Explain routing decision (dry run)
    Route::post('/explain', [RoutingController::class, 'explain'])
        ->name('api.routing.explain');

    // Routing metrics and analytics
    Route::get('/metrics', [RoutingController::class, 'metrics'])
        ->name('api.routing.metrics');

    // Model tier classification reference
    Route::get('/tiers', [RoutingController::class, 'tiers'])
        ->name('api.routing.tiers');

    // Routing rules CRUD
    Route::get('/rules', [RoutingController::class, 'rules'])
        ->name('api.routing.rules');
    Route::post('/rules', [RoutingController::class, 'createRule'])
        ->name('api.routing.rules.create');
    Route::put('/rules/{id}', [RoutingController::class, 'updateRule'])
        ->name('api.routing.rules.update');
    Route::delete('/rules/{id}', [RoutingController::class, 'deleteRule'])
        ->name('api.routing.rules.delete');
});

/*
|--------------------------------------------------------------------------
| OpenAI-Compatible Proxy Routes - THE CONTROL PLANE
|--------------------------------------------------------------------------
|
| These routes provide a drop-in replacement for OpenAI/Anthropic APIs.
| Simply change your base URL to Margexa and add business metadata headers:
|
| Headers:
|   - Authorization: Bearer <your-Margexa-api-key>
|   - X-Customer-Id: <customer_id>           (optional)
|   - X-Customer-External-Id: <external_ref> (optional)
|   - X-Plan-Id: <plan_id>                   (optional)
|   - X-Feature: <feature_name>              (optional)
|   - X-Workflow: <workflow_name>            (optional)
|
| Example:
|   Before: fetch('https://api.openai.com/v1/chat/completions', {...})
|   After:  fetch('https://api.Margexa.io/v1/chat/completions', {...})
|
*/
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:llm-proxy', 'entitlement:proxy_access'])->group(function () {
    // Chat completions (main endpoint)
    Route::post('/chat/completions', [LLMProxyController::class, 'chatCompletions'])
        ->name('api.v1.chat.completions');
    
    // Legacy completions (non-chat)
    Route::post('/completions', [LLMProxyController::class, 'completions'])
        ->name('api.v1.completions');
    
    // Models listing
    Route::get('/models', [LLMProxyController::class, 'listModels'])
        ->name('api.v1.models');
    
    Route::get('/models/{model}', [LLMProxyController::class, 'getModel'])
        ->name('api.v1.models.show');
    
    // Embeddings (coming soon)
    Route::post('/embeddings', [LLMProxyController::class, 'embeddings'])
        ->name('api.v1.embeddings');
});

/*
|--------------------------------------------------------------------------
| Margexa App API — consumed by the Margexa SPA (margexa-app.blade.php)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // ── Auth / User ──────────────────────────────────────────────────────
    Route::get('/me', [UserController::class, 'me'])->name('api.me');

    // ── Onboarding (3-step flow) ─────────────────────────────────────────
    Route::post('/onboarding', [OnboardingApiController::class, 'createWorkspace'])
        ->name('api.onboarding.workspace');
    Route::post('/providers', [OnboardingApiController::class, 'connectProvider'])
        ->name('api.onboarding.provider');

    // ── Dashboard + Analytics ────────────────────────────────────────────
    Route::get('/dashboard/overview',          [DashboardController::class, 'overview']);
    Route::get('/analytics/live-requests',     [DashboardController::class, 'liveRequests']);
    Route::get('/analytics',                   [DashboardController::class, 'analyticsOverview']);
    Route::get('/analytics/trend',             [DashboardController::class, 'trend']);
    Route::get('/analytics/workflows',         [DashboardController::class, 'workflows']);
    Route::get('/providers/status',            [DashboardController::class, 'providersStatus']);

    // ── Policies (JSON API used by app-policies.jsx) ──────────────────────
    Route::get('/policy-triggers', function () {
        $org = auth()->user()?->organization;
        if (! $org) return response()->json([]);
        return response()->json(
            \App\Models\PolicyTrigger::where('organization_id', $org->id)
                ->with('policy:id,name,policy_type')
                ->latest('triggered_at')
                ->limit(20)
                ->get()
        );
    })->name('api.policy-triggers');

    // ── Policies (JSON API used by the Margexa SPA) ──────────────────────
    Route::get('/policies',                    [PolicyApiController::class, 'index'])->name('api.policies.index');
    Route::post('/policies',                   [PolicyApiController::class, 'store'])->name('api.policies.store');
    Route::put('/policies/{id}',               [PolicyApiController::class, 'update'])->name('api.policies.update');
    Route::patch('/policies/{id}/toggle',      [PolicyApiController::class, 'toggle'])->name('api.policies.toggle');
    Route::patch('/policies/{id}/toggle-mode', [PolicyApiController::class, 'toggleMode'])->name('api.policies.toggle-mode');
    Route::delete('/policies/{id}',            [PolicyApiController::class, 'destroy'])->name('api.policies.destroy');

    // ── Stripe Sync ───────────────────────────────────────────────────────
    Route::post('/stripe/sync',    [StripeSyncController::class, 'sync']);
    Route::post('/stripe/connect', [StripeSyncController::class, 'connect']);
    Route::get('/stripe/status',   [StripeSyncController::class, 'status']);

    // ── Team & Invitations ────────────────────────────────────────────────
    Route::prefix('team')->group(function () {
        Route::get('/members',          [TeamApiController::class, 'members']);
        Route::get('/invites',          [TeamApiController::class, 'invites']);
        Route::post('/invite',          [TeamApiController::class, 'invite']);
        Route::patch('/invites/{id}',   [TeamApiController::class, 'resendInvite']);
        Route::delete('/invites/{id}',  [TeamApiController::class, 'cancelInvite']);
    });

    // ── CFO exports — session auth so window.location.href works in the SPA ──
    Route::get('/cfo/weekly/csv', [CFOReportController::class, 'weeklyReadoutCSV'])
        ->middleware('entitlement:cfo_reports')
        ->name('api.cfo.weekly.csv');
    Route::get('/cfo/weekly/pdf', [CFOReportController::class, 'weeklyReadoutPDF'])
        ->middleware('entitlement:cfo_reports')
        ->name('api.cfo.weekly.pdf');

    // ── Audit logs (activity timeline in app-team.jsx) ───────────────────
    Route::get('/audit-logs', function () {
        $org = auth()->user()?->organization;
        if (! $org) return response()->json([]);

        return response()->json(
            \App\Models\AuditLog::where('organization_id', $org->id)
                ->with('user:id,name,email')
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn ($e) => [
                    'id'     => $e->id,
                    'who'    => $e->user?->name ?? 'system',
                    'what'   => $e->action,
                    'target' => $e->entity_type
                        ? ($e->entity_type . ($e->entity_id ? ' #' . $e->entity_id : ''))
                        : (isset($e->payload['description']) ? $e->payload['description'] : '—'),
                    'when'   => $e->created_at->diffForHumans(),
                ])
        );
    })->name('api.audit-logs');

    // ── Analytics heatmap — activity by day-of-week × hour ───────────────
    Route::get('/analytics/heatmap', [DashboardController::class, 'heatmap']);

    // ── API Keys management ───────────────────────────────────────────────
    // key_hash is NEVER returned. The plain-text key is returned once on creation.
    Route::get('/api-keys',        [ApiKeyController::class, 'index']);
    Route::post('/api-keys',       [ApiKeyController::class, 'store']);
    Route::delete('/api-keys/{id}', [ApiKeyController::class, 'destroy']);

    // ── Incidents (from policy_triggers) ─────────────────────────────────
    Route::get('/incidents', function () {
        $org = auth()->user()?->organization;
        if (! $org) return response()->json([]);

        $triggers = \App\Models\PolicyTrigger::where('organization_id', $org->id)
            ->with('policy:id,name,policy_type')
            ->latest('triggered_at')
            ->limit(50)
            ->get();

        return response()->json($triggers->map(fn ($t) => [
            'id'     => 'INC-' . $t->id,
            'sev'    => match ($t->metadata['action'] ?? $t->policy?->policy_type ?? '') {
                'block', 'blocked'                  => 'danger',
                'downgrade', 'fallback', 'warn'     => 'warning',
                'pass', 'observed', 'success'       => 'success',
                default                             => 'info',
            },
            'live'   => $t->triggered_at?->gt(now()->subMinutes(5)) ?? false,
            'status' => ($t->triggered_at?->gt(now()->subMinutes(30)) ?? false) ? 'ACTIVE' : 'RESOLVED',
            't'      => $t->reason ?? ($t->target_label ?? 'Policy triggered'),
            's'      => implode(' · ', array_filter([
                $t->policy?->name ? 'Policy: ' . $t->policy->name : null,
                $t->impacted_cost > 0 ? 'Cost: $' . number_format((float) $t->impacted_cost, 4) : null,
                $t->estimated_cost_avoided > 0 ? 'Avoided: $' . number_format((float) $t->estimated_cost_avoided, 4) : null,
            ])) ?: 'No additional details',
            'time'   => $t->triggered_at?->diffForHumans() ?? '—',
            'scope'  => $t->target_label ?? ($t->feature_id ? 'feature/' . $t->feature_id : 'workspace'),
        ]));
    })->name('api.incidents');

    // ── Prompt requests (ai_requests — no prompt text stored for privacy) ─
    Route::get('/prompts', function (Request $request) {
        $org = auth()->user()?->organization;
        if (! $org) return response()->json([]);

        $limit = min((int) $request->query('limit', 50), 200);

        $rows = \App\Models\AIRequest::where('organization_id', $org->id)
            ->latest()
            ->limit($limit)
            ->get([
                'id', 'created_at', 'model', 'provider', 'workflow_name', 'customer_id',
                'prompt_tokens', 'completion_tokens', 'estimated_cost', 'routing_outcome',
            ]);

        return response()->json($rows->map(fn ($r) => [
            'id'             => $r->id,
            'prompt_preview' => '[' . ($r->provider ?? 'ai') . '] ' . ($r->workflow_name ?? 'unknown workflow') . ' · ' . ($r->prompt_tokens ?? 0) . ' prompt tokens',
            'model'          => $r->model ?? 'unknown',
            'cost_usd'       => (float) ($r->estimated_cost ?? 0),
            'tokens'         => (int) ($r->prompt_tokens ?? 0) + (int) ($r->completion_tokens ?? 0),
            'created_at'     => $r->created_at?->toISOString(),
            'workflow'       => $r->workflow_name,
            'customer_id'    => $r->customer_id,
        ]));
    })->name('api.prompts');

    // ── Circuit Breakers ──────────────────────────────────────────────────
    Route::get('/circuit-breakers',               [CircuitBreakerController::class, 'index']);
    Route::post('/circuit-breakers/{agentId}/reset', [CircuitBreakerController::class, 'reset']);

    // ── Industry Benchmarks ───────────────────────────────────────────────
    Route::get('/benchmarks', function () {
        $org = auth()->user()?->organization;
        if (! $org) return response()->json([]);

        $cutoff  = now()->subDays(30);
        $weekKey = now()->format('Y-\WW');

        // Compute this org's own values for the last 30 days
        $stats = \Illuminate\Support\Facades\DB::table('ai_requests')
            ->where('organization_id', $org->id)
            ->where('created_at', '>=', $cutoff)
            ->selectRaw('
                COUNT(*)                          AS total_requests,
                COALESCE(AVG(estimated_cost), 0)  AS avg_cost,
                COALESCE(SUM(routing_savings), 0) AS total_savings,
                COALESCE(SUM(estimated_cost), 0)  AS total_cost,
                COALESCE(AVG(prompt_tokens), 0)   AS avg_prompt_tokens,
                SUM(CASE WHEN policy_triggered = 1 THEN 1 ELSE 0 END) AS blocks
            ')
            ->first();

        $totalReqs  = (int)   ($stats->total_requests ?? 0);
        $totalCost  = (float) ($stats->total_cost ?? 0);
        $avgCost    = (float) ($stats->avg_cost ?? 0);
        $savingsPct = ($totalCost + (float)($stats->total_savings ?? 0)) > 0
            ? (float)($stats->total_savings ?? 0) / ($totalCost + (float)($stats->total_savings ?? 0)) * 100
            : 0.0;
        $blockRate  = $totalReqs > 0 ? (int)($stats->blocks ?? 0) / $totalReqs * 100 : 0.0;
        $avgTokens  = (float) ($stats->avg_prompt_tokens ?? 0);

        // Fetch stored percentile benchmarks for this week
        $bm = \App\Models\AggregatedBenchmark::where('period_week', $weekKey)->get()->keyBy('metric');

        $build = fn (string $metric, string $label, string $unit, int $dec, float $orgVal, bool $lowerBetter) => [
            'metric'          => $metric,
            'label'           => $label,
            'unit'            => $unit,
            'decimals'        => $dec,
            'org_value'       => round($orgVal, $dec),
            'p25'             => round((float) ($bm[$metric]?->p25 ?? 0), $dec),
            'p50'             => round((float) ($bm[$metric]?->p50 ?? 0), $dec),
            'p75'             => round((float) ($bm[$metric]?->p75 ?? 0), $dec),
            'sample_size'     => (int) ($bm[$metric]?->sample_size ?? 0),
            'lower_is_better' => $lowerBetter,
        ];

        return response()->json([
            'period'  => 'Last 30 days',
            'week'    => $weekKey,
            'metrics' => [
                $build('cost_per_request',   'Cost / request',      '$', 4, $avgCost,    true),
                $build('routing_savings_pct','Routing savings',      '%', 1, $savingsPct, false),
                $build('policy_block_rate',  'Policy block rate',    '%', 1, $blockRate,  true),
                $build('avg_prompt_tokens',  'Avg prompt tokens', 'tok', 0, $avgTokens,   true),
            ],
            'has_benchmark_data' => $bm->isNotEmpty(),
            'note' => $bm->isEmpty() ? 'Benchmark data is computed weekly — first figures appear Sunday night.' : null,
        ]);
    })->name('api.benchmarks');

    // ── Model swap simulation (quick preview, session auth) ───────────────
    Route::get('/simulation/preview', [SimulationController::class, 'preview'])
        ->name('api.simulation.preview');

    // ── Billing JSON API (for app-billing.jsx) ────────────────────────────
    Route::prefix('billing')->group(function () {
        Route::get('/plan',       [BillingApiController::class, 'plan']);
        Route::get('/invoices',   [BillingApiController::class, 'invoices']);
        Route::post('/upgrade',   [BillingApiController::class, 'upgrade']);
        Route::post('/cancel',    [BillingApiController::class, 'cancel']);
    });
});
