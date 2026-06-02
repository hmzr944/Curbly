<?php

namespace App\Models;

use App\Services\Routing\ModelTier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'name',
        'tier',
        'monthly_price',
        'monthly_ai_budget',
        'allow_premium_models',
        'fallback_model',
        'max_model_tier',
    ];

    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'monthly_ai_budget' => 'decimal:2',
            'allow_premium_models' => 'boolean',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function aiRequests(): HasMany
    {
        return $this->hasMany(AIRequest::class);
    }

    // ─────────────────────────────────────────────────────────
    // Routing helpers
    // ─────────────────────────────────────────────────────────

    /**
     * Get the maximum model tier allowed for this plan.
     */
    public function getMaxModelTierEnum(): ModelTier
    {
        // Use explicit max_model_tier if set
        if (isset($this->max_model_tier)) {
            return ModelTier::fromString($this->max_model_tier, ModelTier::STANDARD);
        }

        // Legacy: derive from allow_premium_models
        if ($this->allow_premium_models) {
            return ModelTier::PREMIUM;
        }

        // Derive from plan tier name
        return match ($this->tier) {
            'free' => ModelTier::ECONOMY,
            'starter', 'basic' => ModelTier::STANDARD,
            'pro', 'professional' => ModelTier::PREMIUM,
            'enterprise', 'unlimited' => ModelTier::FLAGSHIP,
            default => ModelTier::STANDARD,
        };
    }

    /**
     * Check if a model tier is allowed for this plan.
     */
    public function allowsTier(ModelTier $tier): bool
    {
        return $tier->isAtOrBelow($this->getMaxModelTierEnum());
    }

    /**
     * Check if a specific model is allowed for this plan.
     */
    public function allowsModel(string $model): bool
    {
        $modelTier = ModelTier::forModel($model);
        return $this->allowsTier($modelTier);
    }

    /**
     * Get the effective fallback model for this plan.
     */
    public function getEffectiveFallbackModel(): string
    {
        if ($this->fallback_model) {
            return $this->fallback_model;
        }

        return $this->getMaxModelTierEnum()->defaultFallbackModel();
    }
}
