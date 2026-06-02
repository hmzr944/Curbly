<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        $tiers = ['entry', 'mid', 'premium', 'enterprise'];
        $tier = fake()->randomElement($tiers);
        $name = ucfirst($tier) . ' Plan';

        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'tier' => $tier,
            'monthly_price' => match ($tier) {
                'entry' => fake()->randomFloat(2, 9, 29),
                'mid' => fake()->randomFloat(2, 49, 99),
                'premium' => fake()->randomFloat(2, 149, 299),
                'enterprise' => fake()->randomFloat(2, 499, 999),
            },
            'monthly_ai_budget' => match ($tier) {
                'entry' => fake()->randomFloat(2, 5, 15),
                'mid' => fake()->randomFloat(2, 20, 50),
                'premium' => fake()->randomFloat(2, 75, 150),
                'enterprise' => fake()->randomFloat(2, 200, 500),
            },
            'allow_premium_models' => in_array($tier, ['premium', 'enterprise']),
            'fallback_model' => 'gpt-4o-mini',
        ];
    }

    public function entry(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'entry',
            'name' => 'Starter',
            'monthly_price' => 29,
            'monthly_ai_budget' => 10,
            'allow_premium_models' => false,
        ]);
    }

    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'premium',
            'name' => 'Premium',
            'monthly_price' => 199,
            'monthly_ai_budget' => 100,
            'allow_premium_models' => true,
        ]);
    }

    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'enterprise',
            'name' => 'Enterprise',
            'monthly_price' => 599,
            'monthly_ai_budget' => 300,
            'allow_premium_models' => true,
        ]);
    }
}
