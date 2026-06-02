<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        // After registration, users are redirected to the Margexa SPA (/app)
        $response->assertRedirect(route('app.index', absolute: false));
    }

    public function test_registration_with_public_offer_redirects_to_billing_checkout(): void
    {
        $response = $this->post('/register', [
            'name' => 'Control User',
            'email' => 'control@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'offer' => 'continuous_control',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('billing.index', absolute: false));
        $response->assertSessionHas('checkout_offer', 'continuous_control');
    }
}
