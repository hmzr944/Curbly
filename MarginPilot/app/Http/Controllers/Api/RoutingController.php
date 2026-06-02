<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIRequest;
use App\Models\RoutingRule;
use App\Services\Routing\EconomicRouterService;
use App\Services\Routing\ModelTier;
use App\Services\Routing\RoutingContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Economic Router API Controller.
 * 
 * Provides endpoints for:
 * - Explaining routing decisions (dry run)
 * - Viewing routing metrics
 * - Managing routing rules
 */
class RoutingController extends Controller
{
    public function __construct(
        private readonly EconomicRouterService $router
    ) {
    }

    /**
     * Explain a routing decision without executing.
     * 
     * POST /api/routing/explain
     * 
     * Request body:
     * {
     *   "model": "gpt-4o",
     *   "customer_id": 123,  // optional
     *   "plan_id": 456,      // optional
     *   "feature_id": 789,   // optional
     *   "workflow_id": "...", // optional
     *   "metadata": {}       // optional
     * }
     */
    public function explain(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model' => 'required|string|in:gpt-4o,gpt-4o-mini,claude-3-5-sonnet,claude-3-5-haiku',
            'provider' => 'nullable|string|in:openai,anthropic',
            'customer_id' => 'nullable|integer',
            'plan_id' => 'nullable|integer',
            'feature_id' => 'nullable|integer',
            'workflow_id' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $organization = $request->user()->organization;

        $ctx = new RoutingContext(
            organizationId: $organization->id,
            requestedModel: $validated['model'],
            provider: $validated['provider'] ?? 'openai',
            customerId: $validated['customer_id'] ?? null,
            planId: $validated['plan_id'] ?? null,
            featureId: $validated['feature_id'] ?? null,
            workflowId: $validated['workflow_id'] ?? null,
            metadata: $validated['metadata'] ?? [],
        );

        $explanation = $this->router->explain($ctx);

        return response()->json([
            'success' => true,
            'data' => $explanation,
        ]);
    }

    /**
     * Get routing metrics for the organization.
     * 
     * GET /api/routing/metrics
     */
    public function metrics(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        $days = (int) $request->query('days', 30);
        $startDate = now()->subDays($days);

        // Base query
        $baseQuery = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $startDate);

        // Total requests
        $totalRequests = (clone $baseQuery)->count();

        // Routing outcome distribution
        $outcomeDistribution = (clone $baseQuery)
            ->select('routing_outcome', DB::raw('COUNT(*) as count'))
            ->whereNotNull('routing_outcome')
            ->groupBy('routing_outcome')
            ->pluck('count', 'routing_outcome')
            ->toArray();

        // Tier distribution
        $tierDistribution = (clone $baseQuery)
            ->select('routing_tier', DB::raw('COUNT(*) as count'))
            ->whereNotNull('routing_tier')
            ->groupBy('routing_tier')
            ->pluck('count', 'routing_tier')
            ->toArray();

        // Total savings from downgrades
        $totalSavings = (clone $baseQuery)
            ->where('routing_outcome', 'downgraded')
            ->sum('routing_savings');

        // Downgrade rate
        $downgradedCount = $outcomeDistribution['downgraded'] ?? 0;
        $downgradeRate = $totalRequests > 0 
            ? round(($downgradedCount / $totalRequests) * 100, 1) 
            : 0;

        // Escalation rate
        $escalatedCount = $outcomeDistribution['escalated'] ?? 0;
        $escalationRate = $totalRequests > 0 
            ? round(($escalatedCount / $totalRequests) * 100, 1) 
            : 0;

        // Average savings per downgrade
        $avgSavingsPerDowngrade = $downgradedCount > 0 
            ? round($totalSavings / $downgradedCount, 6) 
            : 0;

        // Savings by tier
        $savingsByTier = (clone $baseQuery)
            ->select('routing_tier', DB::raw('SUM(routing_savings) as savings'))
            ->where('routing_outcome', 'downgraded')
            ->groupBy('routing_tier')
            ->pluck('savings', 'routing_tier')
            ->toArray();

        // Daily trend
        $dailyTrend = (clone $baseQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN routing_outcome = 'downgraded' THEN 1 ELSE 0 END) as downgraded"),
                DB::raw("SUM(CASE WHEN routing_outcome = 'escalated' THEN 1 ELSE 0 END) as escalated"),
                DB::raw('SUM(routing_savings) as savings')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'total' => (int) $row->total,
                'downgraded' => (int) $row->downgraded,
                'escalated' => (int) $row->escalated,
                'savings' => round((float) $row->savings, 4),
                'downgrade_rate' => $row->total > 0 
                    ? round(($row->downgraded / $row->total) * 100, 1) 
                    : 0,
            ]);

        // Routing efficiency score
        $efficiencyScore = $this->calculateEfficiencyScore(
            $totalRequests,
            $downgradedCount,
            $escalatedCount,
            $totalSavings
        );

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start' => $startDate->toISOString(),
                    'end' => now()->toISOString(),
                    'days' => $days,
                ],
                'summary' => [
                    'total_requests' => $totalRequests,
                    'total_savings' => round($totalSavings, 2),
                    'downgrade_rate' => $downgradeRate,
                    'escalation_rate' => $escalationRate,
                    'avg_savings_per_downgrade' => $avgSavingsPerDowngrade,
                    'efficiency_score' => $efficiencyScore,
                ],
                'distribution' => [
                    'by_outcome' => $outcomeDistribution,
                    'by_tier' => $tierDistribution,
                    'savings_by_tier' => $savingsByTier,
                ],
                'trend' => $dailyTrend,
                'recommendations' => $this->generateRecommendations(
                    $downgradeRate,
                    $escalationRate,
                    $efficiencyScore,
                    $tierDistribution
                ),
            ],
        ]);
    }

    /**
     * Get routing rules for the organization.
     * 
     * GET /api/routing/rules
     */
    public function rules(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;

        $rules = RoutingRule::query()
            ->where('organization_id', $organization->id)
            ->orderBy('priority', 'desc')
            ->get()
            ->map(fn ($rule) => $rule->toApiArray());

        return response()->json([
            'success' => true,
            'data' => $rules,
        ]);
    }

    /**
     * Create a new routing rule.
     * 
     * POST /api/routing/rules
     */
    public function createRule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'scope' => 'required|string|in:global,plan,feature,customer,segment',
            'scope_id' => 'nullable|integer',
            'target_tier' => 'required|string|in:economy,standard,premium,flagship',
            'action' => 'required|string|in:allow,restrict,upgrade,downgrade',
            'priority' => 'nullable|integer|min:1|max:1000',
            'conditions' => 'nullable|array',
            'expires_at' => 'nullable|date',
        ]);

        $organization = $request->user()->organization;

        $rule = RoutingRule::create([
            'organization_id' => $organization->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'scope' => $validated['scope'],
            'scope_id' => $validated['scope_id'] ?? null,
            'target_tier' => $validated['target_tier'],
            'action' => $validated['action'],
            'priority' => $validated['priority'] ?? 100,
            'conditions' => $validated['conditions'] ?? null,
            'is_active' => true,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        // Clear routing rules cache
        $this->router->clearRulesCache($organization->id);

        return response()->json([
            'success' => true,
            'data' => $rule->toApiArray(),
            'message' => 'Routing rule created successfully',
        ], 201);
    }

    /**
     * Update a routing rule.
     * 
     * PUT /api/routing/rules/{id}
     */
    public function updateRule(Request $request, int $id): JsonResponse
    {
        $organization = $request->user()->organization;

        $rule = RoutingRule::query()
            ->where('organization_id', $organization->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'scope' => 'nullable|string|in:global,plan,feature,customer,segment',
            'scope_id' => 'nullable|integer',
            'target_tier' => 'nullable|string|in:economy,standard,premium,flagship',
            'action' => 'nullable|string|in:allow,restrict,upgrade,downgrade',
            'priority' => 'nullable|integer|min:1|max:1000',
            'conditions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $rule->update(array_filter($validated, fn ($v) => $v !== null));

        // Clear routing rules cache
        $this->router->clearRulesCache($organization->id);

        return response()->json([
            'success' => true,
            'data' => $rule->fresh()->toApiArray(),
            'message' => 'Routing rule updated successfully',
        ]);
    }

    /**
     * Delete a routing rule.
     * 
     * DELETE /api/routing/rules/{id}
     */
    public function deleteRule(Request $request, int $id): JsonResponse
    {
        $organization = $request->user()->organization;

        $rule = RoutingRule::query()
            ->where('organization_id', $organization->id)
            ->findOrFail($id);

        $rule->delete();

        // Clear routing rules cache
        $this->router->clearRulesCache($organization->id);

        return response()->json([
            'success' => true,
            'message' => 'Routing rule deleted successfully',
        ]);
    }

    /**
     * Get model tier classification.
     * 
     * GET /api/routing/tiers
     */
    public function tiers(): JsonResponse
    {
        $tiers = [];
        
        foreach (ModelTier::cases() as $tier) {
            $tiers[] = [
                'value' => $tier->value,
                'label' => $tier->label(),
                'weight' => $tier->weight(),
                'default_fallback' => $tier->defaultFallbackModel(),
            ];
        }

        // V1 supported models only
        $sampleModels = [
            'gpt-4o-mini', 'gpt-4o',
            'claude-3-5-haiku', 'claude-3-5-sonnet',
        ];

        $modelClassifications = [];
        foreach ($sampleModels as $model) {
            $modelClassifications[$model] = ModelTier::forModel($model)->value;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tiers' => $tiers,
                'model_classifications' => $modelClassifications,
            ],
        ]);
    }

    /**
     * Calculate routing efficiency score.
     */
    private function calculateEfficiencyScore(
        int $totalRequests,
        int $downgraded,
        int $escalated,
        float $totalSavings
    ): array {
        if ($totalRequests === 0) {
            return ['score' => 0, 'grade' => 'N/A', 'interpretation' => 'No data'];
        }

        // Factors:
        // - Downgrade rate (good if 10-40%)
        // - Escalation rate (good if < 10%)
        // - Savings generated

        $downgradeRate = ($downgraded / $totalRequests) * 100;
        $escalationRate = ($escalated / $totalRequests) * 100;

        // Downgrade score: optimal is 20-30%
        $downgradeScore = match (true) {
            $downgradeRate < 5 => 30,   // Too few downgrades = not optimizing
            $downgradeRate < 15 => 60,
            $downgradeRate < 35 => 100, // Sweet spot
            $downgradeRate < 50 => 70,
            default => 40,              // Too aggressive
        };

        // Escalation score: lower is better
        $escalationScore = match (true) {
            $escalationRate < 2 => 100,
            $escalationRate < 5 => 85,
            $escalationRate < 10 => 70,
            $escalationRate < 20 => 50,
            default => 30,
        };

        // Savings score: based on savings per request
        $savingsPerRequest = $totalRequests > 0 ? $totalSavings / $totalRequests : 0;
        $savingsScore = match (true) {
            $savingsPerRequest < 0.0001 => 40,
            $savingsPerRequest < 0.001 => 60,
            $savingsPerRequest < 0.01 => 80,
            default => 100,
        };

        // Weighted average
        $score = round(
            ($downgradeScore * 0.4) + ($escalationScore * 0.3) + ($savingsScore * 0.3)
        );

        $grade = match (true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'F',
        };

        $interpretation = match ($grade) {
            'A' => 'Excellent routing efficiency',
            'B' => 'Good routing with room for improvement',
            'C' => 'Moderate efficiency, review routing rules',
            'D' => 'Suboptimal routing, significant optimization needed',
            'F' => 'Poor routing efficiency, immediate action required',
            default => 'Unknown',
        };

        return [
            'score' => $score,
            'grade' => $grade,
            'interpretation' => $interpretation,
            'factors' => [
                'downgrade_score' => $downgradeScore,
                'escalation_score' => $escalationScore,
                'savings_score' => $savingsScore,
            ],
        ];
    }

    /**
     * Generate routing recommendations.
     */
    private function generateRecommendations(
        float $downgradeRate,
        float $escalationRate,
        array $efficiencyScore,
        array $tierDistribution
    ): array {
        $recommendations = [];

        if ($downgradeRate < 10) {
            $recommendations[] = [
                'type' => 'optimization',
                'priority' => 'high',
                'message' => 'Low downgrade rate suggests missed cost savings opportunities',
                'action' => 'Review plan tier limits and consider stricter routing rules',
            ];
        }

        if ($downgradeRate > 50) {
            $recommendations[] = [
                'type' => 'quality',
                'priority' => 'high',
                'message' => 'High downgrade rate may impact user experience',
                'action' => 'Consider allowing more premium access or reviewing plan configurations',
            ];
        }

        if ($escalationRate > 15) {
            $recommendations[] = [
                'type' => 'cost',
                'priority' => 'medium',
                'message' => 'High escalation rate increases costs',
                'action' => 'Review escalation rules and tighten criteria',
            ];
        }

        $premiumCount = ($tierDistribution['premium'] ?? 0) + ($tierDistribution['flagship'] ?? 0);
        $economyCount = $tierDistribution['economy'] ?? 0;
        $total = array_sum($tierDistribution);

        if ($total > 0 && ($premiumCount / $total) > 0.5) {
            $recommendations[] = [
                'type' => 'cost',
                'priority' => 'medium',
                'message' => 'Over 50% of requests use premium/flagship models',
                'action' => 'Consider implementing more aggressive routing rules',
            ];
        }

        if ($total > 0 && ($economyCount / $total) > 0.8) {
            $recommendations[] = [
                'type' => 'quality',
                'priority' => 'low',
                'message' => 'Most requests use economy tier',
                'action' => 'Routing is cost-optimized, monitor quality metrics',
            ];
        }

        if ($efficiencyScore['score'] < 60) {
            $recommendations[] = [
                'type' => 'overall',
                'priority' => 'critical',
                'message' => 'Routing efficiency is below acceptable threshold',
                'action' => 'Comprehensive review of routing rules and plan configurations needed',
            ];
        }

        return $recommendations;
    }
}
