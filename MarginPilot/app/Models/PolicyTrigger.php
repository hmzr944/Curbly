<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolicyTrigger extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'policy_id',
        'ai_request_id',
        'attempt_uuid',
        'customer_id',
        'plan_id',
        'feature_id',
        'target_label',
        'reason',
        'impacted_cost',
        'estimated_cost_avoided',
        'triggered_at',
        'is_observed',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'impacted_cost' => 'decimal:6',
            'estimated_cost_avoided' => 'decimal:6',
            'triggered_at' => 'datetime',
            'is_observed' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function policy(): BelongsTo
    {
        return $this->belongsTo(Policy::class);
    }

    public function aiRequest(): BelongsTo
    {
        return $this->belongsTo(AIRequest::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }
}
