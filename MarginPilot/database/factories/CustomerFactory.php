<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Organization;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'external_id' => Str::uuid()->toString(),
            'name' => fake()->company(),
            'plan_id' => null,
            'active' => true,
        ];
    }

    public function withPlan(?Plan $plan = null): static
    {
        return $this->state(fn (array $attributes) => [
            'plan_id' => $plan?->id ?? Plan::factory(),
        ]);
    }
}
