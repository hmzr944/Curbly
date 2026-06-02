<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CircuitBreakerService;
use App\Services\LLMProxyService;
use App\Support\MargeXaCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * LLM Proxy Controller - OpenAI-Compatible API Gateway
 *
 * Provides:
 * - OpenAI-compatible endpoints (/v1/chat/completions, /v1/completions)
 * - Automatic metadata stamping from headers
 * - Policy enforcement before forwarding
 * - Cost tracking and attribution
 * - SSE streaming (stream: true)
 *
 * Business metadata headers:
 *   X-Customer-Id, X-Customer-External-Id, X-Plan-Id, X-Plan,
 *   X-Feature-Id, X-Feature, X-Workflow, X-Provider
 */
class LLMProxyController extends Controller
{
    public function __construct(
        private readonly LLMProxyService      $proxyService,
        private readonly CircuitBreakerService $circuitBreaker,
    ) {}

    /**
     * POST /v1/chat/completions
     *
     * OpenAI-compatible chat completions. Supports stream: true via SSE.
     */
    public function chatCompletions(Request $request): JsonResponse|StreamedResponse
    {
        $validator = Validator::make($request->all(), [
            'model'               => ['required', 'string', Rule::in(MargeXaCatalog::supportedModelIds())],
            'messages'            => 'required|array|min:1',
            'messages.*.role'     => 'required|string|in:system,user,assistant,function,tool',
            'messages.*.content'  => 'required|string',
            'max_tokens'          => 'nullable|integer|min:1|max:128000',
            'temperature'         => 'nullable|numeric|min:0|max:2',
            'top_p'               => 'nullable|numeric|min:0|max:1',
            'n'                   => 'nullable|integer|min:1|max:10',
            'stream'              => 'nullable|boolean',
            'stop'                => 'nullable|array|max:4',
            'presence_penalty'    => 'nullable|numeric|min:-2|max:2',
            'frequency_penalty'   => 'nullable|numeric|min:-2|max:2',
            'user'                => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => [
                    'message' => 'Invalid request format',
                    'type'    => 'invalid_request_error',
                    'param'   => array_key_first($validator->errors()->toArray()),
                    'code'    => 'invalid_request',
                    'details' => $validator->errors()->toArray(),
                ],
            ], 400);
        }

        // Resolve org first — needed by both streaming and non-streaming paths
        $organization = $request->user()->organization;
        if (! $organization) {
            return response()->json([
                'error' => [
                    'message' => 'No organization associated with this API key',
                    'type'    => 'authentication_error',
                    'code'    => 'no_organization',
                ],
            ], 401);
        }

        $metadata = $this->extractMetadata($request);

        // ── Circuit breaker check ─────────────────────────────────────────
        // Protects against agent runaway loops (> 20 req / 60s → OPEN → 429)
        $agentId = $metadata['agent_id'] ?? 'default';
        $circuit = $this->circuitBreaker->check($agentId, (string) $organization->id);

        if ($circuit['state'] === CircuitBreakerService::STATE_OPEN) {
            return response()->json([
                'error' => [
                    'message' => 'Agent circuit open — too many requests in 60s. Reset via the Margexa dashboard.',
                    'type'    => 'rate_limit_error',
                    'code'    => 'circuit_breaker_open',
                    'param'   => null,
                ],
                'Margexa' => ['circuit_breaker' => $circuit],
            ], 429);
        }

        if ($circuit['state'] === CircuitBreakerService::STATE_HALF) {
            // HALF state: allow request through but log a warning.
            // A future release will create a PolicyTrigger incident here.
            Log::warning('CircuitBreaker HALF: agent approaching rate limit', [
                'agent'  => $agentId,
                'org'    => $organization->id,
                'count'  => $circuit['count'],
            ]);
        }

        // ── SSE streaming path ────────────────────────────────────────────
        if ($request->boolean('stream')) {
            return $this->streamChatCompletions($validator->validated(), $metadata, $organization);
        }

        // ── Non-streaming path ────────────────────────────────────────────
        $result = $this->proxyService->proxy($validator->validated(), $metadata, $organization);

        if (! $result['success']) {
            $errorResponse = [
                'error' => [
                    'message' => $result['error'],
                    'type'    => $this->mapErrorType($result['http_status']),
                    'code'    => $this->mapErrorCode($result['http_status'], $result['enforcement']['action'] ?? null),
                ],
            ];
            if (isset($result['enforcement'])) {
                $errorResponse['Margexa'] = [
                    'enforcement'  => $result['enforcement'],
                    'attempt_uuid' => $result['attempt_uuid'] ?? null,
                ];
            }
            return response()->json($errorResponse, $result['http_status']);
        }

        return response()->json($result['response'], 200)
            ->header('X-Margexa-Request-Id',       $result['attempt_uuid'] ?? '')
            ->header('X-Margexa-Cost',              (string) ($result['Margexa_metadata']['actual_cost'] ?? 0))
            ->header('X-Margexa-Enforcement',       $result['enforcement']['action'] ?? 'allowed')
            ->header('X-Margexa-Fallback-Applied',  $result['Margexa_metadata']['fallback_applied'] ?? false ? 'true' : 'false')
            ->header('X-Margexa-Latency-Ms',        (string) ($result['Margexa_metadata']['latency_ms'] ?? 0))
            ->header('X-Margexa-Attribution-Status', $result['attribution']['status'] ?? 'none')
            ->header('X-Margexa-Attribution-Score',  (string) ($result['attribution']['score'] ?? 0));
    }

    /**
     * POST /v1/completions
     *
     * Legacy completions endpoint (non-chat). Converts to chat format internally.
     */
    public function completions(Request $request): JsonResponse|StreamedResponse
    {
        $validator = Validator::make($request->all(), [
            'model'      => ['required', 'string', Rule::in(MargeXaCatalog::supportedModelIds())],
            'prompt'     => 'required|string',
            'max_tokens' => 'nullable|integer|min:1|max:128000',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'top_p'      => 'nullable|numeric|min:0|max:1',
            'n'          => 'nullable|integer|min:1|max:10',
            'stream'     => 'nullable|boolean',
            'stop'       => 'nullable|array|max:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => [
                    'message' => 'Invalid request format',
                    'type'    => 'invalid_request_error',
                    'param'   => array_key_first($validator->errors()->toArray()),
                    'code'    => 'invalid_request',
                ],
            ], 400);
        }

        // Convert prompt → messages format and delegate
        $chatRequest = $request->merge([
            'messages' => [
                ['role' => 'user', 'content' => $request->input('prompt')],
            ],
        ]);

        return $this->chatCompletions($chatRequest);
    }

    /**
     * GET /v1/models
     *
     * List available models through Margexa.
     */
    public function listModels(): JsonResponse
    {
        $models = array_map(
            fn (array $model) => [
                'id'       => $model['value'],
                'object'   => 'model',
                'owned_by' => $model['provider'],
                'provider' => $model['provider'],
            ],
            MargeXaCatalog::supportedModelOptions()
        );

        return response()->json(['object' => 'list', 'data' => $models]);
    }

    /**
     * GET /v1/models/{model}
     *
     * Get info about a specific model.
     */
    public function getModel(string $model): JsonResponse
    {
        $models = collect(MargeXaCatalog::supportedModelOptions())
            ->mapWithKeys(fn (array $m) => [
                $m['value'] => [
                    'id'       => $m['value'],
                    'object'   => 'model',
                    'owned_by' => $m['provider'],
                    'provider' => $m['provider'],
                ],
            ])
            ->all();

        if (! isset($models[$model])) {
            return response()->json([
                'error' => [
                    'message' => "The model '{$model}' does not exist or is not supported in V1",
                    'type'    => 'invalid_request_error',
                    'param'   => 'model',
                    'code'    => 'model_not_found',
                ],
            ], 404);
        }

        return response()->json($models[$model]);
    }

    /**
     * POST /v1/embeddings
     *
     * Embeddings endpoint (not yet implemented).
     */
    public function embeddings(): JsonResponse
    {
        return response()->json([
            'error' => [
                'message' => 'Embeddings endpoint coming soon. Use direct provider API for now.',
                'type'    => 'invalid_request_error',
                'code'    => 'not_implemented',
            ],
        ], 501);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handle a streaming (stream: true) chat completion.
     *
     * Runs the full preflight pipeline inside proxyStream(), then pipes
     * SSE chunks to the client via a StreamedResponse. Headers required by
     * SSE clients and nginx reverse proxies are set explicitly.
     */
    private function streamChatCompletions(
        array        $validated,
        array        $metadata,
        \App\Models\Organization $organization,
    ): StreamedResponse {
        $result = $this->proxyService->proxyStream($validated, $metadata, $organization);

        return new StreamedResponse(function () use ($result) {
            // Disable output buffering so chunks reach the client immediately.
            // Use @ to suppress the notice when there is no buffer (e.g. in tests).
            while (ob_get_level() > 0) {
                @ob_end_flush();
            }

            if (! $result['success']) {
                // Preflight was blocked — emit a single error chunk and close
                $errChunk = json_encode([
                    'error' => [
                        'message' => $result['error'] ?? 'Proxy error',
                        'type'    => $this->mapErrorType($result['http_status'] ?? 500),
                        'code'    => $this->mapErrorCode($result['http_status'] ?? 500, null),
                    ],
                ]);
                echo "data: {$errChunk}\n\n";
                echo "data: [DONE]\n\n";
                flush();
                return;
            }

            // Stream chunks from the provider
            ($result['streamer'])();

        }, 200, [
            'Content-Type'    => 'text/event-stream',
            'Cache-Control'   => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',   // disable nginx proxy buffering
            'Connection'      => 'keep-alive',
            'X-Margexa-Request-Id' => $result['attempt_uuid'] ?? '',
        ]);
    }

    /**
     * Extract business metadata from request headers.
     */
    private function extractMetadata(Request $request): array
    {
        return [
            'agent_id'             => $request->header('X-Agent-Id'),
            'customer_id'          => $request->header('X-Customer-Id'),
            'customer_external_id' => $request->header('X-Customer-External-Id'),
            'plan_id'              => $request->header('X-Plan-Id'),
            'plan'                 => $request->header('X-Plan'),
            'feature_id'           => $request->header('X-Feature-Id'),
            'feature'              => $request->header('X-Feature'),
            'workflow'             => $request->header('X-Workflow'),
            'provider'             => $request->header('X-Provider'),
        ];
    }

    private function mapErrorType(int $status): string
    {
        return match (true) {
            $status === 400 => 'invalid_request_error',
            $status === 401 => 'authentication_error',
            $status === 403 => 'permission_denied',
            $status === 404 => 'not_found_error',
            $status === 429 => 'rate_limit_error',
            $status >= 500  => 'server_error',
            default         => 'api_error',
        };
    }

    private function mapErrorCode(int $status, ?string $action): string
    {
        if ($action === 'blocked') {
            return 'blocked_by_policy';
        }

        return match ($status) {
            400     => 'invalid_request',
            401     => 'invalid_api_key',
            403     => 'permission_denied',
            404     => 'not_found',
            429     => 'rate_limit_exceeded',
            502     => 'provider_error',
            503     => 'service_unavailable',
            default => 'unknown_error',
        };
    }
}
