<?php

namespace App\Services\Routing;

use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;

/**
 * Context for routing decisions.
 * 
 * Encapsulates all information needed to make an economic routing decision.
 */
final class RoutingContext
{
    public function __construct(
        public readonly int $organizationId,
        public readonly string $requestedModel,
        public readonly string $provider,
        public readonly ?int $customerId = null,
        public readonly ?int $planId = null,
        public readonly ?int $featureId = null,
        public readonly ?string $workflowId = null,
        public readonly float $estimatedCost = 0.0,
        public readonly int $inputTokens = 0,
        public readonly int $outputTokens = 0,
        public readonly array $metadata = [],
        // Resolved entities (optional, for performance)
        public readonly ?Organization $organization = null,
        public readonly ?Customer $customer = null,
        public readonly ?Plan $plan = null,
        public readonly ?Feature $feature = null,
    ) {
    }

    /**
     * Create context from array (e.g., API request).
     */
    public static function fromArray(array $data): self
    {
        return new self(
            organizationId: (int) ($data['organization_id'] ?? 0),
            requestedModel: $data['model'] ?? $data['requested_model'] ?? '',
            provider: $data['provider'] ?? 'openai',
            customerId: isset($data['customer_id']) ? (int) $data['customer_id'] : null,
            planId: isset($data['plan_id']) ? (int) $data['plan_id'] : null,
            featureId: isset($data['feature_id']) ? (int) $data['feature_id'] : null,
            workflowId: $data['workflow_id'] ?? null,
            estimatedCost: (float) ($data['estimated_cost'] ?? 0),
            inputTokens: (int) ($data['input_tokens'] ?? $data['prompt_tokens'] ?? 0),
            outputTokens: (int) ($data['output_tokens'] ?? $data['completion_tokens'] ?? 0),
            metadata: $data['metadata'] ?? [],
        );
    }

    /**
     * Get the tier of the requested model.
     */
    public function getRequestedTier(): ModelTier
    {
        return ModelTier::forModel($this->requestedModel);
    }

    /**
     * Check if this is a high-value workflow (e.g., escalation candidate).
     */
    public function isHighValueWorkflow(): bool
    {
        // High-value indicators from metadata
        $indicators = [
            'escalated' => $this->metadata['escalated'] ?? false,
            'priority' => ($this->metadata['priority'] ?? 'normal') === 'high',
            'retry_count' => ($this->metadata['retry_count'] ?? 0) > 2,
            'user_tier' => in_array($this->metadata['user_tier'] ?? '', ['vip', 'enterprise'], true),
            'sla_critical' => $this->metadata['sla_critical'] ?? false,
        ];

        return count(array_filter($indicators)) >= 1;
    }

    /**
     * Check if this is explicitly marked as escalated.
     */
    public function isEscalated(): bool
    {
        return ($this->metadata['escalated'] ?? false) === true
            || ($this->metadata['workflow_escalated'] ?? false) === true;
    }

    /**
     * Get the workflow stage if present.
     */
    public function getWorkflowStage(): ?string
    {
        return $this->metadata['workflow_stage'] ?? $this->metadata['stage'] ?? null;
    }

    /**
     * Get custom routing hints from metadata.
     */
    public function getRoutingHints(): array
    {
        return $this->metadata['routing'] ?? $this->metadata['routing_hints'] ?? [];
    }

    /**
     * Check if a specific escalation is requested.
     */
    public function requestsEscalation(string $type): bool
    {
        $hints = $this->getRoutingHints();
        return ($hints['escalate'] ?? null) === $type
            || in_array($type, $hints['escalations'] ?? [], true);
    }

    /**
     * Get the segment/cohort for this request.
     */
    public function getSegment(): ?string
    {
        // Try explicit segment
        if (isset($this->metadata['segment'])) {
            return $this->metadata['segment'];
        }

        // Derive from plan tier if available
        if ($this->plan) {
            return $this->plan->tier;
        }

        return null;
    }

    /**
     * Enrich context with resolved entities.
     */
    public function withEntities(
        ?Organization $organization = null,
        ?Customer $customer = null,
        ?Plan $plan = null,
        ?Feature $feature = null
    ): self {
        return new self(
            organizationId: $this->organizationId,
            requestedModel: $this->requestedModel,
            provider: $this->provider,
            customerId: $this->customerId,
            planId: $this->planId,
            featureId: $this->featureId,
            workflowId: $this->workflowId,
            estimatedCost: $this->estimatedCost,
            inputTokens: $this->inputTokens,
            outputTokens: $this->outputTokens,
            metadata: $this->metadata,
            organization: $organization ?? $this->organization,
            customer: $customer ?? $this->customer,
            plan: $plan ?? $this->plan,
            feature: $feature ?? $this->feature,
        );
    }

    /**
     * Convert to array for logging/debugging.
     */
    public function toArray(): array
    {
        return [
            'organization_id' => $this->organizationId,
            'requested_model' => $this->requestedModel,
            'requested_tier' => $this->getRequestedTier()->value,
            'provider' => $this->provider,
            'customer_id' => $this->customerId,
            'plan_id' => $this->planId,
            'feature_id' => $this->featureId,
            'workflow_id' => $this->workflowId,
            'estimated_cost' => $this->estimatedCost,
            'is_escalated' => $this->isEscalated(),
            'is_high_value' => $this->isHighValueWorkflow(),
            'segment' => $this->getSegment(),
        ];
    }
}
