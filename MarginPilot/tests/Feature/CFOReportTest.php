<?php

namespace Tests\Feature;

use App\Models\AIRequest;
use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for the CFO Reports API - Finance-friendly metrics.
 */
class CFOReportTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;

    protected function setUp(): void
    {
        parent::setUp();

        // CFO reports require a plan with cfo_reports entitlement — 'control' plan grants it
        $this->org = Organization::factory()->create([
            'plan' => 'control',
        ]);
        $this->user = User::factory()->create([
            'organization_id' => $this->org->id,
        ]);
    }

    public function test_cfo_readout_requires_authentication(): void
    {
        $response = $this->getJson('/api/cfo/readout');

        $response->assertStatus(401);
    }

    public function test_cfo_readout_returns_executive_summary(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/readout');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period',
                    'headline_metrics',
                    'plan_economics',
                    'margin_protection',
                ],
            ]);
    }

    public function test_cfo_plan_economics_returns_per_plan_metrics(): void
    {
        // Create some test data
        $plan = Plan::factory()->create(['organization_id' => $this->org->id]);
        
        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/plan-economics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_cfo_margin_protection_returns_savings_metrics(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/margin-protection');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_margin_protected',
                    'routing_savings',
                    'estimated_policy_savings',
                ],
            ]);
    }

    public function test_cfo_margin_destroyers_returns_top_customers(): void
    {
        // Create customers with AI requests
        $customer = Customer::factory()->create(['organization_id' => $this->org->id]);
        AIRequest::factory()->count(5)->create([
            'organization_id' => $this->org->id,
            'customer_id' => $customer->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/margin-destroyers');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_cfo_weekly_returns_weekly_readout(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/weekly');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period',
                    'kpis',
                ],
            ]);
    }

    public function test_cfo_weekly_csv_returns_csv_download(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/api/cfo/weekly/csv');

        $response->assertStatus(200)
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_cfo_weekly_pdf_returns_html_for_print(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/api/cfo/weekly/pdf');

        $response->assertStatus(200)
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
    }

    public function test_cfo_trend_returns_cost_trend(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/trend');

        // API returns success:true, data is an array of daily cost points (may be empty)
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data', // Array of daily points: [{date, requests, cost, savings}, ...]
            ]);
    }

    public function test_cfo_trend_accepts_days_parameter(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/cfo/trend?days=14');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
