<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    protected $fillable = [
        'organization_id',
        'email',
        'role',
        'token',
        'invited_by_name',
        'accepted_at',
        'expires_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at'  => 'datetime',
    ];

    // ── Scopes ────────────────────────────────────────────────────

    /** Only invitations that have not been accepted and have not expired. */
    public function scopePending($query)
    {
        return $query->whereNull('accepted_at')
                     ->where(fn ($q) => $q->whereNull('expires_at')
                                          ->orWhere('expires_at', '>', now()));
    }

    // ── Relations ─────────────────────────────────────────────────

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    // ── Helpers ───────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->accepted_at === null
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
