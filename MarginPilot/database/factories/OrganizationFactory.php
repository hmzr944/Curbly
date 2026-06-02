<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'monthly_budget_cap' => fake()->randomFloat(2, 100, 10000),
            'settings' => [
                'currency' => 'EUR',
                'timezone' => 'Europe/Paris',
            ],
            'notification_settings' => [
                'policy_triggers' => [
                    'email_enabled' => false,
                    'notify_on_blocked' => true,
                    'notify_on_fallback' => true,
                    'notify_on_observed' => false,
                    'email_recipients' => [],
                ],
            ],
        ];
    }
}
