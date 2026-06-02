<?php

namespace App\Services\Routing;

/**
 * Explainable routing decision.
 * 
 * This DTO captures the complete reasoning chain for a routing decision,
 * making the economic router fully transparent and auditable.
 */
final class RoutingDecision
{
    /**
     * Decision outcomes.
     */
    public const OUTCOME_ALLOWED = 'allowed';
    public const OUTCOME_DOWNGRADED = 'downgraded';
    public const OUTCOME_BLOCKED = 'blocked';
    public const OUTCOME_ESCALATED = 'escalated';

    /**
     * @param string $outcome The final decision (allowed, downgraded, blocked, escalated)
     * @param string $requestedModel The model originally requested
     * @param string $routedModel The model after routing decision
     * @param ModelTier $requestedTier Tier of the requested model
     * @param ModelTier $allowedTier Maximum tier allowed for this context
     * @param ModelTier $routedTier Tier of the routed model
     * @param array<string> $reasonChain Ordered list of reasoning steps
     * @param array $context Context factors that influenced the decision
     * @param float $estimatedSavings Estimated cost savings from downgrade (if any)
     * @param bool $wasEscalated Whether an escalation rule was applied
     * @param ?string $escalationReason Why escalation was granted (if applicable)
     */
    public function __construct(
        public readonly string $outcome,
        public readonly string $requestedModel,
        public readonly string $routedModel,
        public readonly ModelTier $requestedTier,
        public readonly ModelTier $allowedTier,
        public readonly ModelTier $routedTier,
        public readonly array $reasonChain,
        public readonly array $context,
        public readonly float $estimatedSavings = 0.0,
        public readonly bool $wasEscalated = false,
        public readonly ?string $escalationReason = null,
    ) {
    }

    /**
     * Create an "allowed" decision (model passes as-is).
     */
    public static function allowed(
        string $model,
        ModelTier $tier,
        array $reasonChain,
        array $context = []
    ): self {
        return new self(
            outcome: self::OUTCOME_ALLOWED,
            requestedModel: $model,
            routedModel: $model,
            requestedTier: $tier,
            allowedTier: $tier,
            routedTier: $tier,
            reasonChain: $reasonChain,
            context: $context,
        );
    }

    /**
     * Create a "downgraded" decision (model replaced with cheaper option).
     */
    public static function downgraded(
        string $requestedModel,
        string $routedModel,
        ModelTier $requestedTier,
        ModelTier $allowedTier,
        array $reasonChain,
        array $context = [],
        float $estimatedSavings = 0.0
    ): self {
        return new self(
            outcome: self::OUTCOME_DOWNGRADED,
            requestedModel: $requestedModel,
            routedModel: $routedModel,
            requestedTier: $requestedTier,
            allowedTier: $allowedTier,
            routedTier: ModelTier::forModel($routedModel),
            reasonChain: $reasonChain,
            context: $context,
            estimatedSavings: $estimatedSavings,
        );
    }

    /**
     * Create a "blocked" decision (request denied).
     */
    public static function blocked(
        string $requestedModel,
        ModelTier $requestedTier,
        ModelTier $allowedTier,
        array $reasonChain,
        array $context = []
    ): self {
        return new self(
            outcome: self::OUTCOME_BLOCKED,
            requestedModel: $requestedModel,
            routedModel: $requestedModel, // No routing, request blocked
            requestedTier: $requestedTier,
            allowedTier: $allowedTier,
            routedTier: $requestedTier,
            reasonChain: $reasonChain,
            context: $context,
        );
    }

    /**
     * Create an "escalated" decision (premium access granted via escalation rule).
     */
    public static function escalated(
        string $model,
        ModelTier $requestedTier,
        ModelTier $normalAllowedTier,
        string $escalationReason,
        array $reasonChain,
        array $context = []
    ): self {
        return new self(
            outcome: self::OUTCOME_ESCALATED,
            requestedModel: $model,
            routedModel: $model,
            requestedTier: $requestedTier,
            allowedTier: $requestedTier, // Escalation grants the requested tier
            routedTier: $requestedTier,
            reasonChain: $reasonChain,
            context: $context,
            wasEscalated: true,
            escalationReason: $escalationReason,
        );
    }

    /**
     * Whether the model was modified by routing.
     */
    public function wasRerouted(): bool
    {
        return $this->requestedModel !== $this->routedModel;
    }

    /**
     * Whether the request was allowed (including escalated).
     */
    public function isAllowed(): bool
    {
        return in_array($this->outcome, [self::OUTCOME_ALLOWED, self::OUTCOME_ESCALATED, self::OUTCOME_DOWNGRADED], true);
    }

    /**
     * Get human-readable summary of the decision.
     */
    public function getSummary(): string
    {
        return match ($this->outcome) {
            self::OUTCOME_ALLOWED => "Request allowed: {$this->routedModel} ({$this->routedTier->label()} tier)",
            self::OUTCOME_DOWNGRADED => "Downgraded from {$this->requestedModel} to {$this->routedModel} (saves \${$this->estimatedSavings})",
            self::OUTCOME_BLOCKED => "Request blocked: {$this->requestedTier->label()} tier not allowed",
            self::OUTCOME_ESCALATED => "Escalated to {$this->routedTier->label()} tier: {$this->escalationReason}",
            default => "Unknown decision outcome",
        };
    }

    /**
     * Get the complete explanation as formatted text.
     */
    public function getExplanation(): string
    {
        $lines = ["Routing Decision: {$this->getSummary()}", "", "Reasoning:"];
        
        foreach ($this->reasonChain as $i => $reason) {
            $lines[] = "  " . ($i + 1) . ". {$reason}";
        }

        if ($this->context !== []) {
            $lines[] = "";
            $lines[] = "Context:";
            foreach ($this->context as $key => $value) {
                $displayValue = is_array($value) ? json_encode($value) : $value;
                $lines[] = "  - {$key}: {$displayValue}";
            }
        }

        return implode("\n", $lines);
    }

    /**
     * Convert to array for API responses.
     */
    public function toArray(): array
    {
        return [
            'outcome' => $this->outcome,
            'requested_model' => $this->requestedModel,
            'routed_model' => $this->routedModel,
            'requested_tier' => $this->requestedTier->value,
            'allowed_tier' => $this->allowedTier->value,
            'routed_tier' => $this->routedTier->value,
            'reason_chain' => $this->reasonChain,
            'context' => $this->context,
            'estimated_savings' => round($this->estimatedSavings, 6),
            'was_escalated' => $this->wasEscalated,
            'escalation_reason' => $this->escalationReason,
            'summary' => $this->getSummary(),
        ];
    }

    /**
     * Compact array for response headers.
     */
    public function toCompactArray(): array
    {
        return [
            'outcome' => $this->outcome,
            'model' => $this->routedModel,
            'tier' => $this->routedTier->value,
            'reason' => $this->reasonChain[0] ?? 'Routing applied',
        ];
    }
}
