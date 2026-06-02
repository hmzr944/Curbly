<?php

namespace App\Services;

class PolicyTemplateService
{
    public function all(): array
    {
        return [

            // ──────────────────────────────────────────────────────────────
            // UNIVERSAL — applicables à tous les secteurs
            // ──────────────────────────────────────────────────────────────

            [
                'key'               => 'global_monthly_cap',
                'name'              => 'Plafond IA total de l\'organisation',
                'vertical'          => 'universal',
                'type'              => 'budget_cap',
                'scope'             => 'organization',
                'savings_potential' => 'élevé',
                'description'       => 'Bloquer toute requête IA dès que l\'enveloppe mensuelle de l\'organisation est dépassée.',
                'why'               => 'Sans cap global, une seule fonctionnalité peut consommer l\'intégralité du budget IA mensuel sans déclencher aucune alarme.',
                'conditions'        => ['threshold' => 2000],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'basic_no_premium',
                'name'              => 'Plan Basic : interdire les modèles premium',
                'vertical'          => 'universal',
                'type'              => 'premium_model_restriction',
                'scope'             => 'plan',
                'savings_potential' => 'élevé',
                'description'       => 'Bloquer les modèles premium pour les flux support Basic.',
                'why'               => 'Les plans entrée de gamme ne justifient pas le coût d\'un modèle premium. Chaque requête Basic sur GPT-4o coûte 10x inutilement.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'premium_only_high_tier',
                'name'              => 'Modèles premium réservés aux plans Pro et Enterprise',
                'vertical'          => 'universal',
                'type'              => 'premium_model_restriction',
                'scope'             => 'plan',
                'savings_potential' => 'élevé',
                'description'       => 'Éviter la surutilisation des modèles premium sur les plans entrée de gamme.',
                'why'               => 'Réserver les modèles chers aux plans Pro/Enterprise garantit que le coût IA reste corrélé au revenu généré par client.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'fallback_after_threshold',
                'name'              => 'Repli automatique au-delà du seuil de coût',
                'vertical'          => 'universal',
                'type'              => 'fallback_model',
                'scope'             => 'plan',
                'savings_potential' => 'moyen',
                'description'       => 'Basculer vers un modèle moins cher dès que le coût d\'une requête dépasse le seuil défini.',
                'why'               => 'Quand une requête dépasse votre coût cible par interaction, basculer automatiquement préserve la marge sans dégrader l\'expérience.',
                'conditions'        => ['threshold' => 0.05],
                'actions'           => ['fallback_model' => 'claude-3-5-haiku'],
            ],

            [
                'key'               => 'customer_monthly_threshold',
                'name'              => 'Alerter si un client dépasse le seuil mensuel',
                'vertical'          => 'universal',
                'type'              => 'alert_threshold',
                'scope'             => 'customer',
                'savings_potential' => 'moyen',
                'description'       => 'Signaler les clients dont le coût IA support dépasse la cible mensuelle.',
                'why'               => 'Un client qui coûte 300€/mois en IA alors qu\'il paie 49€ d\'abonnement est un client non rentable. Cette règle alerte avant que ça empire.',
                'conditions'        => ['threshold' => 300],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'expensive_feature_flag',
                'name'              => 'Signaler les fonctionnalités coûteuses',
                'vertical'          => 'universal',
                'type'              => 'alert_threshold',
                'scope'             => 'feature',
                'savings_potential' => 'moyen',
                'description'       => 'Détecter les fonctionnalités support créant des fuites de marge.',
                'why'               => 'Certaines fonctionnalités créent des pics de coût IA invisibles. Cette alerte isole les features à problème avant qu\'elles pèsent sur la marge globale.',
                'conditions'        => ['threshold' => 250],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'support_feature_budget_cap',
                'name'              => 'Plafond budgétaire par fonctionnalité',
                'vertical'          => 'universal',
                'type'              => 'budget_cap',
                'scope'             => 'feature',
                'savings_potential' => 'moyen',
                'description'       => 'Protéger la marge par fonctionnalité en cas de pic d\'utilisation.',
                'why'               => 'Chaque fonctionnalité a une enveloppe IA implicite. Dépasser 500€/mois sur une seule feature est souvent le signe d\'une fuite non détectée.',
                'conditions'        => ['threshold' => 500],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'cost_spike_alert',
                'name'              => 'Alerte pic de coût soudain',
                'vertical'          => 'universal',
                'type'              => 'alert_threshold',
                'scope'             => 'organization',
                'savings_potential' => 'élevé',
                'description'       => 'Alerter si le coût IA dépasse significativement la moyenne récente.',
                'why'               => 'Une anomalie soudaine (bug de retry, boucle infinie, feature mal déployée) peut multiplier les coûts IA par 3 en quelques heures. Cette règle détecte le pic immédiatement.',
                'conditions'        => ['threshold' => 150],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'overnight_batch_cheap',
                'name'              => 'Tâches batch nocturnes : modèle économique obligatoire',
                'vertical'          => 'universal',
                'type'              => 'premium_model_restriction',
                'scope'             => 'feature',
                'savings_potential' => 'moyen',
                'description'       => 'Forcer le modèle économique sur les workflows non-temps-réel et les traitements en lot.',
                'why'               => 'Les traitements en lot n\'ont pas besoin d\'un modèle premium. Forcer le modèle économique sur les workflows batch réduit le coût de 60 à 90%.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'new_feature_observe_first',
                'name'              => 'Nouvelle fonctionnalité : observation avant production',
                'vertical'          => 'universal',
                'type'              => 'alert_threshold',
                'scope'             => 'feature',
                'savings_potential' => 'faible',
                'description'       => 'Surveiller les coûts d\'une nouvelle feature IA avant tout déploiement en production.',
                'why'               => 'Déployer une nouvelle feature IA sans la surveiller d\'abord est une prise de risque budgétaire. Cette policy détecte les anomalies avant qu\'elles coûtent.',
                'conditions'        => ['threshold' => 100],
                'actions'           => ['fallback_model' => null],
            ],

            // ──────────────────────────────────────────────────────────────
            // SUPPORT CLIENT SAAS
            // ──────────────────────────────────────────────────────────────

            [
                'key'               => 'support_free_tier_cap',
                'name'              => 'Plan Free : cap strict par utilisateur actif',
                'vertical'          => 'support',
                'type'              => 'budget_cap',
                'scope'             => 'plan',
                'savings_potential' => 'élevé',
                'description'       => 'Bloquer les requêtes IA support dès que l\'enveloppe mensuelle du plan gratuit est dépassée.',
                'why'               => 'Un utilisateur gratuit qui génère autant de coût IA qu\'un utilisateur payant détruit directement votre marge. Un cap strict sur le plan Free est non-négociable.',
                'conditions'        => ['threshold' => 20],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'support_escalated_premium_only',
                'name'              => 'Tickets escaladés uniquement : autoriser le premium',
                'vertical'          => 'support',
                'type'              => 'premium_model_restriction',
                'scope'             => 'feature',
                'savings_potential' => 'élevé',
                'description'       => 'Réserver les modèles premium aux tickets de haute priorité ou escaladés.',
                'why'               => 'Seuls les tickets escaladés justifient un modèle premium. Le reste du volume (80%) peut être traité avec un modèle économique sans perte de qualité perçue.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'claude-3-5-haiku'],
            ],

            [
                'key'               => 'support_first_response_cheap',
                'name'              => 'Première réponse automatique : modèle économique',
                'vertical'          => 'support',
                'type'              => 'fallback_model',
                'scope'             => 'feature',
                'savings_potential' => 'élevé',
                'description'       => 'Forcer un modèle économique sur la première réponse, réserver le premium à la résolution complexe.',
                'why'               => 'La première réponse automatique n\'a pas besoin d\'un GPT-4o. Réserver le premium à la résolution complexe réduit le coût moyen par ticket de 40 à 60%.',
                'conditions'        => ['threshold' => 0.02],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'support_whale_alert',
                'name'              => 'Client whale : alerte si coût > 20% du total',
                'vertical'          => 'support',
                'type'              => 'alert_threshold',
                'scope'             => 'customer',
                'savings_potential' => 'moyen',
                'description'       => 'Signaler tout client dont le coût IA mensuel représente une part disproportionnée du total.',
                'why'               => 'Un client qui concentre plus de 20% de votre coût IA total est un risque de concentration. Si ce client churne, votre rentabilité change du jour au lendemain.',
                'conditions'        => ['threshold' => 600],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'support_high_volume_fallback',
                'name'              => 'Volume élevé : repli automatique sur modèle économique',
                'vertical'          => 'support',
                'type'              => 'fallback_model',
                'scope'             => 'plan',
                'savings_potential' => 'élevé',
                'description'       => 'Basculer automatiquement vers un modèle moins cher au-delà d\'un seuil de volume mensuel.',
                'why'               => 'Au-delà de 50k requêtes/mois, le choix du modèle fait une différence de 300 à 800€. Forcer le repli à ce seuil est la décision la plus rentable à prendre.',
                'conditions'        => ['threshold' => 0.04],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'support_plan_margin_ratio',
                'name'              => 'Alerte marge plan : coût IA > 30% du revenu',
                'vertical'          => 'support',
                'type'              => 'alert_threshold',
                'scope'             => 'plan',
                'savings_potential' => 'élevé',
                'description'       => 'Alerter si les coûts IA support d\'un plan dépassent 30% du revenu mensuel généré.',
                'why'               => 'Si vos coûts IA support représentent plus de 30% du revenu du plan, ce plan n\'est plus rentable. Cette alerte permet de réagir avant la fin du mois.',
                'conditions'        => ['threshold' => 150],
                'actions'           => ['fallback_model' => null],
            ],

            // ──────────────────────────────────────────────────────────────
            // E-COMMERCE
            // ──────────────────────────────────────────────────────────────

            [
                'key'               => 'ecommerce_chatbot_cap',
                'name'              => 'Chatbot produit : cap si coût > marge unitaire',
                'vertical'          => 'ecommerce',
                'type'              => 'budget_cap',
                'scope'             => 'feature',
                'savings_potential' => 'élevé',
                'description'       => 'Bloquer le chatbot produit si le coût IA par session dépasse la marge unitaire du produit.',
                'why'               => 'Un chatbot qui coûte plus que la marge du produit vendu inverse l\'équation économique. Fixer un cap basé sur la marge unitaire est la seule protection rationnelle.',
                'conditions'        => ['threshold' => 0.08],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'ecommerce_returns_cheap_only',
                'name'              => 'Traitement des retours : modèle économique uniquement',
                'vertical'          => 'ecommerce',
                'type'              => 'premium_model_restriction',
                'scope'             => 'feature',
                'savings_potential' => 'moyen',
                'description'       => 'Forcer un modèle économique sur le traitement automatique des retours et réclamations.',
                'why'               => 'Le traitement des retours est un workflow de classification bas coût. Un modèle premium ici n\'apporte aucune valeur différentielle et coûte 10x inutilement.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'ecommerce_anonymous_cheap',
                'name'              => 'Visiteurs non-acheteurs : restriction maximale',
                'vertical'          => 'ecommerce',
                'type'              => 'premium_model_restriction',
                'scope'             => 'plan',
                'savings_potential' => 'moyen',
                'description'       => 'Bloquer l\'accès aux modèles premium pour les visiteurs sans historique d\'achat.',
                'why'               => 'Les visiteurs qui n\'ont jamais acheté ont un LTV nul. Les laisser consommer du GPT-4o sans restriction est un coût IA sans retour sur investissement direct.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'ecommerce_peak_budget_cap',
                'name'              => 'Pic saisonnier : plafond organisationnel renforcé',
                'vertical'          => 'ecommerce',
                'type'              => 'budget_cap',
                'scope'             => 'organization',
                'savings_potential' => 'élevé',
                'description'       => 'Protéger le budget IA global pendant les périodes de pic de trafic.',
                'why'               => 'Les pics saisonniers (soldes, Black Friday) peuvent multiplier la consommation IA par 5 à 10. Un cap absolu évite la surprise sur la facture mensuelle.',
                'conditions'        => ['threshold' => 5000],
                'actions'           => ['fallback_model' => null],
            ],

            // ──────────────────────────────────────────────────────────────
            // FINTECH / FINANCE
            // ──────────────────────────────────────────────────────────────

            [
                'key'               => 'fintech_compliance_alert',
                'name'              => 'Flux conformité : alerte si coût hors norme',
                'vertical'          => 'fintech',
                'type'              => 'alert_threshold',
                'scope'             => 'feature',
                'savings_potential' => 'faible',
                'description'       => 'Surveiller les coûts IA sur les flux réglementaires (KYC, AML, conformité) sans les bloquer.',
                'why'               => 'Les flux réglementaires ont un enjeu légal direct. Le coût d\'un modèle premium est justifié — mais une alerte évite les dérives budgétaires progressives.',
                'conditions'        => ['threshold' => 800],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'fintech_onboarding_cheap',
                'name'              => 'Onboarding KYC : modèle économique suffisant',
                'vertical'          => 'fintech',
                'type'              => 'premium_model_restriction',
                'scope'             => 'feature',
                'savings_potential' => 'moyen',
                'description'       => 'Forcer un modèle économique sur les flux d\'onboarding KYC standard.',
                'why'               => 'L\'onboarding KYC est un workflow de classification structurée. Un modèle économique suffit pour 95% des cas — garder le premium uniquement pour les exceptions.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'fintech_fraud_detection_cap',
                'name'              => 'Détection fraude : plafond mensuel absolu',
                'vertical'          => 'fintech',
                'type'              => 'budget_cap',
                'scope'             => 'feature',
                'savings_potential' => 'moyen',
                'description'       => 'Fixer un cap absolu sur le budget IA mensuel de la détection fraude.',
                'why'               => 'La détection fraude est critique mais son coût IA doit rester prévisible. Un cap mensuel vous protège contre les pics d\'incidents sans bloquer le service.',
                'conditions'        => ['threshold' => 1200],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'fintech_per_transaction_alert',
                'name'              => 'Coût IA par transaction : alerte si > rentabilité',
                'vertical'          => 'fintech',
                'type'              => 'alert_threshold',
                'scope'             => 'customer',
                'savings_potential' => 'élevé',
                'description'       => 'Alerter si le coût IA par transaction dépasse le seuil de rentabilité défini.',
                'why'               => 'Si votre coût IA par transaction dépasse votre commission nette, chaque transaction générée est une perte. Cette alerte est le canari dans la mine.',
                'conditions'        => ['threshold' => 0.03],
                'actions'           => ['fallback_model' => null],
            ],

            // ──────────────────────────────────────────────────────────────
            // RH / RECRUTEMENT
            // ──────────────────────────────────────────────────────────────

            [
                'key'               => 'hr_cv_screening_cheap',
                'name'              => 'Screening CV à grande échelle : modèle économique',
                'vertical'          => 'rh',
                'type'              => 'premium_model_restriction',
                'scope'             => 'feature',
                'savings_potential' => 'élevé',
                'description'       => 'Forcer le modèle économique sur les workflows de tri et présélection de CV.',
                'why'               => 'Trier 500 CVs avec GPT-4o coûte 15 à 30x plus cher qu\'avec un modèle économique. Pour du screening de masse, la différence de qualité ne justifie pas l\'écart de coût.',
                'conditions'        => ['threshold' => null],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

            [
                'key'               => 'hr_interview_premium_only',
                'name'              => 'Entretiens IA structurés : surveiller le coût',
                'vertical'          => 'rh',
                'type'              => 'alert_threshold',
                'scope'             => 'feature',
                'savings_potential' => 'faible',
                'description'       => 'Surveiller les coûts IA sur les entretiens structurés pour s\'assurer que le premium reste justifié.',
                'why'               => 'Un entretien IA engage directement la marque employeur. Le premium est justifié — mais une alerte évite que le périmètre s\'élargisse aux cas non qualifiés.',
                'conditions'        => ['threshold' => 500],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'hr_recruiter_monthly_cap',
                'name'              => 'Budget mensuel par recruteur : cap strict',
                'vertical'          => 'rh',
                'type'              => 'budget_cap',
                'scope'             => 'customer',
                'savings_potential' => 'moyen',
                'description'       => 'Plafonner la consommation IA mensuelle par recruteur ou par seat.',
                'why'               => 'Sans cap par recruteur, un profil hyperactif peut monopoliser votre budget IA RH. Un cap mensuel par seat garantit une consommation équitable et prévisible.',
                'conditions'        => ['threshold' => 200],
                'actions'           => ['fallback_model' => null],
            ],

            [
                'key'               => 'hr_mass_campaign_fallback',
                'name'              => 'Campagne de recrutement de masse : repli automatique',
                'vertical'          => 'rh',
                'type'              => 'fallback_model',
                'scope'             => 'feature',
                'savings_potential' => 'élevé',
                'description'       => 'Basculer automatiquement sur un modèle économique lors des campagnes à fort volume.',
                'why'               => 'Une campagne de recrutement peut générer 10 000 interactions en 48h. Sans repli automatique, la facture IA explose. Ce template active le basculement dès le seuil de volume.',
                'conditions'        => ['threshold' => 0.03],
                'actions'           => ['fallback_model' => 'gpt-4o-mini'],
            ],

        ];
    }

    public function find(string $key): ?array
    {
        foreach ($this->all() as $template) {
            if ($template['key'] === $key) {
                return $template;
            }
        }

        return null;
    }
}
