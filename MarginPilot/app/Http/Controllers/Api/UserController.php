<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * GET /api/me
     * Returns the authenticated user with their organization.
     * Used by the Margexa LoginScreen after successful login.
     */
    public function me(): JsonResponse
    {
        $user = auth()->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $org = $user->organization;

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'organization' => $org ? [
                'id'        => $org->id,
                'name'      => $org->name,
                'plan'      => $org->plan ?? 'free',
                'proxy_url' => url('/api/v1'),
            ] : null,
        ]);
    }
}
