<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'organization_name' => ['required', 'string', 'max:120'],
            'monthly_budget_cap' => ['nullable', 'numeric', 'min:0'],
            'openai_key' => ['nullable', 'string', 'max:255'],
            'anthropic_key' => ['nullable', 'string', 'max:255'],
            'disconnect_openai' => ['nullable', 'boolean'],
            'disconnect_anthropic' => ['nullable', 'boolean'],
            'currency' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'locale'   => ['nullable', 'string', 'in:fr,en,es'],
            // Notification preferences
            'email_notifications_enabled' => ['nullable', 'boolean'],
            'notify_on_blocked' => ['nullable', 'boolean'],
            'notify_on_fallback' => ['nullable', 'boolean'],
            'notify_on_observed' => ['nullable', 'boolean'],
            'notification_recipients' => ['nullable', 'string', 'max:500'],
        ];
    }
}
