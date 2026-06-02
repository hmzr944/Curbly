<?php

namespace Database\Factories;

use App\Models\Feature;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Feature>
 */
class FeatureFactory extends Factory
{
    protected $model = Feature::class;

    public function definition(): array
    {
        $name = fake()->randomElement([
            'Live Chat',
            'Document Summarization',
            'Email Automation',
            'Data Analysis',
            'Content Generation',
            'Code Assistant',
        ]);

        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'model_tier' => fake()->randomElement(['economy', 'standard', 'premium']),
            'fallback_model' => 'gpt-4o-mini',
            'monthly_budget_cap' => fake()->optional()->randomFloat(2, 100, 5000),
            'is_active' => true,
            'metadata' => [],
        ];
    }

    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_tier' => 'premium',
            'fallback_model' => 'gpt-4o',
        ]);
    }

    public function economy(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_tier' => 'economy',
            'fallback_model' => 'gpt-4o-mini',
        ]);
    }
}
