<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\ProviderConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for the LLM Proxy - OpenAI-compatible API Gateway.
 */
class LLMProxyTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;

    protected function setUp(): void
    {
        parent::setUp();

        // Proxy requires proxy_access entitlement (observe, control, scale plans)
        $this->org = Organization::factory()->create([
            'name' => 'Test Org',
            'plan' => 'control',
        ]);
        
        $this->user = User::factory()->create([
            'organization_id' => $this->org->id,
        ]);
    }

    public function test_proxy_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'user', 'content' => 'Test'],
            ],
        ]);

        $response->assertStatus(401);
    }

    public function test_proxy_validates_request_format(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/chat/completions', [
                // Missing 'model' and 'messages'
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('error.code', 'invalid_request');
    }

    public function test_proxy_validates_message_roles(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'invalid_role', 'content' => 'Test'],
                ],
            ]);

        $response->assertStatus(400);
    }

    public function test_proxy_rejects_models_outside_v1_scope(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => 'Test'],
                ],
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('error.code', 'invalid_request');
    }

    public function test_proxy_accepts_streaming(): void
    {
        // Streaming (stream: true) is now supported via SSE (StreamedResponse).
        // The HTTP status is always 200; errors are emitted as SSE data chunks.
        // A valid request must NOT be rejected with 400 (validation error).
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'user', 'content' => 'Test'],
                ],
                'stream' => true,
            ]);

        // Streaming accepted — not a 400 validation rejection.
        // The response body is SSE text (not JSON), so we only assert the status code.
        $response->assertStatus(200);
    }

    public function test_list_models_returns_v1_models(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/models');

        $response->assertStatus(200)
            ->assertJsonPath('object', 'list')
            ->assertJsonCount(7, 'data');

        $modelIds = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertEqualsCanonicalizing(
            [
                'gpt-4o', 'gpt-4o-mini',
                'claude-3-5-sonnet', 'claude-3-5-haiku',
                'claude-sonnet-4', 'claude-haiku-4',
                'gemini-flash-1.5',
            ],
            $modelIds
        );
    }

    public function test_get_model_returns_model_info(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/models/gpt-4o');

        $response->assertStatus(200)
            ->assertJsonPath('id', 'gpt-4o')
            ->assertJsonPath('provider', 'openai');
    }

    public function test_get_model_returns_404_for_unsupported_model(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/models/gpt-3.5-turbo');

        $response->assertStatus(404)
            ->assertJsonPath('error.code', 'model_not_found');
    }

    public function test_proxy_fails_without_provider_connection(): void
    {
        // No provider connection configured
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'user', 'content' => 'Test'],
                ],
            ]);

        $response->assertStatus(503);
    }

    public function test_provider_connection_status_must_be_connected(): void
    {
        // Create a disconnected provider connection
        ProviderConnection::factory()->create([
            'organization_id' => $this->org->id,
            'provider' => 'openai',
            'status' => 'disconnected',
            'api_key_encrypted' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'user', 'content' => 'Test'],
                ],
            ]);

        $response->assertStatus(503);
    }
}
