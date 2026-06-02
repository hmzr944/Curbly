<?php

namespace App\Support;

use Illuminate\Support\Arr;

class MargeXaCatalog
{
    public static function config(?string $key = null, mixed $default = null): mixed
    {
        return config($key ? "margexa.{$key}" : 'margexa', $default);
    }

    public static function internalPlans(): array
    {
        return self::config('internal_plans', []);
    }

    public static function internalPlanIds(): array
    {
        return array_keys(self::internalPlans());
    }

    public static function internalPlan(string $planId): array
    {
        return self::internalPlans()[$planId] ?? self::internalPlans()['free'] ?? [];
    }

    public static function internalPlanName(string $planId): string
    {
        $plan = self::internalPlan($planId);

        return $plan['display_name'] ?? $plan['name'] ?? ucfirst($planId);
    }

    public static function publicOffers(): array
    {
        return array_values(self::config('public_offers', []));
    }

    public static function publicOffersById(): array
    {
        return self::config('public_offers', []);
    }

    public static function publicOfferIds(): array
    {
        return array_keys(self::publicOffersById());
    }

    public static function publicOffer(string $offerId): ?array
    {
        return self::publicOffersById()[$offerId] ?? null;
    }

    public static function resolveOffer(?string $offer, ?string $plan = null, ?string $product = null): ?string
    {
        if ($offer && in_array($offer, self::publicOfferIds(), true)) {
            return $offer;
        }

        return match (true) {
            $product === 'scan' => 'scan',
            $plan === 'control' => 'continuous_control',
            default => null,
        };
    }

    public static function selfServeOfferIds(): array
    {
        return array_values(array_filter(
            self::publicOfferIds(),
            fn (string $offerId) => in_array(
                self::publicOffer($offerId)['kind'] ?? null,
                ['product', 'subscription'],
                true
            )
        ));
    }

    public static function checkoutPlanIdForOffer(string $offerId): ?string
    {
        $offer = self::publicOffer($offerId);

        return $offer['kind'] === 'subscription'
            ? ($offer['plan'] ?? null)
            : null;
    }

    public static function checkoutProductForOffer(string $offerId): ?string
    {
        $offer = self::publicOffer($offerId);

        return $offer['kind'] === 'product'
            ? ($offer['product'] ?? null)
            : null;
    }

    public static function billingPlansForDisplay(?string $currentPlan = null): array
    {
        $plans = collect(self::internalPlans())
            ->filter(fn (array $plan) => ($plan['billing_visible'] ?? false) || $plan['id'] === $currentPlan)
            ->map(function (array $plan): array {
                return [
                    'id' => $plan['id'],
                    'name' => $plan['display_name'] ?? $plan['name'],
                    'internal_name' => $plan['name'],
                    'price' => $plan['price'],
                    'interval' => $plan['interval'],
                    'description' => $plan['description'] ?? null,
                    'features' => $plan['features'] ?? [],
                    'popular' => $plan['popular'] ?? false,
                    'trial_days' => $plan['trial_days'] ?? 0,
                    'cta' => $plan['cta'] ?? null,
                    'self_serve_checkout' => $plan['self_serve_checkout'] ?? false,
                    'contact_only' => ! ($plan['self_serve_checkout'] ?? false),
                ];
            })
            ->values()
            ->all();

        return $plans;
    }

    public static function checkoutPlanIds(): array
    {
        return collect(self::internalPlans())
            ->filter(fn (array $plan) => $plan['self_serve_checkout'] ?? false)
            ->keys()
            ->values()
            ->all();
    }

    public static function stripePriceIdForPlan(string $planId): ?string
    {
        $configKey = Arr::get(self::internalPlan($planId), 'stripe_price_config');

        return $configKey ? config("services.stripe.{$configKey}") : null;
    }

    // ─────────────────────────────────────────────────────────
    // Audit model catalog (broader than V1 runtime models)
    // ─────────────────────────────────────────────────────────

    public static function auditModels(): array
    {
        return self::config('audit_models', []);
    }

    public static function auditModelIds(): array
    {
        return array_keys(self::auditModels());
    }

    public static function auditModelOptions(): array
    {
        return array_values(array_map(
            fn (array $model) => [
                'value'          => $model['id'],
                'label'          => $model['label'],
                'provider'       => $model['provider'],
                'controlled_v1'  => $model['controlled_v1'] ?? false,
            ],
            self::auditModels()
        ));
    }

    public static function isAuditModelControlledV1(string $modelId): bool
    {
        return (bool) (self::auditModels()[$modelId]['controlled_v1'] ?? false);
    }

    // ─────────────────────────────────────────────────────────
    // Runtime models (4 V1-controlled, used by proxy)
    // ─────────────────────────────────────────────────────────

    public static function supportedModels(): array
    {
        return self::config('models', []);
    }

    public static function supportedModelIds(): array
    {
        return array_keys(self::supportedModels());
    }

    public static function supportedModel(string $modelId): ?array
    {
        return self::supportedModels()[$modelId] ?? null;
    }

    public static function supportedModelOptions(): array
    {
        return array_values(array_map(
            fn (array $model) => [
                'value' => $model['id'],
                'label' => $model['label'],
                'provider' => $model['provider'],
            ],
            self::supportedModels()
        ));
    }

    public static function fallbackModelIds(): array
    {
        return array_values(array_keys(array_filter(
            self::supportedModels(),
            fn (array $model) => $model['fallback_allowed'] ?? false
        )));
    }

    public static function premiumModelIds(): array
    {
        return array_values(array_keys(array_filter(
            self::supportedModels(),
            fn (array $model) => $model['premium'] ?? false
        )));
    }

    public static function isSupportedModel(string $modelId): bool
    {
        return array_key_exists(strtolower($modelId), self::supportedModels());
    }

    public static function providerForModel(string $modelId): ?string
    {
        return self::supportedModel($modelId)['provider'] ?? null;
    }

    public static function modelCosts(): array
    {
        return array_reduce(
            self::supportedModels(),
            function (array $carry, array $model): array {
                $carry[$model['id']] = $model['costs'];

                return $carry;
            },
            []
        );
    }

    public static function providerOptions(): array
    {
        return array_values(array_map(
            fn (array $provider) => [
                'value' => $provider['id'],
                'label' => $provider['label'],
            ],
            self::config('providers', [])
        ));
    }

    public static function publicCtas(): array
    {
        return self::config('public_ctas', []);
    }
}
