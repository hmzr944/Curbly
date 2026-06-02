<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    protected $fillable = [
        'organization_id',
        'name',
        'key_hash',
        'prefix',
        'last_used_at',
        'is_active',
    ];

    /**
     * Never expose the hash — not in JSON, not in array casts, not anywhere.
     */
    protected $hidden = ['key_hash'];

    protected $casts = [
        'last_used_at' => 'datetime',
        'is_active'    => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
