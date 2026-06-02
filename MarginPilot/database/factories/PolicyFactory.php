<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Policy;
use Illuminate\Database\Eloquent\Factories\Factory;

class PolicyFactory extends Factory
{
    protected $model = Policy::class;

    public function definition(): array
    {
        $types = ['budget_cap', 'alert_threshold', 'fallback_model', 'premium_model_restriction'];
        $scopes = ['organization', 'plan', 'customer', 'feature'];
        $type = fake()->randomElement($types);

        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->sentence(3),
            'type' => $type,
            'scope' => fake()->randomElement($scopes),
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
            'enforcement_mode' => Policy::MODE_ENFORCE,
            'conditions' => match ($type) {
                'budget_cap' => ['threshold' => fake()->randomFloat(2, 50, 500)],
                'alert_threshold' => ['threshold' => fake()->randomFloat(2, 10, 100)],
                default => [],
            },
            'actions' => match ($type) {
                'fallback_model' => ['fallback_model' => 'gpt-4o-mini'],
                'premium_model_restriction' => [
                    'enforcement' => fake()->randomElement(['block', 'fallback']),
                    'fallback_model' => 'gpt-4o-mini',
                ],
                default => [],
            },
        ];
    }

    public function budgetCap(float $threshold = 100): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Plafond budget',
            'type' => 'budget_cap',
            'scope' => 'organization',
            'conditions' => ['threshold' => $threshold],
        ]);
    }

    public function premiumRestriction(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Restriction modèle premium',
            'type' => 'premium_model_restriction',
            'scope' => 'plan',
            'actions' => ['enforcement' => 'block'],
        ]);
    }

    public function fallback(string $model = 'gpt-4o-mini'): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Fallback automatique',
            'type' => 'fallback_model',
            'scope' => 'organization',
            'actions' => [
                'enforcement' => 'fallback',
                'fallback_model' => $model,
            ],
        ]);
    }

    public function observe(): static
    {
        return $this->state(fn (array $attributes) => [
            'enforcement_mode' => Policy::MODE_OBSERVE,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
