<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\ProviderConnection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Crypt;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProviderConnection>
 */
class ProviderConnectionFactory extends Factory
{
    protected $model = ProviderConnection::class;

    public function definition(): array
    {
        $provider = fake()->randomElement(['openai', 'anthropic']);

        return [
            'organization_id' => Organization::factory(),
            'provider' => $provider,
            'connection_name' => strtoupper($provider) . ' Primary',
            'api_key_encrypted' => null,
            'status' => 'disconnected',
            'last_checked_at' => null,
            'metadata' => [],
        ];
    }

    public function connected(string $apiKey = 'sk-test-key'): static
    {
        return $this->state(fn (array $attributes) => [
            'api_key_encrypted' => Crypt::encryptString($apiKey),
            'status' => 'connected',
            'last_checked_at' => now(),
        ]);
    }

    public function openai(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'openai',
            'connection_name' => 'OPENAI Primary',
        ]);
    }

    public function anthropic(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'anthropic',
            'connection_name' => 'ANTHROPIC Primary',
        ]);
    }
}
