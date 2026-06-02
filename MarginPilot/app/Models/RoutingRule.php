<?php

namespace App\Models;

use App\Services\Routing\ModelTier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Routing rule for economic router.
 * 
 * Defines rules for model tier routing decisions:
 * - By plan: "Starter plan gets standard tier max"
 * - By feature: "Code review feature requires premium"
 * - By customer: "VIP customer gets flagship access"
 * - By segment: "Enterprise segment allows all tiers"
 * 
 * @property int $id
 * @property int $organization_id
 * @property string $name
 * @property ?string $description
 * @property string $scope (global, plan, feature, customer, segment)
 * @property ?int $scope_id
 * @property string $target_tier (economy, standard, premium, flagship)
 * @property string $action (allow, restrict, upgrade, downgrade)
 * @property int $priority
 * @property ?array $conditions
 * @property ?array $metadata
 * @property bool $is_active
 * @property ?\Carbon\Carbon $expires_at
 */
class RoutingRule extends Model
{
    use HasFactory;

    // Scope constants
    public const SCOPE_GLOBAL = 'global';
    public const SCOPE_PLAN = 'plan';
    public const SCOPE_FEATURE = 'feature';
    public const SCOPE_CUSTOMER = 'customer';
    public const SCOPE_SEGMENT = 'segment';

    // Action constants
    public const ACTION_ALLOW = 'allow';       // Grant access to this tier
    public const ACTION_RESTRICT = 'restrict'; // Limit to this tier max
    public const ACTION_UPGRADE = 'upgrade';   // Upgrade to this tier
    public const ACTION_DOWNGRADE = 'downgrade'; // Downgrade to this tier

    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'scope',
        'scope_id',
        'target_tier',
        'action',
        'priority',
        'conditions',
        'metadata',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'scope_id' => 'integer',
            'priority' => 'integer',
            'conditions' => 'array',
            'metadata' => 'array',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the scoped entity (plan, feature, or customer).
     */
    public function scopedEntity(): ?Model
    {
        if (! $this->scope_id) {
            return null;
        }

        return match ($this->scope) {
            self::SCOPE_PLAN => Plan::find($this->scope_id),
            self::SCOPE_FEATURE => Feature::find($this->scope_id),
            self::SCOPE_CUSTOMER => Customer::find($this->scope_id),
            default => null,
        };
    }

    // ─────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────

    /**
     * Active rules only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Rules for a specific scope.
     */
    public function scopeForScope($query, string $scope, ?int $scopeId = null)
    {
        $query->where('scope', $scope);
        
        if ($scopeId !== null) {
            $query->where('scope_id', $scopeId);
        }

        return $query;
    }

    /**
     * Order by priority (highest first).
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    /**
     * Get the target tier as ModelTier enum.
     */
    public function getTargetTierEnum(): ModelTier
    {
        return ModelTier::fromString($this->target_tier, ModelTier::STANDARD);
    }

    /**
     * Check if rule is currently active (not expired).
     */
    public function isCurrentlyActive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Get human-readable scope label.
     */
    public function getScopeLabel(): string
    {
        $entity = $this->scopedEntity();
        
        return match ($this->scope) {
            self::SCOPE_GLOBAL => 'All requests',
            self::SCOPE_PLAN => $entity ? "Plan: {$entity->name}" : "Plan #{$this->scope_id}",
            self::SCOPE_FEATURE => $entity ? "Feature: {$entity->name}" : "Feature #{$this->scope_id}",
            self::SCOPE_CUSTOMER => $entity ? "Customer: {$entity->name}" : "Customer #{$this->scope_id}",
            self::SCOPE_SEGMENT => 'Segment: ' . ($this->conditions['segment'][0] ?? 'Unknown'),
            default => 'Unknown scope',
        };
    }

    /**
     * Get human-readable rule description.
     */
    public function getFullDescription(): string
    {
        $tierLabel = $this->getTargetTierEnum()->label();
        $actionVerb = match ($this->action) {
            self::ACTION_ALLOW => 'grants',
            self::ACTION_RESTRICT => 'limits to',
            self::ACTION_UPGRADE => 'upgrades to',
            self::ACTION_DOWNGRADE => 'downgrades to',
            default => 'sets',
        };

        return "{$this->getScopeLabel()} {$actionVerb} {$tierLabel} tier";
    }

    /**
     * Convert to array for API responses.
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description ?? $this->getFullDescription(),
            'scope' => $this->scope,
            'scope_label' => $this->getScopeLabel(),
            'target_tier' => $this->target_tier,
            'target_tier_label' => $this->getTargetTierEnum()->label(),
            'action' => $this->action,
            'priority' => $this->priority,
            'conditions' => $this->conditions,
            'is_active' => $this->isCurrentlyActive(),
            'expires_at' => $this->expires_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Factory methods for common rule types
    // ─────────────────────────────────────────────────────────

    /**
     * Create a plan tier restriction rule.
     */
    public static function forPlanTier(
        int $organizationId,
        int $planId,
        string $maxTier,
        ?string $name = null
    ): self {
        $plan = Plan::find($planId);
        
        return new self([
            'organization_id' => $organizationId,
            'name' => $name ?? "Plan tier limit: {$plan?->name}",
            'description' => "Restricts plan '{$plan?->name}' to {$maxTier} tier models",
            'scope' => self::SCOPE_PLAN,
            'scope_id' => $planId,
            'target_tier' => $maxTier,
            'action' => self::ACTION_RESTRICT,
            'priority' => 100,
            'is_active' => true,
        ]);
    }

    /**
     * Create a feature minimum tier rule.
     */
    public static function forFeatureMinTier(
        int $organizationId,
        int $featureId,
        string $minTier,
        ?string $name = null
    ): self {
        $feature = Feature::find($featureId);
        
        return new self([
            'organization_id' => $organizationId,
            'name' => $name ?? "Feature requirement: {$feature?->name}",
            'description' => "Feature '{$feature?->name}' requires minimum {$minTier} tier",
            'scope' => self::SCOPE_FEATURE,
            'scope_id' => $featureId,
            'target_tier' => $minTier,
            'action' => self::ACTION_UPGRADE,
            'priority' => 150, // Higher than plan rules
            'is_active' => true,
        ]);
    }

    /**
     * Create a customer VIP access rule.
     */
    public static function forVIPCustomer(
        int $organizationId,
        int $customerId,
        string $grantedTier = 'premium',
        ?string $name = null
    ): self {
        $customer = Customer::find($customerId);
        
        return new self([
            'organization_id' => $organizationId,
            'name' => $name ?? "VIP access: {$customer?->name}",
            'description' => "Grants {$grantedTier} tier access to VIP customer",
            'scope' => self::SCOPE_CUSTOMER,
            'scope_id' => $customerId,
            'target_tier' => $grantedTier,
            'action' => self::ACTION_ALLOW,
            'priority' => 200, // Highest priority
            'is_active' => true,
        ]);
    }

    /**
     * Create a segment-based rule.
     */
    public static function forSegment(
        int $organizationId,
        string $segment,
        string $tier,
        string $action = self::ACTION_RESTRICT
    ): self {
        return new self([
            'organization_id' => $organizationId,
            'name' => "Segment rule: {$segment}",
            'description' => ucfirst($action) . "s {$segment} segment to {$tier} tier",
            'scope' => self::SCOPE_SEGMENT,
            'target_tier' => $tier,
            'action' => $action,
            'conditions' => ['segment' => [$segment]],
            'priority' => 80,
            'is_active' => true,
        ]);
    }
}
