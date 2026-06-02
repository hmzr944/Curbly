<?php

namespace App\Services\Routing;

use App\Models\AIRequest;
use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\RoutingRule;
use App\Services\CostEstimatorService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Economic Router Service - The Business Control Plane.
 * 
 * This service makes explainable routing decisions based on:
 * - Plan entitlements (what tier is this plan allowed?)
 * - Feature routing rules (does this feature require premium?)
 * - Workflow escalation (is this an escalated/high-value workflow?)
 * - Budget constraints (is there remaining budget?)
 * - Custom routing rules (organization-specific rules)
 * 
 * Every decision is fully explainable with a reason chain.
 */
class EconomicRouterService
{
    /**
     * Default fallback models per tier (V1 scope).
     */
    private const TIER_FALLBACKS = [
        'economy' => 'gpt-4o-mini',      // V1: économique
        'standard' => 'gpt-4o-mini',      // V1: économique  
        'premium' => 'gpt-4o',            // V1: premium
        'flagship' => 'gpt-4o',           // V1: premium (pas de flagship distinct en V1)
    ];

    /**
     * Local cache for resolved entities.
     */
    private array $entityCache = [];

    public function __construct(
        private readonly CostEstimatorService $costEstimator
    ) {
    }

    /**
     * Main routing decision method.
     * 
     * Returns a fully explainable routing decision.
     */
    public function route(RoutingContext $ctx): RoutingDecision
    {
        $reasonChain = [];
        $decisionContext = [];

        // ─────────────────────────────────────────────────────────
        // Step 1: Resolve entities if not already provided
        // ─────────────────────────────────────────────────────────
        $ctx = $this->resolveEntities($ctx);
        $organization = $ctx->organization;
        $plan = $ctx->plan;
        $feature = $ctx->feature;
        $customer = $ctx->customer;

        $requestedTier = $ctx->getRequestedTier();
        $reasonChain[] = "Requested model: {$ctx->requestedModel} (tier: {$requestedTier->label()})";

        $decisionContext['organization'] = $organization?->name ?? 'Unknown';
        $decisionContext['plan'] = $plan?->name ?? 'Default';
        $decisionContext['feature'] = $feature?->name ?? $feature?->code ?? 'Unspecified';
        $decisionContext['customer'] = $customer?->name ?? 'Unknown';
        $decisionContext['segment'] = $ctx->getSegment() ?? 'default';

        // ─────────────────────────────────────────────────────────
        // Step 2: Determine base allowed tier from plan
        // ─────────────────────────────────────────────────────────
        $planAllowedTier = $this->getPlanAllowedTier($plan);
        $reasonChain[] = "Plan '{$decisionContext['plan']}' allows up to: {$planAllowedTier->label()} tier";
        $decisionContext['plan_allowed_tier'] = $planAllowedTier->value;

        // ─────────────────────────────────────────────────────────
        // Step 3: Check for feature-specific routing rules
        // ─────────────────────────────────────────────────────────
        $featureOverride = $this->getFeatureRoutingOverride($feature, $ctx->organizationId);
        if ($featureOverride) {
            $reasonChain[] = "Feature '{$decisionContext['feature']}' has routing rule: {$featureOverride['description']}";
            $decisionContext['feature_rule'] = $featureOverride;
        }

        // ─────────────────────────────────────────────────────────
        // Step 4: Check for escalation conditions
        // ─────────────────────────────────────────────────────────
        $escalation = $this->checkEscalation($ctx, $planAllowedTier);
        if ($escalation['granted']) {
            $reasonChain[] = "Escalation granted: {$escalation['reason']}";
            $decisionContext['escalation'] = $escalation;

            return RoutingDecision::escalated(
                model: $ctx->requestedModel,
                requestedTier: $requestedTier,
                normalAllowedTier: $planAllowedTier,
                escalationReason: $escalation['reason'],
                reasonChain: $reasonChain,
                context: $decisionContext,
            );
        }

        // ─────────────────────────────────────────────────────────
        // Step 5: Check custom routing rules
        // ─────────────────────────────────────────────────────────
        $customRule = $this->evaluateCustomRules($ctx, $planAllowedTier);
        if ($customRule) {
            $reasonChain[] = "Custom rule applied: {$customRule['name']}";
            $decisionContext['custom_rule'] = $customRule['name'];
            
            // Custom rule might upgrade or downgrade the allowed tier
            $planAllowedTier = ModelTier::fromString($customRule['target_tier'], $planAllowedTier);
        }

        // ─────────────────────────────────────────────────────────
        // Step 6: Apply feature override if it increases allowed tier
        // ─────────────────────────────────────────────────────────
        $effectiveAllowedTier = $planAllowedTier;
        if ($featureOverride && isset($featureOverride['min_tier'])) {
            $featureMinTier = ModelTier::fromString($featureOverride['min_tier']);
            if ($featureMinTier->exceeds($effectiveAllowedTier)) {
                $effectiveAllowedTier = $featureMinTier;
                $reasonChain[] = "Feature requires minimum tier: {$effectiveAllowedTier->label()}";
            }
        }

        // ─────────────────────────────────────────────────────────
        // Step 7: Check budget constraints
        // ─────────────────────────────────────────────────────────
        $budgetCheck = $this->checkBudgetConstraints($ctx, $organization, $plan);
        if ($budgetCheck['exceeded']) {
            $reasonChain[] = "Budget constraint: {$budgetCheck['reason']}";
            $decisionContext['budget'] = $budgetCheck;

            // If budget exceeded, either block or force economy tier
            if ($budgetCheck['action'] === 'block') {
                return RoutingDecision::blocked(
                    requestedModel: $ctx->requestedModel,
                    requestedTier: $requestedTier,
                    allowedTier: ModelTier::ECONOMY,
                    reasonChain: array_merge($reasonChain, ['Request blocked due to budget cap']),
                    context: $decisionContext,
                );
            }

            // Force economy tier
            $effectiveAllowedTier = ModelTier::ECONOMY;
            $reasonChain[] = 'Forced to economy tier due to budget pressure';
        }

        // ─────────────────────────────────────────────────────────
        // Step 8: Make final routing decision
        // ─────────────────────────────────────────────────────────
        if ($requestedTier->isAtOrBelow($effectiveAllowedTier)) {
            // Request is within allowed tier - allow as-is
            $reasonChain[] = "Model approved: {$requestedTier->label()} ≤ {$effectiveAllowedTier->label()} (allowed)";

            return RoutingDecision::allowed(
                model: $ctx->requestedModel,
                tier: $requestedTier,
                reasonChain: $reasonChain,
                context: $decisionContext,
            );
        }

        // Request exceeds allowed tier - downgrade
        $fallbackModel = $this->selectFallbackModel($effectiveAllowedTier, $plan, $ctx);
        $estimatedSavings = $this->calculateSavings($ctx->requestedModel, $fallbackModel, $ctx);

        $reasonChain[] = "Model downgraded: {$requestedTier->label()} > {$effectiveAllowedTier->label()} (not allowed)";
        $reasonChain[] = "Routed to: {$fallbackModel} (estimated savings: \$" . round($estimatedSavings, 4) . ')';

        return RoutingDecision::downgraded(
            requestedModel: $ctx->requestedModel,
            routedModel: $fallbackModel,
            requestedTier: $requestedTier,
            allowedTier: $effectiveAllowedTier,
            reasonChain: $reasonChain,
            context: $decisionContext,
            estimatedSavings: $estimatedSavings,
        );
    }

    /**
     * Explain a routing decision without executing (dry run).
     */
    public function explain(RoutingContext $ctx): array
    {
        $decision = $this->route($ctx);
        
        return [
            'decision' => $decision->toArray(),
            'explanation' => $decision->getExplanation(),
            'would_be_allowed' => $decision->isAllowed(),
            'model_changes' => $decision->wasRerouted(),
        ];
    }

    /**
     * Get what tier a plan is allowed.
     */
    private function getPlanAllowedTier(?Plan $plan): ModelTier
    {
        if (! $plan) {
            // No plan = default to economy
            return ModelTier::ECONOMY;
        }

        // Check explicit tier setting
        if (isset($plan->max_model_tier)) {
            return ModelTier::fromString($plan->max_model_tier, ModelTier::STANDARD);
        }

        // Legacy: use allow_premium_models boolean
        if ($plan->allow_premium_models) {
            return ModelTier::PREMIUM;
        }

        // Derive from plan tier name
        return match ($plan->tier) {
            'free' => ModelTier::ECONOMY,
            'starter', 'basic' => ModelTier::STANDARD,
            'pro', 'professional' => ModelTier::PREMIUM,
            'enterprise', 'unlimited' => ModelTier::FLAGSHIP,
            default => ModelTier::STANDARD,
        };
    }

    /**
     * Check if feature has routing override.
     */
    private function getFeatureRoutingOverride(?Feature $feature, int $organizationId): ?array
    {
        if (! $feature) {
            return null;
        }

        // Check feature-level routing config
        // This could be stored in a feature_routing_config column or routing_rules table
        $cacheKey = "feature_routing:{$organizationId}:{$feature->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($feature, $organizationId) {
            // Check if there's a routing rule for this feature
            $rule = RoutingRule::query()
                ->where('organization_id', $organizationId)
                ->where('scope', 'feature')
                ->where('scope_id', $feature->id)
                ->where('is_active', true)
                ->first();

            if ($rule) {
                return [
                    'min_tier' => $rule->target_tier,
                    'description' => $rule->description ?? "Feature requires {$rule->target_tier} tier",
                    'rule_id' => $rule->id,
                ];
            }

            // Check feature attributes if they exist
            if (isset($feature->routing_config)) {
                return $feature->routing_config;
            }

            return null;
        });
    }

    /**
     * Check for escalation conditions.
     */
    private function checkEscalation(RoutingContext $ctx, ModelTier $planAllowedTier): array
    {
        $requestedTier = $ctx->getRequestedTier();

        // Only check escalation if request exceeds plan tier
        if ($requestedTier->isAtOrBelow($planAllowedTier)) {
            return ['granted' => false];
        }

        // ─────────────────────────────────────────────────────────
        // Escalation Rule 1: Explicit escalation flag
        // ─────────────────────────────────────────────────────────
        if ($ctx->isEscalated()) {
            return [
                'granted' => true,
                'reason' => 'Workflow explicitly marked as escalated',
                'type' => 'explicit',
            ];
        }

        // ─────────────────────────────────────────────────────────
        // Escalation Rule 2: High-value workflow detection
        // ─────────────────────────────────────────────────────────
        if ($ctx->isHighValueWorkflow()) {
            $indicators = [];
            if (($ctx->metadata['priority'] ?? 'normal') === 'high') {
                $indicators[] = 'high priority';
            }
            if (($ctx->metadata['retry_count'] ?? 0) > 2) {
                $indicators[] = 'multiple retries';
            }
            if (in_array($ctx->metadata['user_tier'] ?? '', ['vip', 'enterprise'], true)) {
                $indicators[] = "user tier: {$ctx->metadata['user_tier']}";
            }
            if ($ctx->metadata['sla_critical'] ?? false) {
                $indicators[] = 'SLA critical';
            }

            return [
                'granted' => true,
                'reason' => 'High-value workflow detected: ' . implode(', ', $indicators),
                'type' => 'auto_detected',
                'indicators' => $indicators,
            ];
        }

        // ─────────────────────────────────────────────────────────
        // Escalation Rule 3: Workflow stage escalation
        // ─────────────────────────────────────────────────────────
        $stage = $ctx->getWorkflowStage();
        $escalatableStages = ['final_review', 'production', 'customer_facing', 'critical'];
        
        if ($stage && in_array($stage, $escalatableStages, true)) {
            return [
                'granted' => true,
                'reason' => "Workflow stage '{$stage}' grants premium access",
                'type' => 'stage_based',
                'stage' => $stage,
            ];
        }

        // ─────────────────────────────────────────────────────────
        // Escalation Rule 4: Custom routing hints
        // ─────────────────────────────────────────────────────────
        if ($ctx->requestsEscalation('premium') || $ctx->requestsEscalation('quality')) {
            return [
                'granted' => true,
                'reason' => 'Explicit escalation requested via routing hints',
                'type' => 'hint_based',
            ];
        }

        return ['granted' => false];
    }

    /**
     * Evaluate custom routing rules for the organization.
     */
    private function evaluateCustomRules(RoutingContext $ctx, ModelTier $currentTier): ?array
    {
        $cacheKey = "routing_rules:{$ctx->organizationId}";
        
        $rules = Cache::remember($cacheKey, 300, function () use ($ctx) {
            return RoutingRule::query()
                ->where('organization_id', $ctx->organizationId)
                ->where('is_active', true)
                ->orderBy('priority', 'desc')
                ->get();
        });

        foreach ($rules as $rule) {
            if ($this->ruleMatches($rule, $ctx)) {
                return [
                    'rule_id' => $rule->id,
                    'name' => $rule->name,
                    'target_tier' => $rule->target_tier,
                    'action' => $rule->action,
                ];
            }
        }

        return null;
    }

    /**
     * Check if a routing rule matches the context.
     */
    private function ruleMatches(RoutingRule $rule, RoutingContext $ctx): bool
    {
        $conditions = $rule->conditions ?? [];

        // Check scope match
        if ($rule->scope === 'plan' && $rule->scope_id !== $ctx->planId) {
            return false;
        }
        if ($rule->scope === 'feature' && $rule->scope_id !== $ctx->featureId) {
            return false;
        }
        if ($rule->scope === 'customer' && $rule->scope_id !== $ctx->customerId) {
            return false;
        }

        // Check segment condition
        if (isset($conditions['segment'])) {
            $segment = $ctx->getSegment();
            if (! in_array($segment, (array) $conditions['segment'], true)) {
                return false;
            }
        }

        // Check model condition
        if (isset($conditions['model_pattern'])) {
            if (! preg_match($conditions['model_pattern'], $ctx->requestedModel)) {
                return false;
            }
        }

        // Check workflow condition
        if (isset($conditions['workflow_id'])) {
            if ($ctx->workflowId !== $conditions['workflow_id']) {
                return false;
            }
        }

        // Check time-based conditions
        if (isset($conditions['time_window'])) {
            $now = Carbon::now();
            $start = Carbon::parse($conditions['time_window']['start'] ?? '00:00');
            $end = Carbon::parse($conditions['time_window']['end'] ?? '23:59');
            if (! $now->between($start, $end)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check budget constraints.
     */
    private function checkBudgetConstraints(
        RoutingContext $ctx,
        ?Organization $organization,
        ?Plan $plan,
    ): array {
        if (! $organization) {
            return ['exceeded' => false];
        }

        // Check organization-level budget
        $orgBudget = $organization->monthly_budget_cap ?? 0;
        if ($orgBudget > 0) {
            $monthSpend = $this->getMonthSpend($ctx->organizationId);
            $remaining = $orgBudget - $monthSpend;
            
            if ($remaining <= 0) {
                return [
                    'exceeded' => true,
                    'reason' => 'Organization monthly budget exhausted',
                    'action' => 'block',
                    'budget' => $orgBudget,
                    'spent' => $monthSpend,
                ];
            }

            // If budget is low (< 10% remaining), force economy
            if ($remaining < ($orgBudget * 0.1)) {
                return [
                    'exceeded' => true,
                    'reason' => 'Low budget remaining (' . round(($remaining / $orgBudget) * 100) . '%)',
                    'action' => 'downgrade',
                    'remaining_percent' => round(($remaining / $orgBudget) * 100),
                ];
            }
        }

        // Check plan-level budget
        if ($plan && $plan->monthly_ai_budget > 0 && $ctx->customerId) {
            $customerSpend = $this->getCustomerMonthSpend($ctx->customerId);
            $remaining = $plan->monthly_ai_budget - $customerSpend;

            if ($remaining <= 0) {
                return [
                    'exceeded' => true,
                    'reason' => "Customer exceeded plan budget ({$plan->name})",
                    'action' => 'downgrade',
                    'budget' => $plan->monthly_ai_budget,
                    'spent' => $customerSpend,
                ];
            }
        }

        return ['exceeded' => false];
    }

    /**
     * Select the best fallback model for a tier.
     */
    private function selectFallbackModel(ModelTier $tier, ?Plan $plan, RoutingContext $ctx): string
    {
        // Check plan-specific fallback
        if ($plan && $plan->fallback_model) {
            $fallbackTier = ModelTier::forModel($plan->fallback_model);
            if ($fallbackTier->isAtOrBelow($tier)) {
                return $plan->fallback_model;
            }
        }

        // Check organization defaults
        // TODO: Could be stored in organization settings

        // Use tier default
        return self::TIER_FALLBACKS[$tier->value] ?? self::TIER_FALLBACKS['standard'];
    }

    /**
     * Calculate estimated savings from downgrade.
     */
    private function calculateSavings(string $originalModel, string $fallbackModel, RoutingContext $ctx): float
    {
        $originalCost = $this->costEstimator->estimateCost(
            $ctx->provider,
            $originalModel,
            $ctx->inputTokens,
            $ctx->outputTokens
        );

        $fallbackProvider = $this->resolveProviderForModel($fallbackModel, $ctx->provider);
        $fallbackCost = $this->costEstimator->estimateCost(
            $fallbackProvider,
            $fallbackModel,
            $ctx->inputTokens,
            $ctx->outputTokens
        );

        return max(0, $originalCost - $fallbackCost);
    }

    /**
     * Resolve entities for the context.
     */
    private function resolveEntities(RoutingContext $ctx): RoutingContext
    {
        $organization = $ctx->organization;
        $customer = $ctx->customer;
        $plan = $ctx->plan;
        $feature = $ctx->feature;

        if (! $organization && $ctx->organizationId) {
            $organization = $this->getOrganization($ctx->organizationId);
        }

        if (! $customer && $ctx->customerId) {
            $customer = $this->getCustomer($ctx->customerId);
        }

        if (! $plan) {
            // Try to get plan from customer or context
            if ($ctx->planId) {
                $plan = $this->getPlan($ctx->planId);
            } elseif ($customer && $customer->plan_id) {
                $plan = $customer->plan;
            }
        }

        if (! $feature && $ctx->featureId) {
            $feature = $this->getFeature($ctx->featureId);
        }

        return $ctx->withEntities($organization, $customer, $plan, $feature);
    }

    /**
     * Get month spend for organization.
     */
    private function getMonthSpend(int $organizationId): float
    {
        $cacheKey = "org_month_spend:{$organizationId}:" . now()->format('Y-m');
        
        return Cache::remember($cacheKey, 60, function () use ($organizationId) {
            return (float) AIRequest::query()
                ->where('organization_id', $organizationId)
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('estimated_cost');
        });
    }

    /**
     * Get month spend for customer.
     */
    private function getCustomerMonthSpend(int $customerId): float
    {
        $cacheKey = "customer_month_spend:{$customerId}:" . now()->format('Y-m');
        
        return Cache::remember($cacheKey, 60, function () use ($customerId) {
            return (float) AIRequest::query()
                ->where('customer_id', $customerId)
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('estimated_cost');
        });
    }

    /**
     * Resolve provider for a model.
     */
    private function resolveProviderForModel(string $model, string $defaultProvider): string
    {
        $model = strtolower($model);

        if (str_starts_with($model, 'gpt') || str_starts_with($model, 'o1') || str_starts_with($model, 'o3')) {
            return 'openai';
        }
        if (str_starts_with($model, 'claude')) {
            return 'anthropic';
        }
        if (str_starts_with($model, 'gemini')) {
            return 'google';
        }
        if (str_starts_with($model, 'mistral') || str_starts_with($model, 'mixtral')) {
            return 'mistral';
        }
        if (str_starts_with($model, 'llama')) {
            return 'meta';
        }

        return $defaultProvider;
    }

    // ─────────────────────────────────────────────────────────
    // Entity resolution helpers (with caching)
    // ─────────────────────────────────────────────────────────

    private function getOrganization(int $id): ?Organization
    {
        return $this->entityCache["org:{$id}"] ??= Organization::query()->find($id);
    }

    private function getCustomer(int $id): ?Customer
    {
        return $this->entityCache["customer:{$id}"] ??= Customer::query()->with('plan')->find($id);
    }

    private function getPlan(int $id): ?Plan
    {
        return $this->entityCache["plan:{$id}"] ??= Plan::query()->find($id);
    }

    private function getFeature(int $id): ?Feature
    {
        return $this->entityCache["feature:{$id}"] ??= Feature::query()->find($id);
    }

    /**
     * Clear routing rules cache for an organization.
     */
    public function clearRulesCache(int $organizationId): void
    {
        Cache::forget("routing_rules:{$organizationId}");
    }
}
