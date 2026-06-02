<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;

/**
 * Represents a request context for preflight policy evaluation,
 * before an AIRequest is persisted.
 */
class PreflightContext
{
    public function __construct(
        public readonly int $organization_id,
        public readonly string $provider,
        public readonly string $model,
        public readonly int $prompt_tokens,
        public readonly int $completion_tokens,
        public readonly float $estimated_cost,
        public readonly ?int $feature_id = null,
        public readonly ?int $customer_id = null,
        public readonly ?int $plan_id = null,
        public readonly ?string $workflow_name = null,
        public readonly ?string $created_at = null,
        public readonly ?Feature $feature = null,
        public readonly ?Customer $customer = null,
        public readonly ?Plan $plan = null,
        public readonly ?Organization $organization = null,
    ) {
    }

    /**
     * Create a new context with a different model and cost (for fallback).
     */
    public function withFallback(string $provider, string $model, float $estimatedCost): self
    {
        return new self(
            organization_id: $this->organization_id,
            provider: $provider,
            model: $model,
            prompt_tokens: $this->prompt_tokens,
            completion_tokens: $this->completion_tokens,
            estimated_cost: $estimatedCost,
            feature_id: $this->feature_id,
            customer_id: $this->customer_id,
            plan_id: $this->plan_id,
            workflow_name: $this->workflow_name,
            created_at: $this->created_at,
            feature: $this->feature,
            customer: $this->customer,
            plan: $this->plan,
            organization: $this->organization,
        );
    }
}
