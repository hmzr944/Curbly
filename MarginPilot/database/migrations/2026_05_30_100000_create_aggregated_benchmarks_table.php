<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Aggregated cross-client benchmarks.
     *
     * Populated weekly by App\Jobs\AggregateBenchmarksJob.
     * All values are anonymous percentile aggregates — no per-org data
     * is stored here. Each row represents one metric × sector × week.
     *
     * Metrics tracked:
     *   cost_per_request      — avg estimated_cost per AI request (USD)
     *   routing_savings_pct   — % of gross cost avoided by router
     *   policy_block_rate     — % of requests blocked by policy
     *   avg_prompt_tokens     — avg prompt token count per request
     */
    public function up(): void
    {
        Schema::create('aggregated_benchmarks', function (Blueprint $table) {
            $table->id();
            $table->string('sector', 64)->default('general');   // industry sector (not yet segmented)
            $table->string('metric', 80);                        // e.g. "cost_per_request"
            $table->string('period_week', 10);                   // ISO week e.g. "2026-W22"
            $table->decimal('p25', 16, 8)->default(0);          // 25th percentile across orgs
            $table->decimal('p50', 16, 8)->default(0);          // 50th percentile (median)
            $table->decimal('p75', 16, 8)->default(0);          // 75th percentile
            $table->unsignedInteger('sample_size')->default(0); // number of organisations in sample
            $table->timestamps();

            $table->unique(['sector', 'metric', 'period_week']);
            $table->index('period_week');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aggregated_benchmarks');
    }
};
