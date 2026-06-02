<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Services\EntitlementService;
use App\Support\MargeXaCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Stripe Billing Controller
 * 
 * Handles:
 * - Stripe Checkout sessions (one-shot & subscriptions)
 * - Stripe Billing Portal
 * - Stripe Webhooks
 * - Billing page display
 */
class BillingController extends Controller
{
    public function __construct(
        private EntitlementService $entitlements
    ) {}

    /**
     * Display billing page.
     */
    public function index(Request $request)
    {
        $org = $request->user()->organization;
        
        // Check for checkout intent from registration
        $checkoutOffer = $request->session()->pull('checkout_offer');
        
        return Inertia::render('Billing/Index', [
            'billing' => $this->entitlements->getBillingStatus($org),
            'plans' => $this->getPlansForDisplay($org),
            'invoices' => $this->getRecentInvoices($org),
            'checkoutOffer' => $checkoutOffer,
        ]);
    }

    /**
     * Create Stripe Checkout session for subscription.
     */
    public function createCheckoutSession(Request $request)
    {
        // Validate plan first (before any Stripe calls) so rejection is consistent
        $request->validate([
            'plan' => 'required|string|in:' . implode(',', MargeXaCatalog::checkoutPlanIds()),
        ]);

        if (! $this->stripeConfigured()) {
            return back()->withErrors(['stripe' => 'Paiement non configuré. Contactez le support.']);
        }

        $org = $request->user()->organization;
        $plan = $request->input('plan');

        // Get Stripe price ID
        $priceId = $this->getPriceIdForPlan($plan);

        if (!$priceId) {
            return back()->withErrors(['plan' => 'Plan non disponible']);
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            
            // Create or retrieve Stripe customer
            $customerId = $this->getOrCreateStripeCustomer($stripe, $org, $request->user());
            
            // Create checkout session
            $session = $stripe->checkout->sessions->create([
                'customer' => $customerId,
                'mode' => 'subscription',
                'line_items' => [[
                    'price' => $priceId,
                    'quantity' => 1,
                ]],
                'success_url' => route('billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('billing.cancel'),
                'metadata' => [
                    'organization_id' => $org->id,
                    'plan' => $plan,
                ],
                'subscription_data' => [
                    'trial_period_days' => $this->getTrialDays($org, $plan),
                    'metadata' => [
                        'organization_id' => $org->id,
                        'plan' => $plan,
                    ],
                ],
                'allow_promotion_codes' => true,
            ]);

            return Inertia::location($session->url);
            
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe checkout error', ['error' => $e->getMessage()]);
            return back()->withErrors(['stripe' => 'Erreur de paiement. Réessayez.']);
        }
    }

    /**
     * Create Stripe Checkout for one-shot AI Margin Scan.
     */
    public function createScanCheckout(Request $request)
    {
        if (! $this->stripeConfigured()) {
            return back()->withErrors(['stripe' => 'Paiement non configuré. Contactez le support.']);
        }

        $org = $request->user()->organization;

        $priceId = MargeXaCatalog::stripePriceIdForPlan('scan');
        
        if (!$priceId) {
            return back()->withErrors(['plan' => 'AI Margin Scan non disponible']);
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            
            $customerId = $this->getOrCreateStripeCustomer($stripe, $org, $request->user());
            
            $session = $stripe->checkout->sessions->create([
                'customer' => $customerId,
                'mode' => 'payment',
                'line_items' => [[
                    'price' => $priceId,
                    'quantity' => 1,
                ]],
                'success_url' => route('billing.scan-success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('billing.cancel'),
                'metadata' => [
                    'organization_id' => $org->id,
                    'product' => 'scan',
                ],
                'allow_promotion_codes' => true,
            ]);

            return Inertia::location($session->url);
            
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe scan checkout error', ['error' => $e->getMessage()]);
            return back()->withErrors(['stripe' => 'Erreur de paiement. Réessayez.']);
        }
    }

    /**
     * Create Stripe Billing Portal session.
     */
    public function createPortalSession(Request $request)
    {
        $org = $request->user()->organization;

        if (!$org->stripe_customer_id) {
            return back()->withErrors(['billing' => 'Aucun compte de facturation associé à cette organisation.']);
        }

        if (! $this->stripeConfigured()) {
            return back()->withErrors(['stripe' => 'Portail non configuré. Contactez le support.']);
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            
            $session = $stripe->billingPortal->sessions->create([
                'customer' => $org->stripe_customer_id,
                'return_url' => route('billing.index'),
            ]);

            return Inertia::location($session->url);
            
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe portal error', ['error' => $e->getMessage()]);
            return back()->withErrors(['stripe' => 'Erreur d\'accès au portail.']);
        }
    }

    /**
     * Handle successful checkout.
     */
    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        if (!$sessionId) {
            return redirect()->route('billing.index');
        }

        // Webhook will handle the actual update
        // Show success page
        return Inertia::render('Billing/Success', [
            'type' => 'subscription',
        ]);
    }

    /**
     * Handle successful scan purchase.
     */
    public function scanSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        if (!$sessionId) {
            return redirect()->route('billing.index');
        }

        return Inertia::render('Billing/Success', [
            'type' => 'scan',
        ]);
    }

    /**
     * Handle cancelled checkout.
     */
    public function cancel()
    {
        return Inertia::render('Billing/Cancel');
    }

    /**
     * Handle Stripe webhooks.
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (! $webhookSecret) {
            Log::error('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured');
            // Return 200 to avoid Stripe retrying — this is a configuration issue, not a Stripe issue
            return response('Webhook secret not configured', 200);
        }

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid webhook payload', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid webhook signature', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        Log::info('Stripe webhook received', ['type' => $event->type]);

        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutCompleted($event->data->object);
                break;
                
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;
                
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;
                
            case 'invoice.paid':
                $this->handleInvoicePaid($event->data->object);
                break;
                
            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event->data->object);
                break;
        }

        return response('OK', 200);
    }

    // ─────────────────────────────────────────────────────────
    // Webhook Handlers
    // ─────────────────────────────────────────────────────────

    private function handleCheckoutCompleted($session): void
    {
        $orgId = $session->metadata->organization_id ?? null;
        
        if (!$orgId) {
            Log::warning('Checkout completed without organization_id', ['session' => $session->id]);
            return;
        }

        $org = Organization::find($orgId);
        
        if (!$org) {
            Log::warning('Organization not found for checkout', ['org_id' => $orgId]);
            return;
        }

        // Update Stripe customer ID — forceFill required; stripe fields are guarded
        $org->forceFill([
            'stripe_customer_id' => $session->customer,
        ])->save();

        // Handle one-shot scan purchase
        if ($session->mode === 'payment' && ($session->metadata->product ?? '') === 'scan') {
            $this->entitlements->grantScanAccess($org);
            Log::info('Scan access granted', ['org_id' => $org->id]);
        }

        // Subscription is handled by subscription.created webhook
    }

    private function handleSubscriptionUpdated($subscription): void
    {
        $orgId = $subscription->metadata->organization_id ?? null;
        
        if (!$orgId) {
            // Try to find by customer ID
            $org = Organization::where('stripe_customer_id', $subscription->customer)->first();
        } else {
            $org = Organization::find($orgId);
        }

        if (!$org) {
            Log::warning('Organization not found for subscription update', [
                'subscription' => $subscription->id,
                'customer' => $subscription->customer,
            ]);
            return;
        }

        $plan = $subscription->metadata->plan ?? $this->getPlanFromPriceId($subscription->items->data[0]->price->id ?? null);

        $org->update([
            'stripe_subscription_id' => $subscription->id,
            'stripe_price_id' => $subscription->items->data[0]->price->id ?? null,
            'subscription_status' => $subscription->status,
            'subscription_ends_at' => $subscription->cancel_at ? \Carbon\Carbon::createFromTimestamp($subscription->cancel_at) : null,
            'trial_ends_at' => $subscription->trial_end ? \Carbon\Carbon::createFromTimestamp($subscription->trial_end) : null,
        ]);

        // Apply plan entitlements
        if (in_array($subscription->status, ['active', 'trialing'])) {
            $this->entitlements->upgradePlan($org, $plan, $subscription->id, $subscription->items->data[0]->price->id ?? null);
        }

        Log::info('Subscription updated', [
            'org_id' => $org->id,
            'status' => $subscription->status,
            'plan' => $plan,
        ]);
    }

    private function handleSubscriptionDeleted($subscription): void
    {
        $org = Organization::where('stripe_subscription_id', $subscription->id)->first();

        if (!$org) {
            Log::warning('Organization not found for subscription delete', ['subscription' => $subscription->id]);
            return;
        }

        $this->entitlements->downgradeToPlan($org, 'free');

        $org->update([
            'subscription_status' => 'canceled',
            'subscription_ends_at' => now(),
        ]);

        Log::info('Subscription canceled', ['org_id' => $org->id]);
    }

    private function handleInvoicePaid($invoice): void
    {
        Log::info('Invoice paid', [
            'invoice' => $invoice->id,
            'customer' => $invoice->customer,
            'amount' => $invoice->amount_paid,
        ]);
    }

    private function handleInvoicePaymentFailed($invoice): void
    {
        $org = Organization::where('stripe_customer_id', $invoice->customer)->first();

        if ($org) {
            $org->update([
                'subscription_status' => 'past_due',
            ]);
        }

        Log::warning('Invoice payment failed', [
            'invoice' => $invoice->id,
            'customer' => $invoice->customer,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    /**
     * Check that Stripe is properly configured before making API calls.
     */
    private function stripeConfigured(): bool
    {
        return ! empty(config('services.stripe.secret'));
    }

    private function getOrCreateStripeCustomer($stripe, Organization $org, $user): string
    {
        if ($org->stripe_customer_id) {
            return $org->stripe_customer_id;
        }

        $customer = $stripe->customers->create([
            'email' => $org->billing_email ?? $user->email,
            'name' => $org->name,
            'metadata' => [
                'organization_id' => $org->id,
            ],
        ]);

        $org->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    private function getPriceIdForPlan(string $plan): ?string
    {
        return MargeXaCatalog::stripePriceIdForPlan($plan);
    }

    private function getPlanFromPriceId(?string $priceId): string
    {
        if (! $priceId) {
            return 'free';
        }

        foreach (MargeXaCatalog::internalPlanIds() as $planId) {
            if (MargeXaCatalog::stripePriceIdForPlan($planId) === $priceId) {
                return $planId;
            }
        }

        return 'free';
    }

    private function getTrialDays(Organization $org, string $plan): int
    {
        if (! $org->stripe_subscription_id) {
            return (int) (MargeXaCatalog::internalPlan($plan)['trial_days'] ?? 0);
        }
        
        return 0;
    }

    private function getPlansForDisplay(Organization $org): array
    {
        return MargeXaCatalog::billingPlansForDisplay($org->plan);
    }

    private function getRecentInvoices(Organization $org): array
    {
        if (!$org->stripe_customer_id || ! $this->stripeConfigured()) {
            return [];
        }

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            
            $invoices = $stripe->invoices->all([
                'customer' => $org->stripe_customer_id,
                'limit' => 10,
            ]);

            return collect($invoices->data)->map(fn ($inv) => [
                'id' => $inv->id,
                'number' => $inv->number,
                'amount' => $inv->amount_paid / 100,
                'currency' => strtoupper($inv->currency),
                'status' => $inv->status,
                'date' => \Carbon\Carbon::createFromTimestamp($inv->created)->format('d/m/Y'),
                'pdf_url' => $inv->invoice_pdf,
            ])->toArray();
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch invoices', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
