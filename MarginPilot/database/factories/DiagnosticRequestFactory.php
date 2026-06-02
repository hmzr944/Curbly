<?php

namespace Database\Factories;

use App\Models\DiagnosticRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DiagnosticRequest>
 */
class DiagnosticRequestFactory extends Factory
{
    protected $model = DiagnosticRequest::class;

    public function definition(): array
    {
        return [
            'access_token' => bin2hex(random_bytes(32)),
            'email' => fake()->companyEmail(),
            'company_name' => fake()->company(),
            'contact_name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'provider' => fake()->randomElement(['openai', 'anthropic', 'both']),
            'primary_model' => fake()->randomElement(['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet']),
            'volume_tier' => fake()->randomElement(['< 10k req/mois', '10k – 50k', '50k – 100k', '100k+']),
            'use_case' => fake()->randomElement(['support_client', 'assistant_sav', 'auto_reponse_ticket', 'copilote_support']),
            'pricing_model' => fake()->randomElement(['flat', 'usage', 'hybrid']),
            'plans' => fake()->randomElements(['Free', 'Basic', 'Pro', 'Enterprise'], rand(1, 3)),
            'current_monthly_spend' => fake()->optional()->randomFloat(2, 500, 50000),
            'customer_count' => fake()->optional()->numberBetween(10, 10000),
            'industry' => fake()->optional()->randomElement(['SaaS', 'E-commerce', 'Fintech', 'Healthcare']),
            'risk_score' => fake()->numberBetween(0, 100),
            'risk_level' => fake()->randomElement([
                DiagnosticRequest::RISK_LOW,
                DiagnosticRequest::RISK_MODERATE,
                DiagnosticRequest::RISK_HIGH,
                DiagnosticRequest::RISK_CRITICAL,
            ]),
            'risk_breakdown' => [],
            'audit_report' => [],
            'policy_recommendations' => $this->generateRecommendations(),
            'estimated_monthly_cost' => fake()->randomFloat(2, 500, 10000),
            'estimated_waste' => fake()->randomFloat(2, 100, 3000),
            'potential_savings' => fake()->randomFloat(2, 100, 2000),
            'status' => DiagnosticRequest::STATUS_NEW,
            'source' => 'factory',
            'requested_full_audit' => false,
            'requested_demo' => false,
        ];
    }

    private function generateRecommendations(): array
    {
        return [
            [
                'priority' => 'high',
                'action' => 'Implémenter des policies de fallback',
                'impact' => 'Réduction de 30% des coûts',
            ],
            [
                'priority' => 'medium',
                'action' => 'Plafonner les requêtes par plan',
                'impact' => 'Protection de la marge',
            ],
        ];
    }

    public function highRisk(): static
    {
        return $this->state(fn (array $attributes) => [
            'risk_level' => DiagnosticRequest::RISK_HIGH,
            'risk_score' => fake()->numberBetween(70, 100),
        ]);
    }

    public function qualified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DiagnosticRequest::STATUS_QUALIFIED,
            'requested_full_audit' => true,
        ]);
    }
}
