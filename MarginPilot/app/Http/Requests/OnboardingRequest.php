<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        // Mode démo: seul demo_mode est requis
        if ($this->boolean('demo_mode')) {
            return [
                'demo_mode' => ['required', 'boolean'],
            ];
        }

        // Mode configuration: organization_name requis, le reste optionnel
        return [
            'demo_mode' => ['nullable', 'boolean'],
            'organization_name' => ['required', 'string', 'max:120'],
            'openai_key' => ['nullable', 'string', 'max:255'],
            'anthropic_key' => ['nullable', 'string', 'max:255'],
            'include_demo_data' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'organization_name.required' => 'Veuillez indiquer le nom de votre organisation.',
        ];
    }
}
