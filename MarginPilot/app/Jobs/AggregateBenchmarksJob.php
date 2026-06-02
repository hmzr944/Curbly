<?php

namespace App\Jobs;

use App\Models\AggregatedBenchmark;
use App\Models\AIRequest;
use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * AggregateBenchmarksJob
 *
 * Runs weekly (Sunday 02:00 UTC) and computes anonymous percentile benchmarks
 * across all organisations. Results are stored in aggregated_benchmarks so
 * the /api/benchmarks endpoint can serve instant comparisons without
 * running cross-org queries at request time.
 *
 * Privacy guarantees:
 *   - Only aggregate statistics (p25/p50/p75) are stored.
 *   - Organisations with fewer than 3 AI requests are excluded from
 *     the sample to prevent re-identification of small users.
 *   - No per-org values are written to the benchmarks table.
 */
class AggregateBenchmarksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries   = 3;

    public function handle(): void
    {
        $weekKey = now()->format('Y-\WW');   // e.g. "2026-W22"
        $cutoff  = now()->subDays(7);        // use the last 7 days for this snapshot

        Log::info("AggregateBenchmarksJob: computing benchmarks for week {$weekKey}");

        $metrics = [
            'cost_per_request'    => $this->buildCostPerRequest($cutoff),
            'routing_savings_pct' => $this->buildRoutingSavingsPct($cutoff),
            'policy_block_rate'   => $this->buildPolicyBlockRate($cutoff),
            'avg_prompt_tokens'   => $this->buildAvgPromptTokens($cutoff),
        ];

        foreach ($metrics as $metric => $values) {
            if (count($values) < 2) {
                // Not enough data yet — skip rather than store meaningless numbers
                Log::info("AggregateBenchmarksJob: skip {$metric} — only " . count($values) . ' org(s)');
                continue;
            }

            sort($values);
            $n = count($values);

            AggregatedBenchmark::updateOrCreate(
                ['sector' => 'general', 'metric' => $metric, 'period_week' => $weekKey],
                [
                    'p25'         => $this->percentile($values, 25),
                    'p50'         => $this->percentile($values, 50),
                    'p75'         => $this->percentile($values, 75),
                    'sample_size' => $n,
                ]
            );

            Log::info("AggregateBenchmarksJob: stored {$metric} p50=" . $this->percentile($values, 50) . " n={$n}");
        }
    }

    // ── Per-metric builders ─────────────────────────────────────────────────

    /**
     * Average cost per request per org (USD).
     */
    private function buildCostPerRequest(\DateTimeInterface $cutoff): array
    {
        return DB::table('ai_requests')
            ->where('created_at', '>=', $cutoff)
            ->groupBy('organization_id')
            ->havingRaw('COUNT(*) >= 3')          // privacy threshold
            ->selectRaw('AVG(estimated_cost) as v')
            ->pluck('v')
            ->map(fn ($v) => (float) $v)
            ->all();
    }

    /**
     * Routing savings as a percentage of gross cost per org.
     *   savings_pct = routing_savings / (estimated_cost + routing_savings)
     */
    private function buildRoutingSavingsPct(\DateTimeInterface $cutoff): array
    {
        return DB::table('ai_requests')
            ->where('created_at', '>=', $cutoff)
            ->groupBy('organization_id')
            ->havingRaw('COUNT(*) >= 3')
            ->selectRaw('
                CASE
                    WHEN SUM(estimated_cost) + SUM(routing_savings) > 0
                    THEN SUM(routing_savings) / (SUM(estimated_cost) + SUM(routing_savings)) * 100
                    ELSE 0
                END as v
            ')
            ->pluck('v')
            ->map(fn ($v) => (float) $v)
            ->all();
    }

    /**
     * Policy block rate per org — % of requests blocked.
     */
    private function buildPolicyBlockRate(\DateTimeInterface $cutoff): array
    {
        return DB::table('ai_requests')
            ->where('created_at', '>=', $cutoff)
            ->groupBy('organization_id')
            ->havingRaw('COUNT(*) >= 3')
            ->selectRaw('
                SUM(CASE WHEN policy_triggered = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100 as v
            ')
            ->pluck('v')
            ->map(fn ($v) => (float) $v)
            ->all();
    }

    /**
     * Average prompt token count per org.
     */
    private function buildAvgPromptTokens(\DateTimeInterface $cutoff): array
    {
        return DB::table('ai_requests')
            ->where('created_at', '>=', $cutoff)
            ->groupBy('organization_id')
            ->havingRaw('COUNT(*) >= 3')
            ->selectRaw('AVG(prompt_tokens) as v')
            ->pluck('v')
            ->map(fn ($v) => (float) $v)
            ->all();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Linear interpolation percentile on a sorted array.
     */
    private function percentile(array $sorted, int $pct): float
    {
        $n = count($sorted);
        if ($n === 0) return 0.0;
        if ($n === 1) return (float) $sorted[0];

        $idx  = ($pct / 100) * ($n - 1);
        $low  = (int) floor($idx);
        $high = (int) ceil($idx);
        $frac = $idx - $low;

        return round((float) $sorted[$low] + $frac * ((float) $sorted[$high] - (float) $sorted[$low]), 8);
    }
}
