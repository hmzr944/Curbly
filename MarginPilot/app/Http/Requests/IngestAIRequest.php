<?php

namespace App\Http\Requests;

use App\Support\MargeXaCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IngestAIRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'provider' => ['required', 'string', 'in:openai,anthropic'],
            'model' => ['required', 'string', 'max:120', Rule::in(MargeXaCatalog::supportedModelIds())],
            'feature_name' => ['nullable', 'string', 'max:120'],
            'feature_id' => ['nullable', 'integer', 'exists:features,id'],
            'customer_name' => ['nullable', 'string', 'max:120'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'plan_name' => ['nullable', 'string', 'max:120'],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
            'workflow_name' => ['nullable', 'string', 'max:120'],
            'prompt_tokens' => ['required', 'integer', 'min:0'],
            'completion_tokens' => ['required', 'integer', 'min:0'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'created_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'model.in' => 'Le modele specifie n est pas supporte. Modeles autorises : ' . implode(', ', MargeXaCatalog::supportedModelIds()),
        ];
    }
}
