<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Billing JSON API — consumed by app-billing.jsx (SPA).
 *
 * Mirrors the billing data served by BillingController but as JSON
 * so the SPA can update widgets without a full-page reload.
 *
 * NOTE: Stripe checkout/portal sessions still go through the web
 *       BillingController (form POST → redirect). This controller
 *       only exposes read-only billing data + soft cancel/upgrade stubs.
 */
class BillingApiController extends Controller
{
    /**
     * GET /api/billing/plan
     * Returns current plan, usage, and limits for the organization.
     */
    public function plan(): JsonResponse
    {
        $org = Auth::user()?->organization;
        if (! $org) {
            return response()->json(['error' => 'No organization'], 403);
        }

        $plan = $org->plan ?? 'starter';

        // Sum AI spend for the current billing month
        $spendUsed = (float) AIRequest::where('organization_id', $org->id)
            ->whereBetween('created_at', [now()->startOfMonth(), now()])
            ->sum('estimated_cost');

        $spendLimit = $this->planLimit($plan);
        $spendPct   = $spendLimit > 0 ? round(($spendUsed / $spendLimit) * 100, 1) : 0;

        return response()->json([
            'plan'        => $plan,
            'label'       => ucfirst($plan),
            'price_usd'   => $this->planPrice($plan),
            'renews_at'   => now()->endOfMonth()->format('M j, Y'),
            'spend_limit' => $spendLimit,
            'spend_used'  => round($spendUsed, 2),
            'spend_pct'   => $spendPct,
            'over_80pct'  => $spendPct >= 80,
        ]);
    }

    /**
     * GET /api/billing/invoices
     * Returns recent invoices from Stripe (empty array if Stripe not configured).
     */
    public function invoices(): JsonResponse
    {
        $org = Auth::user()?->organization;
        if (! $org) {
            return response()->json([]);
        }

        if (! $this->stripeConfigured()) {
            return response()->json([]);
        }

        try {
            $stripe     = new \Stripe\StripeClient(config('services.stripe.secret'));
            $customerId = $org->stripe_customer_id ?? null;

            if (! $customerId) {
                return response()->json([]);
            }

            $invoices = $stripe->invoices->all([
                'customer' => $customerId,
                'limit'    => 12,
            ]);

            return response()->json(
                collect($invoices->data)->map(fn ($inv) => [
                    'id'      => $inv->id,
                    'date'    => date('M j, Y', $inv->created),
                    'amount'  => $inv->amount_paid / 100,
                    'status'  => $inv->status,
                    'period'  => $inv->lines->data[0]->description ?? 'Margexa subscription',
                    'pdf_url' => $inv->invoice_pdf,
                ])->values()->all()
            );
        } catch (\Throwable $e) {
            Log::warning('BillingApiController::invoices Stripe error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }

    /**
     * POST /api/billing/upgrade
     * Returns the URL to the Stripe Checkout session for plan upgrade.
     */
    public function upgrade(): JsonResponse
    {
        // Full Stripe checkout session is created by BillingController.
        // Return the checkout route so the SPA can redirect.
        return response()->json([
            'redirect' => route('billing.index'),
        ]);
    }

    /**
     * POST /api/billing/cancel
     * Cancel the current subscription at period end (Stripe).
     */
    public function cancel(): JsonResponse
    {
        $org = Auth::user()?->organization;
        if (! $org) {
            return response()->json(['error' => 'No organization'], 403);
        }

        if (! $this->stripeConfigured()) {
            return response()->json(['error' => 'Stripe not configured. Contact support.'], 422);
        }

        $subscriptionId = $org->stripe_subscription_id ?? null;
        if (! $subscriptionId) {
            return response()->json(['error' => 'No active subscription found.'], 422);
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $stripe->subscriptions->update($subscriptionId, [
                'cancel_at_period_end' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription will cancel at the end of the current period.',
            ]);
        } catch (\Throwable $e) {
            Log::warning('BillingApiController::cancel Stripe error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to cancel. Please contact support.'], 500);
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function planPrice(string $plan): int
    {
        return match ($plan) {
            'starter'    => 0,
            'team'       => 200,
            'business'   => 800,
            'enterprise' => 3000,
            default      => 0,
        };
    }

    private function planLimit(string $plan): int
    {
        return match ($plan) {
            'starter'    => 10_000,
            'team'       => 50_000,
            'business'   => 250_000,
            'enterprise' => 1_000_000,
            default      => 10_000,
        };
    }

    private function stripeConfigured(): bool
    {
        return ! empty(config('services.stripe.secret'));
    }
}
