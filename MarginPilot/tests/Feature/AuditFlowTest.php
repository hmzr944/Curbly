<?php

namespace Tests\Feature;

use App\Models\DiagnosticRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for the complete public audit flow:
 * GET /audit → POST /audit → redirect → GET /audit/{token}
 */
class AuditFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: The audit form page loads correctly.
     */
    public function test_audit_form_page_loads(): void
    {
        $response = $this->get('/audit');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Audit')
            ->has('providers')
            ->has('models')
            ->has('volumes')
            ->has('useCases')
            ->has('pricingModels')
            ->has('plans')
        );
    }

    /**
     * Test: Form submission creates a diagnostic and redirects to result.
     */
    public function test_audit_submit_creates_diagnostic_and_redirects(): void
    {
        $response = $this->post('/audit', [
            'email' => 'test@example.com',
            'company' => 'Test Company',
            'contact_name' => 'John Doe',
            'phone' => '+33600000000',
            'provider' => 'openai',
            'model' => 'gpt-4o',
            'volume' => '10k – 50k',
            'useCase' => 'support_client',
            'pricing' => 'flat',
            'plans' => ['Basic', 'Pro'],
            'current_spend' => 1500,
            'customer_count' => 100,
            'industry' => 'SaaS',
        ]);

        // Should redirect to audit.show with token
        $response->assertRedirect();
        
        // A diagnostic should exist in database
        $this->assertDatabaseHas('diagnostic_requests', [
            'email' => 'test@example.com',
            'company_name' => 'Test Company',
        ]);

        // Get the created diagnostic
        $diagnostic = DiagnosticRequest::where('email', 'test@example.com')->first();
        $this->assertNotNull($diagnostic);
        $this->assertNotNull($diagnostic->access_token);
        $this->assertNotNull($diagnostic->risk_score);
        $this->assertNotNull($diagnostic->risk_level);
        
        // Redirect should be to audit.show route
        $response->assertRedirect(route('audit.show', ['token' => $diagnostic->access_token]));
    }

    /**
     * Test: The audit result page loads correctly with valid token.
     */
    public function test_audit_result_page_loads_with_valid_token(): void
    {
        // Create a diagnostic with complete audit data
        $diagnostic = DiagnosticRequest::factory()->create([
            'access_token' => 'test-token-12345',
            'risk_score' => 65,
            'risk_level' => 'moderate',
            'estimated_monthly_cost' => 2500,
            'estimated_waste' => 800,
            'potential_savings' => 600,
        ]);

        $response = $this->get("/audit/{$diagnostic->access_token}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/AuditResult')
            ->has('audit')
            ->has('token')
            ->where('token', $diagnostic->access_token)
        );
    }

    /**
     * Test: The audit result page returns 404 for invalid token.
     */
    public function test_audit_result_page_returns_404_for_invalid_token(): void
    {
        $response = $this->get('/audit/invalid-token-does-not-exist');

        $response->assertStatus(404);
    }

    /**
     * Test: Form submission validates required fields.
     */
    public function test_audit_submit_validates_required_fields(): void
    {
        $response = $this->post('/audit', []);

        $response->assertSessionHasErrors([
            'email',
            'company',
            'provider',
            'model',
            'volume',
            'useCase',
            'pricing',
            'plans',
        ]);
    }

    /**
     * Test: Form submission validates email format.
     */
    public function test_audit_submit_validates_email_format(): void
    {
        $response = $this->post('/audit', [
            'email' => 'invalid-email',
            'company' => 'Test Company',
            'provider' => 'openai',
            'model' => 'gpt-4o',
            'volume' => '10k – 50k',
            'useCase' => 'support_client',
            'pricing' => 'flat',
            'plans' => ['Basic'],
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /**
     * Test: Form submission validates plans is an array with at least one item.
     */
    public function test_audit_submit_validates_plans_array(): void
    {
        $response = $this->post('/audit', [
            'email' => 'test@example.com',
            'company' => 'Test Company',
            'provider' => 'openai',
            'model' => 'gpt-4o',
            'volume' => '10k – 50k',
            'useCase' => 'support_client',
            'pricing' => 'flat',
            'plans' => [],
        ]);

        $response->assertSessionHasErrors(['plans']);
    }

    /**
     * Test: Complete end-to-end flow from form to result display.
     */
    public function test_complete_audit_flow_end_to_end(): void
    {
        // Step 1: Load form
        $formResponse = $this->get('/audit');
        $formResponse->assertStatus(200);

        // Step 2: Submit form
        $submitResponse = $this->post('/audit', [
            'email' => 'cto@startup.io',
            'company' => 'AI Startup',
            'provider' => 'anthropic',
            'model' => 'claude-3-5-sonnet',
            'volume' => '50k – 100k',
            'useCase' => 'copilote_support',
            'pricing' => 'hybrid',
            'plans' => ['Basic', 'Pro', 'Enterprise'],
            'current_spend' => 5000,
            'customer_count' => 500,
        ]);

        $submitResponse->assertRedirect();

        // Step 3: Get the diagnostic
        $diagnostic = DiagnosticRequest::where('email', 'cto@startup.io')->first();
        $this->assertNotNull($diagnostic);

        // Step 4: Follow redirect and verify result page
        $resultResponse = $this->get("/audit/{$diagnostic->access_token}");
        $resultResponse->assertStatus(200);
        $resultResponse->assertInertia(fn ($page) => $page
            ->component('Public/AuditResult')
            ->has('audit.company')
            ->has('audit.riskScore')
            ->has('audit.riskLevel')
            ->has('audit.financials')
            ->has('audit.recommendations')
            ->has('audit.profile')
        );
    }

    /**
     * Test: Audit generates risk assessment data.
     */
    public function test_audit_generates_risk_assessment(): void
    {
        $this->post('/audit', [
            'email' => 'test@risk.com',
            'company' => 'High Risk Corp',
            'provider' => 'openai',
            'model' => 'gpt-4o',
            'volume' => '100k+',        // High volume
            'useCase' => 'support_client',
            'pricing' => 'flat',        // Flat pricing = risk
            'plans' => ['Free', 'Basic'], // Low-priced plans
        ]);

        $diagnostic = DiagnosticRequest::where('email', 'test@risk.com')->first();
        
        $this->assertNotNull($diagnostic->risk_score);
        $this->assertGreaterThan(0, $diagnostic->risk_score);
        $this->assertContains($diagnostic->risk_level, ['low', 'moderate', 'high', 'critical']);
        $this->assertNotNull($diagnostic->policy_recommendations);
        $this->assertNotNull($diagnostic->estimated_monthly_cost);
    }
}
