<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'plan_id',
        'name',
        'external_id',
        'email',
        'active',
        'stripe_customer_id',
        'monthly_revenue',
        'revenue_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'active'            => 'boolean',
            'monthly_revenue'   => 'decimal:4',
            'revenue_synced_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function aiRequests(): HasMany
    {
        return $this->hasMany(AIRequest::class);
    }
}
