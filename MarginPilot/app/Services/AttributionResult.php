<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Feature;
use App\Models\Plan;

/**
 * Result of an attribution resolution attempt.
 * 
 * Contains:
 * - Resolved entities (customer, feature, plan)
 * - Resolution status and quality score
 * - Issues encountered during resolution
 * - Metadata about how each entity was resolved
 */
class AttributionResult
{
    /** Organization context */
    public int $organizationId;

    /** Resolved entities */
    public ?Customer $customer = null;
    public ?Feature $feature = null;
    public ?Plan $plan = null;
    public ?string $workflow = null;

    /** 
     * Attribution status: full, partial, none, failed 
     * @var string
     */
    public string $status = AttributionService::STATUS_NONE;

    /**
     * Attribution quality score (0-100)
     * - 40 points for customer
     * - 30 points for feature
     * - 20 points for plan
     * - 10 points for workflow
     */
    public int $score = 0;

    /**
     * What was attempted (input was provided)
     * @var array<string, bool>
     */
    public array $attempted = [
        'customer' => false,
        'feature' => false,
        'plan' => false,
        'workflow' => false,
    ];

    /**
     * How each entity was resolved (id, name, external_id, customer_plan, etc.)
     * @var array<string, string>
     */
    public array $resolvedFrom = [];

    /**
     * Issues encountered during resolution
     * @var string[]
     */
    public array $issues = [];

    /**
     * Details about failed resolutions
     * @var array<string, array{type: string, value: mixed, reason: string}>
     */
    public array $failedResolutions = [];

    /**
     * Check if attribution is complete (full status).
     */
    public function isComplete(): bool
    {
        return $this->status === AttributionService::STATUS_FULL;
    }

    /**
     * Check if attribution has any issues.
     */
    public function hasIssues(): bool
    {
        return !empty($this->issues);
    }

    /**
     * Check if any entity was resolved.
     */
    public function hasAnyAttribution(): bool
    {
        return $this->customer !== null 
            || $this->feature !== null 
            || $this->plan !== null
            || $this->workflow !== null;
    }

    /**
     * Get a summary for API responses.
     */
    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'score' => $this->score,
            'resolved' => [
                'customer_id' => $this->customer?->id,
                'customer_name' => $this->customer?->name,
                'feature_id' => $this->feature?->id,
                'feature_name' => $this->feature?->name,
                'plan_id' => $this->plan?->id,
                'plan_name' => $this->plan?->name,
                'workflow' => $this->workflow,
            ],
            'issues' => $this->issues,
            'resolved_from' => $this->resolvedFrom,
        ];
    }

    /**
     * Get compact summary for storage.
     */
    public function toCompactArray(): array
    {
        return [
            'status' => $this->status,
            'score' => $this->score,
            'issues' => $this->issues,
        ];
    }

    /**
     * Get IDs for database storage.
     */
    public function getIds(): array
    {
        return [
            'customer_id' => $this->customer?->id,
            'feature_id' => $this->feature?->id,
            'plan_id' => $this->plan?->id,
        ];
    }
}
