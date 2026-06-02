<?php

namespace App\Http\Controllers;

use App\Http\Requests\SettingsUpdateRequest;
use App\Models\ProviderConnection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $organization = auth()->user()->organization;

        if (! $organization) {
            return redirect()->route('app.index');
        }

        // Prepare notification settings with defaults - read from policy_triggers nested structure
        $notificationSettings = $organization->notification_settings ?? [];
        $policyTriggers = $notificationSettings['policy_triggers'] ?? [];
        $notificationDefaults = [
            'email_enabled' => $policyTriggers['email_enabled'] ?? false,
            'notify_on_blocked' => $policyTriggers['notify_on_blocked'] ?? true,
            'notify_on_fallback' => $policyTriggers['notify_on_fallback'] ?? true,
            'notify_on_observed' => $policyTriggers['notify_on_observed'] ?? false,
            'recipients' => $policyTriggers['email_recipients'] ?? [],
        ];

        return Inertia::render('Settings/Index', [
            'organization' => $organization,
            'notificationSettings' => $notificationDefaults,
            'providers' => ProviderConnection::query()
                ->where('organization_id', $organization->id)
                ->get()
                ->map(fn ($connection) => [
                    'id' => $connection->id,
                    'provider' => $connection->provider,
                    'status' => $connection->status,
                    'connection_name' => $connection->connection_name,
                    'has_key' => filled($connection->api_key_encrypted),
                    'last_checked_at' => $connection->last_checked_at?->diffForHumans(),
                ]),
        ]);
    }

    public function update(SettingsUpdateRequest $request): RedirectResponse
    {
        $organization = $request->user()->organization;

        if (! $organization) {
            return redirect()->route('app.index');
        }

        $data = $request->validated();

        $settings = $organization->settings ?? [];
        $settings['currency'] = $data['currency'] ?? ($settings['currency'] ?? 'USD');
        $settings['timezone'] = $data['timezone'] ?? ($settings['timezone'] ?? 'Europe/Paris');
        $settings['locale']   = $data['locale']   ?? ($settings['locale']   ?? 'fr');

        // Build notification_settings with policy_triggers nested structure
        // This matches the structure expected by SendPolicyTriggerNotificationJob
        $notificationSettings = $organization->notification_settings ?? [];
        $policyTriggers = $notificationSettings['policy_triggers'] ?? [];
        
        if (isset($data['email_notifications_enabled'])) {
            $policyTriggers['email_enabled'] = (bool) $data['email_notifications_enabled'];
        }
        if (isset($data['notify_on_blocked'])) {
            $policyTriggers['notify_on_blocked'] = (bool) $data['notify_on_blocked'];
        }
        if (isset($data['notify_on_fallback'])) {
            $policyTriggers['notify_on_fallback'] = (bool) $data['notify_on_fallback'];
        }
        if (isset($data['notify_on_observed'])) {
            $policyTriggers['notify_on_observed'] = (bool) $data['notify_on_observed'];
        }
        if (isset($data['notification_recipients'])) {
            // Parse comma-separated emails
            $recipients = array_filter(
                array_map('trim', explode(',', $data['notification_recipients']))
            );
            $policyTriggers['email_recipients'] = array_values($recipients);
        }
        
        $notificationSettings['policy_triggers'] = $policyTriggers;

        $organization->update([
            'name' => $data['organization_name'],
            'monthly_budget_cap' => $data['monthly_budget_cap'] ?? null,
            'slug' => Str::slug($data['organization_name']),
            'settings' => $settings,
            'notification_settings' => $notificationSettings,
        ]);

        $this->updateProvider(
            $organization->id,
            'openai',
            $data['openai_key'] ?? null,
            (bool) ($data['disconnect_openai'] ?? false)
        );
        $this->updateProvider(
            $organization->id,
            'anthropic',
            $data['anthropic_key'] ?? null,
            (bool) ($data['disconnect_anthropic'] ?? false)
        );

        return back();
    }

    private function updateProvider(int $organizationId, string $provider, ?string $apiKey, bool $disconnect): void
    {
        $connection = ProviderConnection::query()->firstOrNew([
            'organization_id' => $organizationId,
            'provider' => $provider,
        ]);

        if ($disconnect) {
            $connection->fill([
                'connection_name' => Str::upper($provider).' Primary',
                'api_key_encrypted' => null,
                'status' => 'disconnected',
                'last_checked_at' => null,
            ]);
            $connection->save();

            return;
        }

        if (! filled($apiKey)) {
            return;
        }

        $connection->fill([
            'connection_name' => Str::upper($provider).' Primary',
            'api_key_encrypted' => Crypt::encryptString($apiKey),
            'status' => 'connected',
            'last_checked_at' => now(),
        ]);

        $connection->save();
    }
}
