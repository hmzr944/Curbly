<?php

namespace App\Http\Middleware;

use App\Support\MargeXaCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $org  = $user?->organization;

        $locale = $org?->settings['locale'] ?? config('app.locale', 'fr');
        App::setLocale($locale);

        // Load all translation bundles so the client can switch language without a round-trip.
        // Cached in memory for the duration of the process (cleared on deploy via `php artisan cache:clear`).
        $translations = Cache::rememberForever('inertia.translations', function () {
            $result = [];
            foreach (['fr', 'en', 'es'] as $loc) {
                $path = base_path("lang/{$loc}.json");
                if (File::exists($path)) {
                    $result[$loc] = json_decode(File::get($path), true) ?? [];
                }
            }
            return $result;
        });

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'organization' => $org,
            ],
            'billing' => $org ? [
                'plan' => $org->plan ?? 'free',
                'plan_name' => $org->getPlanName(),
                'is_active' => $org->hasActiveSubscription(),
                'is_trial' => $org->isOnTrial(),
                'is_past_due' => $org->isPastDue(),
                'entitlements' => $org->entitlements ?? [],
            ] : null,
            'catalog' => [
                'public_offers' => MargeXaCatalog::publicOffers(),
                'public_ctas' => MargeXaCatalog::publicCtas(),
            ],
            'locale' => App::getLocale(),
            'translations' => $translations,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
