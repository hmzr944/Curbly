<?php

namespace App\Services;

use App\Models\AIRequest;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * CFO Metrics Service - Finance-Friendly Views
 * 
 * Provides unit economics, ROI, and margin impact metrics
 * optimized for CFO/finance consumption and export.
 * 
 * Key outputs:
 * - AI cost per plan vs plan revenue
 * - Margin saved by policies/routing
 * - Top 5 margin-destroying customers
 * - Weekly readout (PDF/CSV exportable)
 */
class CFOMetricsService
{
    // ─────────────────────────────────────────────────────────
    // Executive Summary - The "One-Pager"
    // ─────────────────────────────────────────────────────────
    
    /**
     * Generate executive readout for CFO consumption.
     * 
     * @return array Complete executive summary with unit economics
     */
    public function getExecutiveReadout(Organization $organization, ?Carbon $periodStart = null, ?Carbon $periodEnd = null): array
    {
        $periodStart = $periodStart ?? now()->startOfMonth();
        $periodEnd = $periodEnd ?? now();

        return [
            'period' => [
                'start' => $periodStart->toDateString(),
                'end' => $periodEnd->toDateString(),
                'label' => $periodStart->format('M Y'),
            ],
            'headline_metrics' => $this->getHeadlineMetrics($organization, $periodStart, $periodEnd),
            'plan_economics' => $this->getPlanUnitEconomics($organization, $periodStart, $periodEnd),
            'margin_protection' => $this->getMarginProtectionSummary($organization, $periodStart, $periodEnd),
            'top_margin_destroyers' => $this->getTopMarginDestroyers($organization, $periodStart, $periodEnd),
            'cost_trend' => $this->getCostTrend($organization, $periodStart, $periodEnd),
        ];
    }

    /**
     * Get headline metrics for quick executive consumption.
     */
    private function getHeadlineMetrics(Organization $organization, Carbon $start, Carbon $end): array
    {
        $base = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$start, $end]);

        $totalAICost = (float) (clone $base)->sum('estimated_cost');
        $totalRequests = (clone $base)->count();
        $totalRoutingSavings = (float) (clone $base)->sum('routing_savings');
        $policyBlockedRequests = (clone $base)->where('policy_triggered', true)->count();

        // Compare to previous period
        $periodDays = $start->diffInDays($end);
        $prevStart = $start->copy()->subDays($periodDays);
        $prevEnd = $start->copy()->subDay();

        $prevBase = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$prevStart, $prevEnd]);

        $prevTotalCost = (float) (clone $prevBase)->sum('estimated_cost');
        $costChange = $prevTotalCost > 0 
            ? round((($totalAICost - $prevTotalCost) / $prevTotalCost) * 100, 1)
            : null;

        // Calculate total revenue from plans (estimates)
        $totalPlanRevenue = $this->estimatePlanRevenue($organization, $start, $end);

        // AI cost as % of revenue
        $aiCostRevenueRatio = $totalPlanRevenue > 0 
            ? round(($totalAICost / $totalPlanRevenue) * 100, 1)
            : null;

        return [
            'total_ai_cost' => round($totalAICost, 2),
            'total_requests' => $totalRequests,
            'avg_cost_per_request' => $totalRequests > 0 ? round($totalAICost / $totalRequests, 4) : 0,
            'routing_savings' => round($totalRoutingSavings, 2),
            'policy_blocked_requests' => $policyBlockedRequests,
            'estimated_plan_revenue' => round($totalPlanRevenue, 2),
            'ai_cost_revenue_ratio' => $aiCostRevenueRatio,
            'cost_change_vs_prev' => $costChange,
            'cost_trend' => $costChange === null ? 'neutral' : ($costChange > 5 ? 'up' : ($costChange < -5 ? 'down' : 'stable')),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Plan Unit Economics - Cost vs Revenue
    // ─────────────────────────────────────────────────────────
    
    /**
     * Get AI cost per plan vs plan revenue (unit economics view).
     */
    public function getPlanUnitEconomics(Organization $organization, ?Carbon $start = null, ?Carbon $end = null): Collection
    {
        $start = $start ?? now()->startOfMonth();
        $end = $end ?? now();

        return Plan::query()
            ->where('plans.organization_id', $organization->id)
            ->leftJoin('ai_requests', function ($join) use ($organization, $start, $end) {
                $join->on('plans.id', '=', 'ai_requests.plan_id')
                    ->where('ai_requests.organization_id', $organization->id)
                    ->whereBetween('ai_requests.created_at', [$start, $end]);
            })
            ->leftJoin('customers', function ($join) {
                $join->on('customers.plan_id', '=', 'plans.id');
            })
            ->select([
                'plans.id',
                'plans.name',
                'plans.tier',
                'plans.monthly_price',
                'plans.monthly_ai_budget',
            ])
            ->selectRaw('COUNT(DISTINCT customers.id) as active_customers')
            ->selectRaw('COUNT(ai_requests.id) as total_requests')
            ->selectRaw('COALESCE(SUM(ai_requests.estimated_cost), 0) as total_ai_cost')
            ->selectRaw('COALESCE(SUM(ai_requests.routing_savings), 0) as routing_savings')
            ->groupBy('plans.id', 'plans.name', 'plans.tier', 'plans.monthly_price', 'plans.monthly_ai_budget')
            ->orderByDesc('total_ai_cost')
            ->get()
            ->map(function ($plan) {
                $monthlyPrice = (float) ($plan->monthly_price ?? 0);
                $aiCost = (float) $plan->total_ai_cost;
                $customers = (int) $plan->active_customers;
                
                // Revenue for this plan
                $planRevenue = $monthlyPrice * $customers;
                
                // AI cost per customer
                $aiCostPerCustomer = $customers > 0 ? round($aiCost / $customers, 2) : 0;
                
                // AI cost as % of plan price (per customer)
                $aiCostRatio = $monthlyPrice > 0 ? round(($aiCostPerCustomer / $monthlyPrice) * 100, 1) : null;
                
                // Gross margin after AI
                $grossMarginAfterAI = $monthlyPrice - $aiCostPerCustomer;
                $grossMarginPct = $monthlyPrice > 0 ? round(($grossMarginAfterAI / $monthlyPrice) * 100, 1) : null;
                
                // Health status
                $health = $this->getPlanHealthStatus($aiCostRatio, $plan->monthly_ai_budget, $aiCost);
                
                return [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'tier' => $plan->tier,
                    'active_customers' => $customers,
                    'monthly_price' => $monthlyPrice,
                    'plan_revenue' => round($planRevenue, 2),
                    'total_ai_cost' => round($aiCost, 2),
                    'ai_cost_per_customer' => $aiCostPerCustomer,
                    'ai_cost_ratio_pct' => $aiCostRatio,
                    'gross_margin_after_ai' => round($grossMarginAfterAI, 2),
                    'gross_margin_pct' => $grossMarginPct,
                    'routing_savings' => round((float) $plan->routing_savings, 2),
                    'budget_utilization' => $plan->monthly_ai_budget 
                        ? round(($aiCost / $plan->monthly_ai_budget) * 100, 1)
                        : null,
                    'health' => $health,
                ];
            });
    }

    /**
     * Determine plan health status.
     */
    private function getPlanHealthStatus(?float $aiCostRatioPct, ?float $budget, float $spent): string
    {
        // If AI cost exceeds 40% of plan price, it's critical
        if ($aiCostRatioPct !== null && $aiCostRatioPct >= 40) {
            return 'critical';
        }

        // If AI cost exceeds 25% of plan price, it's warning
        if ($aiCostRatioPct !== null && $aiCostRatioPct >= 25) {
            return 'warning';
        }

        // If budget is set and we're over 80%, it's warning
        if ($budget && $spent >= $budget * 0.8) {
            return 'warning';
        }

        return 'healthy';
    }

    // ─────────────────────────────────────────────────────────
    // Margin Protection Summary
    // ─────────────────────────────────────────────────────────
    
    /**
     * Get margin protection summary (savings from policies and routing).
     */
    public function getMarginProtectionSummary(Organization $organization, ?Carbon $start = null, ?Carbon $end = null): array
    {
        $start = $start ?? now()->startOfMonth();
        $end = $end ?? now();

        $base = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$start, $end]);

        // Routing savings
        $routingSavings = (float) (clone $base)->sum('routing_savings');
        $downgradedRequests = (clone $base)->where('routing_outcome', 'downgraded')->count();
        
        // Policy enforcement
        $blockedByPolicy = (clone $base)
            ->where('policy_triggered', true)
            ->where('enforcement_action', 'block')
            ->count();
        
        $warningByPolicy = (clone $base)
            ->where('policy_triggered', true)
            ->where('enforcement_action', 'warn')
            ->count();

        // Estimate blocked cost (average cost × blocked requests)
        $avgCost = (float) (clone $base)->avg('estimated_cost') ?? 0;
        $estimatedBlockedCost = $blockedByPolicy * $avgCost * 2; // Assume blocked were 2x avg

        // Savings by routing tier
        $savingsByTier = (clone $base)
            ->where('routing_outcome', 'downgraded')
            ->whereNotNull('routing_tier')
            ->selectRaw('routing_tier as tier, COUNT(*) as count, SUM(routing_savings) as savings')
            ->groupBy('routing_tier')
            ->get()
            ->keyBy('tier')
            ->map(fn ($row) => [
                'count' => (int) $row->count,
                'savings' => round((float) $row->savings, 2),
            ]);

        // Calculate total margin protected
        $totalMarginProtected = $routingSavings + $estimatedBlockedCost;

        return [
            'total_margin_protected' => round($totalMarginProtected, 2),
            'routing_savings' => round($routingSavings, 2),
            'estimated_policy_savings' => round($estimatedBlockedCost, 2),
            'downgraded_requests' => $downgradedRequests,
            'blocked_by_policy' => $blockedByPolicy,
            'warned_by_policy' => $warningByPolicy,
            'savings_by_tier' => $savingsByTier,
            'protection_rate' => $this->calculateProtectionRate($organization, $start, $end),
        ];
    }

    /**
     * Calculate protection rate (% of requests that were optimized).
     */
    private function calculateProtectionRate(Organization $organization, Carbon $start, Carbon $end): float
    {
        $total = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        if ($total === 0) {
            return 0;
        }

        $protected = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$start, $end])
            ->where(function ($q) {
                $q->where('routing_savings', '>', 0)
                  ->orWhere('policy_triggered', true);
            })
            ->count();

        return round(($protected / $total) * 100, 1);
    }

    // ─────────────────────────────────────────────────────────
    // Top Margin Destroyers
    // ─────────────────────────────────────────────────────────
    
    /**
     * Get top 5 margin-destroying customers.
     * 
     * Ranked by AI cost / expected revenue ratio.
     */
    public function getTopMarginDestroyers(Organization $organization, ?Carbon $start = null, ?Carbon $end = null, int $limit = 5): Collection
    {
        $start = $start ?? now()->startOfMonth();
        $end = $end ?? now();

        return Customer::query()
            ->where('customers.organization_id', $organization->id)
            ->leftJoin('ai_requests', function ($join) use ($organization, $start, $end) {
                $join->on('customers.id', '=', 'ai_requests.customer_id')
                    ->where('ai_requests.organization_id', $organization->id)
                    ->whereBetween('ai_requests.created_at', [$start, $end]);
            })
            ->leftJoin('plans', 'customers.plan_id', '=', 'plans.id')
            ->select([
                'customers.id',
                'customers.name',
                'customers.external_id',
                'plans.name as plan_name',
                'plans.monthly_price',
            ])
            ->selectRaw('COUNT(ai_requests.id) as request_count')
            ->selectRaw('COALESCE(SUM(ai_requests.estimated_cost), 0) as total_ai_cost')
            ->groupBy('customers.id', 'customers.name', 'customers.external_id', 'plans.name', 'plans.monthly_price')
            ->havingRaw('COALESCE(SUM(ai_requests.estimated_cost), 0) > 0')
            ->orderByDesc(DB::raw('COALESCE(SUM(ai_requests.estimated_cost), 0) / NULLIF(plans.monthly_price, 0)'))
            ->limit($limit)
            ->get()
            ->map(function ($customer) {
                $aiCost = (float) $customer->total_ai_cost;
                $monthlyPrice = (float) ($customer->monthly_price ?? 0);
                
                // Cost/revenue ratio
                $costRevenueRatio = $monthlyPrice > 0 
                    ? round(($aiCost / $monthlyPrice) * 100, 1)
                    : null;
                
                // Margin impact (negative = destroying margin)
                $marginImpact = $monthlyPrice > 0 
                    ? round($monthlyPrice - $aiCost, 2)
                    : null;
                
                // How much are they "stealing" from margin
                $excessCost = $monthlyPrice > 0 && $aiCost > ($monthlyPrice * 0.25)
                    ? round($aiCost - ($monthlyPrice * 0.25), 2)
                    : 0;
                
                // Risk level
                $riskLevel = match (true) {
                    $costRevenueRatio === null => 'unknown',
                    $costRevenueRatio >= 50 => 'critical',
                    $costRevenueRatio >= 30 => 'high',
                    $costRevenueRatio >= 15 => 'moderate',
                    default => 'low',
                };
                
                return [
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'external_id' => $customer->external_id,
                    'plan_name' => $customer->plan_name,
                    'plan_revenue' => $monthlyPrice,
                    'ai_cost' => round($aiCost, 2),
                    'request_count' => (int) $customer->request_count,
                    'cost_revenue_ratio_pct' => $costRevenueRatio,
                    'margin_impact' => $marginImpact,
                    'excess_cost' => $excessCost,
                    'risk_level' => $riskLevel,
                    'recommendation' => $this->getCustomerRecommendation($costRevenueRatio, $customer->plan_name),
                ];
            });
    }

    /**
     * Get recommendation for problematic customer.
     */
    private function getCustomerRecommendation(?float $costRevenueRatio, ?string $planName): string
    {
        if ($costRevenueRatio === null) {
            return 'Définir un plan tarifaire pour ce client';
        }

        if ($costRevenueRatio >= 50) {
            return 'Urgence : restreindre au modèle économique ou proposer upgrade';
        }

        if ($costRevenueRatio >= 30) {
            return 'Activer le budget cap ou proposer un plan supérieur';
        }

        return 'Surveiller l\'évolution';
    }

    // ─────────────────────────────────────────────────────────
    // Cost Trend (Daily)
    // ─────────────────────────────────────────────────────────
    
    /**
     * Get daily cost trend for the period.
     */
    public function getCostTrend(Organization $organization, ?Carbon $start = null, ?Carbon $end = null): Collection
    {
        $start = $start ?? now()->startOfMonth();
        $end = $end ?? now();

        return AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("DATE(created_at) as date")
            ->selectRaw('COUNT(*) as requests')
            ->selectRaw('SUM(estimated_cost) as cost')
            ->selectRaw('SUM(routing_savings) as savings')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'requests' => (int) $row->requests,
                'cost' => round((float) $row->cost, 2),
                'savings' => round((float) $row->savings, 2),
            ]);
    }

    // ─────────────────────────────────────────────────────────
    // Weekly Readout (Exportable)
    // ─────────────────────────────────────────────────────────
    
    /**
     * Generate weekly readout summary for export.
     */
    public function getWeeklyReadout(Organization $organization, ?Carbon $weekStart = null): array
    {
        $weekStart = $weekStart ?? now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();
        
        $readout = $this->getExecutiveReadout($organization, $weekStart, $weekEnd);
        
        // Add formatted strings for PDF/CSV
        $headlines = $readout['headline_metrics'];
        
        return [
            'organization' => $organization->name,
            'period' => [
                'start' => $weekStart->format('d/m/Y'),
                'end' => $weekEnd->format('d/m/Y'),
                'week' => $weekStart->format('W'),
            ],
            'summary_text' => $this->generateSummaryText($headlines, $readout),
            'kpis' => [
                ['label' => 'Coût IA total', 'value' => number_format($headlines['total_ai_cost'], 2, ',', ' ') . ' €'],
                ['label' => 'Requêtes', 'value' => number_format($headlines['total_requests'], 0, ',', ' ')],
                ['label' => 'Coût moyen/requête', 'value' => number_format($headlines['avg_cost_per_request'], 4, ',', ' ') . ' €'],
                ['label' => 'Économies routing', 'value' => number_format($headlines['routing_savings'], 2, ',', ' ') . ' €'],
                ['label' => 'Ratio coût/revenu', 'value' => ($headlines['ai_cost_revenue_ratio'] ?? '—') . '%'],
                ['label' => 'Variation vs période préc.', 'value' => ($headlines['cost_change_vs_prev'] !== null ? sprintf('%+.1f%%', $headlines['cost_change_vs_prev']) : '—')],
            ],
            'plans' => $readout['plan_economics']->map(fn ($p) => [
                'name' => $p['plan_name'],
                'tier' => $p['tier'],
                'customers' => $p['active_customers'],
                'ai_cost' => number_format($p['total_ai_cost'], 2, ',', ' ') . ' €',
                'margin_after_ai' => number_format($p['gross_margin_after_ai'], 2, ',', ' ') . ' €',
                'health' => $p['health'],
            ])->toArray(),
            'top_margin_destroyers' => $readout['top_margin_destroyers']->map(fn ($c) => [
                'customer' => $c['customer_name'],
                'plan' => $c['plan_name'] ?? '—',
                'ai_cost' => number_format($c['ai_cost'], 2, ',', ' ') . ' €',
                'ratio' => ($c['cost_revenue_ratio_pct'] ?? '—') . '%',
                'risk' => $c['risk_level'],
            ])->toArray(),
            'margin_protection' => [
                'total_saved' => number_format($readout['margin_protection']['total_margin_protected'], 2, ',', ' ') . ' €',
                'routing_savings' => number_format($readout['margin_protection']['routing_savings'], 2, ',', ' ') . ' €',
                'blocked_requests' => $readout['margin_protection']['blocked_by_policy'],
                'protection_rate' => $readout['margin_protection']['protection_rate'] . '%',
            ],
            'raw_data' => $readout,
        ];
    }

    /**
     * Generate human-readable summary text.
     */
    private function generateSummaryText(array $headlines, array $readout): string
    {
        $lines = [];
        
        $lines[] = sprintf(
            "Cette semaine, le coût IA total s'élève à %.2f € pour %d requêtes.",
            $headlines['total_ai_cost'],
            $headlines['total_requests']
        );

        if ($headlines['cost_change_vs_prev'] !== null) {
            $direction = $headlines['cost_change_vs_prev'] > 0 ? 'hausse' : 'baisse';
            $lines[] = sprintf(
                "C'est une %s de %.1f%% par rapport à la période précédente.",
                $direction,
                abs($headlines['cost_change_vs_prev'])
            );
        }

        if ($headlines['routing_savings'] > 0) {
            $lines[] = sprintf(
                "Le router économique a permis d'économiser %.2f €.",
                $headlines['routing_savings']
            );
        }

        $destroyers = $readout['top_margin_destroyers'];
        if ($destroyers->isNotEmpty()) {
            $top = $destroyers->first();
            if (($top['cost_revenue_ratio_pct'] ?? 0) >= 30) {
                $lines[] = sprintf(
                    "⚠️ Attention : le client %s consomme %.1f%% de son revenu plan en coûts IA.",
                    $top['customer_name'],
                    $top['cost_revenue_ratio_pct']
                );
            }
        }

        return implode(' ', $lines);
    }

    /**
     * Estimate total plan revenue for period.
     */
    private function estimatePlanRevenue(Organization $organization, Carbon $start, Carbon $end): float
    {
        // Count active customers per plan and multiply by monthly price
        // This is a simplified estimate
        return Customer::query()
            ->where('customers.organization_id', $organization->id)
            ->join('plans', 'customers.plan_id', '=', 'plans.id')
            ->whereNotNull('plans.monthly_price')
            ->selectRaw('SUM(plans.monthly_price) as total')
            ->value('total') ?? 0;
    }

    // ─────────────────────────────────────────────────────────
    // Export Helpers
    // ─────────────────────────────────────────────────────────
    
    /**
     * Generate CSV data for weekly readout.
     */
    public function getWeeklyReadoutCSV(Organization $organization, ?Carbon $weekStart = null): array
    {
        $readout = $this->getWeeklyReadout($organization, $weekStart);
        
        $rows = [];
        
        // Header
        $rows[] = ['Margexa - CFO Weekly Readout'];
        $rows[] = ['Organisation', $readout['organization']];
        $rows[] = ['Période', $readout['period']['start'] . ' - ' . $readout['period']['end']];
        $rows[] = [];
        
        // KPIs
        $rows[] = ['== KPIs Clés =='];
        foreach ($readout['kpis'] as $kpi) {
            $rows[] = [$kpi['label'], $kpi['value']];
        }
        $rows[] = [];
        
        // Plans
        $rows[] = ['== Unit Economics par Plan =='];
        $rows[] = ['Plan', 'Tier', 'Clients actifs', 'Coût IA', 'Marge après IA', 'Santé'];
        foreach ($readout['plans'] as $plan) {
            $rows[] = [
                $plan['name'],
                $plan['tier'],
                $plan['customers'],
                $plan['ai_cost'],
                $plan['margin_after_ai'],
                $plan['health'],
            ];
        }
        $rows[] = [];
        
        // Margin destroyers
        $rows[] = ['== Top 5 Clients à Risque Marge =='];
        $rows[] = ['Client', 'Plan', 'Coût IA', 'Ratio coût/revenu', 'Niveau risque'];
        foreach ($readout['top_margin_destroyers'] as $customer) {
            $rows[] = [
                $customer['customer'],
                $customer['plan'],
                $customer['ai_cost'],
                $customer['ratio'],
                $customer['risk'],
            ];
        }
        $rows[] = [];
        
        // Protection
        $rows[] = ['== Protection Marge =='];
        $rows[] = ['Économies totales', $readout['margin_protection']['total_saved']];
        $rows[] = ['Économies routing', $readout['margin_protection']['routing_savings']];
        $rows[] = ['Requêtes bloquées', $readout['margin_protection']['blocked_requests']];
        $rows[] = ['Taux de protection', $readout['margin_protection']['protection_rate']];
        
        return $rows;
    }
}
