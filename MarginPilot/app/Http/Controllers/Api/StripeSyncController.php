<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\StripeSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class StripeSyncController extends Controller
{
    public function __construct(private readonly StripeSyncService $sync) {}

    /**
     * POST /api/stripe/sync
     * Triggers customer + revenue sync for this organization.
     */
    public function sync(Request $request): JsonResponse
    {
        $org = auth()->user()?->organization;
        if (! $org) {
            return response()->json(['error' => 'No organization found'], 400);
        }

        $period      = now()->startOfMonth();
        $periodEnd   = now();

        $customerStats = $this->sync->syncCustomers($org);
        $revenueStats  = $this->sync->syncRevenue($org, $period, $periodEnd);

        return response()->json([
            'success'   => true,
            'customers' => $customerStats,
            'revenue'   => $revenueStats,
            'period'    => ['start' => $period->toDateString(), 'end' => $periodEnd->toDateString()],
        ]);
    }

    /**
     * GET /api/stripe/connect
     * Store the Stripe API key for this organization (encrypted).
     */
    public function connect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stripe_api_key' => 'required|string|starts_with:sk_',
        ]);

        $org = auth()->user()?->organization;
        if (! $org) {
            return response()->json(['error' => 'No organization found'], 400);
        }

        $org->update([
            'stripe_api_key_encrypted' => Crypt::encryptString($validated['stripe_api_key']),
        ]);

        return response()->json(['success' => true, 'connected' => true]);
    }

    /**
     * GET /api/stripe/status
     */
    public function status(Request $request): JsonResponse
    {
        $org = auth()->user()?->organization;
        return response()->json([
            'connected' => $org?->stripe_api_key_encrypted !== null,
        ]);
    }
}
