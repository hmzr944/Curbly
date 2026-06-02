<?php

namespace App\Http\Requests;

use App\Models\Policy;
use App\Support\MargeXaCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'string', 'in:budget_cap,alert_threshold,fallback_model,premium_model_restriction'],
            'scope' => ['required', 'string', 'in:organization,plan,customer,feature'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'enforcement_mode' => ['nullable', 'string', Rule::in([Policy::MODE_ENFORCE, Policy::MODE_OBSERVE])],
            'threshold' => ['nullable', 'numeric', 'min:0'],
            'fallback_model' => ['nullable', 'string', 'max:120', Rule::in(MargeXaCatalog::fallbackModelIds())],
        ];
    }

    public function messages(): array
    {
        return [
            'enforcement_mode.in' => 'Le mode d enforcement doit etre "enforce" ou "observe".',
            'fallback_model.in' => 'Le modele de repli doit etre un modele V1 economique supporte.',
        ];
    }
}
