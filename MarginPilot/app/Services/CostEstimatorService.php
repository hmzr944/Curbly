<?php

namespace App\Services;

class CostEstimatorService
{
    public function estimate(string $provider, string $model, int $promptTokens, int $completionTokens): float
    {
        $rates = $this->rates();
        $key = strtolower($provider).':'.strtolower($model);

        $modelRate = $rates[$key] ?? [
            'prompt' => 0.0015,
            'completion' => 0.002,
        ];

        $cost = ($promptTokens / 1000) * $modelRate['prompt']
            + ($completionTokens / 1000) * $modelRate['completion'];

        return round($cost, 6);
    }

    private function rates(): array
    {
        return [
            'openai:gpt-4o-mini' => ['prompt' => 0.00015, 'completion' => 0.0006],
            'openai:gpt-4o' => ['prompt' => 0.0025, 'completion' => 0.01],
            'anthropic:claude-3-5-haiku' => ['prompt' => 0.0008, 'completion' => 0.004],
            'anthropic:claude-3-5-sonnet' => ['prompt' => 0.003, 'completion' => 0.015],
        ];
    }
}
