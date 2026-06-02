<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Integration smoke tests verifying the MarginPilot → Margexa fusion.
 *
 * Checks that:
 * - The public landing page renders
 * - The Margexa SPA shell loads for authenticated users
 * - Core API endpoints return the expected JSON shape
 * - Old web routes redirect correctly to /app
 * - Auth routes serve the Margexa blade instead of Inertia
 */
class MargeXaFusionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Organization $org;

    protected function setUp(): void
    {
        parent::setUp();

        $this->org = Organization::factory()->create([
            'name' => 'TestCo',
            'plan' => 'control',
        ]);

        $this->user = User::factory()->create([
            'organization_id' => $this->org->id,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // Public routes
    // ─────────────────────────────────────────────────────────────────

    public function test_landing_page_returns_200(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_login_page_returns_200(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        // Should serve the Margexa auth blade (not an Inertia JSON response)
        $response->assertSee('window.MARGEXA', false);
    }

    public function test_register_page_returns_200(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
        $response->assertSee('window.MARGEXA', false);
    }

    // ─────────────────────────────────────────────────────────────────
    // Margexa SPA shell (/app)
    // ─────────────────────────────────────────────────────────────────

    public function test_app_redirects_guests_to_login(): void
    {
        $response = $this->get('/app');

        $response->assertRedirect('/login');
    }

    public function test_app_returns_200_for_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)->get('/app');

        $response->assertStatus(200);
        // The blade view mounts React into #root
        $response->assertSee('id="root"', false);
        // window.MARGEXA context is injected
        $response->assertSee('window.MARGEXA', false);
    }

    public function test_app_any_subroute_returns_200(): void
    {
        $response = $this->actingAs($this->user)->get('/app/dashboard');

        $response->assertStatus(200);
        $response->assertSee('id="root"', false);
    }

    // ─────────────────────────────────────────────────────────────────
    // API endpoints — shape checks
    // ─────────────────────────────────────────────────────────────────

    public function test_api_me_returns_user_and_organization(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/me');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id', 'name', 'email',
            'organization' => ['id', 'name', 'plan'],
        ]);
    }

    public function test_api_dashboard_overview_returns_expected_keys(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/overview');

        $response->assertStatus(200);
        // CFOMetricsService returns these keys (via DashboardController::emptyOverview())
        $response->assertJsonStructure([
            'period',
            'total_ai_cost',
            'routing_savings',
            'total_requests',
        ]);
    }

    public function test_api_policies_returns_array(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/policies');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'policies',
            'recent_triggers_count',
        ]);
        $this->assertIsArray($response->json('policies'));
    }

    public function test_api_analytics_live_requests_returns_array(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/analytics/live-requests');

        $response->assertStatus(200);
        $this->assertIsArray($response->json());
    }

    public function test_api_providers_status_returns_array(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/providers/status');

        $response->assertStatus(200);
        $this->assertIsArray($response->json());
    }

    // ─────────────────────────────────────────────────────────────────
    // Legacy web routes — must redirect to /app
    // ─────────────────────────────────────────────────────────────────

    public function test_dashboard_redirects_to_app(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertRedirect('/app');
    }

    public function test_margin_leaks_redirects_to_app(): void
    {
        $response = $this->actingAs($this->user)->get('/margin-leaks');

        $response->assertRedirect('/app');
    }

    public function test_margin_impact_redirects_to_app(): void
    {
        $response = $this->actingAs($this->user)->get('/margin-impact');

        $response->assertRedirect('/app');
    }

    public function test_simulation_redirects_to_app(): void
    {
        $response = $this->actingAs($this->user)->get('/simulation');

        $response->assertRedirect('/app');
    }

    // ─────────────────────────────────────────────────────────────────
    // Stripe sync API
    // ─────────────────────────────────────────────────────────────────

    public function test_stripe_status_returns_not_configured_when_no_key(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/stripe/status');

        $response->assertStatus(200);
        $response->assertJsonStructure(['connected']);
        $this->assertFalse($response->json('connected'));
    }

    // ─────────────────────────────────────────────────────────────────
    // Team & Invitations API (Phase 2D)
    // ─────────────────────────────────────────────────────────────────

    public function test_team_members_returns_array_with_current_user(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/team/members');

        $response->assertStatus(200);
        $this->assertIsArray($response->json());
        // At least the currently logged-in user should appear
        $this->assertNotEmpty($response->json());
        $response->assertJsonStructure([['id', 'name', 'email', 'role', 'teams', 'last', 'mfa', 'c']]);
    }

    public function test_team_invites_returns_empty_array_initially(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/team/invites');

        $response->assertStatus(200);
        $this->assertIsArray($response->json());
        $this->assertEmpty($response->json());
    }

    public function test_team_invite_creates_invitation(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/team/invite', [
            'email' => 'newmember@example.com',
            'role'  => 'member',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['success', 'invitation' => ['id', 'email', 'role', 'sent']]);
        $this->assertTrue($response->json('success'));
        $this->assertEquals('newmember@example.com', $response->json('invitation.email'));
    }

    public function test_team_invite_validates_email(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/team/invite', [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422);
    }

    public function test_team_invites_lists_pending_after_creation(): void
    {
        // Create one
        $this->actingAs($this->user)->postJson('/api/team/invite', [
            'email' => 'teammate@example.com',
            'role'  => 'admin',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/team/invites');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('teammate@example.com', $response->json('0.email'));
        $this->assertEquals('Admin', $response->json('0.role'));
    }

    public function test_team_revoke_deletes_invitation(): void
    {
        // Create
        $create = $this->actingAs($this->user)->postJson('/api/team/invite', [
            'email' => 'revoke-me@example.com',
        ]);
        $invitationId = $create->json('invitation.id');

        // Revoke
        $response = $this->actingAs($this->user)->deleteJson("/api/team/invites/{$invitationId}");

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));

        // Confirm gone
        $list = $this->actingAs($this->user)->getJson('/api/team/invites');
        $this->assertEmpty($list->json());
    }

    public function test_team_resend_renews_invitation(): void
    {
        $create = $this->actingAs($this->user)->postJson('/api/team/invite', [
            'email' => 'resend-me@example.com',
        ]);
        $invitationId = $create->json('invitation.id');

        $response = $this->actingAs($this->user)->patchJson("/api/team/invites/{$invitationId}");

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
    }

    public function test_team_endpoints_require_authentication(): void
    {
        $this->getJson('/api/team/members')->assertStatus(401);
        $this->getJson('/api/team/invites')->assertStatus(401);
        $this->postJson('/api/team/invite', ['email' => 'x@x.com'])->assertStatus(401);
    }
}
