<?php
// REVIEW : Ce service est à vérifier. Garder uniquement si la simulation est vendue/visible dans le tunnel MVP.


namespace App\Services;
use App\Services\BusinessConstants;

use App\Models\AIRequest;
use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;
use App\Services\Routing\ModelTier;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Simulation Service - "Before Opening the Floodgates"
 * 
 * What-if simulator for strategic decisions:
 * - Volume scaling scenarios (usage x2, x3, etc.)
 * - Model routing changes (e.g., 30% to cheaper model)
 * - Plan-level policy changes (enable fallback)
 * - Feature rollout impact (open feature to all)
 * 
 * Output: projected cost, cost avoided, AI share of revenue.
 */
class SimulationService
{
    // ─────────────────────────────────────────────────────────
    // Scenario Types
    // ─────────────────────────────────────────────────────────
    
    public const SCENARIO_VOLUME_SCALE = 'volume_scale';
    public const SCENARIO_MODEL_SHIFT = 'model_shift';
    public const SCENARIO_PLAN_FALLBACK = 'plan_fallback';
    public const SCENARIO_FEATURE_ROLLOUT = 'feature_rollout';
    public const SCENARIO_BUDGET_CAP = 'budget_cap';
    public const SCENARIO_CUSTOM = 'custom';

    /**
     * Model cost estimates per 1K tokens (simplified).
     */
    // Les coûts sont désormais centralisés dans BusinessConstants

    // ─────────────────────────────────────────────────────────
    // Main Simulation Entry Point
    // ─────────────────────────────────────────────────────────
    
    /**
     * Run a simulation scenario.
     */
    public function simulate(Organization $organization, array $scenario): array
    {
        $type = $scenario['type'] ?? self::SCENARIO_CUSTOM;
        
        // Get baseline metrics
        $baseline = $this->getBaseline($organization);
        
        // Run the appropriate simulation
        $projection = match ($type) {
            self::SCENARIO_VOLUME_SCALE => $this->simulateVolumeScale($organization, $baseline, $scenario),
            self::SCENARIO_MODEL_SHIFT => $this->simulateModelShift($organization, $baseline, $scenario),
            self::SCENARIO_PLAN_FALLBACK => $this->simulatePlanFallback($organization, $baseline, $scenario),
            self::SCENARIO_FEATURE_ROLLOUT => $this->simulateFeatureRollout($organization, $baseline, $scenario),
            self::SCENARIO_BUDGET_CAP => $this->simulateBudgetCap($organization, $baseline, $scenario),
            self::SCENARIO_CUSTOM => $this->simulateCustom($organization, $baseline, $scenario),
            default => throw new \InvalidArgumentException("Unknown scenario type: {$type}"),
        };
        
        // Calculate impact
        return $this->calculateImpact($baseline, $projection, $scenario);
    }

    /**
     * Get multiple pre-built scenarios for quick simulation.
     */
    public function getQuickScenarios(Organization $organization): array
    {
        $baseline = $this->getBaseline($organization);
        
        return [
            'volume_double' => $this->simulate($organization, [
                'type' => self::SCENARIO_VOLUME_SCALE,
                'name' => 'Usage x2',
                'description' => 'Que se passe-t-il si le volume de requêtes double ?',
                'multiplier' => 2.0,
            ]),
            'volume_triple' => $this->simulate($organization, [
                'type' => self::SCENARIO_VOLUME_SCALE,
                'name' => 'Usage x3',
                'description' => 'Impact d\'un triplement des requêtes.',
                'multiplier' => 3.0,
            ]),
            'shift_to_economy' => $this->simulate($organization, [
                'type' => self::SCENARIO_MODEL_SHIFT,
                'name' => '30% vers économique',
                'description' => 'Rediriger 30% des requêtes vers un modèle économique.',
                'shift_percentage' => 30,
                'target_tier' => 'economy',
            ]),
            'fallback_basic' => $this->simulate($organization, [
                'type' => self::SCENARIO_PLAN_FALLBACK,
                'name' => 'Fallback plans Basic',
                'description' => 'Activer le fallback économique pour les plans Basic.',
                'plan_tiers' => ['low', 'basic', 'starter'],
                'fallback_tier' => 'economy',
            ]),
            'budget_cap_all' => $this->simulate($organization, [
                'type' => self::SCENARIO_BUDGET_CAP,
                'name' => 'Budget cap 80%',
                'description' => 'Plafonner les dépenses IA à 80% du revenu plan.',
                'cap_percentage' => 80,
            ]),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Baseline Calculation
    // ─────────────────────────────────────────────────────────
    
    /**
     * Get current baseline metrics.
     */
    private function getBaseline(Organization $organization): array
    {
        $periodStart = now()->startOfMonth();
        
        $base = AIRequest::query()
            ->where('ai_requests.organization_id', $organization->id)
            ->where('ai_requests.created_at', '>=', $periodStart);

        $totalCost = (float) (clone $base)->sum('estimated_cost');
        $totalRequests = (clone $base)->count();
        $avgCostPerRequest = $totalRequests > 0 ? $totalCost / $totalRequests : 0;
        
        // Cost by model tier
        $costByTier = (clone $base)
            ->selectRaw("routing_tier, COUNT(*) as requests, SUM(estimated_cost) as cost")
            ->groupBy('routing_tier')
            ->get()
            ->keyBy('routing_tier')
            ->map(fn ($row) => [
                'requests' => (int) $row->requests,
                'cost' => (float) $row->cost,
            ])
            ->toArray();

        // Cost by plan
        $costByPlan = (clone $base)
            ->leftJoin('plans', 'plans.id', '=', 'ai_requests.plan_id')
            ->selectRaw("plans.id, plans.name, plans.tier, plans.monthly_price, COUNT(*) as requests, SUM(ai_requests.estimated_cost) as cost")
            ->groupBy('plans.id', 'plans.name', 'plans.tier', 'plans.monthly_price')
            ->get()
            ->map(fn ($row) => [
                'plan_id' => $row->id,
                'plan_name' => $row->name ?? 'Sans plan',
                'tier' => $row->tier,
                'monthly_price' => (float) ($row->monthly_price ?? 0),
                'requests' => (int) $row->requests,
                'cost' => (float) $row->cost,
            ])
            ->toArray();

        // Cost by feature
        $costByFeature = (clone $base)
            ->leftJoin('features', 'features.id', '=', 'ai_requests.feature_id')
            ->selectRaw("features.id, features.name, COUNT(*) as requests, SUM(ai_requests.estimated_cost) as cost")
            ->groupBy('features.id', 'features.name')
            ->get()
            ->map(fn ($row) => [
                'feature_id' => $row->id,
                'feature_name' => $row->name ?? 'Sans feature',
                'requests' => (int) $row->requests,
                'cost' => (float) $row->cost,
            ])
            ->toArray();

        // Total plan revenue estimate
        $totalRevenue = Customer::query()
            ->where('customers.organization_id', $organization->id)
            ->join('plans', 'plans.id', '=', 'customers.plan_id')
            ->sum('plans.monthly_price');

        return [
            'period_start' => $periodStart->toDateString(),
            'total_cost' => round($totalCost, 2),
            'total_requests' => $totalRequests,
            'avg_cost_per_request' => round($avgCostPerRequest, 4),
            'total_revenue' => round((float) $totalRevenue, 2),
            'ai_revenue_ratio' => $totalRevenue > 0 ? round(($totalCost / $totalRevenue) * 100, 1) : null,
            'cost_by_tier' => $costByTier,
            'cost_by_plan' => $costByPlan,
            'cost_by_feature' => $costByFeature,
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Scenario Simulators
    // ─────────────────────────────────────────────────────────
    
    /**
     * Simulate volume scaling (usage x2, x3, etc.).
     */
    private function simulateVolumeScale(Organization $org, array $baseline, array $scenario): array
    {
        $multiplier = $scenario['multiplier'] ?? 2.0;
        
        return [
            'total_cost' => $baseline['total_cost'] * $multiplier,
            'total_requests' => (int) ($baseline['total_requests'] * $multiplier),
            'avg_cost_per_request' => $baseline['avg_cost_per_request'], // Same per-request cost
            'total_revenue' => $baseline['total_revenue'], // Revenue unchanged
            'cost_by_tier' => array_map(fn ($tier) => [
                'requests' => (int) ($tier['requests'] * $multiplier),
                'cost' => $tier['cost'] * $multiplier,
            ], $baseline['cost_by_tier']),
            'assumptions' => [
                'Volume multiplié par ' . $multiplier,
                'Même distribution de modèles',
                'Revenu plan inchangé',
            ],
        ];
    }

    /**
     * Simulate model shift (e.g., 30% to cheaper model).
     */
    private function simulateModelShift(Organization $org, array $baseline, array $scenario): array
    {
        $shiftPct = ($scenario['shift_percentage'] ?? 30) / 100;
        $targetTier = $scenario['target_tier'] ?? 'economy';
        
        $targetCostRatio = BusinessConstants::TIER_COSTS[$targetTier] / BusinessConstants::TIER_COSTS['premium'];
        
        // Calculate shifted costs
        $shiftedCost = 0;
        $savedCost = 0;
        $newCostByTier = $baseline['cost_by_tier'];
        
        foreach (['flagship', 'premium'] as $expensiveTier) {
            if (isset($newCostByTier[$expensiveTier])) {
                $tierData = $newCostByTier[$expensiveTier];
                $shiftedRequests = (int) ($tierData['requests'] * $shiftPct);
                $shiftedTierCost = $tierData['cost'] * $shiftPct;
                
                // Cost after shift (cheaper model)
                $newCost = $shiftedTierCost * $targetCostRatio;
                $savedCost += $shiftedTierCost - $newCost;
                
                // Update tier counts
                $newCostByTier[$expensiveTier] = [
                    'requests' => $tierData['requests'] - $shiftedRequests,
                    'cost' => $tierData['cost'] - $shiftedTierCost,
                ];
                
                if (!isset($newCostByTier[$targetTier])) {
                    $newCostByTier[$targetTier] = ['requests' => 0, 'cost' => 0];
                }
                $newCostByTier[$targetTier]['requests'] += $shiftedRequests;
                $newCostByTier[$targetTier]['cost'] += $newCost;
            }
        }
        
        $newTotalCost = $baseline['total_cost'] - $savedCost;
        
        return [
            'total_cost' => round($newTotalCost, 2),
            'total_requests' => $baseline['total_requests'],
            'avg_cost_per_request' => round($newTotalCost / max(1, $baseline['total_requests']), 4),
            'total_revenue' => $baseline['total_revenue'],
            'cost_by_tier' => $newCostByTier,
            'cost_saved' => round($savedCost, 2),
            'assumptions' => [
                sprintf('%d%% des requêtes premium/flagship redirigées vers %s', $scenario['shift_percentage'] ?? 30, $targetTier),
                'Même qualité de réponse supposée',
                'Pas de changement de volume',
            ],
        ];
    }

    /**
     * Simulate plan-level fallback activation.
     */
    private function simulatePlanFallback(Organization $org, array $baseline, array $scenario): array
    {
        $targetTiers = $scenario['plan_tiers'] ?? ['low', 'basic', 'starter'];
        $fallbackTier = $scenario['fallback_tier'] ?? 'economy';
        
        $fallbackCostRatio = BusinessConstants::TIER_COSTS[$fallbackTier] / BusinessConstants::TIER_COSTS['premium'];
        
        $savedCost = 0;
        $newCostByPlan = $baseline['cost_by_plan'];
        
        foreach ($newCostByPlan as $key => $planData) {
            $planTier = strtolower($planData['tier'] ?? '');
            
            if (in_array($planTier, $targetTiers) || in_array($planData['plan_name'], $targetTiers)) {
                // Apply fallback - assume 70% of requests can use fallback
                $fallbackPct = 0.7;
                $originalCost = $planData['cost'];
                $fallbackSavings = $originalCost * $fallbackPct * (1 - $fallbackCostRatio);
                
                $savedCost += $fallbackSavings;
                $newCostByPlan[$key]['cost'] = $originalCost - $fallbackSavings;
                $newCostByPlan[$key]['fallback_applied'] = true;
            }
        }
        
        $newTotalCost = $baseline['total_cost'] - $savedCost;
        
        return [
            'total_cost' => round($newTotalCost, 2),
            'total_requests' => $baseline['total_requests'],
            'avg_cost_per_request' => round($newTotalCost / max(1, $baseline['total_requests']), 4),
            'total_revenue' => $baseline['total_revenue'],
            'cost_by_plan' => $newCostByPlan,
            'cost_saved' => round($savedCost, 2),
            'assumptions' => [
                sprintf('Fallback %s activé pour plans %s', $fallbackTier, implode(', ', $targetTiers)),
                '70% des requêtes éligibles au fallback',
                'Pas de dégradation qualité perçue',
            ],
        ];
    }

    /**
     * Simulate feature rollout to all customers.
     */
    private function simulateFeatureRollout(Organization $org, array $baseline, array $scenario): array
    {
        $featureName = $scenario['feature_name'] ?? null;
        $rolloutMultiplier = $scenario['rollout_multiplier'] ?? 3.0; // 3x more usage
        
        // Find the feature's current cost
        $featureCost = 0;
        $featureRequests = 0;
        
        foreach ($baseline['cost_by_feature'] as $feature) {
            if ($feature['feature_name'] === $featureName || !$featureName) {
                $featureCost += $feature['cost'];
                $featureRequests += $feature['requests'];
                break;
            }
        }
        
        // If no specific feature, use average
        if ($featureCost === 0) {
            $featureCost = $baseline['total_cost'] * 0.2; // Assume 20% of cost
            $featureRequests = (int) ($baseline['total_requests'] * 0.2);
        }
        
        $additionalCost = $featureCost * ($rolloutMultiplier - 1);
        $additionalRequests = (int) ($featureRequests * ($rolloutMultiplier - 1));
        
        return [
            'total_cost' => round($baseline['total_cost'] + $additionalCost, 2),
            'total_requests' => $baseline['total_requests'] + $additionalRequests,
            'avg_cost_per_request' => $baseline['avg_cost_per_request'],
            'total_revenue' => $baseline['total_revenue'],
            'additional_cost' => round($additionalCost, 2),
            'assumptions' => [
                sprintf('Feature "%s" ouverte à tous les clients', $featureName ?? 'principale'),
                sprintf('Usage multiplié par %s', $rolloutMultiplier),
                'Même coût moyen par requête',
            ],
        ];
    }

    /**
     * Simulate budget cap enforcement.
     */
    private function simulateBudgetCap(Organization $org, array $baseline, array $scenario): array
    {
        $capPct = ($scenario['cap_percentage'] ?? 80) / 100;
        
        $savedCost = 0;
        $blockedRequests = 0;
        $newCostByPlan = $baseline['cost_by_plan'];
        
        foreach ($newCostByPlan as $key => $planData) {
            $maxAllowed = $planData['monthly_price'] * $capPct;
            
            if ($planData['cost'] > $maxAllowed && $maxAllowed > 0) {
                $excess = $planData['cost'] - $maxAllowed;
                $savedCost += $excess;
                
                // Estimate blocked requests
                $avgCost = $planData['cost'] / max(1, $planData['requests']);
                $blockedRequests += (int) ($excess / max(0.0001, $avgCost));
                
                $newCostByPlan[$key]['cost'] = $maxAllowed;
                $newCostByPlan[$key]['capped'] = true;
                $newCostByPlan[$key]['blocked_cost'] = round($excess, 2);
            }
        }
        
        $newTotalCost = $baseline['total_cost'] - $savedCost;
        
        return [
            'total_cost' => round($newTotalCost, 2),
            'total_requests' => $baseline['total_requests'] - $blockedRequests,
            'blocked_requests' => $blockedRequests,
            'avg_cost_per_request' => $baseline['avg_cost_per_request'],
            'total_revenue' => $baseline['total_revenue'],
            'cost_by_plan' => $newCostByPlan,
            'cost_saved' => round($savedCost, 2),
            'assumptions' => [
                sprintf('Budget cap à %d%% du revenu plan', $scenario['cap_percentage'] ?? 80),
                'Requêtes au-delà du cap sont bloquées',
                'Pas de fallback automatique',
            ],
        ];
    }

    /**
     * Custom scenario with multiple parameters.
     */
    private function simulateCustom(Organization $org, array $baseline, array $scenario): array
    {
        $result = [
            'total_cost' => $baseline['total_cost'],
            'total_requests' => $baseline['total_requests'],
            'total_revenue' => $baseline['total_revenue'],
            'assumptions' => [],
        ];
        
        // Apply volume multiplier
        if (isset($scenario['volume_multiplier'])) {
            $result['total_cost'] *= $scenario['volume_multiplier'];
            $result['total_requests'] = (int) ($result['total_requests'] * $scenario['volume_multiplier']);
            $result['assumptions'][] = sprintf('Volume x%s', $scenario['volume_multiplier']);
        }
        
        // Apply cost reduction (routing/fallback)
        if (isset($scenario['cost_reduction_pct'])) {
            $reduction = $result['total_cost'] * ($scenario['cost_reduction_pct'] / 100);
            $result['cost_saved'] = round($reduction, 2);
            $result['total_cost'] -= $reduction;
            $result['assumptions'][] = sprintf('%d%% de réduction coût via routing', $scenario['cost_reduction_pct']);
        }
        
        // Apply revenue change
        if (isset($scenario['revenue_multiplier'])) {
            $result['total_revenue'] *= $scenario['revenue_multiplier'];
            $result['assumptions'][] = sprintf('Revenu x%s', $scenario['revenue_multiplier']);
        }
        
        $result['total_cost'] = round($result['total_cost'], 2);
        $result['total_revenue'] = round($result['total_revenue'], 2);
        $result['avg_cost_per_request'] = $result['total_requests'] > 0 
            ? round($result['total_cost'] / $result['total_requests'], 4) 
            : 0;
        
        return $result;
    }

    // ─────────────────────────────────────────────────────────
    // Impact Calculation
    // ─────────────────────────────────────────────────────────
    
    /**
     * Calculate the impact of a scenario vs baseline.
     */
    private function calculateImpact(array $baseline, array $projection, array $scenario): array
    {
        $costDelta = $projection['total_cost'] - $baseline['total_cost'];
        $costDeltaPct = $baseline['total_cost'] > 0 
            ? round(($costDelta / $baseline['total_cost']) * 100, 1)
            : 0;
        
        $projectedAiRatio = $projection['total_revenue'] > 0
            ? round(($projection['total_cost'] / $projection['total_revenue']) * 100, 1)
            : null;
        
        $aiRatioDelta = ($projectedAiRatio !== null && $baseline['ai_revenue_ratio'] !== null)
            ? round($projectedAiRatio - $baseline['ai_revenue_ratio'], 1)
            : null;
        
        // Determine scenario verdict
        $verdict = $this->getVerdict($costDeltaPct, $aiRatioDelta, $projection);
        
        return [
            'scenario' => [
                'type' => $scenario['type'] ?? self::SCENARIO_CUSTOM,
                'name' => $scenario['name'] ?? 'Scénario personnalisé',
                'description' => $scenario['description'] ?? '',
            ],
            'baseline' => [
                'cost' => $baseline['total_cost'],
                'requests' => $baseline['total_requests'],
                'revenue' => $baseline['total_revenue'],
                'ai_ratio' => $baseline['ai_revenue_ratio'],
            ],
            'projection' => [
                'cost' => $projection['total_cost'],
                'requests' => $projection['total_requests'] ?? $baseline['total_requests'],
                'revenue' => $projection['total_revenue'],
                'ai_ratio' => $projectedAiRatio,
                'blocked_requests' => $projection['blocked_requests'] ?? 0,
            ],
            'impact' => [
                'cost_delta' => round($costDelta, 2),
                'cost_delta_pct' => $costDeltaPct,
                'cost_saved' => $projection['cost_saved'] ?? ($costDelta < 0 ? abs($costDelta) : 0),
                'ai_ratio_delta' => $aiRatioDelta,
                'verdict' => $verdict['label'],
                'verdict_type' => $verdict['type'],
                'verdict_details' => $verdict['details'],
            ],
            'assumptions' => $projection['assumptions'] ?? [],
            'details' => [
                'cost_by_tier' => $projection['cost_by_tier'] ?? $baseline['cost_by_tier'],
                'cost_by_plan' => $projection['cost_by_plan'] ?? $baseline['cost_by_plan'],
            ],
        ];
    }

    /**
     * Generate a verdict for the scenario.
     */
    private function getVerdict(float $costDeltaPct, ?float $aiRatioDelta, array $projection): array
    {
        // Positive scenarios (cost reduction)
        if ($costDeltaPct < -10) {
            return [
                'label' => 'Excellente opportunité',
                'type' => 'positive',
                'details' => sprintf('Réduction des coûts de %.1f%%. Fortement recommandé.', abs($costDeltaPct)),
            ];
        }
        
        if ($costDeltaPct < 0) {
            return [
                'label' => 'Opportunité modérée',
                'type' => 'positive',
                'details' => sprintf('Économies de %.1f%%. À considérer.', abs($costDeltaPct)),
            ];
        }
        
        // Neutral scenarios
        if ($costDeltaPct < 20) {
            $warningLevel = $aiRatioDelta !== null && $aiRatioDelta > 5 ? 'warning' : 'neutral';
            return [
                'label' => 'Impact modéré',
                'type' => $warningLevel,
                'details' => sprintf('Augmentation de %.1f%%. Gérable avec optimisations.', $costDeltaPct),
            ];
        }
        
        // Negative scenarios (cost increase)
        if ($costDeltaPct < 50) {
            return [
                'label' => 'Attention requise',
                'type' => 'warning',
                'details' => sprintf('Augmentation de %.1f%%. Prévoir des contrôles.', $costDeltaPct),
            ];
        }
        
        return [
            'label' => 'Risque élevé',
            'type' => 'danger',
            'details' => sprintf('Augmentation de %.1f%%. Nécessite des protections avant déploiement.', $costDeltaPct),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Comparison Tools
    // ─────────────────────────────────────────────────────────
    
    /**
     * Compare multiple scenarios side by side.
     */
    public function compareScenarios(Organization $organization, array $scenarios): array
    {
        $baseline = $this->getBaseline($organization);
        $results = [];
        
        foreach ($scenarios as $key => $scenario) {
            $results[$key] = $this->simulate($organization, $scenario);
        }
        
        // Sort by cost impact (most savings first)
        uasort($results, fn ($a, $b) => $a['impact']['cost_delta'] <=> $b['impact']['cost_delta']);
        
        return [
            'baseline' => $baseline,
            'scenarios' => $results,
            'recommendation' => $this->getBestScenario($results),
        ];
    }

    /**
     * Get recommendation for best scenario.
     */
    private function getBestScenario(array $results): ?array
    {
        $best = null;
        $bestSavings = 0;
        
        foreach ($results as $key => $result) {
            $savings = $result['impact']['cost_saved'] ?? 0;
            if ($savings > $bestSavings) {
                $bestSavings = $savings;
                $best = [
                    'scenario_key' => $key,
                    'name' => $result['scenario']['name'],
                    'savings' => $savings,
                    'verdict' => $result['impact']['verdict'],
                ];
            }
        }
        
        return $best;
    }
}
