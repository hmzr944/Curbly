<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiter for legacy ingestion endpoint
        RateLimiter::for('ai-ingestion', function (Request $request) {
            $key = $request->user()?->organization_id
                ? 'org:'.$request->user()->organization_id
                : 'ip:'.$request->ip();

            return Limit::perMinute(120)->by($key);
        });

        // Rate limiter for LLM Proxy (higher limits for real-time usage)
        RateLimiter::for('llm-proxy', function (Request $request) {
            $key = $request->user()?->organization_id
                ? 'org:'.$request->user()->organization_id
                : 'ip:'.$request->ip();

            // 600 requests per minute per organization (10/sec)
            return Limit::perMinute(600)->by($key);
        });

        Vite::prefetch(concurrency: 3);
    }
}
