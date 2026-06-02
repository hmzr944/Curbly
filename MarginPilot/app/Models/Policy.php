<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Policy extends Model
{
    use HasFactory;

    public const MODE_ENFORCE = 'enforce';
    public const MODE_OBSERVE = 'observe';

    protected $fillable = [
        'organization_id',
        'name',
        'type',
        'scope',
        'description',
        'is_active',
        'enforcement_mode',
        'conditions',
        'actions',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'conditions' => 'array',
            'actions' => 'array',
        ];
    }

    /**
     * Vérifie si la policy est en mode observation.
     */
    public function isObserveMode(): bool
    {
        return $this->enforcement_mode === self::MODE_OBSERVE;
    }

    /**
     * Vérifie si la policy applique réellement les actions.
     */
    public function isEnforceMode(): bool
    {
        return $this->enforcement_mode === self::MODE_ENFORCE;
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function triggers(): HasMany
    {
        return $this->hasMany(PolicyTrigger::class);
    }
}
