<?php

namespace App\Services;

/**
 * BusinessConstants
 *
 * Constantes transverses réellement partagées entre plusieurs services.
 *
 * IMPORTANT : plans, prix, modèles et entitlements sont dans config/Margexa.php
 * et accessibles via App\Support\MargeXaCatalog — pas ici.
 *
 * Ce fichier contient uniquement :
 * - Constantes d'actions policy (PolicyEvaluationService)
 * - Constantes du moteur de diagnostic (DiagnosticService)
 * - Seuils de scoring partagés
 */
class BusinessConstants
{
    // ─────────────────────────────────────────────────────────────────────
    // Actions politique — utilisées par PolicyEvaluationService
    // ─────────────────────────────────────────────────────────────────────

    public const POLICY_ACTION_ALLOWED  = 'allowed';
    public const POLICY_ACTION_BLOCKED  = 'blocked';
    public const POLICY_ACTION_FALLBACK = 'fallback_applied';

    // ─────────────────────────────────────────────────────────────────────
    // Modèles premium V1 — utilisés par PolicyEvaluationService
    // Source de vérité : config/Margexa.php > models[*][premium]
    // Cette liste est un cache constant pour les évaluations rapides.
    // ─────────────────────────────────────────────────────────────────────

    public const PREMIUM_MODELS = [
        'gpt-4o',
        'claude-3-5-sonnet',
    ];

    // ─────────────────────────────────────────────────────────────────────
    // Simulation — coût relatif par tier modèle (ratio vs premium)
    // Utilisé par SimulationService pour calculer les projections de coûts.
    // ─────────────────────────────────────────────────────────────────────

    public const TIER_COSTS = [
        'flagship' => 0.025,
        'premium'  => 0.008,
        'standard' => 0.001,
        'economy'  => 0.0003,
    ];

    // ─────────────────────────────────────────────────────────────────────
    // Diagnostic — coûts modèles V1 (input/output per 1K tokens)
    // Scope V1 strict : gpt-4o, gpt-4o-mini, claude-3-5-sonnet, claude-3-5-haiku
    // ─────────────────────────────────────────────────────────────────────

    public const DIAG_MODEL_COSTS = [
        'gpt-4o'          => ['input' => 0.005,   'output' => 0.015],
        'gpt-4o-mini'     => ['input' => 0.00015, 'output' => 0.0006],
        'claude-3-5-sonnet' => ['input' => 0.003, 'output' => 0.015],
        'claude-3-5-haiku'  => ['input' => 0.00025, 'output' => 0.00125],
    ];

    // ─────────────────────────────────────────────────────────────────────
    // Diagnostic — tokens moyens par use case support
    // ─────────────────────────────────────────────────────────────────────

    public const DIAG_USE_CASE_TOKENS = [
        'support_client'       => ['input' => 800,  'output' => 400],
        'assistant_sav'        => ['input' => 1200, 'output' => 600],
        'auto_reponse_ticket'  => ['input' => 600,  'output' => 300],
        'copilote_support'     => ['input' => 1500, 'output' => 800],
        'default'              => ['input' => 1000, 'output' => 500],
    ];

    // ─────────────────────────────────────────────────────────────────────
    // Diagnostic — mapping volume tiers
    // ─────────────────────────────────────────────────────────────────────

    public const DIAG_VOLUME_MAP = [
        '< 10k req/mois' => 5000,
        '10k – 50k'      => 30000,
        '50k – 100k'     => 75000,
        '100k+'          => 150000,
    ];

    // ─────────────────────────────────────────────────────────────────────
    // Diagnostic — pondérations des risques
    // ─────────────────────────────────────────────────────────────────────

    public const DIAG_RISK_WEIGHTS = [
        'premium_model_no_restriction' => 25,
        'no_plan_differentiation'      => 20,
        'high_volume'                  => 15,
        'flat_pricing_variable_cost'   => 15,
        'no_fallback_strategy'         => 10,
        'no_budget_caps'               => 10,
        'whale_risk'                   => 5,
    ];

    // ─────────────────────────────────────────────────────────────────────
    // Scoring — seuils partagés entre DiagnosticService et AuditService
    // ─────────────────────────────────────────────────────────────────────

    public const THRESHOLD_SUCCESS = 80;
    public const THRESHOLD_WARNING = 50;

    public const SCORE_AUDIT_SUCCESS = 100;
    public const SCORE_AUDIT_WARNING = 60;
    public const SCORE_AUDIT_FAIL    = 0;

    public const LABEL_SUCCESS = 'Succès';
    public const LABEL_WARNING = 'Avertissement';
    public const LABEL_FAIL    = 'Échec';
}
