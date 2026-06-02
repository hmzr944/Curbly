<?php
namespace App\Services;

use App\Models\Organization;
use App\Support\MargeXaCatalog;

/**
 * Entitlements Service
 * 
 * Manages plan-based feature access for Margexa V1.
 * 
 * Plans V1:
 * - free: Basic access, no paid features
 * - scan: One-shot AI Margin Scan (paid)
 * - observe: Observe plan (€149/month) - Shadow mode, metrics, alerts
 * - control: Control plan (€349/month) - + Enforcement, policies, proxy
 * - scale: Scale plan (custom) - + SSO, multi-org, SLA
 */
class EntitlementService
{
    /**
     * Cached plans configuration.
     */
    private static ?array $plansCache = null;

    /**
     * Get all plans with their configurations.
     * Uses config() instead of env() for proper Laravel convention.
     */
    public static function getPlans(): array
    {
        if (self::$plansCache !== null) {
            return self::$plansCache;
        }

        self::$plansCache = MargeXaCatalog::internalPlans();
        return self::$plansCache;
    }

    /**
     * Check if organization has a specific entitlement.
     */
    public function can(Organization $org, string $entitlement): bool
    {
        $plan = $this->getPlanConfig($org->plan ?? 'free');
        $entitlements = $plan['entitlements'] ?? [];
        
        // Check custom entitlements first (overrides)
        $customEntitlements = $org->entitlements ?? [];
        if (isset($customEntitlements[$entitlement])) {
            return (bool) $customEntitlements[$entitlement];
        }
        
        return $entitlements[$entitlement] ?? false;
    }

    /**
     * Get numeric limit for an entitlement.
     */
    public function limit(Organization $org, string $entitlement): ?int
    {
        $plan = $this->getPlanConfig($org->plan ?? 'free');
        $entitlements = $plan['entitlements'] ?? [];
        
        // Check custom entitlements first
        $customEntitlements = $org->entitlements ?? [];
        if (isset($customEntitlements[$entitlement])) {
            return $customEntitlements[$entitlement];
        }
        
        return $entitlements[$entitlement] ?? null;
    }

    /**
     * Get plan configuration.
     */
    public function getPlanConfig(string $plan): array
    {
        $plans = self::getPlans();
        return $plans[$plan] ?? $plans['free'];
    }

    /**
     * Get all plans for pricing display.
     */
    public function getAllPlans(): array
    {
        return self::getPlans();
    }

    /**
     * Check if organization has active subscription.
     */
    public function hasActiveSubscription(Organization $org): bool
    {
        return in_array($org->subscription_status, ['active', 'trialing']);
    }

    /**
     * Check if organization is on trial.
     */
    public function isOnTrial(Organization $org): bool
    {
        return $org->subscription_status === 'trialing' 
            && $org->trial_ends_at 
            && $org->trial_ends_at->isFuture();
    }

    /**
     * Get days remaining in trial.
     */
    public function trialDaysRemaining(Organization $org): int
    {
        if (!$this->isOnTrial($org)) {
            return 0;
        }
        
        return max(0, now()->diffInDays($org->trial_ends_at, false));
    }

    /**
     * Check if subscription is past due.
     */
    public function isPastDue(Organization $org): bool
    {
        return $org->subscription_status === 'past_due';
    }

    /**
     * Get billing status for display.
     */
    public function getBillingStatus(Organization $org): array
    {
        $plan = $this->getPlanConfig($org->plan ?? 'free');
        
        return [
            'plan' => $org->plan ?? 'free',
            'plan_name' => $plan['display_name'] ?? $plan['name'],
            'price' => $plan['price'],
            'interval' => $plan['interval'],
            'status' => $org->subscription_status ?? 'none',
            'is_active' => $this->hasActiveSubscription($org),
            'is_trial' => $this->isOnTrial($org),
            'is_past_due' => $this->isPastDue($org),
            'trial_days_remaining' => $this->trialDaysRemaining($org),
            'ends_at' => $org->subscription_ends_at?->format('Y-m-d'),
            'has_scan' => $org->has_purchased_scan,
        ];
    }

    /**
     * Apply plan entitlements to organization.
     */
    public function applyPlan(Organization $org, string $plan): void
    {
        $config = $this->getPlanConfig($plan);

        $org->forceFill([
            'plan'         => $plan,
            'entitlements' => $config['entitlements'],
        ])->save();
    }

    /**
     * Upgrade organization to new plan.
     */
    public function upgradePlan(Organization $org, string $newPlan, ?string $stripeSubscriptionId = null, ?string $stripePriceId = null): void
    {
        $config = $this->getPlanConfig($newPlan);

        $org->forceFill([
            'plan'                    => $newPlan,
            'entitlements'            => $config['entitlements'],
            'stripe_subscription_id'  => $stripeSubscriptionId ?? $org->stripe_subscription_id,
            'stripe_price_id'         => $stripePriceId ?? $org->stripe_price_id,
            'subscription_status'     => 'active',
        ])->save();
    }

    /**
     * Downgrade organization (e.g., on cancel).
     */
    public function downgradeToPlan(Organization $org, string $plan = 'free'): void
    {
        $config = $this->getPlanConfig($plan);

        $org->forceFill([
            'plan'                => $plan,
            'entitlements'        => $config['entitlements'],
            'subscription_status' => $plan === 'free' ? null : 'canceled',
        ])->save();
    }

    /**
     * Grant scan access after one-shot purchase.
     */
    public function grantScanAccess(Organization $org): void
    {
        $scanConfig = $this->getPlanConfig('scan');

        $org->forceFill([
            'has_purchased_scan' => true,
            'scan_purchased_at'  => now(),
            'plan'               => $org->plan === 'free' ? 'scan' : $org->plan,
            'entitlements'       => array_merge(
                $org->entitlements ?? [],
                $scanConfig['entitlements']
            ),
        ])->save();
    }
}
