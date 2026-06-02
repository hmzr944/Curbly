<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Organization;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * StripeSyncService
 *
 * Bridges Stripe revenue data with Margexa AI cost data.
 * This is the feature that differentiates Margexa from generic observability tools:
 * gross margin = Stripe revenue − AI cost (per customer).
 *
 * IMPORTANT: This is separate from Margexa's own billing (BillingController).
 * - Margexa billing  = how Margexa charges its own users (Stripe subscriptions)
 * - Stripe sync      = the user's own customers in THEIR Stripe account
 */
class StripeSyncService
{
    /**
     * Sync all Stripe customers for an organization into Margexa customers table.
     *
     * @return array{synced: int, created: int, updated: int, errors: int}
     */
    public function syncCustomers(Organization $org): array
    {
        $stripeKey = $org->stripeApiKey();
        if (! $stripeKey) {
            return ['synced' => 0, 'created' => 0, 'updated' => 0, 'errors' => 0, 'error' => 'No Stripe API key configured'];
        }

        $stats = ['synced' => 0, 'created' => 0, 'updated' => 0, 'errors' => 0];
        $startingAfter = null;

        do {
            $params = ['limit' => 100, 'expand' => ['data.subscriptions']];
            if ($startingAfter) {
                $params['starting_after'] = $startingAfter;
            }

            $response = Http::withToken($stripeKey)
                ->get('https://api.stripe.com/v1/customers', $params);

            if ($response->failed()) {
                Log::error('Stripe customer sync failed', ['org' => $org->id, 'status' => $response->status()]);
                $stats['errors']++;
                break;
            }

            $data = $response->json();

            foreach ($data['data'] ?? [] as $stripeCustomer) {
                try {
                    $this->upsertCustomer($org, $stripeCustomer);
                    $stats['synced']++;
                } catch (\Throwable $e) {
                    Log::warning('Failed to upsert Stripe customer', ['id' => $stripeCustomer['id'], 'error' => $e->getMessage()]);
                    $stats['errors']++;
                }
            }

            $startingAfter = $data['has_more'] ? ($data['data'][array_key_last($data['data'])]['id'] ?? null) : null;

        } while ($startingAfter);

        return $stats;
    }

    /**
     * Sync revenue (charges / invoices) from Stripe for a given period.
     *
     * @return array{synced: int, errors: int}
     */
    public function syncRevenue(Organization $org, Carbon $periodStart, Carbon $periodEnd): array
    {
        $stripeKey = $org->stripeApiKey();
        if (! $stripeKey) {
            return ['synced' => 0, 'errors' => 0, 'error' => 'No Stripe API key configured'];
        }

        $stats = ['synced' => 0, 'errors' => 0];
        $startingAfter = null;

        do {
            $params = [
                'limit'          => 100,
                'created[gte]'   => $periodStart->timestamp,
                'created[lte]'   => $periodEnd->timestamp,
                'status'         => 'paid',
            ];
            if ($startingAfter) {
                $params['starting_after'] = $startingAfter;
            }

            $response = Http::withToken($stripeKey)
                ->get('https://api.stripe.com/v1/invoices', $params);

            if ($response->failed()) {
                $stats['errors']++;
                break;
            }

            $data = $response->json();

            foreach ($data['data'] ?? [] as $invoice) {
                try {
                    $this->applyInvoiceRevenue($org, $invoice, $periodStart);
                    $stats['synced']++;
                } catch (\Throwable $e) {
                    Log::warning('Failed to apply invoice revenue', ['id' => $invoice['id'], 'error' => $e->getMessage()]);
                    $stats['errors']++;
                }
            }

            $startingAfter = $data['has_more'] ? ($data['data'][array_key_last($data['data'])]['id'] ?? null) : null;

        } while ($startingAfter);

        return $stats;
    }

    /**
     * Calculate the full margin for a single customer for a given period.
     *
     * @return array{customer_id: int, revenue: float, ai_cost: float, margin_amount: float, margin_pct: float|null}
     */
    public function getCustomerMargin(Customer $customer, Carbon $periodStart, Carbon $periodEnd): array
    {
        $revenue = (float) ($customer->monthly_revenue ?? 0);

        $aiCost = (float) $customer->aiRequests()
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->sum('estimated_cost');

        $margin = $revenue - $aiCost;
        $marginPct = $revenue > 0 ? round(($margin / $revenue) * 100, 1) : null;

        return [
            'customer_id'   => $customer->id,
            'customer_name' => $customer->name,
            'revenue'       => round($revenue, 2),
            'ai_cost'       => round($aiCost, 4),
            'margin_amount' => round($margin, 2),
            'margin_pct'    => $marginPct,
            'stripe_synced' => ! empty($customer->stripe_customer_id),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function upsertCustomer(Organization $org, array $stripeCustomer): void
    {
        $email     = $stripeCustomer['email'] ?? null;
        $externalId= $stripeCustomer['metadata']['margexa_customer_id'] ?? null;

        // Try matching by external_id, then by email
        $customer = null;
        if ($externalId) {
            $customer = Customer::where('organization_id', $org->id)
                ->where('external_id', $externalId)
                ->first();
        }
        if (! $customer && $email) {
            $customer = Customer::where('organization_id', $org->id)
                ->where('email', $email)
                ->first();
        }

        $attrs = [
            'stripe_customer_id' => $stripeCustomer['id'],
            'name'               => $stripeCustomer['name'] ?? $email ?? $stripeCustomer['id'],
            'email'              => $email,
        ];

        if ($customer) {
            $customer->update($attrs);
        } else {
            Customer::create([
                'organization_id' => $org->id,
                'external_id'     => $externalId ?? $stripeCustomer['id'],
                ...$attrs,
            ]);
        }
    }

    private function applyInvoiceRevenue(Organization $org, array $invoice, Carbon $period): void
    {
        $stripeCustomerId = $invoice['customer'] ?? null;
        if (! $stripeCustomerId) return;

        $amountPaid = ($invoice['amount_paid'] ?? 0) / 100; // Convert from cents

        Customer::where('organization_id', $org->id)
            ->where('stripe_customer_id', $stripeCustomerId)
            ->update(['monthly_revenue' => $amountPaid]);
    }
}
