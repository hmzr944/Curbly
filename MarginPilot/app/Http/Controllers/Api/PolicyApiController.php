<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PolicyRequest;
use App\Models\Policy;
use App\Models\PolicyTrigger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * JSON API for the Margexa SPA policies tab.
 * Mirrors PolicyController logic but returns JSON instead of Inertia responses.
 */
class PolicyApiController extends Controller
{
    /**
     * GET /api/policies
     * List all policies for the authenticated org, with recent trigger counts.
     */
    public function index(): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json(['error' => 'No organization found.'], 422);
        }

        $policies = Policy::query()
            ->where('organization_id', $organization->id)
            ->withCount(['triggers as triggers_24h' => function ($q) {
                $q->where('triggered_at', '>=', now()->subHours(24));
            }])
            ->latest()
            ->get()
            ->map(fn (Policy $p) => $this->formatPolicy($p));

        $recentTriggersCount = PolicyTrigger::query()
            ->where('organization_id', $organization->id)
            ->where('triggered_at', '>=', now()->subHours(24))
            ->count();

        return response()->json([
            'policies'              => $policies,
            'recent_triggers_count' => $recentTriggersCount,
        ]);
    }

    /**
     * POST /api/policies
     */
    public function store(PolicyRequest $request): JsonResponse
    {
        $organization = $request->user()->organization;

        if (! $organization) {
            return response()->json(['error' => 'No organization found.'], 422);
        }

        $data = $request->validated();

        $policy = Policy::query()->create([
            'organization_id'  => $organization->id,
            'name'             => $data['name'],
            'type'             => $data['type'],
            'scope'            => $data['scope'],
            'description'      => $data['description'] ?? null,
            'is_active'        => (bool) ($data['is_active'] ?? true),
            'enforcement_mode' => $data['enforcement_mode'] ?? Policy::MODE_ENFORCE,
            'conditions'       => ['threshold' => $data['threshold'] ?? null],
            'actions'          => ['fallback_model' => $data['fallback_model'] ?? null],
        ]);

        return response()->json($this->formatPolicy($policy), 201);
    }

    /**
     * PUT /api/policies/{id}
     */
    public function update(PolicyRequest $request, int $id): JsonResponse
    {
        $policy = Policy::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $data = $request->validated();

        $policy->update([
            'name'             => $data['name'],
            'type'             => $data['type'],
            'scope'            => $data['scope'],
            'description'      => $data['description'] ?? null,
            'is_active'        => (bool) ($data['is_active'] ?? true),
            'enforcement_mode' => $data['enforcement_mode'] ?? Policy::MODE_ENFORCE,
            'conditions'       => ['threshold' => $data['threshold'] ?? null],
            'actions'          => ['fallback_model' => $data['fallback_model'] ?? null],
        ]);

        return response()->json($this->formatPolicy($policy->fresh()));
    }

    /**
     * PATCH /api/policies/{id}/toggle
     * Toggle is_active on/off.
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $policy = Policy::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $policy->update(['is_active' => ! $policy->is_active]);

        return response()->json($this->formatPolicy($policy->fresh()));
    }

    /**
     * PATCH /api/policies/{id}/toggle-mode
     * Toggle enforcement_mode between enforce <-> observe.
     */
    public function toggleMode(Request $request, int $id): JsonResponse
    {
        $policy = Policy::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $newMode = $policy->enforcement_mode === Policy::MODE_OBSERVE
            ? Policy::MODE_ENFORCE
            : Policy::MODE_OBSERVE;

        $policy->update(['enforcement_mode' => $newMode]);

        return response()->json($this->formatPolicy($policy->fresh()));
    }

    /**
     * DELETE /api/policies/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $policy = Policy::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $policy->delete();

        return response()->json(['deleted' => true]);
    }

    // ─────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────

    private function formatPolicy(Policy $policy): array
    {
        return [
            'id'               => $policy->id,
            'name'             => $policy->name,
            'type'             => $policy->type,
            'scope'            => $policy->scope,
            'description'      => $policy->description,
            'is_active'        => $policy->is_active,
            'enforcement_mode' => $policy->enforcement_mode,
            'conditions'       => $policy->conditions,
            'actions'          => $policy->actions,
            'triggers_24h'     => $policy->triggers_24h ?? 0,
            'created_at'       => $policy->created_at?->toISOString(),
            'updated_at'       => $policy->updated_at?->toISOString(),
        ];
    }
}
