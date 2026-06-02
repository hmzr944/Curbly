<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CircuitBreakerService;
use Illuminate\Http\JsonResponse;

class CircuitBreakerController extends Controller
{
    public function __construct(
        private readonly CircuitBreakerService $cb,
    ) {}

    /**
     * GET /api/circuit-breakers
     * List all known agents for this org and their current circuit state.
     */
    public function index(): JsonResponse
    {
        $org = auth()->user()?->organization;
        if (! $org) {
            return response()->json([]);
        }

        return response()->json($this->cb->listAgents((string) $org->id));
    }

    /**
     * POST /api/circuit-breakers/{agentId}/reset
     * Manually reset a circuit to CLOSED and return the new state.
     */
    public function reset(string $agentId): JsonResponse
    {
        $org = auth()->user()?->organization;
        if (! $org) {
            return response()->json(['error' => 'No organization'], 403);
        }

        $this->cb->reset($agentId, (string) $org->id);

        return response()->json([
            'success' => true,
            'agentId' => $agentId,
            'state'   => CircuitBreakerService::STATE_CLOSED,
        ]);
    }
}
