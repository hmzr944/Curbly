<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\CFOMetricsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * CFO Report Controller
 * 
 * Provides finance-friendly endpoints for AI cost analytics:
 * - Executive readout with unit economics
 * - Weekly readout (JSON, CSV, PDF)
 * - Top margin destroyers
 * - Plan economics
 */
class CFOReportController extends Controller
{
    public function __construct(
        private readonly CFOMetricsService $cfoMetrics
    ) {}

    /**
     * Get executive readout with all key metrics.
     * 
     * GET /api/cfo/readout
     */
    public function executiveReadout(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found for user.',
            ], 400);
        }

        $periodStart = $request->filled('start') 
            ? Carbon::parse($request->input('start')) 
            : now()->startOfMonth();
        
        $periodEnd = $request->filled('end')
            ? Carbon::parse($request->input('end'))
            : now();

        $readout = $this->cfoMetrics->getExecutiveReadout($organization, $periodStart, $periodEnd);

        return response()->json([
            'success' => true,
            'data' => $readout,
        ]);
    }

    /**
     * Get plan unit economics.
     * 
     * GET /api/cfo/plan-economics
     */
    public function planEconomics(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found for user.',
            ], 400);
        }

        $periodStart = $request->filled('start') 
            ? Carbon::parse($request->input('start')) 
            : now()->startOfMonth();
        
        $periodEnd = $request->filled('end')
            ? Carbon::parse($request->input('end'))
            : now();

        $plans = $this->cfoMetrics->getPlanUnitEconomics($organization, $periodStart, $periodEnd);

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    /**
     * Get margin protection summary.
     * 
     * GET /api/cfo/margin-protection
     */
    public function marginProtection(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found for user.',
            ], 400);
        }

        $periodStart = $request->filled('start') 
            ? Carbon::parse($request->input('start')) 
            : now()->startOfMonth();
        
        $periodEnd = $request->filled('end')
            ? Carbon::parse($request->input('end'))
            : now();

        $protection = $this->cfoMetrics->getMarginProtectionSummary($organization, $periodStart, $periodEnd);

        return response()->json([
            'success' => true,
            'data' => $protection,
        ]);
    }

    /**
     * Get top margin-destroying customers.
     * 
     * GET /api/cfo/margin-destroyers
     */
    public function marginDestroyers(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found for user.',
            ], 400);
        }

        $limit = $request->integer('limit', 5);
        
        $periodStart = $request->filled('start') 
            ? Carbon::parse($request->input('start')) 
            : now()->startOfMonth();
        
        $periodEnd = $request->filled('end')
            ? Carbon::parse($request->input('end'))
            : now();

        $destroyers = $this->cfoMetrics->getTopMarginDestroyers($organization, $periodStart, $periodEnd, $limit);

        return response()->json([
            'success' => true,
            'data' => $destroyers,
        ]);
    }

    /**
     * Get weekly readout (JSON).
     * 
     * GET /api/cfo/weekly
     */
    public function weeklyReadout(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found for user.',
            ], 400);
        }

        $weekStart = $request->filled('week')
            ? Carbon::parse($request->input('week'))->startOfWeek()
            : now()->startOfWeek();

        $readout = $this->cfoMetrics->getWeeklyReadout($organization, $weekStart);

        return response()->json([
            'success' => true,
            'data' => $readout,
        ]);
    }

    /**
     * Export weekly readout as CSV.
     * 
     * GET /api/cfo/weekly/csv
     */
    public function weeklyReadoutCSV(Request $request): Response
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response('No organization found', 400);
        }

        $weekStart = $request->filled('week')
            ? Carbon::parse($request->input('week'))->startOfWeek()
            : now()->startOfWeek();

        $rows = $this->cfoMetrics->getWeeklyReadoutCSV($organization, $weekStart);

        // Build CSV content
        $csv = '';
        foreach ($rows as $row) {
            $csv .= implode(';', array_map(function ($cell) {
                // Escape semicolons and quotes
                $cell = str_replace('"', '""', (string) $cell);
                return '"' . $cell . '"';
            }, $row)) . "\r\n";
        }

        // Add BOM for Excel compatibility
        $csv = "\xEF\xBB\xBF" . $csv;

        $filename = sprintf(
            'Margexa-cfo-readout-%s-semaine-%s.csv',
            $organization->slug ?? $organization->id,
            $weekStart->format('Y-W')
        );

        return response($csv)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Export weekly readout as PDF.
     * 
     * GET /api/cfo/weekly/pdf
     * 
     * Note: For a full implementation, you would use a PDF library like dompdf or mpdf.
     * This provides a simple HTML-based PDF that browsers can print.
     */
    public function weeklyReadoutPDF(Request $request): Response
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response('No organization found', 400);
        }

        $weekStart = $request->filled('week')
            ? Carbon::parse($request->input('week'))->startOfWeek()
            : now()->startOfWeek();

        $readout = $this->cfoMetrics->getWeeklyReadout($organization, $weekStart);

        // Generate HTML for print/PDF
        $html = $this->generatePDFHtml($readout);

        $filename = sprintf(
            'Margexa-cfo-readout-%s-semaine-%s.html',
            $organization->slug ?? $organization->id,
            $weekStart->format('Y-W')
        );

        return response($html)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Content-Disposition', 'inline; filename="' . $filename . '"');
    }

    /**
     * Generate printable HTML for PDF export.
     */
    private function generatePDFHtml(array $readout): string
    {
        $kpis = $readout['kpis'];
        $plans = $readout['plans'];
        $destroyers = $readout['top_margin_destroyers'];
        $protection = $readout['margin_protection'];

        $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFO Readout - Margexa</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.5;
            color: #1e293b;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
        }
        h1 { color: #0284c7; font-size: 24px; margin-bottom: 8px; }
        h2 { color: #334155; font-size: 16px; margin-top: 32px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        .header { margin-bottom: 32px; }
        .period { color: #64748b; font-size: 14px; }
        .summary { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .kpi { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
        .kpi-value { font-size: 24px; font-weight: 700; color: #0284c7; }
        .kpi-label { font-size: 12px; color: #64748b; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #64748b; }
        td { font-size: 14px; }
        .status-healthy { color: #16a34a; }
        .status-warning { color: #d97706; }
        .status-critical { color: #dc2626; }
        .risk-low { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .risk-moderate { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .risk-high { background: #fed7aa; color: #9a3412; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .risk-critical { background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
        @media print {
            body { padding: 20px; }
            .kpis { break-inside: avoid; }
            table { break-inside: avoid; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Margexa CFO Readout</h1>
        <p class="period">{$readout['organization']} · Semaine {$readout['period']['week']} · {$readout['period']['start']} au {$readout['period']['end']}</p>
    </div>

    <div class="summary">
        <p>{$readout['summary_text']}</p>
    </div>

    <h2>📈 KPIs Clés</h2>
    <div class="kpis">
HTML;

        foreach (array_slice($kpis, 0, 6) as $kpi) {
            $html .= <<<HTML
        <div class="kpi">
            <div class="kpi-value">{$kpi['value']}</div>
            <div class="kpi-label">{$kpi['label']}</div>
        </div>
HTML;
        }

        $html .= <<<HTML
    </div>

    <h2>💰 Unit Economics par Plan</h2>
    <table>
        <thead>
            <tr>
                <th>Plan</th>
                <th>Tier</th>
                <th>Clients</th>
                <th>Coût IA</th>
                <th>Marge après IA</th>
                <th>Santé</th>
            </tr>
        </thead>
        <tbody>
HTML;

        foreach ($plans as $plan) {
            $healthClass = 'status-' . $plan['health'];
            $healthLabel = ucfirst($plan['health']);
            $html .= <<<HTML
            <tr>
                <td><strong>{$plan['name']}</strong></td>
                <td>{$plan['tier']}</td>
                <td>{$plan['customers']}</td>
                <td>{$plan['ai_cost']}</td>
                <td>{$plan['margin_after_ai']}</td>
                <td class="{$healthClass}">{$healthLabel}</td>
            </tr>
HTML;
        }

        $html .= <<<HTML
        </tbody>
    </table>

    <h2>⚠️ Top Clients à Risque Marge</h2>
    <table>
        <thead>
            <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Coût IA</th>
                <th>Ratio coût/revenu</th>
                <th>Risque</th>
            </tr>
        </thead>
        <tbody>
HTML;

        foreach ($destroyers as $customer) {
            $riskClass = 'risk-' . $customer['risk'];
            $riskLabel = ucfirst($customer['risk']);
            $html .= <<<HTML
            <tr>
                <td><strong>{$customer['customer']}</strong></td>
                <td>{$customer['plan']}</td>
                <td>{$customer['ai_cost']}</td>
                <td>{$customer['ratio']}</td>
                <td><span class="{$riskClass}">{$riskLabel}</span></td>
            </tr>
HTML;
        }

        $html .= <<<HTML
        </tbody>
    </table>

    <h2>🛡️ Protection Marge</h2>
    <div class="kpis">
        <div class="kpi">
            <div class="kpi-value">{$protection['total_saved']}</div>
            <div class="kpi-label">Économies totales</div>
        </div>
        <div class="kpi">
            <div class="kpi-value">{$protection['routing_savings']}</div>
            <div class="kpi-label">Économies routing</div>
        </div>
        <div class="kpi">
            <div class="kpi-value">{$protection['protection_rate']}</div>
            <div class="kpi-label">Taux de protection</div>
        </div>
    </div>

    <div class="footer">
        <p>Généré par Margexa · {$readout['period']['end']} · Margexa.app</p>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    /**
     * Get cost trend data for charting.
     * 
     * GET /api/cfo/trend
     */
    public function costTrend(Request $request): JsonResponse
    {
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found for user.',
            ], 400);
        }

        $periodStart = $request->filled('start') 
            ? Carbon::parse($request->input('start')) 
            : now()->startOfMonth();
        
        $periodEnd = $request->filled('end')
            ? Carbon::parse($request->input('end'))
            : now();

        $trend = $this->cfoMetrics->getCostTrend($organization, $periodStart, $periodEnd);

        return response()->json([
            'success' => true,
            'data' => $trend,
        ]);
    }
}
