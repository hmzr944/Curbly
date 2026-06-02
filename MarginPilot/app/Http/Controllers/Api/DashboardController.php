<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIRequest;
use App\Services\CFOMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(
        private readonly CFOMetricsService $cfo,
    ) {}

    /**
     * GET /api/dashboard/overview
     * KPIs for the Margexa dashboard header strip.
     */
    public function overview(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json($this->emptyOverview());
        }

        $start = now()->startOfMonth();
        $end   = now();

        try {
            $headline = $this->cfo->getExecutiveReadout($organization, $start, $end);

            return response()->json([
                'total_ai_cost'        => $headline['headline_metrics']['total_ai_cost'] ?? 0,
                'total_requests'       => $headline['headline_metrics']['total_requests'] ?? 0,
                'routing_savings'      => $headline['headline_metrics']['routing_savings'] ?? 0,
                'avg_cost_per_request' => $headline['headline_metrics']['avg_cost_per_request'] ?? 0,
                'cost_change_pct'      => $headline['headline_metrics']['cost_change_vs_prev'],
                'cost_trend'           => $headline['headline_metrics']['cost_trend'] ?? 'neutral',
                'ai_cost_revenue_ratio'=> $headline['headline_metrics']['ai_cost_revenue_ratio'],
                'policy_blocked'       => $headline['headline_metrics']['policy_blocked_requests'] ?? 0,
                'period'               => $headline['period'],
            ]);
        } catch (\Throwable) {
            return response()->json($this->emptyOverview());
        }
    }

    /**
     * GET /api/analytics/live-requests
     * Last 20 requests for the live activity feed (poll every 5s).
     */
    public function liveRequests(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json([]);
        }

        $rows = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->with(['customer:id,name,external_id', 'feature:id,name'])
            ->latest()
            ->limit(20)
            ->get([
                'id', 'created_at',
                'requested_model', 'model',
                'estimated_cost', 'prompt_tokens', 'completion_tokens',
                'policy_triggered', 'routing_outcome', 'routing_savings',
                'customer_id', 'feature_id', 'workflow_name',
            ]);

        return response()->json($rows->map(fn ($r) => [
            'id'              => $r->id,
            'time'            => $r->created_at->format('H:i:s'),
            'requested'       => $r->requested_model ?? $r->model ?? 'unknown',
            'routed'          => $r->model ?? 'unknown',
            'cost'            => round((float) $r->estimated_cost, 5),
            'tokens'          => ($r->prompt_tokens ?? 0) + ($r->completion_tokens ?? 0),
            'latency_ms'      => null,
            'ok'              => true,
            'policy_hit'      => (bool) $r->policy_triggered,
            'routing_applied' => $r->routing_outcome !== null,
            'customer'        => $r->customer?->external_id ?? $r->customer?->name,
            'feature'         => $r->feature?->name,
            'workflow'        => $r->workflow_name,
        ])->values());
    }

    /**
     * GET /api/analytics/overview
     * Spend chart data (daily buckets).
     */
    public function analyticsOverview(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;
        if (! $organization) {
            return response()->json(['chart' => [], 'providers' => [], 'workflows' => []]);
        }

        $days  = max(7, min(90, (int) ($request->get('days', 30))));
        $start = now()->subDays($days)->startOfDay();

        $chart = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $start)
            ->selectRaw("DATE(created_at) as day, SUM(estimated_cost) as cost, COUNT(*) as reqs")
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($r) => [
                'date' => $r->day,
                'cost' => round((float) $r->cost, 4),
                'reqs' => (int) $r->reqs,
            ]);

        $providers = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $start)
            ->selectRaw("COALESCE(provider, 'unknown') as provider, SUM(estimated_cost) as cost, COUNT(*) as reqs")
            ->groupBy('provider')
            ->orderByDesc('cost')
            ->get()
            ->map(fn ($r) => [
                'provider' => $r->provider,
                'cost'     => round((float) $r->cost, 4),
                'reqs'     => (int) $r->reqs,
            ]);

        $providerChart = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $start)
            ->selectRaw("DATE(created_at) as day, COALESCE(provider, 'unknown') as provider, SUM(estimated_cost) as cost")
            ->groupBy('day', 'provider')
            ->orderBy('day')
            ->get()
            ->map(fn ($r) => [
                'date'     => $r->day,
                'provider' => $r->provider,
                'cost'     => round((float) $r->cost, 4),
            ]);

        return response()->json([
            'chart'          => $chart,
            'providers'      => $providers,
            'provider_chart' => $providerChart,
        ]);
    }

    /**
     * GET /api/analytics/trend
     * Cost trend for TrendChart in Analytics tab.
     */
    public function trend(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;
        if (! $organization) {
            return response()->json([]);
        }

        try {
            $start  = now()->subDays(30);
            $end    = now();
            $trend  = $this->cfo->getCostTrend($organization, $start, $end);
            return response()->json($trend);
        } catch (\Throwable) {
            return response()->json([]);
        }
    }

    /**
     * GET /api/analytics/workflows
     * Workflow profitability for Analytics tab.
     */
    public function workflows(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;
        if (! $organization) {
            return response()->json([]);
        }

        $start = now()->subDays(30)->startOfDay();

        $rows = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $start)
            ->whereNotNull('workflow_name')
            ->selectRaw("workflow_name, COUNT(*) as calls, SUM(estimated_cost) as total_cost, AVG(estimated_cost) as avg_cost")
            ->groupBy('workflow_name')
            ->orderByDesc('total_cost')
            ->limit(20)
            ->get()
            ->map(fn ($r) => [
                'workflow'   => $r->workflow_name,
                'calls'      => (int) $r->calls,
                'total_cost' => round((float) $r->total_cost, 4),
                'avg_cost'   => round((float) $r->avg_cost, 5),
            ]);

        return response()->json($rows);
    }

    /**
     * GET /api/providers/status
     * Returns connected providers for this organization.
     */
    public function providersStatus(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;
        if (! $organization) {
            return response()->json([]);
        }

        $connected = $organization->providerConnections()
            ->select(['provider', 'status', 'created_at'])
            ->get()
            ->keyBy('provider');

        $providers = [
            ['id' => 'openai',    'label' => 'OpenAI',    'coming_soon' => false],
            ['id' => 'anthropic', 'label' => 'Anthropic', 'coming_soon' => false],
            ['id' => 'google',    'label' => 'Gemini',    'coming_soon' => true],
            ['id' => 'mistral',   'label' => 'Mistral',   'coming_soon' => true],
        ];

        return response()->json(array_map(function ($p) use ($connected) {
            $conn = $connected->get($p['id']);

            return [
                ...$p,
                'connected'    => $conn !== null && $conn->status === 'connected',
                'connected_at' => $conn?->created_at?->toISOString(),
            ];
        }, $providers));
    }

    /**
     * GET /api/analytics/heatmap
     * Returns a 7×24 matrix of request counts grouped by day-of-week and hour.
     * Rows = days (0 = Sunday … 6 = Saturday), columns = hours (0–23).
     * Values are normalised 0–1 relative to the busiest cell.
     */
    public function heatmap(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json($this->emptyHeatmap());
        }

        $start = now()->subDays(30)->startOfDay();

        // Raw counts grouped by day-of-week (1=Sun…7=Sat in MySQL) and hour
        $rows = AIRequest::query()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', $start)
            ->selectRaw('DAYOFWEEK(created_at) - 1 AS dow, HOUR(created_at) AS hour, COUNT(*) AS cnt')
            ->groupBy('dow', 'hour')
            ->get();

        // Build a 7×24 zero matrix, then fill from DB results
        $matrix = array_fill(0, 7, array_fill(0, 24, 0));
        $max    = 1;

        foreach ($rows as $r) {
            $d = (int) $r->dow;  // 0=Sun, already adjusted above
            $h = (int) $r->hour;
            $matrix[$d][$h] = (int) $r->cnt;
            if ($r->cnt > $max) $max = $r->cnt;
        }

        // Normalise to 0–1
        $normalised = array_map(
            fn (array $day) => array_map(fn (int $v) => round($v / $max, 3), $day),
            $matrix
        );

        return response()->json($normalised);
    }

    /** 7×24 zero matrix — returned when no org or on error. */
    private function emptyHeatmap(): array
    {
        return array_fill(0, 7, array_fill(0, 24, 0));
    }

    private function emptyOverview(): array
    {
        return [
            'total_ai_cost'        => 0,
            'total_requests'       => 0,
            'routing_savings'      => 0,
            'avg_cost_per_request' => 0,
            'cost_change_pct'      => null,
            'cost_trend'           => 'neutral',
            'ai_cost_revenue_ratio'=> null,
            'policy_blocked'       => 0,
            'period'               => ['start' => now()->startOfMonth()->toDateString(), 'end' => now()->toDateString()],
        ];
    }
}
