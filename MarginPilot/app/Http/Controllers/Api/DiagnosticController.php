<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InternalLeadNotification;
use App\Mail\LeadRequestConfirmation;
use App\Models\DiagnosticRequest;
use App\Services\DiagnosticService;
use App\Support\MargeXaCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

/**
 * Public Diagnostic Controller
 * 
 * Handles the public AI Margin Diagnostic form submission.
 * No authentication required - this is the commercial entry point.
 */
class DiagnosticController extends Controller
{
    public function __construct(
        private readonly DiagnosticService $diagnosticService
    ) {}

    /**
     * Submit a diagnostic request and receive instant audit.
     * 
     * POST /api/diagnostic
     * Public endpoint (no auth required)
     */
    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Lead capture (required)
            'email' => ['required', 'email', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            
            // Optional lead info
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            
            // Business context (required)
            'provider' => ['required', 'string', Rule::in(['openai', 'anthropic', 'OpenAI', 'Anthropic'])],
            'model' => ['required', 'string', 'max:100', Rule::in(MargeXaCatalog::supportedModelIds())],
            'volume' => ['required', 'string', Rule::in(['< 10k req/mois', '10k – 50k', '50k – 100k', '100k+'])],
            'useCase' => ['required', 'string', Rule::in([
                'support_client',
                'assistant_sav',
                'auto_reponse_ticket',
                'copilote_support',
                'Support client',
                'Support client / Chatbot',
                'Assistant SAV',
                'Auto-reponse tickets',
                'Copilote support',
            ])],
            'pricing' => ['required', 'string', Rule::in(['Forfait', 'Usage', 'Hybride'])],
            
            // Optional business context
            'plans' => ['nullable', 'array'],
            'plans.*' => ['string', Rule::in(['Free', 'Basic', 'Pro', 'Enterprise'])],
            'current_spend' => ['nullable', 'numeric', 'min:0'],
            'customer_count' => ['nullable', 'integer', 'min:1'],
            'industry' => ['nullable', 'string', 'max:100'],
            
            // UTM tracking
            'source' => ['nullable', 'string', 'max:100'],
            'utm_source' => ['nullable', 'string', 'max:100'],
            'utm_campaign' => ['nullable', 'string', 'max:100'],
            'utm_medium' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            // Add client IP and user agent for tracking
            $validated['ip_address'] = $request->ip();
            $validated['user_agent'] = $request->userAgent();

            // Process the diagnostic request
            $diagnostic = $this->diagnosticService->processRequest($validated);

            // Return the public-facing result
            return response()->json([
                'success' => true,
                'data' => $diagnostic->toPublicArray(),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Diagnostic submission failed', [
                'error' => $e->getMessage(),
                'email' => $validated['email'] ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'analyse. Veuillez réessayer.',
            ], 500);
        }
    }

    /**
     * Request a full audit or demo.
     * 
     * POST /api/diagnostic/{id}/request-audit
     * Public endpoint (no auth required)
     */
    public function requestAudit(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['audit', 'demo'])],
            'preferred_time' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $diagnostic = DiagnosticRequest::where('access_token', $id)->first();

        if (!$diagnostic) {
            return response()->json([
                'success' => false,
                'message' => 'Diagnostic non trouvé.',
            ], 404);
        }

        // Update the diagnostic with the request
        $diagnostic->update([
            'requested_full_audit' => $validated['type'] === 'audit',
            'requested_demo' => $validated['type'] === 'demo',
            'status' => DiagnosticRequest::STATUS_QUALIFIED,
            'notes' => $validated['notes'] ?? null,
        ]);

        Log::info('Audit/demo requested', [
            'diagnostic_id' => $diagnostic->id,
            'type' => $validated['type'],
            'company' => $diagnostic->company_name,
        ]);

        // Send confirmation email to lead
        try {
            Mail::to($diagnostic->email)
                ->send(new LeadRequestConfirmation($diagnostic, $validated['type']));
        } catch (\Exception $e) {
            Log::warning('Failed to send lead confirmation email', [
                'diagnostic_id' => $diagnostic->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Send notification to internal sales team
        $salesEmail = config('mail.sales_team_email', 'contact@Margexa.app');
        try {
            Mail::to($salesEmail)
                ->send(new InternalLeadNotification($diagnostic, $validated['type']));
        } catch (\Exception $e) {
            Log::warning('Failed to send internal lead notification', [
                'diagnostic_id' => $diagnostic->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $validated['type'] === 'audit' 
                ? 'Votre demande d\'AI Margin Scan a été enregistrée. Nous vous contacterons sous 24h.'
                : 'Votre demande de démo a été enregistrée. Nous vous contacterons sous 24h.',
        ]);
    }

    /**
     * Get diagnostic result by ID.
     * 
     * GET /api/diagnostic/{id}
     * Public endpoint (uses ID as access token)
     */
    public function show(string $id): JsonResponse
    {
        $diagnostic = DiagnosticRequest::where('access_token', $id)->first();

        if (!$diagnostic) {
            return response()->json([
                'success' => false,
                'message' => 'Diagnostic non trouvé.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $diagnostic->toPublicArray(),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // Admin endpoints (require authentication)
    // ─────────────────────────────────────────────────────────

    /**
     * List all diagnostic requests (admin only).
     * 
     * GET /api/admin/diagnostics
     */
    public function index(Request $request): JsonResponse
    {
        $query = DiagnosticRequest::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by risk level
        if ($request->has('risk_level')) {
            $query->where('risk_level', $request->input('risk_level'));
        }

        // Filter high value only
        if ($request->boolean('high_value_only')) {
            $query->where(function ($q) {
                $q->where('risk_level', DiagnosticRequest::RISK_HIGH)
                  ->orWhere('risk_level', DiagnosticRequest::RISK_CRITICAL);
            });
        }

        // Order by latest
        $query->orderBy('created_at', 'desc');

        $diagnostics = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $diagnostics,
        ]);
    }

    /**
     * Update diagnostic status (admin only).
     * 
     * PATCH /api/admin/diagnostics/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', Rule::in([
                DiagnosticRequest::STATUS_NEW,
                DiagnosticRequest::STATUS_CONTACTED,
                DiagnosticRequest::STATUS_QUALIFIED,
                DiagnosticRequest::STATUS_CONVERTED,
                DiagnosticRequest::STATUS_LOST,
            ])],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $diagnostic = DiagnosticRequest::findOrFail($id);
        $diagnostic->update($validated);

        return response()->json([
            'success' => true,
            'data' => $diagnostic,
        ]);
    }

    /**
     * Get diagnostic analytics (admin only).
     * 
     * GET /api/admin/diagnostics/analytics
     */
    public function analytics(): JsonResponse
    {
        $total = DiagnosticRequest::count();
        $byStatus = DiagnosticRequest::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');
        
        $byRiskLevel = DiagnosticRequest::selectRaw('risk_level, COUNT(*) as count')
            ->groupBy('risk_level')
            ->pluck('count', 'risk_level');

        $conversionRate = $total > 0 
            ? round(($byStatus[DiagnosticRequest::STATUS_CONVERTED] ?? 0) / $total * 100, 1)
            : 0;

        $avgRiskScore = DiagnosticRequest::avg('risk_score');
        $avgPotentialSavings = DiagnosticRequest::avg('potential_savings');

        $recentLeads = DiagnosticRequest::where('status', DiagnosticRequest::STATUS_NEW)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'company_name', 'email', 'risk_level', 'potential_savings', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'by_status' => $byStatus,
                'by_risk_level' => $byRiskLevel,
                'conversion_rate' => $conversionRate,
                'avg_risk_score' => round($avgRiskScore ?? 0, 1),
                'avg_potential_savings' => round($avgPotentialSavings ?? 0, 2),
                'recent_leads' => $recentLeads,
            ],
        ]);
    }
}
