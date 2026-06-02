<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIRequest;
use App\Services\CostEstimatorService;
use App\Services\SimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Simulation Controller - "Before Opening the Floodgates"
 * 
 * What-if simulator for strategic decision making:
 * - Volume scaling impact
 * - Model routing changes
 * - Plan-level policy changes
 * - Feature rollout projections
 */
class SimulationController extends Controller
{
    public function __construct(
        private readonly SimulationService    $simulationService,
        private readonly CostEstimatorService $costEstimator,
    ) {}

    /**
     * Get quick pre-built scenarios.
     * 
     * GET /api/simulation/quick
     */
    public function quickScenarios(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found.',
            ], 400);
        }

        $scenarios = $this->simulationService->getQuickScenarios($organization);

        return response()->json([
            'success' => true,
            'data' => $scenarios,
        ]);
    }

    /**
     * Run a custom simulation.
     * 
     * POST /api/simulation/run
     */
    public function run(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found.',
            ], 400);
        }

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in([
                SimulationService::SCENARIO_VOLUME_SCALE,
                SimulationService::SCENARIO_MODEL_SHIFT,
                SimulationService::SCENARIO_PLAN_FALLBACK,
                SimulationService::SCENARIO_FEATURE_ROLLOUT,
                SimulationService::SCENARIO_BUDGET_CAP,
                SimulationService::SCENARIO_CUSTOM,
            ])],
            'name' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            
            // Volume scale params
            'multiplier' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
            
            // Model shift params
            'shift_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'target_tier' => ['nullable', 'string', Rule::in(['economy', 'standard', 'premium', 'flagship'])],
            
            // Plan fallback params
            'plan_tiers' => ['nullable', 'array'],
            'plan_tiers.*' => ['string'],
            'fallback_tier' => ['nullable', 'string'],
            
            // Feature rollout params
            'feature_name' => ['nullable', 'string'],
            'rollout_multiplier' => ['nullable', 'numeric', 'min:1', 'max:100'],
            
            // Budget cap params
            'cap_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            
            // Custom params
            'volume_multiplier' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
            'cost_reduction_pct' => ['nullable', 'integer', 'min:0', 'max:100'],
            'revenue_multiplier' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
        ]);

        try {
            $result = $this->simulationService->simulate($organization, $validated);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Compare multiple scenarios.
     * 
     * POST /api/simulation/compare
     */
    public function compare(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found.',
            ], 400);
        }

        $validated = $request->validate([
            'scenarios' => ['required', 'array', 'min:1', 'max:5'],
            'scenarios.*.type' => ['required', 'string'],
            'scenarios.*.name' => ['nullable', 'string'],
            'scenarios.*.multiplier' => ['nullable', 'numeric'],
            'scenarios.*.shift_percentage' => ['nullable', 'integer'],
            'scenarios.*.target_tier' => ['nullable', 'string'],
            'scenarios.*.cap_percentage' => ['nullable', 'integer'],
        ]);

        try {
            $comparison = $this->simulationService->compareScenarios(
                $organization,
                $validated['scenarios']
            );

            return response()->json([
                'success' => true,
                'data' => $comparison,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * GET /api/simulation/preview
     *
     * Model-swap simulation: "What would I have paid if I used {to_model}
     * instead of {from_model} for the last {period}?"
     *
     * Query params:
     *   from_model  — source model id (e.g. "gpt-4o")
     *   to_model    — target model id (e.g. "gpt-4o-mini")
     *   workflow    — optional workflow filter
     *   period      — 7d | 14d | 30d | 60d | 90d  (default: 30d)
     *
     * Returns: requests_affected, current_cost, simulated_cost, savings,
     *          savings_pct, quality_delta
     */
    public function preview(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        if (! $organization) {
            return response()->json(['success' => false, 'message' => 'No organization'], 400);
        }

        $validated = $request->validate([
            'from_model' => ['required', 'string', 'max:120'],
            'to_model'   => ['required', 'string', 'max:120'],
            'workflow'   => ['nullable', 'string', 'max:120'],
            'period'     => ['nullable', 'string', 'in:7d,14d,30d,60d,90d'],
        ]);

        $days   = (int) str_replace('d', '', $validated['period'] ?? '30d');
        $cutoff = now()->subDays($days);

        $query = AIRequest::where('organization_id', $organization->id)
            ->where('created_at', '>=', $cutoff);

        if (! empty($validated['from_model'])) {
            $query->where('model', $validated['from_model']);
        }
        if (! empty($validated['workflow'])) {
            $query->where('workflow_name', $validated['workflow']);
        }

        $requests = $query->get(['model', 'provider', 'prompt_tokens', 'completion_tokens', 'estimated_cost']);

        $currentCost = (float) $requests->sum('estimated_cost');

        // Parse "provider:model" or plain "model" for the target
        $toModelFull = $validated['to_model'];
        [$toProvider, $toModelId] = str_contains($toModelFull, ':')
            ? explode(':', $toModelFull, 2)
            : ['openai', $toModelFull];

        $simulatedCost = $requests->sum(fn ($r) => $this->costEstimator->estimate(
            $toProvider,
            $toModelId,
            (int) ($r->prompt_tokens ?? 0),
            (int) ($r->completion_tokens ?? 0),
        ));

        $savings    = max(0.0, $currentCost - $simulatedCost);
        $savingsPct = $currentCost > 0 ? round(($savings / $currentCost) * 100, 1) : 0;

        return response()->json([
            'success'           => true,
            'period_days'       => $days,
            'requests_affected' => $requests->count(),
            'current_cost'      => round($currentCost, 4),
            'simulated_cost'    => round((float) $simulatedCost, 4),
            'savings'           => round($savings, 4),
            'savings_pct'       => $savingsPct,
            'quality_delta'     => $this->qualityDelta($validated['from_model'], $validated['to_model']),
            'from_model'        => $validated['from_model'],
            'to_model'          => $validated['to_model'],
        ]);
    }

    /**
     * Approximate quality delta (in %) when switching from → to model.
     * Positive = quality gain, negative = quality loss.
     * Tier ranking: haiku/mini=1, sonnet/gpt-4o-mini=2, gpt-4o=3, opus=4
     */
    private function qualityDelta(string $fromModel, string $toModel): int
    {
        $rank = static function (string $m): int {
            if (str_contains($m, 'opus'))    return 4;
            if (str_contains($m, 'gpt-4o') && ! str_contains($m, 'mini')) return 3;
            if (str_contains($m, 'sonnet'))  return 2;
            if (str_contains($m, 'gpt-4o-mini')) return 1;
            if (str_contains($m, 'haiku'))   return 1;
            return 2;
        };

        return ($rank($toModel) - $rank($fromModel)) * 5;
    }

    /**
     * Get available scenario templates.
     *
     * GET /api/simulation/templates
     */
    public function templates(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'type' => SimulationService::SCENARIO_VOLUME_SCALE,
                    'name' => 'Scaling de volume',
                    'description' => 'Simuler l\'impact d\'une augmentation du volume de requêtes.',
                    'icon' => '📈',
                    'params' => [
                        ['name' => 'multiplier', 'label' => 'Multiplicateur', 'type' => 'number', 'default' => 2, 'min' => 0.1, 'max' => 100],
                    ],
                    'examples' => ['Usage x2', 'Usage x3', 'Usage x10'],
                ],
                [
                    'type' => SimulationService::SCENARIO_MODEL_SHIFT,
                    'name' => 'Changement de modèle',
                    'description' => 'Rediriger une partie du trafic vers un modèle moins coûteux.',
                    'icon' => '🔄',
                    'params' => [
                        ['name' => 'shift_percentage', 'label' => '% à rediriger', 'type' => 'number', 'default' => 30, 'min' => 1, 'max' => 100],
                        ['name' => 'target_tier', 'label' => 'Tier cible', 'type' => 'select', 'options' => ['economy', 'standard', 'premium'], 'default' => 'economy'],
                    ],
                    'examples' => ['30% vers économique', '50% vers standard'],
                ],
                [
                    'type' => SimulationService::SCENARIO_PLAN_FALLBACK,
                    'name' => 'Fallback par plan',
                    'description' => 'Activer un fallback automatique pour certains plans.',
                    'icon' => '🛡️',
                    'params' => [
                        ['name' => 'plan_tiers', 'label' => 'Plans cibles', 'type' => 'multiselect', 'options' => ['low', 'basic', 'starter', 'mid', 'pro']],
                        ['name' => 'fallback_tier', 'label' => 'Tier fallback', 'type' => 'select', 'options' => ['economy', 'standard'], 'default' => 'economy'],
                    ],
                    'examples' => ['Fallback Basic/Starter', 'Fallback tous sauf Enterprise'],
                ],
                [
                    'type' => SimulationService::SCENARIO_FEATURE_ROLLOUT,
                    'name' => 'Rollout feature',
                    'description' => 'Impact de l\'ouverture d\'une feature à tous les clients.',
                    'icon' => '🚀',
                    'params' => [
                        ['name' => 'feature_name', 'label' => 'Feature', 'type' => 'text'],
                        ['name' => 'rollout_multiplier', 'label' => 'Multiplicateur usage', 'type' => 'number', 'default' => 3, 'min' => 1, 'max' => 100],
                    ],
                    'examples' => ['Ouvrir chatbot à tous', 'Lancement assistant IA'],
                ],
                [
                    'type' => SimulationService::SCENARIO_BUDGET_CAP,
                    'name' => 'Budget cap',
                    'description' => 'Plafonner les coûts IA à un % du revenu plan.',
                    'icon' => '🎯',
                    'params' => [
                        ['name' => 'cap_percentage', 'label' => '% max du revenu', 'type' => 'number', 'default' => 80, 'min' => 1, 'max' => 100],
                    ],
                    'examples' => ['Cap à 80%', 'Cap à 50%', 'Cap à 30%'],
                ],
                [
                    'type' => SimulationService::SCENARIO_CUSTOM,
                    'name' => 'Scénario personnalisé',
                    'description' => 'Combiner plusieurs paramètres.',
                    'icon' => '⚙️',
                    'params' => [
                        ['name' => 'volume_multiplier', 'label' => 'Multiplicateur volume', 'type' => 'number', 'default' => 1],
                        ['name' => 'cost_reduction_pct', 'label' => '% réduction coût', 'type' => 'number', 'default' => 0],
                        ['name' => 'revenue_multiplier', 'label' => 'Multiplicateur revenu', 'type' => 'number', 'default' => 1],
                    ],
                    'examples' => ['Volume x2 + 20% économies'],
                ],
            ],
        ]);
    }
}
