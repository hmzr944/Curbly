<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MarginMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Attribution Metrics API Controller
 * 
 * Exposes attribution quality KPIs as a central metric.
 * This is not a technical detail - it's a core business health indicator.
 */
class AttributionMetricsController extends Controller
{
    public function __construct(
        private readonly MarginMetricsService $metricsService,
    ) {
    }

    /**
     * GET /api/metrics/attribution
     * 
     * Returns attribution quality KPIs for the authenticated organization.
     * 
     * Response includes:
     * - attribution_health: overall health grade (excellent, good, fair, poor, critical)
     * - coverage: breakdown by status (full, partial, none, failed)
     * - percentages: same as coverage but as percentages
     * - avg_score: average attribution score (0-100)
     * - entity_coverage: % requests with each entity type
     * - top_issues: most common attribution problems
     * - recommendations: actionable improvement suggestions
     */
    public function index(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;

        if (!$organization) {
            return response()->json([
                'error' => 'No organization associated with this user',
            ], 403);
        }

        $startDate = $request->has('start_date')
            ? new \DateTime($request->input('start_date'))
            : null;

        $metrics = $this->metricsService->attributionMetrics($organization, $startDate);

        return response()->json([
            'ok' => true,
            'data' => $metrics,
            'meta' => [
                'organization_id' => $organization->id,
                'period_start' => $startDate?->format('Y-m-d') ?? now()->startOfMonth()->format('Y-m-d'),
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * GET /api/metrics/attribution/summary
     * 
     * Returns a compact attribution summary for dashboards.
     */
    public function summary(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;

        if (!$organization) {
            return response()->json([
                'error' => 'No organization associated with this user',
            ], 403);
        }

        $metrics = $this->metricsService->attributionMetrics($organization);

        // Return compact summary
        return response()->json([
            'health' => $metrics['attribution_health'],
            'score' => $metrics['avg_score'],
            'full_coverage_pct' => $metrics['percentages']['full_pct'],
            'total_requests' => $metrics['total_requests'],
            'top_issue' => array_key_first($metrics['top_issues']),
            'recommendations_count' => count($metrics['recommendations']),
        ]);
    }
}
