<?php

namespace App\Services\Routing;

enum ModelTier: string
{
    case ECONOMY = 'economy';
    case STANDARD = 'standard';
    case PREMIUM = 'premium';
    case FLAGSHIP = 'flagship';

    public function weight(): int
    {
        return match ($this) {
            self::ECONOMY => 1,
            self::STANDARD => 2,
            self::PREMIUM => 3,
            self::FLAGSHIP => 4,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::ECONOMY => 'Economy',
            self::STANDARD => 'Standard',
            self::PREMIUM => 'Premium',
            self::FLAGSHIP => 'Flagship',
        };
    }

    public function isAtOrBelow(ModelTier $other): bool
    {
        return $this->weight() <= $other->weight();
    }

    public function exceeds(ModelTier $other): bool
    {
        return $this->weight() > $other->weight();
    }

    public static function fromString(?string $value, ModelTier $default = self::STANDARD): self
    {
        if ($value === null) {
            return $default;
        }

        return self::tryFrom(strtolower($value)) ?? $default;
    }

    public static function forModel(string $model): self
    {
        return match (strtolower($model)) {
            'gpt-4o-mini', 'claude-3-5-haiku' => self::ECONOMY,
            'gpt-4o', 'claude-3-5-sonnet' => self::PREMIUM,
            default => self::STANDARD,
        };
    }

    public function defaultFallbackModel(): string
    {
        return match ($this) {
            self::ECONOMY => 'gpt-4o-mini',
            self::STANDARD => 'gpt-4o-mini',
            self::PREMIUM => 'gpt-4o',
            self::FLAGSHIP => 'gpt-4o',
        };
    }

    public function allowedTiers(): array
    {
        return array_filter(
            self::cases(),
            fn (ModelTier $tier) => $tier->isAtOrBelow($this)
        );
    }
}
