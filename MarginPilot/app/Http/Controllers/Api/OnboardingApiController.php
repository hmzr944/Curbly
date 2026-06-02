<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\ProviderConnection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

/**
 * API-only onboarding controller for the Margexa 3-step flow:
 *   Step 1 — POST /api/onboarding          (create workspace)
 *   Step 2 — POST /api/providers           (connect provider key)
 *   Step 3 — GET  /api/diagnostic/ping     (test connection, reuses DiagnosticController)
 */
class OnboardingApiController extends Controller
{
    /**
     * Step 1 — Create or update the user's organization workspace.
     */
    public function createWorkspace(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_name' => 'required|string|max:255',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // If user already has an org, just update the name
        if ($user->organization_id) {
            /** @var \App\Models\Organization $org */
            $org = $user->organization;
            $org->update(['name' => $validated['organization_name']]);

            return response()->json([
                'success'         => true,
                'organization_id' => $org->id,
                'organization'    => ['id' => $org->id, 'name' => $org->name],
            ]);
        }

        $org = Organization::create([
            'name'    => $validated['organization_name'],
            'plan'    => 'free',
            'api_key' => 'mrg_' . Str::random(40),
        ]);

        $user->update(['organization_id' => $org->id]);

        return response()->json([
            'success'         => true,
            'organization_id' => $org->id,
            'api_key'         => $org->api_key,
            'organization'    => ['id' => $org->id, 'name' => $org->name],
            'proxy_url'       => url('/api/v1'),
        ], 201);
    }

    /**
     * Step 2 — Connect a provider API key.
     */
    public function connectProvider(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|in:openai,anthropic',
            'api_key'  => 'required|string|min:10',
        ]);

        /** @var \App\Models\User|null $authUser */
        $authUser     = $request->user();
        $organization = $authUser?->organization;
        if (! $organization) {
            return response()->json(['error' => 'No workspace found. Complete step 1 first.'], 400);
        }

        $connection = ProviderConnection::updateOrCreate(
            ['organization_id' => $organization->id, 'provider' => $validated['provider']],
            [
                'api_key_encrypted' => Crypt::encryptString($validated['api_key']),
                'status'            => 'connected',
            ]
        );

        return response()->json([
            'success'  => true,
            'provider' => $validated['provider'],
            'connected'=> true,
        ]);
    }
}
