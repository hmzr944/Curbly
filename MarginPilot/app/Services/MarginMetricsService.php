<?php

namespace App\Services;

use App\Models\AIRequest;
use App\Models\Organization;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MarginMetricsService
{
    public function forOrganization(Organization $organization, ?\Carbon\Carbon $periodStart = null): array
    {
        $periodStart ??= now()->subDays(30);

        $base = AIRequest::query()
            ->where('ai_requests.organization_id', $organization->id)
            ->where('ai_requests.created_at', '>=', $periodStart);

        $totalSpend = (float) (clone $base)->sum('estimated_cost');
        $totalRequests = (int) (clone $base)->count();

        $spendByFeature = (clone $base)
            ->leftJoin('features', 'features.id', '=', 'ai_requests.feature_id')
            ->selectRaw("COALESCE(features.name, 'Inconnu') as label, SUM(ai_requests.estimated_cost) as value")
            ->groupBy('features.name')
            ->orderByDesc('value')
            ->limit(8)
            ->get();

        $spendByCustomer = (clone $base)
            ->leftJoin('customers', 'customers.id', '=', 'ai_requests.customer_id')
            ->selectRaw("COALESCE(customers.name, 'Inconnu') as label, SUM(ai_requests.estimated_cost) as value")
            ->groupBy('customers.name')
            ->orderByDesc('value')
            ->limit(8)
            ->get();

        $spendByPlan = (clone $base)
            ->leftJoin('plans', 'plans.id', '=', 'ai_requests.plan_id')
            ->selectRaw("COALESCE(plans.name, 'Inconnu') as label, SUM(ai_requests.estimated_cost) as value")
            ->groupBy('plans.name')
            ->orderByDesc('value')
            ->limit(8)
            ->get();

        $topLeaks = (clone $base)
            ->with(['customer:id,name', 'feature:id,name', 'plan:id,name'])
            ->orderByDesc('estimated_cost')
            ->limit(5)
            ->get();

        $topCostlyCustomers = (clone $base)
            ->leftJoin('customers', 'customers.id', '=', 'ai_requests.customer_id')
            ->leftJoin('plans', 'plans.id', '=', 'customers.plan_id')
            ->selectRaw("COALESCE(customers.name, 'Inconnu') as name, COALESCE(plans.name, 'Inconnu') as plan_name, SUM(ai_requests.estimated_cost) as spend")
            ->groupBy('customers.name', 'plans.name')
            ->orderByDesc('spend')
            ->limit(5)
            ->get();

        $topCostlyFeatures = (clone $base)
            ->leftJoin('features', 'features.id', '=', 'ai_requests.feature_id')
            ->selectRaw("COALESCE(features.name, 'Inconnu') as name, SUM(ai_requests.estimated_cost) as spend")
            ->groupBy('features.name')
            ->orderByDesc('spend')
            ->limit(5)
            ->get();

        $topCostlyModels = (clone $base)
            ->selectRaw("COALESCE(model, 'Inconnu') as name, SUM(estimated_cost) as spend")
            ->groupBy('model')
            ->orderByDesc('spend')
            ->limit(5)
            ->get();

        $topRiskyPlans = Plan::query()
            ->where('plans.organization_id', $organization->id)
            ->leftJoin('ai_requests', function ($join) use ($periodStart) {
                $join->on('plans.id', '=', 'ai_requests.plan_id')
                    ->where('ai_requests.created_at', '>=', $periodStart);
            })
            ->selectRaw('plans.id, plans.name, plans.monthly_ai_budget, plans.monthly_price, plans.tier, COALESCE(SUM(ai_requests.estimated_cost), 0) as spend')
            ->groupBy('plans.id', 'plans.name', 'plans.monthly_ai_budget', 'plans.monthly_price', 'plans.tier')
            ->orderByDesc(DB::raw('CASE WHEN plans.monthly_ai_budget IS NULL OR plans.monthly_ai_budget = 0 THEN 0 ELSE COALESCE(SUM(ai_requests.estimated_cost), 0) / plans.monthly_ai_budget END'))
            ->limit(5)
            ->get()
            ->map(function ($row) {
                $budget = (float) ($row->monthly_ai_budget ?? 0);
                $price = (float) ($row->monthly_price ?? 0);
                $spend = (float) $row->spend;
                
                // Calcul ai_cost_share en pourcentage
                $aiCostSharePct = $price > 0 ? round(($spend / $price) * 100, 1) : null;
                
                // Revenu restant après coût IA
                $revenueAfterAi = $price > 0 ? round($price - $spend, 2) : null;
                
                // Statut de pression basé sur le ratio coût IA / revenu
                $pressureStatus = $this->getPressureStatus($aiCostSharePct);
                
                return [
                    'id' => $row->id,
                    'name' => $row->name,
                    'tier' => $row->tier,
                    'spend' => $spend,
                    'budget' => $budget,
                    'monthly_price' => $price,
                    'risk_ratio' => $budget > 0 ? round($spend / $budget, 2) : null,
                    'ai_cost_share' => $price > 0 ? round($spend / $price, 2) : null,
                    'ai_cost_share_pct' => $aiCostSharePct,
                    'revenue_after_ai' => $revenueAfterAi,
                    'pressure_status' => $pressureStatus,
                ];
            });

        $averageCost = (float) (clone $base)->avg('estimated_cost');
        $spikeThreshold = $averageCost > 0 ? $averageCost * 2 : 0;

        $spikes = $spikeThreshold > 0
            ? (clone $base)
                ->with(['customer:id,name', 'feature:id,name', 'plan:id,name'])
                ->where('estimated_cost', '>', $spikeThreshold)
                ->orderByDesc('estimated_cost')
                ->limit(10)
                ->get()
            : collect();

        $biggestLeak = $topLeaks->first();

        $customersAtRisk = $topCostlyCustomers
            ->take(3)
            ->map(fn ($row) => [
                'name' => $row->name,
                'plan_name' => $row->plan_name,
                'spend' => (float) $row->spend,
            ]);

        $plansUnderPressure = $topRiskyPlans
            ->filter(fn ($row) => ($row['risk_ratio'] ?? 0) >= 0.8)
            ->take(3)
            ->values();

        $plansAtMarginRisk = $topRiskyPlans
            ->filter(fn ($row) => ($row['ai_cost_share'] ?? 0) >= 0.3)
            ->take(3)
            ->values();

        $recommendedActions = [];

        if ($plansAtMarginRisk->isNotEmpty()) {
            $planAtRisk = $plansAtMarginRisk->first();
            $pct = round(($planAtRisk['ai_cost_share'] ?? 0) * 100);
            $recommendedActions[] = sprintf(
                'Le plan %s utilise %d%% de son revenu en coûts IA.',
                $planAtRisk['name'],
                $pct
            );
        }

        if ($customersAtRisk->isNotEmpty()) {
            $customer = $customersAtRisk->first();
            $recommendedActions[] = sprintf(
                'Le client %s dépasse le coût IA attendu sur le plan %s.',
                $customer['name'],
                $customer['plan_name'] ?: 'actuel'
            );
        }

        if ($topCostlyFeatures->isNotEmpty()) {
            $feature = $topCostlyFeatures->first();
            $recommendedActions[] = sprintf(
                'La fonctionnalité %s est le principal générateur de coûts cette période.',
                $feature->name
            );
        }

        $entryPlan = Plan::query()
            ->where('organization_id', $organization->id)
            ->orderByRaw("CASE WHEN LOWER(tier) = 'low' THEN 0 WHEN LOWER(tier) = 'mid' THEN 1 ELSE 2 END")
            ->orderBy('allow_premium_models')
            ->orderByRaw('CASE WHEN monthly_ai_budget IS NULL THEN 1 ELSE 0 END')
            ->orderBy('monthly_ai_budget')
            ->first();

        if ($entryPlan) {
            $entryPlanPremiumCount = AIRequest::query()
                ->where('organization_id', $organization->id)
                ->where('plan_id', $entryPlan->id)
                ->where('created_at', '>=', $periodStart)
                ->whereIn(DB::raw('LOWER(model)'), ['gpt-4o', 'claude-3-5-sonnet'])
                ->count();

            if ($entryPlanPremiumCount > 0 && ! $entryPlan->allow_premium_models) {
                $recommendedActions[] = sprintf(
                    'Le plan %s utilise trop souvent les modèles premium.',
                    $entryPlan->name
                );
            }

            if ($entryPlan->fallback_model) {
                $recommendedActions[] = sprintf(
                    'Envisagez de basculer vers %s pour vos flux support entrée de gamme.',
                    $entryPlan->fallback_model
                );
            }
        }

        return [
            'total_requests' => $totalRequests,
            'total_spend' => round($totalSpend, 2),
            'spend_by_feature' => $spendByFeature,
            'spend_by_customer' => $spendByCustomer,
            'spend_by_plan' => $spendByPlan,
            'top_leaks' => $topLeaks,
            'top_costly_customers' => $topCostlyCustomers,
            'top_costly_features' => $topCostlyFeatures,
            'top_costly_models' => $topCostlyModels,
            'top_risky_plans' => $topRiskyPlans,
            'spikes' => $spikes,
            'biggest_margin_leak' => $biggestLeak,
            'customers_at_risk' => $customersAtRisk,
            'plans_under_pressure' => $plansUnderPressure,
            'plans_at_margin_risk' => $plansAtMarginRisk,
            'recommended_actions' => $recommendedActions,
        ];
    }

    /**
     * Détermine le statut de pression basé sur le pourcentage de coût IA / revenu.
     * 
     * - Faible : < 15%
     * - Modérée : 15% à 30%
     * - Élevée : > 30%
     */
    private function getPressureStatus(?float $aiCostSharePct): string
    {
        if ($aiCostSharePct === null) {
            return 'unknown';
        }

        if ($aiCostSharePct < 15) {
            return 'low';
        }

        if ($aiCostSharePct <= 30) {
            return 'moderate';
        }

        return 'high';
    }

    /**
     * Attribution Quality KPIs - CENTRAL METRIC for data health.
     * 
     * Returns metrics about tagging quality:
     * - % requests with full attribution (customer + feature + plan)
     * - % requests with partial attribution
     * - % requests with no attribution (orphan requests)
     * - Attribution score distribution
     * - Top attribution issues
     */
    public function attributionMetrics(Organization $organization, ?\DateTime $startDate = null): array
    {
        $periodStart = $startDate ?? now()->startOfMonth();

        $base = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $periodStart);

        $totalRequests = (clone $base)->count();

        if ($totalRequests === 0) {
            return [
                'total_requests' => 0,
                'attribution_health' => 'no_data',
                'coverage' => [
                    'full' => 0,
                    'partial' => 0,
                    'none' => 0,
                    'failed' => 0,
                ],
                'percentages' => [
                    'full_pct' => 0,
                    'partial_pct' => 0,
                    'none_pct' => 0,
                    'failed_pct' => 0,
                ],
                'avg_score' => 0,
                'score_distribution' => [],
                'entity_coverage' => [
                    'customer' => 0,
                    'feature' => 0,
                    'plan' => 0,
                    'workflow' => 0,
                ],
                'top_issues' => [],
                'recommendations' => [],
            ];
        }

        // Attribution status breakdown
        $statusCounts = (clone $base)
            ->selectRaw("COALESCE(attribution_status, 'none') as status, COUNT(*) as count")
            ->groupBy('attribution_status')
            ->pluck('count', 'status')
            ->toArray();

        $fullCount = $statusCounts['full'] ?? 0;
        $partialCount = $statusCounts['partial'] ?? 0;
        $noneCount = $statusCounts['none'] ?? 0;
        $failedCount = $statusCounts['failed'] ?? 0;

        // Average attribution score
        $avgScore = (clone $base)->avg('attribution_score') ?? 0;

        // Score distribution (buckets: 0-25, 26-50, 51-75, 76-100)
        $scoreDistribution = (clone $base)
            ->selectRaw("
                CASE
                    WHEN attribution_score <= 25 THEN 'poor'
                    WHEN attribution_score <= 50 THEN 'fair'
                    WHEN attribution_score <= 75 THEN 'good'
                    ELSE 'excellent'
                END as bucket,
                COUNT(*) as count
            ")
            ->groupBy(DB::raw("
                CASE
                    WHEN attribution_score <= 25 THEN 'poor'
                    WHEN attribution_score <= 50 THEN 'fair'
                    WHEN attribution_score <= 75 THEN 'good'
                    ELSE 'excellent'
                END
            "))
            ->pluck('count', 'bucket')
            ->toArray();

        // Entity coverage (% requests with each entity)
        $customerCoverage = (clone $base)->whereNotNull('customer_id')->count();
        $featureCoverage = (clone $base)->whereNotNull('feature_id')->count();
        $planCoverage = (clone $base)->whereNotNull('plan_id')->count();
        $workflowCoverage = (clone $base)->whereNotNull('workflow_name')->count();

        // Top attribution issues (from attribution_issues JSON)
        $topIssues = DB::table('ai_requests')
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $periodStart)
            ->whereNotNull('attribution_issues')
            ->where('attribution_issues', '!=', '[]')
            ->selectRaw('attribution_issues, COUNT(*) as count')
            ->groupBy('attribution_issues')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $issues = json_decode($row->attribution_issues, true) ?? [];
                return [
                    'issues' => $issues,
                    'count' => $row->count,
                ];
            });

        // Flatten issue counts
        $issueCounts = [];
        foreach ($topIssues as $item) {
            foreach ($item['issues'] as $issue) {
                $issueCounts[$issue] = ($issueCounts[$issue] ?? 0) + $item['count'];
            }
        }
        arsort($issueCounts);

        // Compute health grade
        $fullPct = round(($fullCount / $totalRequests) * 100, 1);
        $health = $this->computeAttributionHealth($fullPct, $avgScore);

        // Generate recommendations
        $recommendations = $this->generateAttributionRecommendations(
            $fullPct,
            $customerCoverage / $totalRequests * 100,
            $featureCoverage / $totalRequests * 100,
            $issueCounts
        );

        return [
            'total_requests' => $totalRequests,
            'attribution_health' => $health,
            'coverage' => [
                'full' => $fullCount,
                'partial' => $partialCount,
                'none' => $noneCount,
                'failed' => $failedCount,
            ],
            'percentages' => [
                'full_pct' => $fullPct,
                'partial_pct' => round(($partialCount / $totalRequests) * 100, 1),
                'none_pct' => round(($noneCount / $totalRequests) * 100, 1),
                'failed_pct' => round(($failedCount / $totalRequests) * 100, 1),
            ],
            'avg_score' => round($avgScore, 1),
            'score_distribution' => [
                'poor' => $scoreDistribution['poor'] ?? 0,
                'fair' => $scoreDistribution['fair'] ?? 0,
                'good' => $scoreDistribution['good'] ?? 0,
                'excellent' => $scoreDistribution['excellent'] ?? 0,
            ],
            'entity_coverage' => [
                'customer_pct' => round(($customerCoverage / $totalRequests) * 100, 1),
                'feature_pct' => round(($featureCoverage / $totalRequests) * 100, 1),
                'plan_pct' => round(($planCoverage / $totalRequests) * 100, 1),
                'workflow_pct' => round(($workflowCoverage / $totalRequests) * 100, 1),
            ],
            'top_issues' => array_slice($issueCounts, 0, 5, true),
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Compute attribution health grade.
     */
    private function computeAttributionHealth(float $fullPct, float $avgScore): string
    {
        if ($fullPct >= 90 && $avgScore >= 80) {
            return 'excellent';
        }
        if ($fullPct >= 70 && $avgScore >= 60) {
            return 'good';
        }
        if ($fullPct >= 50 && $avgScore >= 40) {
            return 'fair';
        }
        if ($fullPct >= 25) {
            return 'poor';
        }
        return 'critical';
    }

    /**
     * Generate actionable recommendations for improving attribution.
     */
    private function generateAttributionRecommendations(
        float $fullPct,
        float $customerPct,
        float $featurePct,
        array $topIssues
    ): array {
        $recommendations = [];

        if ($fullPct < 70) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'coverage',
                'message' => "Seulement {$fullPct}% des requêtes ont une attribution complète. Cible: 90%+",
                'action' => 'Vérifiez que tous vos appels API incluent X-Customer-Id et X-Feature',
            ];
        }

        if ($customerPct < 80) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'customer',
                'message' => "Couverture client à {$customerPct}%. Les coûts non attribués ne peuvent pas être facturés.",
                'action' => 'Ajoutez X-Customer-Id ou X-Customer-External-Id à chaque requête',
            ];
        }

        if ($featurePct < 60) {
            $recommendations[] = [
                'priority' => 'medium',
                'type' => 'feature',
                'message' => "Couverture feature à {$featurePct}%. L'allocation des coûts par fonctionnalité est imprécise.",
                'action' => 'Utilisez X-Feature pour identifier chaque point d\'appel IA',
            ];
        }

        if (isset($topIssues['customer_not_found']) && $topIssues['customer_not_found'] > 10) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'data_quality',
                'message' => "{$topIssues['customer_not_found']} requêtes avec customer_id invalide",
                'action' => 'Vérifiez la synchronisation de vos IDs client avec Margexa',
            ];
        }

        if (isset($topIssues['feature_not_found']) && $topIssues['feature_not_found'] > 10) {
            $recommendations[] = [
                'priority' => 'medium',
                'type' => 'data_quality',
                'message' => "{$topIssues['feature_not_found']} requêtes avec feature inconnue",
                'action' => 'Créez les features manquantes dans Settings > Features',
            ];
        }

        return $recommendations;
    }
}
