<?php

namespace Tests\Feature;

use App\Models\DiagnosticRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Tests for the Public Diagnostic API - Commercial entry point.
 */
class DiagnosticTest extends TestCase
{
    use RefreshDatabase;

    public function test_diagnostic_submit_requires_required_fields(): void
    {
        $response = $this->postJson('/api/diagnostic', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'company', 'provider', 'model', 'volume', 'useCase', 'pricing']);
    }

    public function test_diagnostic_submit_creates_diagnostic_request(): void
    {
        $response = $this->postJson('/api/diagnostic', [
            'email' => 'test@example.com',
            'company' => 'Test Company',
            'provider' => 'openai',
            'model' => 'gpt-4o',
            'volume' => '10k – 50k',
            'useCase' => 'Support client',
            'pricing' => 'Forfait',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('diagnostic_requests', [
            'email' => 'test@example.com',
            'company_name' => 'Test Company',
        ]);
    }

    public function test_diagnostic_submit_validates_provider(): void
    {
        $response = $this->postJson('/api/diagnostic', [
            'email' => 'test@example.com',
            'company' => 'Test Company',
            'provider' => 'InvalidProvider',
            'model' => 'gpt-4o',
            'volume' => '10k – 50k',
            'useCase' => 'Support client',
            'pricing' => 'Forfait',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['provider']);
    }

    public function test_diagnostic_submit_validates_volume(): void
    {
        $response = $this->postJson('/api/diagnostic', [
            'email' => 'test@example.com',
            'company' => 'Test Company',
            'provider' => 'OpenAI',
            'model' => 'gpt-4o',
            'volume' => 'invalid_volume',
            'useCase' => 'Support client',
            'pricing' => 'Forfait',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['volume']);
    }

    public function test_diagnostic_show_returns_diagnostic(): void
    {
        $diagnostic = DiagnosticRequest::factory()->create();

        $response = $this->getJson("/api/diagnostic/{$diagnostic->access_token}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_diagnostic_show_returns_404_for_unknown_id(): void
    {
        $response = $this->getJson('/api/diagnostic/nonexistent-uuid');

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_request_audit_updates_diagnostic(): void
    {
        Mail::fake();

        $diagnostic = DiagnosticRequest::factory()->create([
            'status' => DiagnosticRequest::STATUS_NEW,
        ]);

        $response = $this->postJson("/api/diagnostic/{$diagnostic->access_token}/request-audit", [
            'type' => 'audit',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $diagnostic->refresh();
        $this->assertTrue($diagnostic->requested_full_audit);
        $this->assertEquals(DiagnosticRequest::STATUS_QUALIFIED, $diagnostic->status);
    }

    public function test_request_demo_updates_diagnostic(): void
    {
        Mail::fake();

        $diagnostic = DiagnosticRequest::factory()->create([
            'status' => DiagnosticRequest::STATUS_NEW,
        ]);

        $response = $this->postJson("/api/diagnostic/{$diagnostic->access_token}/request-audit", [
            'type' => 'demo',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $diagnostic->refresh();
        $this->assertTrue($diagnostic->requested_demo);
    }

    public function test_request_audit_validates_type(): void
    {
        $diagnostic = DiagnosticRequest::factory()->create();

        $response = $this->postJson("/api/diagnostic/{$diagnostic->access_token}/request-audit", [
            'type' => 'invalid_type',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_request_audit_returns_404_for_unknown_diagnostic(): void
    {
        $response = $this->postJson('/api/diagnostic/nonexistent-uuid/request-audit', [
            'type' => 'audit',
        ]);

        $response->assertStatus(404);
    }
}
