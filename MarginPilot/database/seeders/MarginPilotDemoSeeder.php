<?php

namespace Database\Seeders;

use App\Models\AIRequest;
use App\Models\Customer;
use App\Models\Feature;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Policy;
use App\Services\CostEstimatorService;
use App\Services\PolicyEvaluationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

/**
 * Margexa demo seeder — realistic AI cost / margin data.
 *
 * Run: php artisan db:seed --class=MargexaDemoSeeder
 */
class MargexaDemoSeeder extends Seeder
{
    /** Monthly revenue per plan (€) — used for margin calculations */
    private const PLAN_REVENUE = [
        'Basic'      => 49,
        'Pro'        => 149,
        'Enterprise' => 499,
    ];

    /** Workflows spanning multiple business areas (Phase 2 scope expansion) */
    private const WORKFLOWS = [
        // Support
        'support/live-chat',
        'support/ticket-resolution',
        'support/csat-follow-up',
        // Sales
        'sales/lead-enrichment',
        'sales/proposal-draft',
        'sales/email-sequence',
        // Finance
        'finance/invoice-automation',
        'finance/reconciliation',
        // Engineering
        'eng/code-review',
        'eng/doc-generation',
        // Marketing
        'marketing/seo-drafts',
        'marketing/ad-copy',
    ];

    public function run(): void
    {
        $organization = Organization::query()->first();

        if (! $organization) {
            $this->command->warn('No organization found. Run php artisan migrate --seed first.');
            return;
        }

        // ── Features ─────────────────────────────────────────────
        $features = collect([
            ['name' => 'AI Support Assistant', 'code' => 'ai_support_assistant'],
            ['name' => 'Smart Reply',           'code' => 'smart_reply'],
            ['name' => 'Ticket Auto Reply',     'code' => 'ticket_auto_reply'],
            ['name' => 'Sales Copilot',         'code' => 'sales_copilot'],
            ['name' => 'Invoice Automation',    'code' => 'invoice_automation'],
            ['name' => 'Code Review',           'code' => 'code_review'],
        ])->map(fn (array $row) => Feature::query()->firstOrCreate(
            ['organization_id' => $organization->id, 'code' => $row['code']],
            array_merge($row, ['organization_id' => $organization->id])
        ));

        // ── Plans ─────────────────────────────────────────────────
        $basicPlan = Plan::query()->firstOrCreate(
            ['organization_id' => $organization->id, 'name' => 'Basic'],
            [
                'tier'                 => 'low',
                'monthly_price'        => self::PLAN_REVENUE['Basic'],
                'monthly_ai_budget'    => 8,
                'allow_premium_models' => false,
                'fallback_model'       => 'gpt-4o-mini',
            ]
        );

        $proPlan = Plan::query()->firstOrCreate(
            ['organization_id' => $organization->id, 'name' => 'Pro'],
            [
                'tier'                 => 'mid',
                'monthly_price'        => self::PLAN_REVENUE['Pro'],
                'monthly_ai_budget'    => 25,
                'allow_premium_models' => true,
                'fallback_model'       => null,
            ]
        );

        $enterprisePlan = Plan::query()->firstOrCreate(
            ['organization_id' => $organization->id, 'name' => 'Enterprise'],
            [
                'tier'                 => 'high',
                'monthly_price'        => self::PLAN_REVENUE['Enterprise'],
                'monthly_ai_budget'    => 80,
                'allow_premium_models' => true,
                'fallback_model'       => null,
            ]
        );

        // ── Customers (with Stripe revenue fields) ────────────────
        $customers = collect([
            [
                'name'            => 'ACME Care',
                'plan_id'         => $basicPlan->id,
                'external_id'     => 'cust_acme_001',
                'email'           => 'ops@acme-care.io',
                'active'          => true,
                'monthly_revenue' => self::PLAN_REVENUE['Basic'],
            ],
            [
                'name'            => 'NovaShop',
                'plan_id'         => $basicPlan->id,
                'external_id'     => 'cust_nova_002',
                'email'           => 'tech@novashop.com',
                'active'          => true,
                'monthly_revenue' => self::PLAN_REVENUE['Basic'],
            ],
            [
                'name'            => 'HelpDeskly',
                'plan_id'         => $proPlan->id,
                'external_id'     => 'cust_helpdesk_003',
                'email'           => 'admin@helpdesk.ly',
                'active'          => true,
                'monthly_revenue' => self::PLAN_REVENUE['Pro'],
            ],
            [
                'name'            => 'ScaleOps',
                'plan_id'         => $proPlan->id,
                'external_id'     => 'cust_scale_004',
                'email'           => 'it@scaleops.co',
                'active'          => true,
                'monthly_revenue' => self::PLAN_REVENUE['Pro'],
            ],
            [
                'name'            => 'WhaleCare',
                'plan_id'         => $enterprisePlan->id,
                'external_id'     => 'cust_whale_005',
                'email'           => 'enterprise@whalecare.ai',
                'active'          => true,
                'monthly_revenue' => self::PLAN_REVENUE['Enterprise'],
            ],
        ])->map(fn (array $row) => Customer::query()->firstOrCreate(
            ['organization_id' => $organization->id, 'external_id' => $row['external_id']],
            array_merge($row, ['organization_id' => $organization->id])
        ));

        // ── Policies ──────────────────────────────────────────────
        $policySeed = [
            [
                'name'       => 'Budget cap — AI support feature',
                'type'       => 'budget_cap',
                'scope'      => 'feature',
                'conditions' => ['threshold' => 500],
                'actions'    => [],
            ],
            [
                'name'       => 'Alert — customer exceeds monthly AI threshold',
                'type'       => 'alert_threshold',
                'scope'      => 'customer',
                'conditions' => ['threshold' => 300],
                'actions'    => [],
            ],
            [
                'name'       => 'Fallback model — cost optimisation',
                'type'       => 'fallback_model',
                'scope'      => 'plan',
                'conditions' => ['threshold' => 1.8],
                'actions'    => ['fallback_model' => 'claude-3-5-haiku'],
            ],
            [
                'name'       => 'Basic plan — no premium models',
                'type'       => 'premium_model_restriction',
                'scope'      => 'plan',
                'conditions' => [],
                'actions'    => ['fallback_model' => 'gpt-4o-mini'],
            ],
        ];

        foreach ($policySeed as $p) {
            Policy::query()->firstOrCreate(
                ['organization_id' => $organization->id, 'name' => $p['name']],
                [
                    'type'       => $p['type'],
                    'scope'      => $p['scope'],
                    'is_active'  => true,
                    'conditions' => $p['conditions'],
                    'actions'    => $p['actions'],
                ]
            );
        }

        // ── AI Requests ───────────────────────────────────────────
        if (AIRequest::query()->where('organization_id', $organization->id)->exists()) {
            return;
        }

        $estimator     = app(CostEstimatorService::class);
        $policyService = app(PolicyEvaluationService::class);

        $featureByCode = $features->keyBy('code');

        for ($i = 0; $i < 320; $i++) {
            $customer = $this->pickCustomer($customers);
            $planName = strtolower((string) optional($customer->plan)->name);

            [$provider, $requestedModel, $routedModel] = $this->pickModels($planName);

            $feature  = $this->pickFeature($featureByCode);
            $workflow = fake()->randomElement(self::WORKFLOWS);

            [$promptTokens, $completionTokens] = $this->pickTokens($feature->code);

            $cost = $estimator->estimate($provider, $routedModel, $promptTokens, $completionTokens);

            // Simulate routing savings when downgraded
            $routingSavings = 0;
            $routingOutcome = null;
            $routingTier    = null;
            if ($requestedModel !== $routedModel) {
                $originalCost   = $estimator->estimate($provider, $requestedModel, $promptTokens, $completionTokens);
                $routingSavings = max(0, $originalCost - $cost);
                $routingOutcome = 'downgraded';
                $routingTier    = 'economy';
            }

            $request = AIRequest::query()->create([
                'organization_id'  => $organization->id,
                'provider'         => $provider,
                'requested_provider' => $provider,
                'model'            => $routedModel,
                'requested_model'  => $requestedModel,
                'feature_id'       => $feature->id,
                'customer_id'      => $customer->id,
                'plan_id'          => $customer->plan_id,
                'workflow_name'    => $workflow,
                'prompt_tokens'    => $promptTokens,
                'completion_tokens'=> $completionTokens,
                'estimated_cost'   => $cost,
                'routing_outcome'  => $routingOutcome,
                'routing_tier'     => $routingTier,
                'routing_savings'  => $routingSavings,
                'created_at'       => now()->subDays(fake()->numberBetween(0, 40))
                                         ->subHours(fake()->numberBetween(0, 23))
                                         ->subMinutes(fake()->numberBetween(0, 59)),
            ]);

            // @phpstan-ignore-next-line — deprecated for runtime; fine for seeding demo data
            $policyService->evaluate($request);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────

    private function pickCustomer(Collection $customers): Customer
    {
        $roll = fake()->numberBetween(1, 100);

        return match (true) {
            $roll <= 35 => $customers->firstWhere('external_id', 'cust_whale_005'),
            $roll <= 58 => $customers->firstWhere('external_id', 'cust_acme_001'),
            $roll <= 74 => $customers->firstWhere('external_id', 'cust_nova_002'),
            $roll <= 88 => $customers->firstWhere('external_id', 'cust_helpdesk_003'),
            default     => $customers->firstWhere('external_id', 'cust_scale_004'),
        };
    }

    /** Returns [provider, requestedModel, routedModel] */
    private function pickModels(string $planName): array
    {
        if ($planName === 'basic') {
            $requested = fake()->randomElement(['gpt-4o', 'claude-3-5-sonnet']);
            // Basic plan: 70% downgraded to cheap model
            if (fake()->boolean(70)) {
                return ['openai', $requested, 'gpt-4o-mini'];
            }
            return ['openai', $requested, $requested];
        }

        if ($planName === 'enterprise') {
            return fake()->randomElement([
                ['openai',     'gpt-4o',           'gpt-4o'],
                ['anthropic',  'claude-3-5-sonnet', 'claude-3-5-sonnet'],
                ['openai',     'gpt-4o',            'gpt-4o-mini'],  // occasional downgrade
            ]);
        }

        // Pro — mix of models, occasional downgrade
        return fake()->randomElement([
            ['openai',    'gpt-4o',           'gpt-4o-mini'],
            ['openai',    'gpt-4o',           'gpt-4o'],
            ['anthropic', 'claude-3-5-sonnet','claude-3-5-haiku'],
            ['anthropic', 'claude-3-5-haiku', 'claude-3-5-haiku'],
        ]);
    }

    private function pickFeature(Collection $featureByCode): Feature
    {
        $weights = [
            'ai_support_assistant' => 40,
            'smart_reply'          => 20,
            'ticket_auto_reply'    => 12,
            'sales_copilot'        => 12,
            'invoice_automation'   => 10,
            'code_review'          => 6,
        ];
        $roll = fake()->numberBetween(1, 100);
        $acc  = 0;
        foreach ($weights as $code => $w) {
            $acc += $w;
            if ($roll <= $acc) {
                return $featureByCode->get($code) ?? $featureByCode->first();
            }
        }
        return $featureByCode->first();
    }

    private function pickTokens(string $featureCode): array
    {
        return match ($featureCode) {
            'ai_support_assistant' => [
                fake()->numberBetween(900, 3200),
                fake()->numberBetween(600, 2600),
            ],
            'code_review' => [
                fake()->numberBetween(2000, 8000),
                fake()->numberBetween(1000, 4000),
            ],
            'invoice_automation' => [
                fake()->numberBetween(500, 2000),
                fake()->numberBetween(200, 800),
            ],
            default => [
                fake()->numberBetween(180, 1600),
                fake()->numberBetween(120, 1200),
            ],
        };
    }
}
