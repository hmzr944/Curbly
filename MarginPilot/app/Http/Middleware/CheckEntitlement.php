<?php

namespace App\Http\Middleware;

use App\Services\EntitlementService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to check if organization has required entitlement.
 * 
 * Usage in routes:
 *   ->middleware('entitlement:policies')
 *   ->middleware('entitlement:enforcement')
 */
class CheckEntitlement
{
    public function __construct(
        private EntitlementService $entitlements
    ) {}

    public function handle(Request $request, Closure $next, string $entitlement): Response
    {
        $user = $request->user();
        
        if (!$user || !$user->organization) {
            return $this->denyAccess($request, $entitlement);
        }

        $org = $user->organization;
        
        if (!$this->entitlements->can($org, $entitlement)) {
            return $this->denyAccess($request, $entitlement);
        }

        return $next($request);
    }

    private function denyAccess(Request $request, string $entitlement): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'upgrade_required',
                'message' => "Cette fonctionnalité nécessite une mise à niveau de votre plan.",
                'required_entitlement' => $entitlement,
                'upgrade_url' => route('billing.index'),
            ], 403);
        }

        return redirect()->route('billing.index')->with('error', 
            "Cette fonctionnalité n'est pas disponible avec votre plan actuel."
        );
    }
}
