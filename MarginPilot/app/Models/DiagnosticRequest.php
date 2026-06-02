<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Diagnostic request / lead capture model.
 *
 * Stores public diagnostic submissions and generated audit reports.
 * Central to the GTM funnel: Diagnostic → Mini Audit → Full Audit → Proxy → Subscription
 *
 * organization_id is nullable: the form is public (unauthenticated).
 * It is linked lazily in AuditIAController when the user visits the dashboard,
 * or immediately in AuditController::store() when the submitter is authenticated.
 *
 * @property int $id
 * @property ?int $organization_id
 * @property string $email
 * @property string $company_name
 * @property ?string $contact_name
 * @property ?string $phone
 * @property string $provider
 * @property string $primary_model
 * @property string $volume_tier
 * @property string $use_case
 * @property string $pricing_model
 * @property array $plans
 * @property ?float $current_monthly_spend
 * @property ?int $customer_count
 * @property ?string $industry
 * @property ?int $risk_score
 * @property ?string $risk_level
 * @property ?array $risk_breakdown
 * @property ?array $audit_report
 * @property ?array $policy_recommendations
 * @property ?float $estimated_monthly_cost
 * @property ?float $estimated_waste
 * @property ?float $potential_savings
 * @property string $status
 * @property string $source
 * @property bool $requested_full_audit
 * @property bool $requested_demo
 */
class DiagnosticRequest extends Model
{
    use HasFactory;

    // Status constants
    public const STATUS_NEW = 'new';
    public const STATUS_CONTACTED = 'contacted';
    public const STATUS_QUALIFIED = 'qualified';
    public const STATUS_CONVERTED = 'converted';
    public const STATUS_LOST = 'lost';

    // Risk level constants
    public const RISK_LOW = 'low';
    public const RISK_MODERATE = 'moderate';
    public const RISK_HIGH = 'high';
    public const RISK_CRITICAL = 'critical';

    protected $fillable = [
        'organization_id',
        'access_token',
        'email',
        'company_name',
        'contact_name',
        'phone',
        'provider',
        'primary_model',
        'volume_tier',
        'use_case',
        'pricing_model',
        'plans',
        'current_monthly_spend',
        'customer_count',
        'industry',
        'risk_score',
        'risk_level',
        'risk_breakdown',
        'audit_report',
        'policy_recommendations',
        'estimated_monthly_cost',
        'estimated_waste',
        'potential_savings',
        'status',
        'source',
        'utm_source',
        'utm_campaign',
        'utm_medium',
        'requested_full_audit',
        'requested_demo',
        'contacted_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'plans' => 'array',
            'risk_breakdown' => 'array',
            'audit_report' => 'array',
            'policy_recommendations' => 'array',
            'current_monthly_spend' => 'decimal:2',
            'estimated_monthly_cost' => 'decimal:2',
            'estimated_waste' => 'decimal:2',
            'potential_savings' => 'decimal:2',
            'requested_full_audit' => 'boolean',
            'requested_demo' => 'boolean',
            'contacted_at' => 'datetime',
        ];
    }

    // ─────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────

    public function scopeNew($query)
    {
        return $query->where('status', self::STATUS_NEW);
    }

    public function scopeHighRisk($query)
    {
        return $query->whereIn('risk_level', [self::RISK_HIGH, self::RISK_CRITICAL]);
    }

    public function scopeQualified($query)
    {
        return $query->where('status', self::STATUS_QUALIFIED);
    }

    public function scopeRequestedAudit($query)
    {
        return $query->where('requested_full_audit', true);
    }

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    /**
     * Check if this is a high-value lead.
     */
    public function isHighValue(): bool
    {
        // High volume + high risk = high value lead
        $highVolume = in_array($this->volume_tier, ['50k-100k', '100k+']);
        $highRisk = in_array($this->risk_level, [self::RISK_HIGH, self::RISK_CRITICAL]);
        $hasEnterprise = in_array('enterprise', $this->plans ?? []);
        
        return ($highVolume && $highRisk) || $hasEnterprise;
    }

    /**
     * Get the risk level label for display.
     */
    public function getRiskLevelLabel(): string
    {
        return match ($this->risk_level) {
            self::RISK_LOW => 'Faible',
            self::RISK_MODERATE => 'Modéré',
            self::RISK_HIGH => 'Élevé',
            self::RISK_CRITICAL => 'Critique',
            default => 'Non évalué',
        };
    }

    /**
     * Get the risk level color class.
     */
    public function getRiskLevelColor(): string
    {
        return match ($this->risk_level) {
            self::RISK_LOW => 'emerald',
            self::RISK_MODERATE => 'sky',
            self::RISK_HIGH => 'amber',
            self::RISK_CRITICAL => 'red',
            default => 'slate',
        };
    }

    /**
     * Mark as contacted.
     */
    public function markContacted(): void
    {
        $this->update([
            'status' => self::STATUS_CONTACTED,
            'contacted_at' => now(),
        ]);
    }

    /**
     * Convert to public API response.
     */
    public function toPublicArray(): array
    {
        return [
            'token' => $this->access_token,
            'company' => $this->company_name,
            'risk_score' => $this->risk_score,
            'risk_level' => $this->risk_level,
            'risk_level_label' => $this->getRiskLevelLabel(),
            'estimated_monthly_cost' => $this->estimated_monthly_cost,
            'estimated_waste' => $this->estimated_waste,
            'potential_savings' => $this->potential_savings,
            'risk_breakdown' => $this->risk_breakdown,
            'policy_recommendations' => $this->policy_recommendations,
            'audit_report' => $this->audit_report,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
