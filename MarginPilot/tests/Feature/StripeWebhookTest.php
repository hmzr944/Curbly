<?php

namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use MockeryPHPUnitIntegration;
    use RefreshDatabase;

    public function test_checkout_completed_scan_grants_scan_access(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);

        $organization = Organization::factory()->create(['plan' => 'free']);

        $event = (object) [
            'type' => 'checkout.session.completed',
            'data' => (object) [
                'object' => (object) [
                    'id' => 'cs_scan_123',
                    'mode' => 'payment',
                    'customer' => 'cus_scan_123',
                    'metadata' => (object) [
                        'organization_id' => $organization->id,
                        'product' => 'scan',
                    ],
                ],
            ],
        ];

        Mockery::mock('alias:\Stripe\Webhook')
            ->shouldReceive('constructEvent')
            ->once()
            ->andReturn($event);

        $response = $this->post(route('stripe.webhook'), [], [
            'Stripe-Signature' => 'sig_test',
        ]);

        $response->assertOk();

        $organization->refresh();
        $this->assertTrue($organization->has_purchased_scan);
        $this->assertSame('scan', $organization->plan);
        $this->assertSame('cus_scan_123', $organization->stripe_customer_id);
    }

    public function test_subscription_updated_applies_control_plan(): void
    {
        config([
            'services.stripe.webhook_secret' => 'whsec_test',
            'services.stripe.price_control' => 'price_control_test',
        ]);

        $organization = Organization::factory()->create(['plan' => 'free']);

        $event = (object) [
            'type' => 'customer.subscription.updated',
            'data' => (object) [
                'object' => (object) [
                    'id' => 'sub_control_123',
                    'customer' => 'cus_control_123',
                    'status' => 'active',
                    'cancel_at' => null,
                    'trial_end' => null,
                    'metadata' => (object) [
                        'organization_id' => $organization->id,
                        'plan' => 'control',
                    ],
                    'items' => (object) [
                        'data' => [
                            (object) [
                                'price' => (object) ['id' => 'price_control_test'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        Mockery::mock('alias:\Stripe\Webhook')
            ->shouldReceive('constructEvent')
            ->once()
            ->andReturn($event);

        $response = $this->post(route('stripe.webhook'), [], [
            'Stripe-Signature' => 'sig_test',
        ]);

        $response->assertOk();

        $organization->refresh();
        $this->assertSame('control', $organization->plan);
        $this->assertSame('active', $organization->subscription_status);
        $this->assertSame('sub_control_123', $organization->stripe_subscription_id);
        $this->assertSame('price_control_test', $organization->stripe_price_id);
    }
}
