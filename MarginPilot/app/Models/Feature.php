<?php

namespace App\Models;

use App\Services\Routing\ModelTier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'active',
        'min_model_tier',
        'routing_config',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'routing_config' => 'array',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function aiRequests(): HasMany
    {
        return $this->hasMany(AIRequest::class);
    }

    // ─────────────────────────────────────────────────────────
    // Routing helpers
    // ─────────────────────────────────────────────────────────

    /**
     * Get the minimum model tier required for this feature.
     */
    public function getMinModelTierEnum(): ?ModelTier
    {
        if (! $this->min_model_tier) {
            return null;
        }

        return ModelTier::fromString($this->min_model_tier);
    }

    /**
     * Check if this feature has routing requirements.
     */
    public function hasRoutingRequirements(): bool
    {
        return $this->min_model_tier !== null || ! empty($this->routing_config);
    }

    /**
     * Get routing configuration value.
     */
    public function getRoutingConfig(string $key, mixed $default = null): mixed
    {
        return $this->routing_config[$key] ?? $default;
    }

    /**
     * Check if feature requires premium tier or above.
     */
    public function requiresPremium(): bool
    {
        $minTier = $this->getMinModelTierEnum();
        
        if (! $minTier) {
            return false;
        }

        return $minTier->exceeds(ModelTier::STANDARD);
    }
}
