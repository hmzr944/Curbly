<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EntitlementAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_plan_is_redirected_from_policies(): void
    {
        $organization = Organization::factory()->create(['plan' => 'free']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('policies.index'));

        $response->assertRedirect(route('billing.index'));
    }

    public function test_control_plan_can_access_policies(): void
    {
        $organization = Organization::factory()->create(['plan' => 'control']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('policies.index'));

        $response->assertOk();
    }

    public function test_control_plan_can_access_margin_impact(): void
    {
        $organization = Organization::factory()->create(['plan' => 'control']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'email_verified_at' => now(),
        ]);

        // /margin-impact now redirects to the Margexa SPA at /app (Step 10 cleanup)
        $response = $this->actingAs($user)->get(route('margin-impact.index'));

        $response->assertRedirect('/app');
    }
}
