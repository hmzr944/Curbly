<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IngestAIRequest;
use App\Models\AIRequest;
use App\Services\AttributionService;
use App\Services\BusinessConstants;
use App\Services\CostEstimatorService;
use App\Services\PolicyEvaluationService;
use App\Services\PreflightContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AIRequestIngestionController extends Controller
{
    public function store(
        IngestAIRequest $request,
        CostEstimatorService $estimator,
        PolicyEvaluationService $policyService,
        AttributionService $attributionService
    ): JsonResponse {
        $data = $request->validated();

        abort_unless((int) $request->user()->organization_id === (int) $data['organization_id'], 403);

        // Generate unique attempt ID for deduplication of blocked attempts
        $attemptUuid = Str::uuid()->toString();

        // ROBUST ATTRIBUTION: Use AttributionService for strict entity resolution
        $attribution = $attributionService->resolve($data, (int) $data['organization_id']);

        $originalModel = $data['model'];
        $originalProvider = $data['provider'];
        $estimatedCost = isset($data['estimated_cost'])
            ? round((float) $data['estimated_cost'], 6)
            : $estimator->estimate($data['provider'], $data['model'], (int) $data['prompt_tokens'], (int) $data['completion_tokens']);

        // Build preflight context for policy evaluation BEFORE creating AIRequest
        $ctx = new PreflightContext(
            organization_id: (int) $data['organization_id'],
            provider: $originalProvider,
            model: $originalModel,
            prompt_tokens: (int) $data['prompt_tokens'],
            completion_tokens: (int) $data['completion_tokens'],
            estimated_cost: $estimatedCost,
            feature_id: $attribution->feature?->id,
            customer_id: $attribution->customer?->id,
            plan_id: $attribution->plan?->id,
            workflow_name: $attribution->workflow,
            created_at: $data['created_at'] ?? null,
            feature: $attribution->feature,
            customer: $attribution->customer,
            plan: $attribution->plan,
        );

        // Preflight evaluation: decide enforcement action BEFORE persisting
        $enforcement = $policyService->preflightEvaluate($ctx);
        $observedPolicies = $enforcement['observed_policies'] ?? [];

        // BLOCKED: do not create AIRequest, log trigger, return 403
        if ($enforcement['action'] === BusinessConstants::POLICY_ACTION_BLOCKED) {
            $policyService->logTriggers(
                $enforcement['triggered_policies'], 
                null, 
                $ctx, 
                $enforcement['action'], 
                $attemptUuid, 
                $observedPolicies
            );

            return response()->json([
                'ok' => false,
                'error' => 'blocked_by_policy',
                'attempt_uuid' => $attemptUuid,
                'enforcement' => [
                    'action' => 'blocked',
                    'reason' => $enforcement['reason'],
                    'requested_provider' => $originalProvider,
                    'requested_model' => $originalModel,
                    'effective_provider' => null,
                    'effective_model' => null,
                    'requested_cost' => $estimatedCost,
                    'effective_cost' => null,
                    'cost_avoided' => $estimatedCost,
                    'triggered_policies' => array_map(
                        fn ($p) => ['name' => $p['policy_name'], 'type' => $p['policy_type'], 'reason' => $p['reason']],
                        $enforcement['triggered_policies']
                    ),
                    'observed_policies' => array_map(
                        fn ($p) => ['name' => $p['policy_name'], 'type' => $p['policy_type'], 'would_action' => $p['metadata']['theoretical_action'] ?? 'observed'],
                        $observedPolicies
                    ),
                ],
            ], 403);
        }

        // FALLBACK: swap model/provider, recalculate cost
        $finalProvider = $originalProvider;
        $finalModel = $originalModel;
        $finalCost = $estimatedCost;
        $fallbackApplied = false;

        if ($enforcement['action'] === BusinessConstants::POLICY_ACTION_FALLBACK) {
            $finalProvider = $enforcement['fallback_provider'] ?? $originalProvider;
            $finalModel = $enforcement['fallback_model'] ?? $originalModel;
            $finalCost = $enforcement['fallback_cost']
                ?? $estimator->estimate($finalProvider, $finalModel, (int) $data['prompt_tokens'], (int) $data['completion_tokens']);
            $fallbackApplied = true;
        }

        // Create AIRequest with potentially swapped model
        // requested_* always stores original intent; provider/model store effective values
        // enforcement_action is ALWAYS persisted for analytics traceability
        // ATTRIBUTION TRACKING: Store attribution status and score for KPI monitoring
        $aiRequest = AIRequest::query()->create([
            'organization_id' => $data['organization_id'],
            'provider' => $finalProvider,
            'requested_provider' => $originalProvider,
            'model' => $finalModel,
            'requested_model' => $originalModel,
            'feature_id' => $attribution->feature?->id,
            'customer_id' => $attribution->customer?->id,
            'plan_id' => $attribution->plan?->id,
            'workflow_name' => $attribution->workflow,
            'prompt_tokens' => $data['prompt_tokens'],
            'completion_tokens' => $data['completion_tokens'],
            'estimated_cost' => $finalCost,
            'enforcement_action' => $enforcement['action'],
            'enforcement_reason' => $enforcement['reason'],
            'attribution_status' => $attribution->status,
            'attribution_score' => $attribution->score,
            'attribution_issues' => $attribution->issues ?: null,
            'created_at' => $data['created_at'] ?? now(),
        ]);

        // Log any triggered policies (enforced + observed)
        if ($enforcement['triggered_policies'] !== [] || $observedPolicies !== []) {
            $policyService->logTriggers(
                $enforcement['triggered_policies'], 
                $aiRequest, 
                $ctx, 
                $enforcement['action'], 
                $attemptUuid,
                $observedPolicies
            );
        }

        return response()->json([
            'ok' => true,
            'id' => $aiRequest->id,
            'attempt_uuid' => $attemptUuid,
            'enforcement' => [
                'action' => $enforcement['action'],
                'reason' => $enforcement['reason'],
                'requested_provider' => $originalProvider,
                'requested_model' => $originalModel,
                'effective_provider' => $finalProvider,
                'effective_model' => $finalModel,
                'requested_cost' => $estimatedCost,
                'effective_cost' => $finalCost,
                'cost_avoided' => $fallbackApplied ? round($estimatedCost - $finalCost, 6) : 0,
                'triggered_policies' => array_map(
                    fn ($p) => ['name' => $p['policy_name'], 'type' => $p['policy_type'], 'reason' => $p['reason']],
                    $enforcement['triggered_policies']
                ),
                'observed_policies' => array_map(
                    fn ($p) => ['name' => $p['policy_name'], 'type' => $p['policy_type'], 'would_action' => $p['metadata']['theoretical_action'] ?? 'observed'],
                    $observedPolicies
                ),
            ],
            // ATTRIBUTION KPI: Expose attribution quality in every response
            'attribution' => $attribution->toArray(),
        ], 201);
    }
}
