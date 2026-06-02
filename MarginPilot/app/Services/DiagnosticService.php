<?php

namespace App\Services;

use App\Mail\InternalLeadNotification;
use App\Mail\LeadRequestConfirmation;
use App\Models\DiagnosticRequest;
use App\Services\BusinessConstants;
use App\Support\MargeXaCatalog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DiagnosticService
{
    public function processRequest(array $data): DiagnosticRequest
    {
        $accessToken = bin2hex(random_bytes(32));

        $diagnostic = DiagnosticRequest::create([
            'access_token' => $accessToken,
            'email' => $data['email'],
            'company_name' => $data['company'],
            'contact_name' => $data['contact_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'provider' => $this->normalizeProvider($data['provider']),
            'primary_model' => $this->normalizeModel($data['model']),
            'volume_tier' => $data['volume'],
            'use_case' => $this->normalizeUseCase($data['useCase']),
            'pricing_model' => $this->normalizePricing($data['pricing']),
            'plans' => $data['plans'] ?? [],
            'current_monthly_spend' => $data['current_spend'] ?? null,
            'customer_count' => $data['customer_count'] ?? null,
            'industry' => $data['industry'] ?? null,
            'source' => $data['source'] ?? 'public_diagnostic',
            'utm_source' => $data['utm_source'] ?? null,
            'utm_campaign' => $data['utm_campaign'] ?? null,
            'utm_medium' => $data['utm_medium'] ?? null,
            'status' => DiagnosticRequest::STATUS_NEW,
        ]);

        $audit = $this->generateAudit($diagnostic);

        $diagnostic->update([
            'risk_score' => $audit['risk_score'],
            'risk_level' => $audit['risk_level'],
            'risk_breakdown' => $audit['risk_breakdown'],
            'audit_report' => $audit['report'],
            'policy_recommendations' => $audit['policy_recommendations'],
            'estimated_monthly_cost' => $audit['estimated_monthly_cost'],
            'estimated_waste' => $audit['estimated_waste'],
            'potential_savings' => $audit['potential_savings'],
        ]);

        $diagnostic = $diagnostic->fresh();

        Log::info('Diagnostic request processed', [
            'id' => $diagnostic->id,
            'company' => $diagnostic->company_name,
            'risk_level' => $audit['risk_level'],
            'is_high_value' => $diagnostic->isHighValue(),
        ]);

        if ($diagnostic->isHighValue()) {
            $this->notifyTeam($diagnostic);
        }

        return $diagnostic;
    }

    private function generateAudit(DiagnosticRequest $diagnostic): array
    {
        $riskBreakdown = $this->calculateRiskBreakdown($diagnostic);
        $riskScore = array_sum(array_column($riskBreakdown, 'score'));
        $riskLevel = $this->determineRiskLevel($riskScore);

        $costEstimate = $this->estimateMonthlyCost($diagnostic);
        $wasteEstimate = $this->estimateWaste($costEstimate, $riskBreakdown);
        $potentialSavings = $this->calculatePotentialSavings($wasteEstimate, $riskBreakdown);

        return [
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'risk_breakdown' => $riskBreakdown,
            'estimated_monthly_cost' => $costEstimate,
            'estimated_waste' => $wasteEstimate,
            'potential_savings' => $potentialSavings,
            'policy_recommendations' => $this->generatePolicyRecommendations($diagnostic, $riskBreakdown),
            'report' => $this->buildAuditReport($diagnostic, $riskBreakdown, $costEstimate, $wasteEstimate),
        ];
    }

    private function calculateRiskBreakdown(DiagnosticRequest $diagnostic): array
    {
        $breakdown = [];
        $model = $diagnostic->primary_model;
        $plans = $diagnostic->plans ?? [];
        $pricing = $diagnostic->pricing_model;
        $volume = $diagnostic->volume_tier;

        $isPremiumModel = in_array($model, MargeXaCatalog::premiumModelIds(), true);
        if ($isPremiumModel) {
            $breakdown[] = [
                'id' => 'premium_model_no_restriction',
                'title' => 'Modele premium sans restriction',
                'description' => "Vous utilisez {$model} sans garde-fou economique runtime.",
                'severity' => 'high',
                'score' => BusinessConstants::DIAG_RISK_WEIGHTS['premium_model_no_restriction'],
                'impact' => 'Le support IA peut devenir non rentable sur des requetes simples.',
            ];
        }

        $hasMultiplePlans = count($plans) > 1;
        $hasBasicPlan = in_array('Basic', $plans, true);
        if ($hasMultiplePlans && $hasBasicPlan && $isPremiumModel) {
            $breakdown[] = [
                'id' => 'no_plan_differentiation',
                'title' => 'Pas de differenciation par plan',
                'description' => 'Vos plans d entree de gamme semblent utiliser les memes modeles que les plans premium.',
                'severity' => 'high',
                'score' => BusinessConstants::DIAG_RISK_WEIGHTS['no_plan_differentiation'],
                'impact' => 'La marge fuit sur les clients les moins chers.',
            ];
        }

        $isHighVolume = in_array($volume, ['50k – 100k', '100k+'], true);
        if ($isHighVolume) {
            $breakdown[] = [
                'id' => 'high_volume',
                'title' => 'Volume eleve sans controle actif',
                'description' => "A {$volume}, chaque erreur de routage coute immediatement cher.",
                'severity' => 'medium',
                'score' => BusinessConstants::DIAG_RISK_WEIGHTS['high_volume'],
                'impact' => 'Le moindre ecart de cout se propage a grande echelle.',
            ];
        }

        if ($pricing === 'flat') {
            $breakdown[] = [
                'id' => 'flat_pricing_variable_cost',
                'title' => 'Forfait fixe, cout IA variable',
                'description' => 'Votre revenu est borne alors que le cout inference varie au runtime.',
                'severity' => 'high',
                'score' => BusinessConstants::DIAG_RISK_WEIGHTS['flat_pricing_variable_cost'],
                'impact' => 'Un client actif peut consommer plus de marge que son forfait ne couvre.',
            ];
        }

        if ($isPremiumModel) {
            $breakdown[] = [
                'id' => 'no_fallback_strategy',
                'title' => 'Pas de fallback economique',
                'description' => 'Aucune regle evidente ne protege les requetes simples ou recurrentes.',
                'severity' => 'medium',
                'score' => BusinessConstants::DIAG_RISK_WEIGHTS['no_fallback_strategy'],
                'impact' => 'Une partie du trafic pourrait tourner sur un modele moins couteux.',
            ];
        }

        $breakdown[] = [
            'id' => 'no_budget_caps',
            'title' => 'Pas de budget cap visible',
            'description' => 'Sans plafond organisation, plan ou client, la fuite de marge reste ouverte.',
            'severity' => 'medium',
            'score' => BusinessConstants::DIAG_RISK_WEIGHTS['no_budget_caps'],
            'impact' => 'Un client ou une feature peut generer une derive non detectee.',
        ];

        if ($isHighVolume && in_array('Enterprise', $plans, true)) {
            $breakdown[] = [
                'id' => 'whale_risk',
                'title' => 'Risque de concentration client',
                'description' => 'Un compte fort volume peut absorber une part disproportionnee de la marge.',
                'severity' => 'low',
                'score' => BusinessConstants::DIAG_RISK_WEIGHTS['whale_risk'],
                'impact' => 'La rentabilite devient dependante de quelques gros usages.',
            ];
        }

        return $breakdown;
    }

    private function determineRiskLevel(int $score): string
    {
        return match (true) {
            $score >= 70 => DiagnosticRequest::RISK_CRITICAL,
            $score >= 50 => DiagnosticRequest::RISK_HIGH,
            $score >= 30 => DiagnosticRequest::RISK_MODERATE,
            default => DiagnosticRequest::RISK_LOW,
        };
    }

    private function estimateMonthlyCost(DiagnosticRequest $diagnostic): float
    {
        $model = $this->normalizeModelKey($diagnostic->primary_model);
        $volume = BusinessConstants::DIAG_VOLUME_MAP[$diagnostic->volume_tier] ?? 30000;
        $useCase = $diagnostic->use_case;

        $modelCosts = MargeXaCatalog::modelCosts()[$model] ?? MargeXaCatalog::modelCosts()['gpt-4o-mini'];
        $tokens = BusinessConstants::DIAG_USE_CASE_TOKENS[$useCase] ?? BusinessConstants::DIAG_USE_CASE_TOKENS['default'];

        $costPerRequest = ($tokens['input'] / 1000 * $modelCosts['input'])
            + ($tokens['output'] / 1000 * $modelCosts['output']);

        $monthlyCost = $costPerRequest * $volume;

        return round($monthlyCost, 2);
    }

    private function estimateWaste(float $monthlyCost, array $riskBreakdown): float
    {
        $wastePercentage = 0;

        foreach ($riskBreakdown as $risk) {
            $wastePercentage += match ($risk['id']) {
                'premium_model_no_restriction' => 15,
                'no_plan_differentiation' => 12,
                'flat_pricing_variable_cost' => 8,
                'no_fallback_strategy' => 10,
                'no_budget_caps' => 5,
                default => 2,
            };
        }

        return round($monthlyCost * (min($wastePercentage, 45) / 100), 2);
    }

    private function calculatePotentialSavings(float $waste, array $riskBreakdown): float
    {
        $recoveryRate = count($riskBreakdown) >= 4 ? 0.80 : 0.70;

        return round($waste * $recoveryRate, 2);
    }

    private function generatePolicyRecommendations(DiagnosticRequest $diagnostic, array $riskBreakdown): array
    {
        $recommendations = [];
        $model = $diagnostic->primary_model;
        $fallbackModel = $this->defaultFallbackForModel($model);

        foreach ($riskBreakdown as $risk) {
            $recommendation = match ($risk['id']) {
                'premium_model_no_restriction' => [
                    'title' => 'Restreindre le modele premium par plan',
                    'description' => "Reserver {$model} aux plans Pro et Enterprise, puis basculer le reste vers {$fallbackModel}.",
                    'type' => 'routing_rule',
                    'priority' => 1,
                    'estimated_impact' => '25-35% de reduction des couts',
                    'policy_config' => [
                        'type' => 'plan_tier_restriction',
                        'plans_allowed_premium' => ['Pro', 'Enterprise'],
                        'fallback_model' => $fallbackModel,
                    ],
                ],
                'no_plan_differentiation' => [
                    'title' => 'Introduire une vraie segmentation par plan',
                    'description' => 'Definir un tier maximal par segment de clients pour eviter la fuite sur les comptes entree de gamme.',
                    'type' => 'routing_rule',
                    'priority' => 1,
                    'estimated_impact' => '20-30% de reduction sur les clients Basic',
                    'policy_config' => [
                        'type' => 'segment_routing',
                        'basic_tier' => 'economy',
                        'pro_tier' => 'standard',
                        'enterprise_tier' => 'premium',
                    ],
                ],
                'flat_pricing_variable_cost' => [
                    'title' => 'Activer un budget cap par client',
                    'description' => 'Limiter le cout IA maximum selon le plan facture.',
                    'type' => 'budget_cap',
                    'priority' => 2,
                    'estimated_impact' => 'Protection immediate contre les whales',
                    'policy_config' => [
                        'type' => 'customer_budget_cap',
                        'basic_cap' => 50,
                        'pro_cap' => 150,
                        'enterprise_cap' => 500,
                    ],
                ],
                'no_fallback_strategy' => [
                    'title' => 'Activer un fallback economique',
                    'description' => "Rediriger les requetes simples vers {$fallbackModel} pour proteger la marge sans changer votre stack.",
                    'type' => 'fallback_rule',
                    'priority' => 2,
                    'estimated_impact' => '15-25% de reduction des couts',
                    'policy_config' => [
                        'type' => 'smart_fallback',
                        'trigger' => 'simple_queries',
                        'fallback_model' => $fallbackModel,
                    ],
                ],
                'no_budget_caps' => [
                    'title' => 'Installer une alerte budget',
                    'description' => 'Recevoir un signal clair avant que le budget support IA ne derape.',
                    'type' => 'alert',
                    'priority' => 3,
                    'estimated_impact' => 'Visibilite immediate',
                    'policy_config' => [
                        'type' => 'budget_alert',
                        'threshold_percent' => 80,
                        'action' => 'notify',
                    ],
                ],
                'high_volume' => [
                    'title' => 'Activer le monitoring runtime',
                    'description' => 'Mesurer les couts par feature, client et plan pour prouver l impact des regles.',
                    'type' => 'monitoring',
                    'priority' => 3,
                    'estimated_impact' => 'Pilotage plus fin de la marge',
                    'policy_config' => [
                        'type' => 'real_time_monitoring',
                        'dimensions' => ['customer', 'plan', 'feature'],
                    ],
                ],
                default => null,
            };

            if ($recommendation !== null) {
                $recommendations[] = $recommendation;
            }
        }

        usort($recommendations, fn (array $a, array $b) => $a['priority'] <=> $b['priority']);

        return array_slice($recommendations, 0, 5);
    }

    private function buildAuditReport(
        DiagnosticRequest $diagnostic,
        array $riskBreakdown,
        float $estimatedCost,
        float $estimatedWaste
    ): array {
        $topRisks = array_slice($riskBreakdown, 0, 3);

        return [
            'summary' => [
                'company' => $diagnostic->company_name,
                'analysis_date' => now()->toISOString(),
                'profile' => [
                    'provider' => $diagnostic->provider,
                    'model' => $diagnostic->primary_model,
                    'volume' => $diagnostic->volume_tier,
                    'use_case' => $diagnostic->use_case,
                    'pricing' => $diagnostic->pricing_model,
                    'plans' => $diagnostic->plans,
                ],
            ],
            'findings' => [
                'total_risks' => count($riskBreakdown),
                'high_severity_count' => count(array_filter($riskBreakdown, fn (array $risk) => $risk['severity'] === 'high')),
                'top_risks' => array_map(
                    fn (array $risk) => [
                        'title' => $risk['title'],
                        'severity' => $risk['severity'],
                        'impact' => $risk['impact'],
                    ],
                    $topRisks
                ),
            ],
            'financials' => [
                'estimated_monthly_cost' => $estimatedCost,
                'estimated_waste' => $estimatedWaste,
                'waste_percentage' => $estimatedCost > 0 ? round(($estimatedWaste / $estimatedCost) * 100, 1) : 0,
                'estimated_annual_impact' => round($estimatedWaste * 12, 2),
            ],
            'next_steps' => [
                'immediate' => 'Appliquer les premieres regles sur votre support IA le plus critique.',
                'short_term' => 'Debloquer l AI Margin Scan ou activer le controle continu.',
                'long_term' => 'Passer a un pilotage runtime prouvant le ROI des regles.',
            ],
            'cta' => [
                'scan' => [
                    'title' => 'AI Margin Scan',
                    'description' => 'Rapport complet, recommandations et plan d activation.',
                    'value' => 'Comprendre ou fuit la marge et quoi deployer en premier.',
                ],
                'continuous_control' => [
                    'title' => 'Continuous Control',
                    'description' => 'Policies, routage economique et suivi d impact en continu.',
                    'value' => 'Passer du diagnostic a la protection active.',
                ],
            ],
        ];
    }

    private function notifyTeam(DiagnosticRequest $diagnostic): void
    {
        Log::info('High-value diagnostic lead', [
            'id' => $diagnostic->id,
            'company' => $diagnostic->company_name,
            'email' => $diagnostic->email,
            'risk_level' => $diagnostic->risk_level,
            'estimated_waste' => $diagnostic->estimated_waste,
        ]);

        Mail::to(config('mail.sales_address', 'sales@Margexa.app'))
            ->queue(new InternalLeadNotification($diagnostic, 'audit'));

        if ($diagnostic->email) {
            Mail::to($diagnostic->email)
                ->queue(new LeadRequestConfirmation($diagnostic, 'audit'));
        }
    }

    private function normalizeProvider(string $provider): string
    {
        return match (strtolower($provider)) {
            'openai' => 'openai',
            'anthropic' => 'anthropic',
            default => 'openai',
        };
    }

    private function normalizeModel(string $model): string
    {
        $normalized = strtolower(trim($model));

        return match (true) {
            str_contains($normalized, 'gpt-4o-mini') || str_contains($normalized, '4o mini') => 'gpt-4o-mini',
            str_contains($normalized, 'gpt-4o') || str_contains($normalized, '4o') => 'gpt-4o',
            str_contains($normalized, 'haiku') => 'claude-3-5-haiku',
            str_contains($normalized, 'sonnet') => 'claude-3-5-sonnet',
            MargeXaCatalog::isSupportedModel($normalized) => $normalized,
            default => 'gpt-4o-mini',
        };
    }

    private function normalizeModelKey(string $model): string
    {
        $normalized = $this->normalizeModel($model);

        return MargeXaCatalog::isSupportedModel($normalized) ? $normalized : 'gpt-4o-mini';
    }

    private function normalizeUseCase(string $useCase): string
    {
        return match (strtolower($useCase)) {
            'support_client', 'support client', 'support client / chatbot', 'chatbot support' => 'support_client',
            'assistant sav', 'assistant_sav' => 'assistant_sav',
            'auto-reponse tickets', 'auto-reponse ticket', 'auto_reponse_ticket' => 'auto_reponse_ticket',
            'copilote support', 'copilote agent support', 'copilote_support' => 'copilote_support',
            default => 'support_client',
        };
    }

    private function normalizePricing(string $pricing): string
    {
        return match (strtolower($pricing)) {
            'forfait', 'flat' => 'flat',
            'usage' => 'usage',
            'hybride', 'hybrid' => 'hybrid',
            default => 'flat',
        };
    }

    private function defaultFallbackForModel(string $model): string
    {
        return MargeXaCatalog::providerForModel($model) === 'anthropic'
            ? 'claude-3-5-haiku'
            : 'gpt-4o-mini';
    }
}
