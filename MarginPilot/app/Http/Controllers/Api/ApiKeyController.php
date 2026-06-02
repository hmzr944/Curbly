<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    /**
     * GET /api/api-keys
     * List all API keys for the authenticated org.
     * key_hash is NEVER included in the response.
     */
    public function index(): JsonResponse
    {
        $org = Auth::user()?->organization;

        if (! $org) {
            return response()->json([]);
        }

        $keys = ApiKey::where('organization_id', $org->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ApiKey $k) => [
                'id'           => $k->id,
                'name'         => $k->name,
                'prefix'       => $k->prefix,
                'is_active'    => $k->is_active,
                'last_used_at' => $k->last_used_at?->diffForHumans(),
                'created_at'   => $k->created_at->format('Y-m-d'),
            ]);

        return response()->json($keys);
    }

    /**
     * POST /api/api-keys
     * Generate a new API key.
     *
     * The plain-text key is returned ONCE in this response and
     * NEVER stored — only the bcrypt hash is persisted.
     *
     * Key format: mrg_live_{32 random alphanumeric chars}
     */
    public function store(Request $request): JsonResponse
    {
        $org = Auth::user()?->organization;

        if (! $org) {
            return response()->json(['message' => 'No workspace found.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        // Generate the raw key: mrg_live_ (9) + 32 random chars = 41 chars total
        $rawKey = 'mrg_live_' . Str::random(32);

        // Prefix shown in the UI: mrg_live_ + first 8 random chars (17 chars shown)
        $prefix = Str::substr($rawKey, 0, 17);

        $key = ApiKey::create([
            'organization_id' => $org->id,
            'name'            => $validated['name'],
            'key_hash'        => Hash::make($rawKey),   // bcrypt — never expose
            'prefix'          => $prefix,
            'is_active'       => true,
        ]);

        return response()->json([
            'success'    => true,
            'key'        => $rawKey,                    // ← returned ONCE, never again
            'id'         => $key->id,
            'name'       => $key->name,
            'prefix'     => $key->prefix,
            'created_at' => $key->created_at->format('Y-m-d'),
        ], 201);
    }

    /**
     * DELETE /api/api-keys/{id}
     * Permanently revoke (delete) an API key.
     * Scoped to the authenticated org to prevent cross-org deletion.
     */
    public function destroy(int $id): JsonResponse
    {
        $org = Auth::user()?->organization;

        if (! $org) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $key = ApiKey::where('id', $id)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $key->delete();

        return response()->json(['success' => true]);
    }
}
