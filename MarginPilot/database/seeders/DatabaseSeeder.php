<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Plan;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $organization = Organization::query()->create([
            'name' => 'Margexa Demo Support',
            'slug' => 'Margexa-demo-support',
            'monthly_budget_cap' => 2000,
            'settings' => [
                'currency' => 'USD',
                'timezone' => 'Europe/Paris',
            ],
        ]);

        Plan::query()->insert([
            [
                'organization_id' => $organization->id,
                'name' => 'Basic',
                'tier' => 'low',
                'monthly_price' => 49,
                'monthly_ai_budget' => 150,
                'allow_premium_models' => false,
                'fallback_model' => 'gpt-4o-mini',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'organization_id' => $organization->id,
                'name' => 'Pro',
                'tier' => 'mid',
                'monthly_price' => 149,
                'monthly_ai_budget' => 450,
                'allow_premium_models' => true,
                'fallback_model' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'organization_id' => $organization->id,
                'name' => 'Enterprise',
                'tier' => 'high',
                'monthly_price' => 499,
                'monthly_ai_budget' => 1400,
                'allow_premium_models' => true,
                'fallback_model' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        User::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Margexa Admin',
            'email' => 'admin@Margexa.local',
        ]);

        $this->call([
            MargexaDemoSeeder::class,
        ]);
    }
}
