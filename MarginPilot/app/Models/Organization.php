<?php

namespace App\Models;

use App\Support\MargeXaCatalog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    /**
     * User-facing fields that may be set via form inputs.
     * Billing/Stripe fields are intentionally excluded — use forceFill() in internal services only.
     */
    protected $fillable = [
        'name',
        'slug',
        'monthly_budget_cap',
        'settings',
        'notification_settings',
        'last_policy_notification_at',
        'billing_email',
        'billing_address',
        'stripe_api_key_encrypted',
        'api_key',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'notification_settings' => 'array',
            'entitlements' => 'array',
            'billing_address' => 'array',
            'monthly_budget_cap' => 'decimal:2',
            'last_policy_notification_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'scan_purchased_at' => 'datetime',
            'has_purchased_scan' => 'boolean',
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Billing Helpers
    // ─────────────────────────────────────────────────────────

    public function hasActiveSubscription(): bool
    {
        return in_array($this->subscription_status, ['active', 'trialing']);
    }

    public function isOnTrial(): bool
    {
        return $this->subscription_status === 'trialing' 
            && $this->trial_ends_at 
            && $this->trial_ends_at->isFuture();
    }

    public function isPastDue(): bool
    {
        return $this->subscription_status === 'past_due';
    }

    public function canAccess(string $feature): bool
    {
        $entitlements = $this->entitlements ?? [];
        return $entitlements[$feature] ?? false;
    }

    public function getLimit(string $feature): ?int
    {
        $entitlements = $this->entitlements ?? [];
        return $entitlements[$feature] ?? null;
    }

    public function getPlanName(): string
    {
        return MargeXaCatalog::internalPlanName($this->plan ?? 'free');
    }

    /**
     * Decrypt and return the org's own Stripe API key (for syncing their customer revenue).
     * Returns null if not configured.
     */
    public function stripeApiKey(): ?string
    {
        if (empty($this->stripe_api_key_encrypted)) {
            return null;
        }
        try {
            return \Illuminate\Support\Facades\Crypt::decryptString($this->stripe_api_key_encrypted);
        } catch (\Throwable) {
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────────────────

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function providerConnections(): HasMany
    {
        return $this->hasMany(ProviderConnection::class);
    }

    public function features(): HasMany
    {
        return $this->hasMany(Feature::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    public function aiRequests(): HasMany
    {
        return $this->hasMany(AIRequest::class);
    }

    public function policies(): HasMany
    {
        return $this->hasMany(Policy::class);
    }

    public function policyTriggers(): HasMany
    {
        return $this->hasMany(PolicyTrigger::class);
    }
}
