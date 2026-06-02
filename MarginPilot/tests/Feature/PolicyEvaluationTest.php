<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Plan;
use App\Models\Policy;
use App\Models\User;
use App\Services\CostEstimatorService;
use App\Services\PolicyEvaluationService;
use App\Services\PreflightContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicyEvaluationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private Plan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::factory()->create([
            'name' => 'Test Org',
            'monthly_budget_cap' => 1000,
        ]);

        $this->plan = Plan::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Starter',
            'tier' => 'entry',
            'monthly_price' => 29,
            'allow_premium_models' => false,
        ]);
    }

    private function makeService(): PolicyEvaluationService
    {
        return new PolicyEvaluationService(app(CostEstimatorService::class));
    }

    private function makeContext(array $overrides = []): PreflightContext
    {
        $provider = $overrides['provider'] ?? 'openai';
        $model = $overrides['model'] ?? 'gpt-4o';
        $promptTokens = $overrides['prompt_tokens'] ?? 1000;
        $completionTokens = $overrides['completion_tokens'] ?? 500;
        
        // Estimate cost for the context
        $costEstimator = app(CostEstimatorService::class);
        $estimatedCost = $costEstimator->estimate($provider, $model, $promptTokens, $completionTokens);
        
        return new PreflightContext(
            organization_id: $overrides['organization_id'] ?? $this->organization->id,
            provider: $provider,
            model: $model,
            prompt_tokens: $promptTokens,
            completion_tokens: $completionTokens,
            estimated_cost: $estimatedCost,
            customer_id: $overrides['customer_id'] ?? null,
            plan_id: $overrides['plan_id'] ?? $this->plan->id ?? null,
            feature_id: $overrides['feature_id'] ?? null,
            plan: $this->plan,
        );
    }

    /** @test */
    public function it_allows_request_when_no_policies_exist(): void
    {
        $service = $this->makeService();
        $ctx = $this->makeContext();

        $result = $service->preflightEvaluate($ctx);

        $this->assertEquals('allowed', $result['action']);
        $this->assertEmpty($result['triggered_policies']);
        $this->assertEmpty($result['observed_policies']);
    }

    /** @test */
    public function it_blocks_premium_model_for_restricted_plan(): void
    {
        Policy::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Restriction modèle premium',
            'type' => 'premium_model_restriction',
            'scope' => 'plan',
            'is_active' => true,
            'enforcement_mode' => Policy::MODE_ENFORCE,
            'actions' => ['enforcement' => 'block'],
        ]);

        $service = $this->makeService();
        $ctx = $this->makeContext(['model' => 'gpt-4o']);

        $result = $service->preflightEvaluate($ctx);

        $this->assertEquals('blocked', $result['action']);
        $this->assertNotEmpty($result['triggered_policies']);
        $this->assertEquals('premium_model_restriction', $result['triggered_policies'][0]['policy_type']);
    }

    /** @test */
    public function it_applies_fallback_when_configured(): void
    {
        Policy::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Fallback vers GPT-4o-mini',
            'type' => 'premium_model_restriction',
            'scope' => 'plan',
            'is_active' => true,
            'enforcement_mode' => Policy::MODE_ENFORCE,
            'actions' => [
                'enforcement' => 'fallback',
                'fallback_model' => 'gpt-4o-mini',
            ],
        ]);

        $service = $this->makeService();
        $ctx = $this->makeContext(['model' => 'gpt-4o']);

        $result = $service->preflightEvaluate($ctx);

        $this->assertEquals('fallback_applied', $result['action']);
        $this->assertEquals('gpt-4o-mini', $result['fallback_model']);
        $this->assertNotEmpty($result['triggered_policies']);
    }

    /** @test */
    public function observe_mode_does_not_block_request(): void
    {
        Policy::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Policy en observation',
            'type' => 'premium_model_restriction',
            'scope' => 'plan',
            'is_active' => true,
            'enforcement_mode' => Policy::MODE_OBSERVE,
            'actions' => ['enforcement' => 'block'],
        ]);

        $service = $this->makeService();
        $ctx = $this->makeContext(['model' => 'gpt-4o']);

        $result = $service->preflightEvaluate($ctx);

        // Should be allowed, not blocked
        $this->assertEquals('allowed', $result['action']);
        
        // But should appear in observed_policies
        $this->assertEmpty($result['triggered_policies']);
        $this->assertNotEmpty($result['observed_policies']);
        $this->assertEquals('would_block', $result['observed_policies'][0]['metadata']['theoretical_action']);
    }

    /** @test */
    public function observe_mode_does_not_apply_fallback(): void
    {
        Policy::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Fallback en observation',
            'type' => 'premium_model_restriction',
            'scope' => 'plan',
            'is_active' => true,
            'enforcement_mode' => Policy::MODE_OBSERVE,
            'actions' => [
                'enforcement' => 'fallback',
                'fallback_model' => 'gpt-4o-mini',
            ],
        ]);

        $service = $this->makeService();
        $ctx = $this->makeContext(['model' => 'gpt-4o']);

        $result = $service->preflightEvaluate($ctx);

        // Should be allowed with original model, no fallback applied
        $this->assertEquals('allowed', $result['action']);
        $this->assertNull($result['fallback_model']);
        
        // But should show theoretical action
        $this->assertNotEmpty($result['observed_policies']);
        $this->assertEquals('would_fallback', $result['observed_policies'][0]['metadata']['theoretical_action']);
    }

    /** @test */
    public function inactive_policy_is_ignored(): void
    {
        Policy::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Policy inactive',
            'type' => 'premium_model_restriction',
            'scope' => 'plan',
            'is_active' => false,
            'enforcement_mode' => Policy::MODE_ENFORCE,
            'actions' => ['enforcement' => 'block'],
        ]);

        $service = $this->makeService();
        $ctx = $this->makeContext(['model' => 'gpt-4o']);

        $result = $service->preflightEvaluate($ctx);

        $this->assertEquals('allowed', $result['action']);
        $this->assertEmpty($result['triggered_policies']);
        $this->assertEmpty($result['observed_policies']);
    }

    /** @test */
    public function budget_cap_blocks_when_exceeded(): void
    {
        // Set a very low budget cap
        $this->organization->update(['monthly_budget_cap' => 0.01]);

        Policy::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Plafond budget',
            'type' => 'budget_cap',
            'scope' => 'organization',
            'is_active' => true,
            'enforcement_mode' => Policy::MODE_ENFORCE,
            'conditions' => ['threshold' => 0.01],
        ]);

        $service = $this->makeService();
        $ctx = $this->makeContext(['model' => 'gpt-4o', 'prompt_tokens' => 10000, 'completion_tokens' => 5000]);

        $result = $service->preflightEvaluate($ctx);

        // Should be blocked due to budget cap
        $this->assertEquals('blocked', $result['action']);
        $this->assertNotEmpty($result['triggered_policies']);
        $this->assertEquals('budget_cap', $result['triggered_policies'][0]['policy_type']);
    }
}
