<?php

namespace Database\Factories;

use App\Models\AIRequest;
use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AIRequest>
 */
class AIRequestFactory extends Factory
{
    protected $model = AIRequest::class;

    public function definition(): array
    {
        $model = fake()->randomElement(['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'claude-3-5-haiku']);
        $provider = str_contains($model, 'gpt') ? 'openai' : 'anthropic';
        $promptTokens = fake()->numberBetween(100, 5000);
        $completionTokens = fake()->numberBetween(50, 2000);

        return [
            'organization_id' => Organization::factory(),
            'customer_id' => null,
            'plan_id' => null,
            'feature_id' => null,
            'provider' => $provider,
            'requested_provider' => $provider,
            'model' => $model,
            'requested_model' => $model,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'estimated_cost' => $this->estimateCost($provider, $model, $promptTokens, $completionTokens),
            'policy_triggered' => false,
            'policy_trigger_reason' => null,
            'enforcement_action' => null,
            'enforcement_reason' => null,
            'workflow_name' => fake()->optional()->randomElement(['chat', 'summary', 'analysis']),
            'attribution_status' => 'full',
            'attribution_score' => fake()->numberBetween(80, 100),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    private function estimateCost(string $provider, string $model, int $promptTokens, int $completionTokens): float
    {
        $rates = [
            'openai:gpt-4o-mini' => ['input' => 0.00015, 'output' => 0.0006],
            'openai:gpt-4o' => ['input' => 0.0025, 'output' => 0.01],
            'anthropic:claude-3-5-haiku' => ['input' => 0.0008, 'output' => 0.004],
            'anthropic:claude-3-5-sonnet' => ['input' => 0.003, 'output' => 0.015],
        ];

        $key = "{$provider}:{$model}";
        $rate = $rates[$key] ?? ['input' => 0.001, 'output' => 0.002];

        return round(($promptTokens / 1000) * $rate['input'] + ($completionTokens / 1000) * $rate['output'], 6);
    }

    public function blocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'policy_triggered' => true,
            'policy_trigger_reason' => 'model_blocked',
            'enforcement_action' => 'blocked',
            'completion_tokens' => 0,
            'estimated_cost' => 0,
        ]);
    }

    public function fallback(): static
    {
        return $this->state(fn (array $attributes) => [
            'policy_triggered' => true,
            'policy_trigger_reason' => 'fallback_applied',
            'enforcement_action' => 'fallback',
            'requested_model' => 'gpt-4o',
            'model' => 'gpt-4o-mini',
        ]);
    }

    public function withCustomer(?Customer $customer = null): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_id' => $customer?->id ?? Customer::factory(),
            'attribution_status' => 'full',
        ]);
    }

    public function withPlan(?Plan $plan = null): static
    {
        return $this->state(fn (array $attributes) => [
            'plan_id' => $plan?->id ?? Plan::factory(),
        ]);
    }

    public function withFeature(?Feature $feature = null): static
    {
        return $this->state(fn (array $attributes) => [
            'feature_id' => $feature?->id ?? Feature::factory(),
        ]);
    }
}
