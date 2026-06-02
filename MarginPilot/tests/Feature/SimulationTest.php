<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for the Simulation API - What-if scenarios.
 */
class SimulationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;

    protected function setUp(): void
    {
        parent::setUp();

        // Simulation requires 'simulation' entitlement — 'control' plan grants it
        $this->org = Organization::factory()->create([
            'plan' => 'control',
        ]);
        $this->user = User::factory()->create([
            'organization_id' => $this->org->id,
        ]);
    }

    public function test_simulation_requires_authentication(): void
    {
        $response = $this->getJson('/api/simulation/templates');

        $response->assertStatus(401);
    }

    public function test_simulation_templates_returns_available_scenarios(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/simulation/templates');

        // API returns templates directly in data array
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['type', 'name', 'description'],
                ],
            ]);
    }

    public function test_simulation_quick_runs_volume_scale(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/simulation/run', [
                'type' => 'volume_scale',
                'multiplier' => 2.0,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scenario' => ['type', 'name', 'description'],
                    'baseline' => ['cost', 'requests', 'revenue'],
                    'projection' => ['cost', 'requests', 'revenue'],
                    'impact' => ['cost_delta', 'cost_delta_pct', 'verdict'],
                ],
            ]);
    }

    public function test_simulation_quick_runs_model_shift(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/simulation/run', [
                'type' => 'model_shift',
                'target_tier' => 'economy',
                'shift_percentage' => 50,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scenario.type', 'model_shift');
    }

    public function test_simulation_quick_runs_budget_cap(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/simulation/run', [
                'type' => 'budget_cap',
                'cap_percentage' => 80,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scenario.type', 'budget_cap');
    }

    public function test_simulation_quick_validates_type(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/simulation/run', [
                'type' => 'invalid_type',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_simulation_run_executes_custom_scenario(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/simulation/run', [
                'type' => 'custom',
                'volume_multiplier' => 1.5,
                'cost_reduction_pct' => 20,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scenario' => ['type', 'name', 'description'],
                    'baseline' => ['cost', 'requests', 'revenue'],
                    'projection' => ['cost', 'requests', 'revenue'],
                    'impact' => ['cost_delta', 'cost_delta_pct', 'verdict'],
                ],
            ]);
    }

    public function test_simulation_compare_multiple_scenarios(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/simulation/compare', [
                'scenarios' => [
                    [
                        'type' => 'volume_scale',
                        'multiplier' => 1.5,
                    ],
                    [
                        'type' => 'model_shift',
                        'target_tier' => 'economy',
                        'shift_percentage' => 50,
                    ],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.scenarios');
    }
}
