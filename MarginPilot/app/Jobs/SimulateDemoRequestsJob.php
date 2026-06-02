<?php

namespace App\Jobs;

use App\Models\AIRequest;
use App\Models\Organization;
use App\Services\CostEstimatorService;
use App\Services\PolicyEvaluationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Demo-only job. Simulates AI requests for onboarding walkthroughs.
 * Must NOT be dispatched in a production data pipeline.
 */
class SimulateDemoRequestsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $organizationId,
        public readonly int $volume = 150,
    ) {
    }

    public function handle(CostEstimatorService $estimator, PolicyEvaluationService $policyService): void
    {
        $organization = Organization::query()->find($this->organizationId);

        if (! $organization) {
            return;
        }

        $features = $organization->features()->get();
        $customers = $organization->customers()->with('plan')->get();

        if ($features->isEmpty() || $customers->isEmpty()) {
            return;
        }

        $providers = ['openai', 'anthropic'];
        $modelsByProvider = [
            'openai' => ['gpt-4o-mini', 'gpt-4o'],
            'anthropic' => ['claude-3-5-haiku', 'claude-3-5-sonnet'],
        ];
        // Premium models that should trigger rules on Starter plans
        $premiumModels = ['gpt-4o', 'claude-3-5-sonnet'];
        $economicModels = ['gpt-4o-mini', 'claude-3-5-haiku'];

        $workflows = ['ticket-auto-reply', 'live-chat-assist', 'csat-followup'];

        // Identify a "problem" customer for demo storytelling
        // Pick the customer with the lowest-tier plan (Starter) to show margin pressure
        $problemCustomer = $customers->sortBy(fn ($c) => $c->plan?->monthly_price ?? 0)->first();

        for ($i = 0; $i < $this->volume; $i++) {
            $customer = $customers->random();
            $feature = $features->random();
            $provider = $providers[array_rand($providers)];

            // Storytelling: problem customer uses 60% premium models
            $isProblemCustomer = $customer->id === $problemCustomer?->id;
            if ($isProblemCustomer && random_int(1, 100) <= 60) {
                $model = $premiumModels[array_rand($premiumModels)];
            } elseif (! $isProblemCustomer && random_int(1, 100) <= 80) {
                // Normal customers: 80% economic models
                $model = $economicModels[array_rand($economicModels)];
            } else {
                $model = $modelsByProvider[$provider][array_rand($modelsByProvider[$provider])];
            }

            // Problem customer has larger token usage (longer conversations)
            $tokenMultiplier = $isProblemCustomer ? 1.5 : 1;
            $promptTokens = (int) (random_int(120, 2200) * $tokenMultiplier);
            $completionTokens = (int) (random_int(80, 1800) * $tokenMultiplier);

            $request = AIRequest::query()->create([
                'organization_id' => $organization->id,
                'provider' => $provider,
                'model' => $model,
                'feature_id' => $feature->id,
                'customer_id' => $customer->id,
                'plan_id' => $customer->plan_id,
                'workflow_name' => $workflows[array_rand($workflows)],
                'prompt_tokens' => $promptTokens,
                'completion_tokens' => $completionTokens,
                'estimated_cost' => $estimator->estimate($provider, $model, $promptTokens, $completionTokens),
                'created_at' => now()->subDays(random_int(0, 30)),
            ]);

            $policyService->evaluate($request);
        }
    }
}
