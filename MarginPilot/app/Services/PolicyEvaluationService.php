<?php
namespace App\Services;
use App\Services\BusinessConstants;

use App\Jobs\SendPolicyTriggerNotificationJob;
use App\Models\AIRequest;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\Policy;
use App\Models\PolicyTrigger;
use App\Support\MargeXaCatalog;
use Carbon\Carbon;

class PolicyEvaluationService
{
    /**
     * Enforcement actions returned by preflight evaluation.
     */
    // Actions centralisées dans BusinessConstants

    /**
     * Premium models that trigger restriction policies.
     * Update this list as providers release new flagship models.
     */
    // Modèles premium centralisés dans BusinessConstants

    /** Instance-level cache to avoid re-querying org + policies on every call. */
    private array $orgCache = [];

    /** @var array<int, \Illuminate\Database\Eloquent\Collection> */
    private array $policiesCache = [];

    public function __construct(private readonly CostEstimatorService $costEstimator)
    {
    }

    /**
     * Preflight evaluation: decides enforcement action BEFORE request is persisted.
     *
     * @return array{
     *     action: string,
     *     reason: ?string,
     *     fallback_provider: ?string,
     *     fallback_model: ?string,
     *     fallback_cost: ?float,
     *     triggered_policies: array,
     *     observed_policies: array
     * }
     */
    public function preflightEvaluate(PreflightContext $ctx): array
    {
        $organization = $ctx->organization ?? $this->getOrganization($ctx->organization_id);
        $policies = $this->getPolicies($ctx->organization_id);

        $triggeredPolicies = [];
        $observedPolicies = [];
        $shouldBlock = false;
        $fallbackModel = null;
        $fallbackProvider = null;
        $fallbackCost = null;
        $blockReason = null;

        foreach ($policies as $policy) {
            $result = $this->checkPolicyPreflight($policy, $ctx, $organization);

            if (! $result['triggered']) {
                continue;
            }

            $policyData = [
                'policy_id' => $policy->id,
                'policy_name' => $policy->name,
                'policy_type' => $policy->type,
                'reason' => $result['reason'],
                'target_label' => $result['target_label'] ?? null,
                'metadata' => $result['metadata'] ?? [],
                'is_observed' => $policy->isObserveMode(),
            ];

            // Si la policy est en mode observe, elle ne contribue pas à l'action réelle
            if ($policy->isObserveMode()) {
                // Calculer l'action "théorique" qui aurait été appliquée
                $theoreticalAction = 'allowed';
                $policyAction = $policy->actions['enforcement'] ?? 'log';
                
                if ($policyAction === 'block' || $policy->type === 'budget_cap') {
                    $theoreticalAction = 'would_block';
                } elseif ($policyAction === 'fallback' || $policy->type === 'fallback_model' || $policy->type === 'premium_model_restriction') {
                    $theoreticalAction = 'would_fallback';
                }
                
                $policyData['metadata']['theoretical_action'] = $theoreticalAction;
                $observedPolicies[] = $policyData;
                continue;
            }

            // Policy en mode enforce normal
            $triggeredPolicies[] = $policyData;

            // Determine enforcement action based on policy type and action config
            $policyAction = $policy->actions['enforcement'] ?? 'log'; // log, block, fallback

            if ($policyAction === 'block' || $policy->type === 'budget_cap') {
                $shouldBlock = true;
                $blockReason = $result['reason'];
            }

            if (($policyAction === 'fallback' || $policy->type === 'fallback_model' || $policy->type === 'premium_model_restriction')
                && ! $shouldBlock
            ) {
                $candidateFallback = $result['metadata']['fallback_model'] ?? null;
                if ($candidateFallback && ! $fallbackModel) {
                    $fallbackModel = $candidateFallback;
                    $fallbackProvider = $result['metadata']['fallback_provider']
                        ?? $this->resolveProviderForModel($candidateFallback, $ctx->provider);
                    $fallbackCost = $result['metadata']['estimated_cost_after'] ?? null;
                }
            }
        }

        if ($triggeredPolicies === [] && $observedPolicies === []) {
            return [
                'action' => BusinessConstants::POLICY_ACTION_ALLOWED,
                'reason' => null,
                'fallback_provider' => null,
                'fallback_model' => null,
                'fallback_cost' => null,
                'triggered_policies' => [],
                'observed_policies' => [],
            ];
        }

        if ($shouldBlock) {
            return [
                'action' => BusinessConstants::POLICY_ACTION_BLOCKED,
                'reason' => $blockReason,
                'fallback_provider' => null,
                'fallback_model' => null,
                'fallback_cost' => null,
                'triggered_policies' => $triggeredPolicies,
                'observed_policies' => $observedPolicies,
            ];
        }

        if ($fallbackModel) {
            return [
                'action' => BusinessConstants::POLICY_ACTION_FALLBACK,
                'reason' => $triggeredPolicies[0]['reason'] ?? 'Fallback applied',
                'fallback_provider' => $fallbackProvider,
                'fallback_model' => $fallbackModel,
                'fallback_cost' => $fallbackCost,
                'triggered_policies' => $triggeredPolicies,
                'observed_policies' => $observedPolicies,
            ];
        }

        // Policies triggered but no enforcement action configured → treat as allowed with warnings
        return [
            'action' => BusinessConstants::POLICY_ACTION_ALLOWED,
            'reason' => null,
            'fallback_provider' => null,
            'fallback_model' => null,
            'fallback_cost' => null,
            'triggered_policies' => $triggeredPolicies,
            'observed_policies' => $observedPolicies,
        ];
    }

    /**
     * Log triggers after AIRequest is created (or for blocked requests).
     * Handles both enforced and observed policies.
     *
     * @param string $attemptUuid Unique identifier for this ingestion attempt (for deduplication)
     * @param array $observedPolicies Policies in observe mode that would have triggered
     */
    public function logTriggers(
        array $triggeredPolicies,
        ?AIRequest $aiRequest,
        PreflightContext $ctx,
        string $action,
        string $attemptUuid,
        array $observedPolicies = []
    ): void {
        $organization = $ctx->organization ?? $this->getOrganization($ctx->organization_id);
        $firstTriggerId = null;

        // Log enforced policy triggers
        foreach ($triggeredPolicies as $policyData) {
            $trigger = $this->createPolicyTrigger($policyData, $aiRequest, $ctx, $action, $attemptUuid, false);
            
            if ($trigger && $firstTriggerId === null) {
                $firstTriggerId = $trigger->id;
            }
        }

        // Log observed policy triggers (mode observe)
        foreach ($observedPolicies as $policyData) {
            $observedAction = $policyData['metadata']['theoretical_action'] ?? 'observed';
            $this->createPolicyTrigger($policyData, $aiRequest, $ctx, $observedAction, $attemptUuid, true);
        }

        // Update AIRequest if it exists and enforced policies triggered
        if ($aiRequest && $triggeredPolicies !== []) {
            $reason = $triggeredPolicies[0]['reason'] ?? null;
            $aiRequest->update([
                'policy_triggered' => true,
                'policy_trigger_reason' => implode(' | ', array_column($triggeredPolicies, 'reason')),
                'enforcement_action' => $action,
                'enforcement_reason' => $reason,
            ]);
        }

        // Dispatch notification job (only for enforced actions, not observed)
        if ($firstTriggerId !== null && in_array($action, [BusinessConstants::POLICY_ACTION_BLOCKED, BusinessConstants::POLICY_ACTION_FALLBACK], true)) {
            SendPolicyTriggerNotificationJob::dispatch(
                $ctx->organization_id,
                $firstTriggerId,
                $action
            );
        }

        // Dispatch notification for observed policies if configured
        if (! empty($observedPolicies)) {
            $this->notifyObservedPolicies($ctx->organization_id, $observedPolicies, $attemptUuid);
        }
    }

    /**
     * Create a single policy trigger record.
     */
    private function createPolicyTrigger(
        array $policyData,
        ?AIRequest $aiRequest,
        PreflightContext $ctx,
        string $action,
        string $attemptUuid,
        bool $isObserved
    ): ?PolicyTrigger {
        $policy = Policy::query()->find($policyData['policy_id']);
        if (! $policy) {
            return null;
        }

        $metadata = $policyData['metadata'] ?? [];
        $metadata['enforcement_action'] = $action;
        $metadata['attempt_uuid'] = $attemptUuid;
        $metadata['is_observed'] = $isObserved;

        $trigger = PolicyTrigger::query()->create([
            'organization_id' => $ctx->organization_id,
            'policy_id' => $policy->id,
            'ai_request_id' => $aiRequest?->id,
            'attempt_uuid' => $attemptUuid,
            'customer_id' => $ctx->customer_id,
            'plan_id' => $ctx->plan_id,
            'feature_id' => $ctx->feature_id,
            'target_label' => $policyData['target_label'] ?? null,
            'reason' => $policyData['reason'],
            'impacted_cost' => $metadata['estimated_cost_before'] ?? $ctx->estimated_cost,
            'estimated_cost_avoided' => $isObserved ? 0 : ($metadata['estimated_cost_avoided'] ?? 0),
            'triggered_at' => now(),
            'is_observed' => $isObserved,
            'metadata' => $metadata,
        ]);

        $auditAction = match (true) {
            $isObserved => 'policy.observed',
            $action === BusinessConstants::POLICY_ACTION_BLOCKED => 'policy.blocked',
            default => 'policy.triggered',
        };

        AuditLog::query()->create([
            'organization_id' => $ctx->organization_id,
            'user_id' => null,
            'action' => $auditAction,
            'entity_type' => 'policy_trigger',
            'entity_id' => $trigger->id,
            'payload' => [
                'policy_id' => $policy->id,
                'policy_name' => $policy->name,
                'ai_request_id' => $aiRequest?->id,
                'attempt_uuid' => $attemptUuid,
                'enforcement_action' => $action,
                'reason' => $policyData['reason'],
                'target_label' => $policyData['target_label'] ?? null,
                'is_observed' => $isObserved,
            ],
            'created_at' => now(),
        ]);

        return $trigger;
    }

    /**
     * Dispatch notifications for observed policies if organization opted-in.
     */
    private function notifyObservedPolicies(int $organizationId, array $observedPolicies, string $attemptUuid): void
    {
        // Les notifications pour les policies observées sont optionnelles
        // et gérées via le setting notify_on_observed
        $firstObservedPolicy = $observedPolicies[0] ?? null;
        if (! $firstObservedPolicy) {
            return;
        }

        $trigger = PolicyTrigger::query()
            ->where('attempt_uuid', $attemptUuid)
            ->where('is_observed', true)
            ->first();

        if ($trigger) {
            SendPolicyTriggerNotificationJob::dispatch(
                $organizationId,
                $trigger->id,
                'observed'
            );
        }
    }

    private function checkPolicyPreflight(Policy $policy, PreflightContext $ctx, Organization $organization): array
    {
        $threshold = (float) ($policy->conditions['threshold'] ?? 0);

        return match ($policy->type) {
            'budget_cap' => $this->checkBudgetCapPreflight($policy, $ctx, $organization, $threshold),
            'alert_threshold' => $this->checkAlertThresholdPreflight($policy, $ctx, $threshold),
            'fallback_model' => $this->checkFallbackModelPreflight($policy, $ctx, $threshold),
            'premium_model_restriction' => $this->checkPremiumRestrictionPreflight($policy, $ctx),
            default => ['triggered' => false],
        };
    }

    private function checkBudgetCapPreflight(Policy $policy, PreflightContext $ctx, Organization $organization, float $threshold): array
    {
        $cap = $threshold > 0 ? $threshold : (float) ($organization->monthly_budget_cap ?? 0);

        if ($cap <= 0) {
            return ['triggered' => false];
        }

        $monthStart = Carbon::parse($ctx->created_at ?? now())->startOfMonth();
        $query = AIRequest::query()
            ->where('organization_id', $ctx->organization_id)
            ->where('created_at', '>=', $monthStart);

        $targetLabel = 'Organization';

        if ($policy->scope === 'customer' && $ctx->customer_id) {
            $query->where('customer_id', $ctx->customer_id);
            $targetLabel = $ctx->customer?->name ?? 'Customer';
        }

        if ($policy->scope === 'feature' && $ctx->feature_id) {
            $query->where('feature_id', $ctx->feature_id);
            $targetLabel = $ctx->feature?->name ?? 'Feature';
        }

        if ($policy->scope === 'plan' && $ctx->plan_id) {
            $query->where('plan_id', $ctx->plan_id);
            $targetLabel = $ctx->plan?->name ?? 'Plan';
        }

        $monthSpend = (float) $query->sum('estimated_cost');

        // Check if adding this request would exceed the cap
        if (($monthSpend + $ctx->estimated_cost) <= $cap) {
            return ['triggered' => false];
        }

        return [
            'triggered' => true,
            'reason' => 'Monthly budget cap would be exceeded',
            'target_label' => $targetLabel,
            'metadata' => [
                'cap' => $cap,
                'month_spend' => round($monthSpend, 6),
                'request_cost' => round($ctx->estimated_cost, 6),
                'estimated_cost_before' => round($ctx->estimated_cost, 6),
                'estimated_cost_after' => 0,
                'estimated_cost_avoided' => round($ctx->estimated_cost, 6),
            ],
        ];
    }

    private function checkAlertThresholdPreflight(Policy $policy, PreflightContext $ctx, float $threshold): array
    {
        if ($threshold <= 0) {
            return ['triggered' => false];
        }

        $monthStart = Carbon::parse($ctx->created_at ?? now())->startOfMonth();
        $query = AIRequest::query()
            ->where('organization_id', $ctx->organization_id)
            ->where('created_at', '>=', $monthStart);

        $targetLabel = 'Organization';

        if ($policy->scope === 'customer' && $ctx->customer_id) {
            $query->where('customer_id', $ctx->customer_id);
            $targetLabel = $ctx->customer?->name ?? 'Customer';
        }

        if ($policy->scope === 'feature' && $ctx->feature_id) {
            $query->where('feature_id', $ctx->feature_id);
            $targetLabel = $ctx->feature?->name ?? 'Feature';
        }

        if ($policy->scope === 'plan' && $ctx->plan_id) {
            $query->where('plan_id', $ctx->plan_id);
            $targetLabel = $ctx->plan?->name ?? 'Plan';
        }

        $spend = (float) $query->sum('estimated_cost');

        if (($spend + $ctx->estimated_cost) <= $threshold) {
            return ['triggered' => false];
        }

        $impact = $this->buildImpactPreflight($ctx, null);

        return [
            'triggered' => true,
            'reason' => 'Alert threshold exceeded',
            'target_label' => $targetLabel,
            'metadata' => [
                'threshold' => $threshold,
                'spend' => round($spend, 6),
                ...$impact,
            ],
        ];
    }

    private function checkFallbackModelPreflight(Policy $policy, PreflightContext $ctx, float $threshold): array
    {
        if ($threshold <= 0) {
            return ['triggered' => false];
        }

        if ($ctx->estimated_cost <= $threshold) {
            return ['triggered' => false];
        }

        $fallbackModel = $policy->actions['fallback_model']
            ?? $ctx->plan?->fallback_model
            ?? null;

        if (! $fallbackModel) {
            return ['triggered' => false];
        }

        $impact = $this->buildImpactPreflight($ctx, $fallbackModel);

        return [
            'triggered' => true,
            'reason' => 'Fallback model suggested',
            'target_label' => $ctx->plan?->name ?? 'Plan',
            'metadata' => $impact,
        ];
    }

    private function checkPremiumRestrictionPreflight(Policy $policy, PreflightContext $ctx): array
    {
        if (! in_array(strtolower($ctx->model), array_map('strtolower', MargeXaCatalog::premiumModelIds()), true)) {
            return ['triggered' => false];
        }

        if (! $ctx->plan) {
            return ['triggered' => false];
        }

        if ($ctx->plan->allow_premium_models) {
            return ['triggered' => false];
        }

        $fallbackModel = $policy->actions['fallback_model']
            ?? $ctx->plan->fallback_model
            ?? $this->defaultFallbackForProvider($ctx->provider);

        $impact = $this->buildImpactPreflight($ctx, $fallbackModel);

        return [
            'triggered' => true,
            'reason' => 'Premium model used on restricted plan',
            'target_label' => $ctx->plan->name ?? 'Plan',
            'metadata' => [
                'plan' => $ctx->plan->name,
                'scope' => $policy->scope,
                ...$impact,
            ],
        ];
    }

    private function buildImpactPreflight(PreflightContext $ctx, ?string $fallbackModel): array
    {
        $before = round($ctx->estimated_cost, 6);
        $after = $before;
        $fallbackProvider = null;

        if ($fallbackModel) {
            $fallbackProvider = $this->resolveProviderForModel($fallbackModel, $ctx->provider);
            $after = round($this->costEstimator->estimate(
                $fallbackProvider,
                $fallbackModel,
                $ctx->prompt_tokens,
                $ctx->completion_tokens
            ), 6);
        }

        $avoided = round(max($before - $after, 0), 6);

        return [
            'current_provider' => $ctx->provider,
            'current_model' => $ctx->model,
            'fallback_provider' => $fallbackProvider,
            'fallback_model' => $fallbackModel,
            'estimated_cost_before' => $before,
            'estimated_cost_after' => $after,
            'estimated_cost_avoided' => $avoided,
        ];
    }

    private function getOrganization(int $orgId): Organization
    {
        if (! isset($this->orgCache[$orgId])) {
            $this->orgCache[$orgId] = Organization::query()->findOrFail($orgId);
        }

        return $this->orgCache[$orgId];
    }

    private function getPolicies(int $orgId): \Illuminate\Database\Eloquent\Collection
    {
        if (! isset($this->policiesCache[$orgId])) {
            $this->policiesCache[$orgId] = Policy::query()
                ->where('organization_id', $orgId)
                ->where('is_active', true)
                ->get();
        }

        return $this->policiesCache[$orgId];
    }

    /**
     * @deprecated Use preflightEvaluate + logTriggers instead for runtime enforcement.
     */
    public function evaluate(AIRequest $request): array
    {
        $orgId = $request->organization_id;

        if (! isset($this->orgCache[$orgId])) {
            $this->orgCache[$orgId] = Organization::query()->findOrFail($orgId);
        }

        if (! isset($this->policiesCache[$orgId])) {
            $this->policiesCache[$orgId] = Policy::query()
                ->where('organization_id', $orgId)
                ->where('is_active', true)
                ->get();
        }

        $organization = $this->orgCache[$orgId];
        $policies = $this->policiesCache[$orgId];

        $triggerReasons = [];

        foreach ($policies as $policy) {
            $result = $this->checkPolicy($policy, $request, $organization);

            if (! $result['triggered']) {
                continue;
            }

            $triggerReasons[] = $result['reason'];

            $trigger = PolicyTrigger::query()->create([
                'organization_id' => $organization->id,
                'policy_id' => $policy->id,
                'ai_request_id' => $request->id,
                'customer_id' => $request->customer_id,
                'plan_id' => $request->plan_id,
                'feature_id' => $request->feature_id,
                'target_label' => $result['target_label'],
                'reason' => $result['reason'],
                'impacted_cost' => $result['estimated_cost_before'],
                'estimated_cost_avoided' => $result['estimated_cost_avoided'],
                'triggered_at' => now(),
                'metadata' => $result['metadata'],
            ]);

            AuditLog::query()->create([
                'organization_id' => $organization->id,
                'user_id' => null,
                'action' => 'policy.triggered',
                'entity_type' => 'policy_trigger',
                'entity_id' => $trigger->id,
                'payload' => [
                    'policy_id' => $policy->id,
                    'policy_name' => $policy->name,
                    'ai_request_id' => $request->id,
                    'reason' => $result['reason'],
                    'target_label' => $result['target_label'] ?? null,
                    'estimated_cost_before' => $result['estimated_cost_before'] ?? null,
                    'estimated_cost_after' => $result['estimated_cost_after'] ?? null,
                    'estimated_cost_avoided' => $result['estimated_cost_avoided'] ?? null,
                ],
                'created_at' => now(),
            ]);
        }

        if ($triggerReasons !== []) {
            $request->update([
                'policy_triggered' => true,
                'policy_trigger_reason' => implode(' | ', $triggerReasons),
            ]);
        }

        return $triggerReasons;
    }

    private function checkPolicy(Policy $policy, AIRequest $request, Organization $organization): array
    {
        $threshold = (float) ($policy->conditions['threshold'] ?? 0);

        return match ($policy->type) {
            'budget_cap' => $this->checkBudgetCap($policy, $request, $organization, $threshold),
            'alert_threshold' => $this->checkAlertThreshold($policy, $request, $threshold),
            'fallback_model' => $this->checkFallbackModel($policy, $request, $threshold),
            'premium_model_restriction' => $this->checkPremiumRestriction($policy, $request),
            default => ['triggered' => false],
        };
    }

    private function checkBudgetCap(Policy $policy, AIRequest $request, Organization $organization, float $threshold): array
    {
        $cap = $threshold > 0 ? $threshold : (float) ($organization->monthly_budget_cap ?? 0);

        if ($cap <= 0) {
            return ['triggered' => false];
        }

        $monthStart = Carbon::parse($request->created_at)->startOfMonth();
        $query = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->whereBetween('created_at', [$monthStart, Carbon::parse($request->created_at)]);

        $targetLabel = 'Organization';

        if ($policy->scope === 'customer' && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
            $targetLabel = $request->customer?->name ?? 'Customer';
        }

        if ($policy->scope === 'feature' && $request->feature_id) {
            $query->where('feature_id', $request->feature_id);
            $targetLabel = $request->feature?->name ?? 'Feature';
        }

        if ($policy->scope === 'plan' && $request->plan_id) {
            $query->where('plan_id', $request->plan_id);
            $targetLabel = $request->plan?->name ?? 'Plan';
        }

        $monthSpend = (float) $query->sum('estimated_cost');

        if ($monthSpend <= $cap) {
            return ['triggered' => false];
        }

        $impact = $this->buildImpact($request);

        return [
            'triggered' => true,
            'reason' => 'Monthly budget cap exceeded',
            'target_label' => $targetLabel,
            'estimated_cost_before' => $impact['estimated_cost_before'],
            'estimated_cost_after' => $impact['estimated_cost_after'],
            'estimated_cost_avoided' => $impact['estimated_cost_avoided'],
            'metadata' => [
                'cap' => $cap,
                'month_spend' => round((float) $monthSpend, 6),
                ...$impact,
            ],
        ];
    }

    private function checkAlertThreshold(Policy $policy, AIRequest $request, float $threshold): array
    {
        if ($threshold <= 0) {
            return ['triggered' => false];
        }

        $query = AIRequest::query()->where('organization_id', $request->organization_id);
        $monthStart = Carbon::parse($request->created_at)->startOfMonth();
        $query->where('created_at', '>=', $monthStart);
        $targetLabel = 'Organization';

        if ($policy->scope === 'customer' && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
            $targetLabel = $request->customer?->name ?? 'Customer';
        }

        if ($policy->scope === 'feature' && $request->feature_id) {
            $query->where('feature_id', $request->feature_id);
            $targetLabel = $request->feature?->name ?? 'Feature';
        }

        if ($policy->scope === 'plan' && $request->plan_id) {
            $query->where('plan_id', $request->plan_id);
            $targetLabel = $request->plan?->name ?? 'Plan';
        }

        $spend = (float) $query->sum('estimated_cost');

        if ($spend <= $threshold) {
            return ['triggered' => false];
        }

        $impact = $this->buildImpact($request);

        return [
            'triggered' => true,
            'reason' => 'Alert threshold exceeded',
            'target_label' => $targetLabel,
            'estimated_cost_before' => $impact['estimated_cost_before'],
            'estimated_cost_after' => $impact['estimated_cost_after'],
            'estimated_cost_avoided' => $impact['estimated_cost_avoided'],
            'metadata' => [
                'threshold' => $threshold,
                'spend' => round($spend, 6),
                ...$impact,
            ],
        ];
    }

    private function checkFallbackModel(Policy $policy, AIRequest $request, float $threshold): array
    {
        // threshold = 0 means "no threshold defined" → skip cost check entirely
        if ($threshold <= 0) {
            return ['triggered' => false];
        }

        if ((float) $request->estimated_cost <= $threshold) {
            return ['triggered' => false];
        }

        $fallbackModel = $policy->actions['fallback_model']
            ?? $request->plan?->fallback_model
            ?? null;

        if (! $fallbackModel) {
            return ['triggered' => false];
        }

        $impact = $this->buildImpact($request, $fallbackModel);

        return [
            'triggered' => true,
            'reason' => 'Fallback model suggested',
            'target_label' => $request->plan?->name ?? 'Plan',
            'estimated_cost_before' => $impact['estimated_cost_before'],
            'estimated_cost_after' => $impact['estimated_cost_after'],
            'estimated_cost_avoided' => $impact['estimated_cost_avoided'],
            'metadata' => [
                ...$impact,
            ],
        ];
    }

    private function checkPremiumRestriction(Policy $policy, AIRequest $request): array
    {
        if (! in_array(strtolower($request->model), array_map('strtolower', MargeXaCatalog::premiumModelIds()), true)) {
            return ['triggered' => false];
        }

        // No plan resolved = cannot determine restriction, skip
        if (! $request->plan) {
            return ['triggered' => false];
        }

        if ($request->plan->allow_premium_models) {
            return ['triggered' => false];
        }

        $fallbackModel = $policy->actions['fallback_model']
            ?? $request->plan->fallback_model
            ?? $this->defaultFallbackForProvider($request->provider);

        $impact = $this->buildImpact($request, $fallbackModel);

        return [
            'triggered' => true,
            'reason' => 'Premium model used on restricted plan',
            'target_label' => $request->plan?->name ?? 'Plan',
            'estimated_cost_before' => $impact['estimated_cost_before'],
            'estimated_cost_after' => $impact['estimated_cost_after'],
            'estimated_cost_avoided' => $impact['estimated_cost_avoided'],
            'metadata' => [
                'plan' => $request->plan?->name,
                'scope' => $policy->scope,
                ...$impact,
            ],
        ];
    }

    private function buildImpact(AIRequest $request, ?string $fallbackModel = null): array
    {
        $before = round((float) $request->estimated_cost, 6);
        $after = $before;
        $fallbackProvider = null;

        if ($fallbackModel) {
            $fallbackProvider = $this->resolveProviderForModel($fallbackModel, $request->provider);
            $after = round($this->costEstimator->estimate(
                $fallbackProvider,
                $fallbackModel,
                (int) $request->prompt_tokens,
                (int) $request->completion_tokens
            ), 6);
        }

        $avoided = round(max($before - $after, 0), 6);

        return [
            'current_provider' => $request->provider,
            'current_model' => $request->model,
            'fallback_provider' => $fallbackProvider,
            'fallback_model' => $fallbackModel,
            'estimated_cost_before' => $before,
            'estimated_cost_after' => $after,
            'estimated_cost_avoided' => $avoided,
        ];
    }

    private function resolveProviderForModel(string $model, string $defaultProvider): string
    {
        $normalized = strtolower($model);

        if (str_starts_with($normalized, 'claude')) {
            return 'anthropic';
        }

        if (str_starts_with($normalized, 'gpt')) {
            return 'openai';
        }

        return $defaultProvider;
    }

    private function defaultFallbackForProvider(string $provider): string
    {
        return strtolower($provider) === 'anthropic'
            ? 'claude-3-5-haiku'
            : 'gpt-4o-mini';
    }
}
