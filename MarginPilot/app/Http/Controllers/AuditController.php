<?php

namespace App\Http\Controllers;

use App\Models\DiagnosticRequest;
use App\Services\DiagnosticService;
use App\Support\MargeXaCatalog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Audit Controller - Commercial Entry Point
 * 
 * Gère le tunnel: Audit IA → Activation → Contrôle
 */
class AuditController extends Controller
{
    public function __construct(
        private DiagnosticService $diagnosticService
    ) {}

    /**
     * Affiche le formulaire d'audit IA en 5 minutes.
     */
    public function create()
    {
        return Inertia::render('Public/Audit', [
            'providers' => MargeXaCatalog::providerOptions(),
            'models' => MargeXaCatalog::auditModelOptions(),
            'volumes' => [
                ['value' => '< 10k req/mois', 'label' => '< 10k req/mois', 'estimate' => '~500€/mois'],
                ['value' => '10k – 50k', 'label' => '10k – 50k req/mois', 'estimate' => '~2 000€/mois'],
                ['value' => '50k – 100k', 'label' => '50k – 100k req/mois', 'estimate' => '~5 000€/mois'],
                ['value' => '100k+', 'label' => '100k+ req/mois', 'estimate' => '~10 000€+/mois'],
            ],
            'useCases' => [
                ['value' => 'support_client', 'label' => 'Support client / Chatbot'],
                ['value' => 'assistant_sav', 'label' => 'Assistant SAV'],
                ['value' => 'auto_reponse_ticket', 'label' => 'Auto-réponse tickets'],
                ['value' => 'copilote_support', 'label' => 'Copilote agent support'],
            ],
            'pricingModels' => [
                ['value' => 'flat', 'label' => 'Forfait fixe'],
                ['value' => 'usage', 'label' => 'À l\'usage'],
                ['value' => 'hybrid', 'label' => 'Hybride (fixe + variable)'],
            ],
            'plans' => [
                ['value' => 'Free', 'label' => 'Free'],
                ['value' => 'Basic', 'label' => 'Basic / Starter'],
                ['value' => 'Pro', 'label' => 'Pro / Professional'],
                ['value' => 'Enterprise', 'label' => 'Enterprise'],
            ],
        ]);
    }

    /**
     * Traite le formulaire et génère l'audit.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'company' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'provider' => ['required', 'string', Rule::in(array_column(MargeXaCatalog::providerOptions(), 'value'))],
            'model' => ['required', 'string', Rule::in(MargeXaCatalog::auditModelIds())],
            'volume' => 'required|string',
            'useCase' => 'required|string',
            'pricing' => 'required|string',
            'plans' => 'required|array|min:1',
            'current_spend' => 'nullable|numeric|min:0',
            'customer_count' => 'nullable|integer|min:1',
            'industry' => 'nullable|string|max:100',
        ]);

        // Link to organization immediately if the submitter is authenticated
        if ($request->user()?->organization) {
            $validated['organization_id'] = $request->user()->organization->id;
        }

        $diagnostic = $this->diagnosticService->processRequest($validated);

        return redirect()->route('audit.show', [
            'token' => $diagnostic->access_token,
        ]);
    }

    /**
     * Affiche le résultat de l'audit de manière professionnelle.
     */
    public function show(Request $request, string $token)
    {
        $diagnostic = DiagnosticRequest::where('access_token', $token)->firstOrFail();

        // Enrichir les données pour le rendu
        $auditData = $this->buildAuditPresentation($diagnostic);

        return Inertia::render('Public/AuditResult', [
            'audit' => $auditData,
            'token' => $token,
        ]);
    }

    /**
     * Construit la présentation de l'audit pour le frontend.
     */
    private function buildAuditPresentation(DiagnosticRequest $diagnostic): array
    {
        $report = $diagnostic->audit_report;
        if (is_string($report)) {
            $report = json_decode($report, true) ?: [];
        } elseif (!is_array($report)) {
            $report = [];
        }
        $recommendations = $diagnostic->policy_recommendations;
        if (is_string($recommendations)) {
            $recommendations = json_decode($recommendations, true) ?: [];
        } elseif (!is_array($recommendations)) {
            $recommendations = [];
        }
        
        // Calcul du score de marge protégée
        $monthlyRevenue = $this->estimateMonthlyRevenue($diagnostic);
        $estimatedCost = $diagnostic->estimated_monthly_cost ?? 0;
        $aiCostShare = $monthlyRevenue > 0 
            ? round(($estimatedCost / $monthlyRevenue) * 100, 1) 
            : 0;

        return [
            'id' => $diagnostic->id,
            'company' => $diagnostic->company_name,
            'generatedAt' => $diagnostic->created_at->format('d/m/Y H:i'),
            
            // Scores de risque
            'riskScore' => $diagnostic->risk_score ?? 50,
            'riskLevel' => $diagnostic->risk_level ?? 'moderate',
            'riskBreakdown' => (function($val) {
                if (is_string($val)) return json_decode($val, true) ?: [];
                if (is_array($val)) return $val;
                return [];
            })($diagnostic->risk_breakdown),
            
            // Métriques financières
            'financials' => [
                'estimatedMonthlyCost' => (float) ($diagnostic->estimated_monthly_cost ?? 0),
                'estimatedWaste' => (float) ($diagnostic->estimated_waste ?? 0),
                'potentialSavings' => (float) ($diagnostic->potential_savings ?? 0),
                'annualImpact' => (float) (($diagnostic->estimated_waste ?? 0) * 12),
                'aiCostSharePercent' => (float) $aiCostShare,
                'estimatedMonthlyRevenue' => (float) $monthlyRevenue,
            ],
            
            // Profil analysé
            'profile' => [
                'provider'          => $diagnostic->provider ?? 'openai',
                'model'             => $diagnostic->primary_model ?? 'gpt-4o',
                'model_controlled_v1' => MargeXaCatalog::isAuditModelControlledV1($diagnostic->primary_model ?? ''),
                'volume'            => $diagnostic->volume_tier ?? '< 10k req/mois',
                'useCase'           => $this->formatUseCase($diagnostic->use_case ?? 'support_client'),
                'pricing'           => $this->formatPricing($diagnostic->pricing_model ?? 'usage'),
                'plans'             => is_array($diagnostic->plans) ? $diagnostic->plans : [],
                'customerCount'     => (int) ($diagnostic->customer_count ?? 100),
            ],
            
            // Recommandations avec policies suggérées
            'recommendations' => array_map(function ($rec, $index) {
                return [
                    'number' => $index + 1,
                    'title' => $rec['title'] ?? '',
                    'description' => $rec['description'] ?? '',
                    'type' => $rec['type'] ?? 'policy',
                    'impact' => $rec['estimated_impact'] ?? '',
                    'priority' => $rec['priority'] ?? 3,
                ];
            }, $recommendations, array_keys($recommendations)),
            
            // Top fuites identifiées
            'topLeaks' => $this->identifyTopLeaks($diagnostic),
            
            // Segments sous pression
            'pressurePoints' => $this->identifyPressurePoints($diagnostic),
            
            // Prochaines étapes structurées
            'nextSteps' => $this->buildNextSteps($diagnostic),
            
            // CTAs pour conversion
            'ctas' => [
                'activate' => [
                    'title' => 'Activer Margexa',
                    'subtitle' => 'Commencez à contrôler immédiatement',
                    'action' => 'create-account',
                ],
                'deepAudit' => [
                    'title' => 'Audit approfondi',
                    'subtitle' => 'Analyse sur vos données réelles',
                    'action' => 'request-audit',
                ],
                'demo' => [
                    'title' => 'Voir une démo',
                    'subtitle' => 'En 30 minutes, tout comprendre',
                    'action' => 'schedule-demo',
                ],
            ],
        ];
    }

    /**
     * Estime le revenu mensuel basé sur les plans.
     */
    private function estimateMonthlyRevenue(DiagnosticRequest $diagnostic): float
    {
        $plans = $diagnostic->plans ?? [];
        $customerCount = $diagnostic->customer_count ?? 100;
        
        // Estimation basée sur plans
        $avgPricePerPlan = [
            'Free' => 0,
            'Basic' => 29,
            'Pro' => 99,
            'Enterprise' => 499,
        ];
        
        $planCount = count($plans);
        if ($planCount === 0) return 0;
        
        $avgPrice = array_sum(array_map(
            fn($p) => $avgPricePerPlan[$p] ?? 50,
            $plans
        )) / $planCount;
        
        return $avgPrice * $customerCount;
    }

    /**
     * Identifie les top fuites de marge potentielles.
     */
    private function identifyTopLeaks(DiagnosticRequest $diagnostic): array
    {
        $leaks = [];
        $model = $diagnostic->primary_model;
        $plans = $diagnostic->plans ?? [];
        
        // Fuite 1: Modèle premium sur plan Basic
        if (in_array('Basic', $plans, true) && in_array($model, MargeXaCatalog::premiumModelIds(), true)) {
            $leaks[] = [
                'source' => 'Plan Basic sur modèle premium',
                'description' => "Les clients Basic utilisent {$model} coûteux",
                'estimatedLeak' => round($diagnostic->estimated_waste * 0.35, 2),
                'severity' => 'high',
            ];
        }
        
        // Fuite 2: Pas de fallback
        if (! in_array($model, MargeXaCatalog::fallbackModelIds(), true)) {
            $leaks[] = [
                'source' => 'Absence de fallback économique',
                'description' => 'Toutes les requêtes vont au modèle principal, même les simples',
                'estimatedLeak' => round($diagnostic->estimated_waste * 0.25, 2),
                'severity' => 'medium',
            ];
        }
        
        // Fuite 3: Pas de budget cap
        $leaks[] = [
            'source' => 'Pas de plafond par client',
            'description' => 'Un "whale" peut générer des coûts illimités',
            'estimatedLeak' => round($diagnostic->estimated_waste * 0.2, 2),
            'severity' => 'medium',
        ];
        
        // Fuite 4: Volume élevé
        if (in_array($diagnostic->volume_tier, ['50k – 100k', '100k+'])) {
            $leaks[] = [
                'source' => 'Volume sans optimisation',
                'description' => 'À ce volume, chaque % économisé compte',
                'estimatedLeak' => round($diagnostic->estimated_waste * 0.2, 2),
                'severity' => 'high',
            ];
        }
        
        return array_slice($leaks, 0, 4);
    }

    /**
     * Identifie les points de pression (clients/features/plans).
     */
    private function identifyPressurePoints(DiagnosticRequest $diagnostic): array
    {
        $points = [];
        $plans = $diagnostic->plans ?? [];
        
        // Pression par plan
        foreach ($plans as $plan) {
            $pressure = match($plan) {
                'Free' => ['level' => 'critical', 'reason' => 'Coût IA > 100% du revenu'],
                'Basic' => ['level' => 'high', 'reason' => 'Coût IA risque de dépasser la marge'],
                'Pro' => ['level' => 'moderate', 'reason' => 'Surveiller les gros consommateurs'],
                'Enterprise' => ['level' => 'low', 'reason' => 'Marge confortable mais à optimiser'],
                default => ['level' => 'moderate', 'reason' => 'Impact à évaluer'],
            };
            
            $points[] = [
                'type' => 'plan',
                'name' => $plan,
                'pressure' => $pressure['level'],
                'reason' => $pressure['reason'],
            ];
        }
        
        return $points;
    }

    /**
     * Construit les prochaines étapes recommandées.
     */
    private function buildNextSteps(DiagnosticRequest $diagnostic): array
    {
        $riskLevel = $diagnostic->risk_level ?? 'moderate';
        
        return [
            [
                'step' => 1,
                'title' => 'Activer le contrôle sur 1 feature',
                'description' => 'Déployez Margexa sur votre chatbot principal et mesurez l\'impact en 7 jours.',
                'effort' => 'Intégration < 1h',
                'outcome' => 'Visibilité immédiate sur les coûts réels',
            ],
            [
                'step' => 2,
                'title' => 'Créer vos premières policies',
                'description' => 'Routing par plan, budget cap, fallback automatique sur les tops recommandations.',
                'effort' => '30 minutes de configuration',
                'outcome' => 'Protection active de votre marge',
            ],
            [
                'step' => 3,
                'title' => 'Mesurer l\'impact après 30 jours',
                'description' => 'Rapport CFO automatique avec coût évité, marge protégée et ROI démontré.',
                'effort' => 'Automatique',
                'outcome' => 'Business case prouvé pour scale',
            ],
        ];
    }

    private function formatUseCase(string $useCase): string
    {
        return match($useCase) {
            'support_client' => 'Support client / Chatbot',
            'assistant_sav' => 'Assistant SAV',
            'auto_reponse_ticket' => 'Auto-réponse tickets',
            'copilote_support' => 'Copilote agent support',
            default => $useCase,
        };
    }

    private function formatPricing(string $pricing): string
    {
        return match($pricing) {
            'flat' => 'Forfait fixe',
            'usage' => 'À l\'usage',
            'hybrid' => 'Hybride',
            default => $pricing,
        };
    }
}
