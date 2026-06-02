<?php

namespace App\Models;

use App\Services\Routing\ModelTier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AIRequest extends Model
{
    use HasFactory;

    protected $table = 'ai_requests';

    protected $fillable = [
        'organization_id',
        'provider',
        'requested_provider',
        'model',
        'requested_model',
        'feature_id',
        'customer_id',
        'plan_id',
        'workflow_name',
        'prompt_tokens',
        'completion_tokens',
        'estimated_cost',
        'policy_triggered',
        'policy_trigger_reason',
        'enforcement_action',
        'enforcement_reason',
        'attribution_status',
        'attribution_score',
        'attribution_issues',
        'routing_outcome',
        'routing_tier',
        'routing_savings',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'estimated_cost' => 'decimal:6',
            'policy_triggered' => 'boolean',
            'attribution_issues' => 'array',
            'routing_savings' => 'decimal:6',
            'created_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function policyTriggers(): HasMany
    {
        return $this->hasMany(PolicyTrigger::class);
    }

    /**
     * Scope: requests with full attribution.
     */
    public function scopeFullyAttributed($query)
    {
        return $query->where('attribution_status', 'full');
    }

    /**
     * Scope: requests with attribution issues.
     */
    public function scopeWithAttributionIssues($query)
    {
        return $query->whereIn('attribution_status', ['partial', 'failed', 'none']);
    }

    /**
     * Scope: orphan requests (no customer attribution).
     */
    public function scopeOrphan($query)
    {
        return $query->whereNull('customer_id');
    }

    /**
     * Scope: requests with minimum attribution score.
     */
    public function scopeMinScore($query, int $score)
    {
        return $query->where('attribution_score', '>=', $score);
    }

    /**
     * Check if this request has full attribution.
     */
    public function hasFullAttribution(): bool
    {
        return $this->attribution_status === 'full';
    }

    /**
     * Check if this request is orphaned (no customer).
     */
    public function isOrphan(): bool
    {
        return $this->customer_id === null;
    }

    // ─────────────────────────────────────────────────────────
    // Routing helpers
    // ─────────────────────────────────────────────────────────

    /**
     * Scope: requests that were downgraded by routing.
     */
    public function scopeDowngraded($query)
    {
        return $query->where('routing_outcome', 'downgraded');
    }

    /**
     * Scope: requests that were escalated.
     */
    public function scopeEscalated($query)
    {
        return $query->where('routing_outcome', 'escalated');
    }

    /**
     * Scope: requests routed to a specific tier.
     */
    public function scopeRoutedToTier($query, string $tier)
    {
        return $query->where('routing_tier', $tier);
    }

    /**
     * Scope: requests with routing savings.
     */
    public function scopeWithSavings($query)
    {
        return $query->where('routing_savings', '>', 0);
    }

    /**
     * Check if model was downgraded.
     */
    public function wasDowngraded(): bool
    {
        return $this->routing_outcome === 'downgraded';
    }

    /**
     * Check if model was escalated.
     */
    public function wasEscalated(): bool
    {
        return $this->routing_outcome === 'escalated';
    }

    /**
     * Get the routed tier as enum.
     */
    public function getRoutedTierEnum(): ?ModelTier
    {
        if (! $this->routing_tier) {
            return null;
        }

        return ModelTier::fromString($this->routing_tier);
    }
}
