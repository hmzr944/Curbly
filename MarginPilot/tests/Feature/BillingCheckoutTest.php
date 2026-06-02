<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_billing_page_loads_and_exposes_checkout_offer(): void
    {
        $organization = Organization::factory()->create(['plan' => 'free']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($user)
            ->withSession(['checkout_offer' => 'continuous_control'])
            ->get(route('billing.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Billing/Index')
            ->where('checkoutOffer', 'continuous_control')
            ->where('billing.plan', 'free')
        );
    }

    public function test_subscription_checkout_rejects_non_self_serve_plan(): void
    {
        $organization = Organization::factory()->create(['plan' => 'free']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->post(route('billing.checkout'), [
            'plan' => 'observe',
        ]);

        $response->assertSessionHasErrors(['plan']);
    }

    public function test_subscription_checkout_returns_error_when_price_is_missing(): void
    {
        config([
            'services.stripe.secret' => 'sk_test_fake_for_test',
            'services.stripe.price_control' => null,
        ]);

        $organization = Organization::factory()->create(['plan' => 'free']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->from(route('billing.index'))->post(route('billing.checkout'), [
            'plan' => 'control',
        ]);

        $response->assertRedirect(route('billing.index'));
        $response->assertSessionHasErrors(['plan']);
    }

    public function test_checkout_returns_error_when_stripe_not_configured(): void
    {
        config(['services.stripe.secret' => null]);

        $organization = Organization::factory()->create(['plan' => 'free']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->from(route('billing.index'))->post(route('billing.checkout'), [
            'plan' => 'control',
        ]);

        $response->assertRedirect(route('billing.index'));
        $response->assertSessionHasErrors(['stripe']);
    }

    public function test_portal_returns_error_when_customer_absent(): void
    {
        $organization = Organization::factory()->create([
            'plan' => 'free',
            'stripe_customer_id' => null,
        ]);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->from(route('billing.index'))->post(route('billing.portal'));

        $response->assertRedirect(route('billing.index'));
        $response->assertSessionHasErrors(['billing']);
    }
}
