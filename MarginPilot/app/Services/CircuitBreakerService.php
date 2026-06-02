<?php

namespace App\Services;

use App\Models\PolicyTrigger;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Circuit Breaker — protects against agent runaway loops.
 *
 * Uses a sliding window counter stored in cache (Redis in production,
 * file/array in dev). A single circuit tracks calls from one agent
 * within a 60-second window, scoped per organisation.
 *
 * States:
 *   CLOSED  → normal                       (≤ 10 calls / 60s)
 *   HALF    → alert, passes through        (11–20 calls / 60s)
 *   OPEN    → blocked, returns 429         (> 20 calls / 60s)
 */
class CircuitBreakerService
{
    public const STATE_CLOSED = 'CLOSED';
    public const STATE_HALF   = 'HALF';
    public const STATE_OPEN   = 'OPEN';

    private const WINDOW_SECONDS  = 60;
    private const THRESHOLD_HALF  = 10;   // > this → HALF
    private const THRESHOLD_OPEN  = 20;   // > this → OPEN
    private const TTL_STATE        = 300;  // manual-override state TTL (5 min)
    private const TTL_COUNTER      = 65;   // slightly more than the window

    /**
     * Increment call counter for the given agent and return the current state.
     *
     * The counter key uses a 60-second bucket derived from the current time
     * so it resets naturally without needing an explicit decrement.
     *
     * @return array{ state: string, count: int, agentId: string }
     */
    public function check(string $agentId, string $organizationId): array
    {
        // If manually forced OPEN, respect it until it expires.
        $overrideKey = $this->overrideKey($agentId, $organizationId);
        if (Cache::has($overrideKey)) {
            return [
                'state'   => self::STATE_OPEN,
                'count'   => $this->currentCount($agentId, $organizationId),
                'agentId' => $agentId,
            ];
        }

        $count = $this->increment($agentId, $organizationId);

        $state = match (true) {
            $count > self::THRESHOLD_OPEN => self::STATE_OPEN,
            $count > self::THRESHOLD_HALF => self::STATE_HALF,
            default                       => self::STATE_CLOSED,
        };

        if ($state !== self::STATE_CLOSED) {
            Log::warning("CircuitBreaker: {$state} for agent {$agentId} org {$organizationId}", [
                'count' => $count,
                'agent' => $agentId,
                'org'   => $organizationId,
            ]);
        }

        return ['state' => $state, 'count' => $count, 'agentId' => $agentId];
    }

    /**
     * Manually reset a circuit to CLOSED.
     */
    public function reset(string $agentId, string $organizationId): void
    {
        Cache::forget($this->counterKey($agentId, $organizationId));
        Cache::forget($this->overrideKey($agentId, $organizationId));
    }

    /**
     * Get the current state of a circuit without incrementing.
     *
     * @return array{ state: string, count: int, agentId: string }
     */
    public function status(string $agentId, string $organizationId): array
    {
        if (Cache::has($this->overrideKey($agentId, $organizationId))) {
            return ['state' => self::STATE_OPEN, 'count' => $this->currentCount($agentId, $organizationId), 'agentId' => $agentId];
        }

        $count = $this->currentCount($agentId, $organizationId);
        $state = match (true) {
            $count > self::THRESHOLD_OPEN => self::STATE_OPEN,
            $count > self::THRESHOLD_HALF => self::STATE_HALF,
            default                       => self::STATE_CLOSED,
        };

        return ['state' => $state, 'count' => $count, 'agentId' => $agentId];
    }

    /**
     * List all known agent IDs for an organisation (those that have ever fired).
     * We store a registry set in cache to track this.
     */
    public function listAgents(string $organizationId): array
    {
        $registry = Cache::get($this->registryKey($organizationId), []);
        $agents   = [];

        foreach ($registry as $agentId) {
            $agents[] = $this->status($agentId, $organizationId);
        }

        return $agents;
    }

    // ──────────────────────────────────────────────────────────
    // Private
    // ──────────────────────────────────────────────────────────

    private function increment(string $agentId, string $organizationId): int
    {
        $key = $this->counterKey($agentId, $organizationId);

        // Register this agent in the org registry
        $this->registerAgent($agentId, $organizationId);

        if (Cache::has($key)) {
            return (int) Cache::increment($key);
        }

        Cache::put($key, 1, self::TTL_COUNTER);
        return 1;
    }

    private function currentCount(string $agentId, string $organizationId): int
    {
        return (int) Cache::get($this->counterKey($agentId, $organizationId), 0);
    }

    private function registerAgent(string $agentId, string $organizationId): void
    {
        $key      = $this->registryKey($organizationId);
        $registry = Cache::get($key, []);
        if (! in_array($agentId, $registry, true)) {
            $registry[] = $agentId;
            Cache::put($key, $registry, 86400); // keep registry for 24h
        }
    }

    private function counterKey(string $agentId, string $organizationId): string
    {
        // Use a 60-second time bucket so the counter auto-resets
        $bucket = (int) floor(time() / self::WINDOW_SECONDS);
        return "cb:{$organizationId}:{$agentId}:{$bucket}";
    }

    private function overrideKey(string $agentId, string $organizationId): string
    {
        return "cb_override:{$organizationId}:{$agentId}";
    }

    private function registryKey(string $organizationId): string
    {
        return "cb_registry:{$organizationId}";
    }
}
