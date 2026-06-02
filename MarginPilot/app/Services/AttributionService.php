<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;

/**
 * Attribution Service - Ensures robust business metadata tagging
 * 
 * This service is responsible for:
 * 1. Resolving business entities (customer, feature, plan) with strict validation
 * 2. Tracking attribution attempts vs successes
 * 3. Logging attribution failures for debugging
 * 4. Providing metrics for attribution quality KPIs
 * 
 * Attribution quality is a CENTRAL KPI, not a technical detail.
 */
class AttributionService
{
    /**
     * Attribution status constants
     */
    public const STATUS_FULL = 'full';           // All provided fields resolved
    public const STATUS_PARTIAL = 'partial';     // Some fields resolved, some failed
    public const STATUS_NONE = 'none';           // No attribution at all
    public const STATUS_FAILED = 'failed';       // Fields provided but none resolved

    /**
     * Attribution issue types
     */
    public const ISSUE_CUSTOMER_NOT_FOUND = 'customer_not_found';
    public const ISSUE_CUSTOMER_WRONG_ORG = 'customer_wrong_org';
    public const ISSUE_FEATURE_NOT_FOUND = 'feature_not_found';
    public const ISSUE_FEATURE_WRONG_ORG = 'feature_wrong_org';
    public const ISSUE_PLAN_NOT_FOUND = 'plan_not_found';
    public const ISSUE_PLAN_WRONG_ORG = 'plan_wrong_org';
    public const ISSUE_MISSING_CUSTOMER = 'missing_customer';
    public const ISSUE_MISSING_FEATURE = 'missing_feature';

    /**
     * Resolve all business entities with full tracking.
     * 
     * @param array $input Raw input data with potential identifiers
     * @param int $organizationId Organization scope for validation
     * @return AttributionResult Complete result with entities and issues
     */
    public function resolve(array $input, int $organizationId): AttributionResult
    {
        $result = new AttributionResult();
        $result->organizationId = $organizationId;

        // Track what was attempted
        $result->attempted = [
            'customer' => $this->hasCustomerInput($input),
            'feature' => $this->hasFeatureInput($input),
            'plan' => $this->hasPlanInput($input),
            'workflow' => !empty($input['workflow'] ?? $input['workflow_name'] ?? null),
        ];

        // Resolve each entity
        $result->customer = $this->resolveCustomer($input, $organizationId, $result);
        $result->feature = $this->resolveFeature($input, $organizationId, $result);
        $result->plan = $this->resolvePlan($input, $organizationId, $result->customer?->plan_id, $result);
        $result->workflow = $input['workflow'] ?? $input['workflow_name'] ?? null;

        // Compute attribution status
        $result->status = $this->computeStatus($result);
        $result->score = $this->computeScore($result);

        // Log issues if any
        if (!empty($result->issues)) {
            $this->logAttributionIssues($result, $input);
        }

        return $result;
    }

    /**
     * Resolve customer with strict validation and issue tracking.
     */
    private function resolveCustomer(array $input, int $organizationId, AttributionResult $result): ?Customer
    {
        $customerId = $input['customer_id'] ?? null;
        $customerExternalId = $input['customer_external_id'] ?? null;
        $customerName = $input['customer_name'] ?? $input['customer'] ?? null;

        if (!$customerId && !$customerExternalId && !$customerName) {
            // No customer input provided - this is acceptable but tracked
            if ($this->isCustomerRequired($input)) {
                $result->issues[] = self::ISSUE_MISSING_CUSTOMER;
            }
            return null;
        }

        // Try by ID first
        if ($customerId) {
            // Check if ID exists at all
            $customer = Customer::query()->find($customerId);
            
            if (!$customer) {
                $result->issues[] = self::ISSUE_CUSTOMER_NOT_FOUND;
                $result->failedResolutions['customer'] = [
                    'type' => 'id',
                    'value' => $customerId,
                    'reason' => 'not_found',
                ];
                return $this->tryFallbackCustomerResolution($input, $organizationId, $result);
            }

            // Check org scope
            if ((int) $customer->organization_id !== $organizationId) {
                $result->issues[] = self::ISSUE_CUSTOMER_WRONG_ORG;
                $result->failedResolutions['customer'] = [
                    'type' => 'id',
                    'value' => $customerId,
                    'reason' => 'wrong_organization',
                    'expected_org' => $organizationId,
                    'actual_org' => $customer->organization_id,
                ];
                Log::warning('Attribution: Customer ID belongs to different organization', [
                    'customer_id' => $customerId,
                    'expected_org' => $organizationId,
                    'actual_org' => $customer->organization_id,
                ]);
                return null; // Strict: don't return customer from wrong org
            }

            $result->resolvedFrom['customer'] = 'id';
            return $customer;
        }

        // Try by external ID
        if ($customerExternalId) {
            $customer = Customer::query()
                ->where('organization_id', $organizationId)
                ->where('external_id', $customerExternalId)
                ->first();

            if ($customer) {
                $result->resolvedFrom['customer'] = 'external_id';
                return $customer;
            }

            $result->issues[] = self::ISSUE_CUSTOMER_NOT_FOUND;
            $result->failedResolutions['customer'] = [
                'type' => 'external_id',
                'value' => $customerExternalId,
                'reason' => 'not_found',
            ];
        }

        // Try by name
        if ($customerName) {
            $customer = Customer::query()
                ->where('organization_id', $organizationId)
                ->where('name', $customerName)
                ->first();

            if ($customer) {
                $result->resolvedFrom['customer'] = 'name';
                return $customer;
            }

            if (!isset($result->failedResolutions['customer'])) {
                $result->issues[] = self::ISSUE_CUSTOMER_NOT_FOUND;
                $result->failedResolutions['customer'] = [
                    'type' => 'name',
                    'value' => $customerName,
                    'reason' => 'not_found',
                ];
            }
        }

        return null;
    }

    /**
     * Resolve feature with strict validation and issue tracking.
     */
    private function resolveFeature(array $input, int $organizationId, AttributionResult $result): ?Feature
    {
        $featureId = $input['feature_id'] ?? null;
        $featureName = $input['feature_name'] ?? $input['feature'] ?? null;

        if (!$featureId && !$featureName) {
            if ($this->isFeatureRequired($input)) {
                $result->issues[] = self::ISSUE_MISSING_FEATURE;
            }
            return null;
        }

        // Try by ID first
        if ($featureId) {
            $feature = Feature::query()->find($featureId);

            if (!$feature) {
                $result->issues[] = self::ISSUE_FEATURE_NOT_FOUND;
                $result->failedResolutions['feature'] = [
                    'type' => 'id',
                    'value' => $featureId,
                    'reason' => 'not_found',
                ];
                return $this->tryFallbackFeatureResolution($input, $organizationId, $result);
            }

            if ((int) $feature->organization_id !== $organizationId) {
                $result->issues[] = self::ISSUE_FEATURE_WRONG_ORG;
                $result->failedResolutions['feature'] = [
                    'type' => 'id',
                    'value' => $featureId,
                    'reason' => 'wrong_organization',
                ];
                Log::warning('Attribution: Feature ID belongs to different organization', [
                    'feature_id' => $featureId,
                    'expected_org' => $organizationId,
                    'actual_org' => $feature->organization_id,
                ]);
                return null;
            }

            $result->resolvedFrom['feature'] = 'id';
            return $feature;
        }

        // Try by name
        if ($featureName) {
            $feature = Feature::query()
                ->where('organization_id', $organizationId)
                ->where('name', $featureName)
                ->first();

            if ($feature) {
                $result->resolvedFrom['feature'] = 'name';
                return $feature;
            }

            $result->issues[] = self::ISSUE_FEATURE_NOT_FOUND;
            $result->failedResolutions['feature'] = [
                'type' => 'name',
                'value' => $featureName,
                'reason' => 'not_found',
            ];
        }

        return null;
    }

    /**
     * Resolve plan with strict validation and issue tracking.
     */
    private function resolvePlan(array $input, int $organizationId, ?int $customerPlanId, AttributionResult $result): ?Plan
    {
        $planId = $input['plan_id'] ?? null;
        $planName = $input['plan_name'] ?? $input['plan'] ?? null;

        // Try explicit plan first
        if ($planId) {
            $plan = Plan::query()->find($planId);

            if (!$plan) {
                $result->issues[] = self::ISSUE_PLAN_NOT_FOUND;
                $result->failedResolutions['plan'] = [
                    'type' => 'id',
                    'value' => $planId,
                    'reason' => 'not_found',
                ];
            } elseif ((int) $plan->organization_id !== $organizationId) {
                $result->issues[] = self::ISSUE_PLAN_WRONG_ORG;
                $result->failedResolutions['plan'] = [
                    'type' => 'id',
                    'value' => $planId,
                    'reason' => 'wrong_organization',
                ];
                Log::warning('Attribution: Plan ID belongs to different organization', [
                    'plan_id' => $planId,
                    'expected_org' => $organizationId,
                    'actual_org' => $plan->organization_id,
                ]);
            } else {
                $result->resolvedFrom['plan'] = 'id';
                return $plan;
            }
        }

        // Try by name
        if ($planName) {
            $plan = Plan::query()
                ->where('organization_id', $organizationId)
                ->where('name', $planName)
                ->first();

            if ($plan) {
                $result->resolvedFrom['plan'] = 'name';
                return $plan;
            }

            if (!isset($result->failedResolutions['plan'])) {
                $result->issues[] = self::ISSUE_PLAN_NOT_FOUND;
                $result->failedResolutions['plan'] = [
                    'type' => 'name',
                    'value' => $planName,
                    'reason' => 'not_found',
                ];
            }
        }

        // Fallback to customer's plan if available
        if ($customerPlanId && !$planId && !$planName) {
            $plan = Plan::query()
                ->where('id', $customerPlanId)
                ->where('organization_id', $organizationId)
                ->first();

            if ($plan) {
                $result->resolvedFrom['plan'] = 'customer_plan';
                return $plan;
            }
        }

        return null;
    }

    /**
     * Try fallback resolution methods for customer.
     */
    private function tryFallbackCustomerResolution(array $input, int $organizationId, AttributionResult $result): ?Customer
    {
        $customerExternalId = $input['customer_external_id'] ?? null;
        $customerName = $input['customer_name'] ?? $input['customer'] ?? null;

        if ($customerExternalId) {
            $customer = Customer::query()
                ->where('organization_id', $organizationId)
                ->where('external_id', $customerExternalId)
                ->first();

            if ($customer) {
                $result->resolvedFrom['customer'] = 'external_id_fallback';
                // Remove the not_found issue since we found it via fallback
                $result->issues = array_filter($result->issues, fn($i) => $i !== self::ISSUE_CUSTOMER_NOT_FOUND);
                return $customer;
            }
        }

        if ($customerName) {
            $customer = Customer::query()
                ->where('organization_id', $organizationId)
                ->where('name', $customerName)
                ->first();

            if ($customer) {
                $result->resolvedFrom['customer'] = 'name_fallback';
                $result->issues = array_filter($result->issues, fn($i) => $i !== self::ISSUE_CUSTOMER_NOT_FOUND);
                return $customer;
            }
        }

        return null;
    }

    /**
     * Try fallback resolution methods for feature.
     */
    private function tryFallbackFeatureResolution(array $input, int $organizationId, AttributionResult $result): ?Feature
    {
        $featureName = $input['feature_name'] ?? $input['feature'] ?? null;

        if ($featureName) {
            $feature = Feature::query()
                ->where('organization_id', $organizationId)
                ->where('name', $featureName)
                ->first();

            if ($feature) {
                $result->resolvedFrom['feature'] = 'name_fallback';
                $result->issues = array_filter($result->issues, fn($i) => $i !== self::ISSUE_FEATURE_NOT_FOUND);
                return $feature;
            }
        }

        return null;
    }

    /**
     * Compute overall attribution status.
     */
    private function computeStatus(AttributionResult $result): string
    {
        $attemptedCount = count(array_filter($result->attempted));
        $resolvedCount = 0;

        if ($result->customer) $resolvedCount++;
        if ($result->feature) $resolvedCount++;
        if ($result->plan) $resolvedCount++;
        if ($result->workflow) $resolvedCount++;

        // Adjust for non-attempted fields
        $relevantAttempted = 0;
        if ($result->attempted['customer']) $relevantAttempted++;
        if ($result->attempted['feature']) $relevantAttempted++;
        if ($result->attempted['plan']) $relevantAttempted++;

        if ($relevantAttempted === 0) {
            return self::STATUS_NONE;
        }

        $resolvedFromAttempted = 0;
        if ($result->attempted['customer'] && $result->customer) $resolvedFromAttempted++;
        if ($result->attempted['feature'] && $result->feature) $resolvedFromAttempted++;
        if ($result->attempted['plan'] && $result->plan) $resolvedFromAttempted++;

        if ($resolvedFromAttempted === $relevantAttempted) {
            return self::STATUS_FULL;
        }

        if ($resolvedFromAttempted === 0) {
            return self::STATUS_FAILED;
        }

        return self::STATUS_PARTIAL;
    }

    /**
     * Compute attribution quality score (0-100).
     * 
     * Scoring:
     * - Customer: 40 points (most important for billing)
     * - Feature: 30 points (important for cost allocation)
     * - Plan: 20 points (important for policy)
     * - Workflow: 10 points (nice to have for granularity)
     */
    private function computeScore(AttributionResult $result): int
    {
        $score = 0;

        if ($result->customer) {
            $score += 40;
        }

        if ($result->feature) {
            $score += 30;
        }

        if ($result->plan) {
            $score += 20;
        }

        if ($result->workflow) {
            $score += 10;
        }

        return $score;
    }

    /**
     * Log attribution issues for debugging and monitoring.
     */
    private function logAttributionIssues(AttributionResult $result, array $input): void
    {
        Log::info('Attribution issues detected', [
            'organization_id' => $result->organizationId,
            'status' => $result->status,
            'score' => $result->score,
            'issues' => $result->issues,
            'failed_resolutions' => $result->failedResolutions,
            'input_keys' => array_keys(array_filter($input)),
        ]);
    }

    /**
     * Helper: check if customer input was provided.
     */
    private function hasCustomerInput(array $input): bool
    {
        return !empty($input['customer_id'])
            || !empty($input['customer_external_id'])
            || !empty($input['customer_name'])
            || !empty($input['customer']);
    }

    /**
     * Helper: check if feature input was provided.
     */
    private function hasFeatureInput(array $input): bool
    {
        return !empty($input['feature_id'])
            || !empty($input['feature_name'])
            || !empty($input['feature']);
    }

    /**
     * Helper: check if plan input was provided.
     */
    private function hasPlanInput(array $input): bool
    {
        return !empty($input['plan_id'])
            || !empty($input['plan_name'])
            || !empty($input['plan']);
    }

    /**
     * Determine if customer is required (heuristic based on context).
     */
    private function isCustomerRequired(array $input): bool
    {
        // If a plan or feature is specified, customer is usually expected
        return $this->hasPlanInput($input) || $this->hasFeatureInput($input);
    }

    /**
     * Determine if feature is required (heuristic based on context).
     */
    private function isFeatureRequired(array $input): bool
    {
        // Feature is always recommended for proper cost allocation
        return true;
    }
}
