<?php

namespace App\Services;

use App\Models\AIRequest;
use App\Models\Organization;
use App\Models\ProviderConnection;
use App\Services\Routing\EconomicRouterService;
use App\Services\Routing\RoutingContext;
use App\Services\Routing\RoutingDecision;
use App\Support\MargeXaCatalog;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * LLM Proxy Service - The Control Plane
 * 
 * This service is the central proxy that:
 * 1. Receives OpenAI-compatible requests
 * 2. Auto-stamps business metadata (organization, customer, feature, plan, workflow)
 * 3. Enforces policies BEFORE calling the provider
 * 4. Forwards to the real provider (OpenAI, Anthropic, etc.)
 * 5. Returns OpenAI-compatible responses with cost/enforcement metadata
 * 6. Tracks attribution quality as a central KPI
 */
class LLMProxyService
{
    /** Provider base URLs */
    private const PROVIDER_URLS = [
        'openai' => 'https://api.openai.com/v1',
        'anthropic' => 'https://api.anthropic.com/v1',
    ];

    /** 
     * V1 Supported Models (primary scope)
     * Other models will default to openai provider.
     */
    private const MODEL_PROVIDERS = [
        // OpenAI V1
        'gpt-4o' => 'openai',
        'gpt-4o-mini' => 'openai',
        // Anthropic V1
        'claude-3-5-sonnet' => 'anthropic',
        'claude-3-5-haiku' => 'anthropic',
    ];

    public function __construct(
        private readonly PolicyEvaluationService $policyService,
        private readonly CostEstimatorService $costEstimator,
        private readonly AttributionService $attributionService,
        private readonly EconomicRouterService $economicRouter,
    ) {
    }

    /**
     * Main proxy method - handles the complete request lifecycle.
     * 
     * @param array $requestBody OpenAI-compatible request body
     * @param array $metadata Business metadata from headers
     * @param Organization $organization The authenticated organization
     * @return array{
     *     success: bool,
     *     response: ?array,
     *     enforcement: array,
     *     error: ?string,
     *     http_status: int
     * }
     */
    public function proxy(array $requestBody, array $metadata, Organization $organization): array
    {
        $attemptUuid = Str::uuid()->toString();
        $startTime = microtime(true);

        // 1. Extract request details
        $model = $requestBody['model'] ?? 'gpt-4o-mini';
        if (! MargeXaCatalog::isSupportedModel($model)) {
            return [
                'success' => false,
                'response' => null,
                'enforcement' => ['action' => BusinessConstants::POLICY_ACTION_ALLOWED, 'reason' => 'Model not in catalog'],
                'error' => "Model '{$model}' is not in the Margexa V1 catalog.",
                'http_status' => 400,
            ];
        }

        // Google Gemini — proxy support coming in V2
        $modelConfig = MargeXaCatalog::supportedModel($model);
        if (($modelConfig['coming_soon'] ?? false) || ($modelConfig['provider'] ?? null) === 'google') {
            return [
                'success'     => false,
                'response'    => null,
                'enforcement' => ['action' => BusinessConstants::POLICY_ACTION_ALLOWED, 'reason' => 'Provider not yet available'],
                'error'       => "Google/Gemini provider support is coming in Margexa V2. Use OpenAI or Anthropic for now.",
                'http_status' => 501,
            ];
        }

        $provider = $this->resolveProvider($model, $metadata['provider'] ?? null);
        $messages = $requestBody['messages'] ?? [];
        
        // Estimate tokens from messages (rough estimate before actual call)
        $estimatedPromptTokens = $this->estimateTokens($messages);
        $estimatedCompletionTokens = $requestBody['max_tokens'] ?? 1000;

        // 2. ROBUST ATTRIBUTION: Use AttributionService for strict entity resolution
        $attribution = $this->attributionService->resolve($metadata, $organization->id);

        // 3. ECONOMIC ROUTING: Make explainable routing decision BEFORE policy enforcement
        $routingContext = new RoutingContext(
            organizationId: $organization->id,
            requestedModel: $model,
            provider: $provider,
            customerId: $attribution->customer?->id,
            planId: $attribution->plan?->id,
            featureId: $attribution->feature?->id,
            workflowId: $attribution->workflow,
            estimatedCost: 0, // Will be calculated after routing
            inputTokens: $estimatedPromptTokens,
            outputTokens: $estimatedCompletionTokens,
            metadata: $metadata,
            organization: $organization,
            customer: $attribution->customer,
            plan: $attribution->plan,
            feature: $attribution->feature,
        );
        $routingDecision = $this->economicRouter->route($routingContext);

        // 3b. Apply routing decision (may change model)
        $routedModel = $routingDecision->routedModel;
        $routedProvider = $this->resolveProvider($routedModel, $provider);
        $routingApplied = $routingDecision->wasRerouted();

        Log::info('LLMProxy: Economic routing decision', [
            'requested_model' => $model,
            'routed_model' => $routedModel,
            'outcome' => $routingDecision->outcome,
            'reason' => $routingDecision->reasonChain[0] ?? 'No reason',
            'was_escalated' => $routingDecision->wasEscalated,
        ]);

        // 4. Estimate cost (using routed model)
        $estimatedCost = $this->costEstimator->estimate(
            $routedProvider,
            $routedModel,
            $estimatedPromptTokens,
            $estimatedCompletionTokens
        );

        // 4b. Check if routing blocked the request
        if ($routingDecision->outcome === RoutingDecision::OUTCOME_BLOCKED) {
            Log::warning('LLMProxy: Request blocked by economic router', [
                'organization_id' => $organization->id,
                'requested_model' => $model,
                'reason_chain' => $routingDecision->reasonChain,
            ]);

            return [
                'success' => false,
                'response' => null,
                'enforcement' => $this->buildEnforcementResponse(
                    ['action' => 'blocked', 'reason' => 'Blocked by economic router', 'triggered_policies' => [], 'observed_policies' => []],
                    $provider,
                    $model,
                    null,
                    null,
                    $estimatedCost,
                    null,
                    []
                ),
                'routing' => $routingDecision->toArray(),
                'error' => 'Request blocked: ' . implode(' | ', $routingDecision->reasonChain),
                'http_status' => 403,
                'attempt_uuid' => $attemptUuid,
            ];
        }

        // 5. Build preflight context (with routed model)
        $ctx = new PreflightContext(
            organization_id: $organization->id,
            provider: $routedProvider,
            model: $routedModel,
            prompt_tokens: $estimatedPromptTokens,
            completion_tokens: $estimatedCompletionTokens,
            estimated_cost: $estimatedCost,
            feature_id: $attribution->feature?->id,
            customer_id: $attribution->customer?->id,
            plan_id: $attribution->plan?->id,
            workflow_name: $attribution->workflow,
            feature: $attribution->feature,
            customer: $attribution->customer,
            plan: $attribution->plan,
            organization: $organization,
        );

        // 6. Preflight policy evaluation - ENFORCEMENT AFTER ROUTING
        $enforcement = $this->policyService->preflightEvaluate($ctx);
        $observedPolicies = $enforcement['observed_policies'] ?? [];

        // 7. Handle BLOCKED by policy
        if ($enforcement['action'] === BusinessConstants::POLICY_ACTION_BLOCKED) {
            $this->policyService->logTriggers(
                $enforcement['triggered_policies'],
                null,
                $ctx,
                $enforcement['action'],
                $attemptUuid,
                $observedPolicies
            );

            return [
                'success' => false,
                'response' => null,
                'enforcement' => $this->buildEnforcementResponse(
                    $enforcement,
                    $provider,
                    $model,
                    null,
                    null,
                    $estimatedCost,
                    null,
                    $observedPolicies
                ),
                'routing' => $routingDecision->toArray(),
                'error' => 'Request blocked by policy: ' . $enforcement['reason'],
                'http_status' => 403,
                'attempt_uuid' => $attemptUuid,
                'Margexa_metadata' => $this->buildMetadataHeader($organization, $attribution->feature, $attribution->customer, $attribution->plan, $metadata),
            ];
        }

        // 8. Handle additional FALLBACK from policy (on top of routing)
        $effectiveProvider = $routedProvider;
        $effectiveModel = $routedModel;
        $fallbackApplied = $routingApplied; // Track if routing or policy changed model

        if ($enforcement['action'] === BusinessConstants::POLICY_ACTION_FALLBACK) {
            $effectiveProvider = $enforcement['fallback_provider'] ?? $provider;
            $effectiveModel = $enforcement['fallback_model'] ?? $routedModel;
            $fallbackApplied = true;
            
            // Update request body with fallback model
            $requestBody['model'] = $effectiveModel;
        } else {
            // Apply routing decision model (may already be different from requested)
            $requestBody['model'] = $effectiveModel;
        }

        // 9. Get provider API key
        $apiKey = $this->getProviderApiKey($organization->id, $effectiveProvider);
        if (!$apiKey) {
            return [
                'success' => false,
                'response' => null,
                'enforcement' => $this->buildEnforcementResponse(
                    $enforcement,
                    $provider,
                    $model,
                    $effectiveProvider,
                    $effectiveModel,
                    $estimatedCost,
                    null,
                    $observedPolicies
                ),
                'error' => "No API key configured for provider: {$effectiveProvider}",
                'http_status' => 503,
                'attempt_uuid' => $attemptUuid,
            ];
        }

        // 10. Forward to provider
        $providerResponse = $this->forwardToProvider(
            $effectiveProvider,
            $requestBody,
            $apiKey
        );

        // 11. Parse response and extract actual usage
        if (!$providerResponse['success']) {
            Log::error('LLMProxy: Provider request failed', [
                'provider' => $effectiveProvider,
                'model' => $effectiveModel,
                'error' => $providerResponse['error'],
            ]);

            return [
                'success' => false,
                'response' => $providerResponse['response'],
                'enforcement' => $this->buildEnforcementResponse(
                    $enforcement,
                    $provider,
                    $model,
                    $effectiveProvider,
                    $effectiveModel,
                    $estimatedCost,
                    null,
                    $observedPolicies
                ),
                'error' => $providerResponse['error'],
                'http_status' => $providerResponse['http_status'],
                'attempt_uuid' => $attemptUuid,
            ];
        }

        // 12. Extract actual token usage from response
        $responseData = $providerResponse['response'];
        $actualPromptTokens = $responseData['usage']['prompt_tokens'] ?? $estimatedPromptTokens;
        $actualCompletionTokens = $responseData['usage']['completion_tokens'] ?? $estimatedCompletionTokens;

        // 13. Calculate actual cost
        $actualCost = $this->costEstimator->estimate(
            $effectiveProvider,
            $effectiveModel,
            $actualPromptTokens,
            $actualCompletionTokens
        );

        // 14. Create AIRequest record with ROUTING + ATTRIBUTION TRACKING
        $aiRequest = AIRequest::query()->create([
            'organization_id' => $organization->id,
            'provider' => $effectiveProvider,
            'requested_provider' => $provider,
            'model' => $effectiveModel,
            'requested_model' => $model,
            'feature_id' => $attribution->feature?->id,
            'customer_id' => $attribution->customer?->id,
            'plan_id' => $attribution->plan?->id,
            'workflow_name' => $attribution->workflow,
            'prompt_tokens' => $actualPromptTokens,
            'completion_tokens' => $actualCompletionTokens,
            'estimated_cost' => $actualCost,
            'enforcement_action' => $enforcement['action'],
            'enforcement_reason' => $enforcement['reason'],
            'attribution_status' => $attribution->status,
            'attribution_score' => $attribution->score,
            'attribution_issues' => $attribution->issues ?: null,
            // NEW: Track routing decision
            'routing_outcome' => $routingDecision->outcome,
            'routing_tier' => $routingDecision->routedTier->value,
            'routing_savings' => $routingDecision->estimatedSavings,
            'created_at' => now(),
        ]);

        // 15. Log triggered policies
        if ($enforcement['triggered_policies'] !== [] || $observedPolicies !== []) {
            $this->policyService->logTriggers(
                $enforcement['triggered_policies'],
                $aiRequest,
                $ctx,
                $enforcement['action'],
                $attemptUuid,
                $observedPolicies
            );
        }

        $latencyMs = (int) ((microtime(true) - $startTime) * 1000);

        // 16. Build enriched response with ROUTING + ATTRIBUTION KPIs
        return [
            'success' => true,
            'response' => $responseData,
            'enforcement' => $this->buildEnforcementResponse(
                $enforcement,
                $provider,
                $model,
                $effectiveProvider,
                $effectiveModel,
                $estimatedCost,
                $actualCost,
                $observedPolicies
            ),
            // NEW: Full routing decision for transparency
            'routing' => $routingDecision->toArray(),
            'error' => null,
            'http_status' => 200,
            'attempt_uuid' => $attemptUuid,
            'Margexa_metadata' => [
                'ai_request_id' => $aiRequest->id,
                'organization_id' => $organization->id,
                'customer_id' => $attribution->customer?->id,
                'customer_name' => $attribution->customer?->name,
                'feature_id' => $attribution->feature?->id,
                'feature_name' => $attribution->feature?->name,
                'plan_id' => $attribution->plan?->id,
                'plan_name' => $attribution->plan?->name,
                'workflow' => $attribution->workflow,
                'actual_cost' => $actualCost,
                'latency_ms' => $latencyMs,
                'fallback_applied' => $fallbackApplied,
                // NEW: Routing visibility
                'routing_outcome' => $routingDecision->outcome,
                'routing_tier' => $routingDecision->routedTier->value,
                'routing_reason' => $routingDecision->reasonChain[0] ?? null,
            ],
            // ATTRIBUTION KPI: Central metric for data quality
            'attribution' => $attribution->toArray(),
        ];
    }

    /**
     * Forward request to the actual LLM provider.
     */
    private function forwardToProvider(string $provider, array $requestBody, string $apiKey): array
    {
        $baseUrl = self::PROVIDER_URLS[$provider] ?? null;
        if (!$baseUrl) {
            return [
                'success' => false,
                'response' => null,
                'error' => "Unsupported provider: {$provider}",
                'http_status' => 400,
            ];
        }

        try {
            if ($provider === 'anthropic') {
                // Anthropic uses a different API format
                $response = $this->forwardToAnthropic($requestBody, $apiKey);
            } else {
                // OpenAI and OpenAI-compatible providers
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ])->timeout(120)->post("{$baseUrl}/chat/completions", $requestBody);
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'response' => $response->json(),
                    'error' => null,
                    'http_status' => $response->status(),
                ];
            }

            return [
                'success' => false,
                'response' => $response->json(),
                'error' => $response->json()['error']['message'] ?? 'Provider request failed',
                'http_status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('LLMProxy: Exception during provider call', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'response' => null,
                'error' => 'Provider connection failed: ' . $e->getMessage(),
                'http_status' => 502,
            ];
        }
    }

    /**
     * Forward to Anthropic (converts OpenAI format to Anthropic format).
     */
    private function forwardToAnthropic(array $requestBody, string $apiKey): Response
    {
        // Convert OpenAI messages format to Anthropic format
        $messages = $requestBody['messages'] ?? [];
        $systemMessage = null;
        $anthropicMessages = [];

        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $systemMessage = $message['content'];
            } else {
                $anthropicMessages[] = [
                    'role' => $message['role'] === 'assistant' ? 'assistant' : 'user',
                    'content' => $message['content'],
                ];
            }
        }

        $anthropicBody = [
            'model' => $this->mapToAnthropicModel($requestBody['model']),
            'max_tokens' => $requestBody['max_tokens'] ?? 1024,
            'messages' => $anthropicMessages,
        ];

        if ($systemMessage) {
            $anthropicBody['system'] = $systemMessage;
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
            'Content-Type' => 'application/json',
        ])->timeout(120)->post('https://api.anthropic.com/v1/messages', $anthropicBody);

        // Convert Anthropic response back to OpenAI format
        if ($response->successful()) {
            $anthropicData = $response->json();
            $openAIResponse = [
                'id' => $anthropicData['id'] ?? Str::uuid()->toString(),
                'object' => 'chat.completion',
                'created' => time(),
                'model' => $requestBody['model'],
                'choices' => [
                    [
                        'index' => 0,
                        'message' => [
                            'role' => 'assistant',
                            'content' => $anthropicData['content'][0]['text'] ?? '',
                        ],
                        'finish_reason' => $this->mapAnthropicStopReason($anthropicData['stop_reason'] ?? 'end_turn'),
                    ],
                ],
                'usage' => [
                    'prompt_tokens' => $anthropicData['usage']['input_tokens'] ?? 0,
                    'completion_tokens' => $anthropicData['usage']['output_tokens'] ?? 0,
                    'total_tokens' => ($anthropicData['usage']['input_tokens'] ?? 0) + ($anthropicData['usage']['output_tokens'] ?? 0),
                ],
            ];

            // Return a fake successful response with converted data
            return new class($openAIResponse) extends Response {
                private array $data;
                
                public function __construct(array $data)
                {
                    $this->data = $data;
                }
                
                public function successful(): bool
                {
                    return true;
                }
                
                public function json($key = null, $default = null)
                {
                    if ($key === null) {
                        return $this->data;
                    }
                    return data_get($this->data, $key, $default);
                }
                
                public function status(): int
                {
                    return 200;
                }
            };
        }

        return $response;
    }

    private function mapToAnthropicModel(string $model): string
    {
        return match ($model) {
            'claude-3-5-sonnet' => 'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku' => 'claude-3-5-haiku-20241022',
            default => $model,
        };
    }

    private function mapAnthropicStopReason(string $reason): string
    {
        return match ($reason) {
            'end_turn' => 'stop',
            'max_tokens' => 'length',
            'stop_sequence' => 'stop',
            default => 'stop',
        };
    }

    /**
     * Resolve provider from model name.
     */
    private function resolveProvider(string $model, ?string $explicitProvider): string
    {
        $catalogProvider = MargeXaCatalog::providerForModel($model);
        if ($catalogProvider) {
            return $catalogProvider;
        }

        if ($explicitProvider) {
            return strtolower($explicitProvider);
        }

        return self::MODEL_PROVIDERS[$model] ?? 'openai';
    }

    /**
     * Get API key for a provider from ProviderConnection.
     */
    private function getProviderApiKey(int $organizationId, string $provider): ?string
    {
        $connection = ProviderConnection::query()
            ->where('organization_id', $organizationId)
            ->where('provider', $provider)
            ->where('status', 'connected')
            ->first();

        if (!$connection) {
            return null;
        }

        // Decrypt the API key
        return decrypt($connection->api_key_encrypted);
    }

    /**
     * Estimate tokens from messages (rough estimate).
     */
    private function estimateTokens(array $messages): int
    {
        $text = '';
        foreach ($messages as $message) {
            $text .= $message['content'] ?? '';
        }

        // Rough estimate: 1 token ≈ 4 characters
        return (int) ceil(strlen($text) / 4);
    }

    private function buildEnforcementResponse(
        array $enforcement,
        string $requestedProvider,
        string $requestedModel,
        ?string $effectiveProvider,
        ?string $effectiveModel,
        float $estimatedCost,
        ?float $actualCost,
        array $observedPolicies
    ): array {
        $costAvoided = 0;
        if ($actualCost !== null && $enforcement['action'] === BusinessConstants::POLICY_ACTION_FALLBACK) {
            $originalCost = $this->costEstimator->estimate(
                $requestedProvider,
                $requestedModel,
                0, // Will use the rate difference
                0
            );
            // Approximate cost avoided based on cost difference
            $costAvoided = max(0, $estimatedCost - ($actualCost ?? $estimatedCost));
        }

        return [
            'action' => $enforcement['action'],
            'reason' => $enforcement['reason'],
            'requested_provider' => $requestedProvider,
            'requested_model' => $requestedModel,
            'effective_provider' => $effectiveProvider,
            'effective_model' => $effectiveModel,
            'estimated_cost' => $estimatedCost,
            'actual_cost' => $actualCost,
            'cost_avoided' => round($costAvoided, 6),
            'triggered_policies' => array_map(
                fn ($p) => [
                    'name' => $p['policy_name'],
                    'type' => $p['policy_type'],
                    'reason' => $p['reason'],
                ],
                $enforcement['triggered_policies']
            ),
            'observed_policies' => array_map(
                fn ($p) => [
                    'name' => $p['policy_name'],
                    'type' => $p['policy_type'],
                    'would_action' => $p['metadata']['theoretical_action'] ?? 'observed',
                ],
                $observedPolicies
            ),
        ];
    }

    private function buildMetadataHeader(
        Organization $organization,
        ?Feature $feature,
        ?Customer $customer,
        ?Plan $plan,
        array $metadata
    ): array {
        return [
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'customer_id' => $customer?->id,
            'customer_name' => $customer?->name,
            'feature_id' => $feature?->id,
            'feature_name' => $feature?->name,
            'plan_id' => $plan?->id,
            'plan_name' => $plan?->name,
            'workflow' => $metadata['workflow'] ?? null,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────
    // SSE STREAMING
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Streaming proxy — replaces the 400 "streaming not supported" response.
     *
     * Runs the same preflight (routing + policy) as proxy(), then returns
     * a 'streamer' Closure that, when called inside a StreamedResponse, pipes
     * SSE chunks to the client and logs the completed request to ai_requests.
     *
     * @return array{success: bool, streamer?: \Closure, attempt_uuid?: string, error?: string, http_status?: int}
     */
    public function proxyStream(array $requestBody, array $metadata, Organization $organization): array
    {
        $attemptUuid = Str::uuid()->toString();
        $startTime   = microtime(true);

        $model = $requestBody['model'] ?? 'gpt-4o-mini';

        if (! MargeXaCatalog::isSupportedModel($model)) {
            return ['success' => false, 'error' => "Model '{$model}' is not in the Margexa V1 catalog.", 'http_status' => 400];
        }

        $modelConfig = MargeXaCatalog::supportedModel($model);
        if (($modelConfig['coming_soon'] ?? false) || ($modelConfig['provider'] ?? null) === 'google') {
            return ['success' => false, 'error' => 'Google/Gemini provider support is coming in Margexa V2.', 'http_status' => 501];
        }

        $provider = $this->resolveProvider($model, $metadata['provider'] ?? null);
        $messages = $requestBody['messages'] ?? [];

        $estimatedPromptTokens     = $this->estimateTokens($messages);
        $estimatedCompletionTokens = $requestBody['max_tokens'] ?? 1000;

        // Attribution
        $attribution = $this->attributionService->resolve($metadata, $organization->id);

        // Economic routing
        $routingContext = new RoutingContext(
            organizationId: $organization->id,
            requestedModel: $model,
            provider:       $provider,
            customerId:     $attribution->customer?->id,
            planId:         $attribution->plan?->id,
            featureId:      $attribution->feature?->id,
            workflowId:     $attribution->workflow,
            estimatedCost:  0,
            inputTokens:    $estimatedPromptTokens,
            outputTokens:   $estimatedCompletionTokens,
            metadata:       $metadata,
            organization:   $organization,
            customer:       $attribution->customer,
            plan:           $attribution->plan,
            feature:        $attribution->feature,
        );
        $routingDecision = $this->economicRouter->route($routingContext);
        $routedModel     = $routingDecision->routedModel;
        $routedProvider  = $this->resolveProvider($routedModel, $provider);

        $estimatedCost = $this->costEstimator->estimate(
            $routedProvider, $routedModel,
            $estimatedPromptTokens, $estimatedCompletionTokens
        );

        if ($routingDecision->outcome === RoutingDecision::OUTCOME_BLOCKED) {
            return [
                'success'     => false,
                'error'       => 'Request blocked: ' . implode(' | ', $routingDecision->reasonChain),
                'http_status' => 403,
            ];
        }

        // Policy preflight
        $ctx = new PreflightContext(
            organization_id:   $organization->id,
            provider:          $routedProvider,
            model:             $routedModel,
            prompt_tokens:     $estimatedPromptTokens,
            completion_tokens: $estimatedCompletionTokens,
            estimated_cost:    $estimatedCost,
            feature_id:        $attribution->feature?->id,
            customer_id:       $attribution->customer?->id,
            plan_id:           $attribution->plan?->id,
            workflow_name:     $attribution->workflow,
            feature:           $attribution->feature,
            customer:          $attribution->customer,
            plan:              $attribution->plan,
            organization:      $organization,
        );

        $enforcement      = $this->policyService->preflightEvaluate($ctx);
        $observedPolicies = $enforcement['observed_policies'] ?? [];

        if ($enforcement['action'] === BusinessConstants::POLICY_ACTION_BLOCKED) {
            $this->policyService->logTriggers(
                $enforcement['triggered_policies'], null, $ctx,
                $enforcement['action'], $attemptUuid, $observedPolicies
            );
            return [
                'success'     => false,
                'error'       => 'Request blocked by policy: ' . $enforcement['reason'],
                'http_status' => 403,
            ];
        }

        $effectiveProvider = $routedProvider;
        $effectiveModel    = $routedModel;

        if ($enforcement['action'] === BusinessConstants::POLICY_ACTION_FALLBACK) {
            $effectiveProvider = $enforcement['fallback_provider'] ?? $provider;
            $effectiveModel    = $enforcement['fallback_model'] ?? $routedModel;
        }

        $requestBody['model'] = $effectiveModel;

        $apiKey = $this->getProviderApiKey($organization->id, $effectiveProvider);
        if (! $apiKey) {
            return [
                'success'     => false,
                'error'       => "No API key configured for provider: {$effectiveProvider}",
                'http_status' => 503,
            ];
        }

        // The streamer Closure is called inside StreamedResponse.
        // $this is automatically bound — private methods are accessible.
        $streamer = function () use (
            $effectiveProvider, $effectiveModel, $requestBody, $apiKey,
            $model, $provider, $attribution, $organization, $enforcement, $ctx,
            $observedPolicies, $routingDecision, $attemptUuid
        ) {
            try {
                [$promptTokens, $completionTokens] = $effectiveProvider === 'anthropic'
                    ? $this->streamAnthropic($requestBody, $apiKey, $effectiveModel, $model)
                    : $this->streamOpenAI($requestBody, $apiKey);
            } catch (\Throwable $e) {
                Log::error('LLMProxy: SSE streaming error', ['error' => $e->getMessage()]);
                $errChunk = json_encode([
                    'error' => ['message' => 'Streaming failed: ' . $e->getMessage(), 'type' => 'server_error'],
                ]);
                echo "data: {$errChunk}\n\n";
                echo "data: [DONE]\n\n";
                if (ob_get_level()) ob_flush();
                flush();
                return;
            }

            // Log to ai_requests after the stream completes
            $actualCost = $this->costEstimator->estimate(
                $effectiveProvider, $effectiveModel, $promptTokens, $completionTokens
            );

            try {
                $aiRequest = AIRequest::query()->create([
                    'organization_id'    => $organization->id,
                    'provider'           => $effectiveProvider,
                    'requested_provider' => $provider,
                    'model'              => $effectiveModel,
                    'requested_model'    => $model,
                    'feature_id'         => $attribution->feature?->id,
                    'customer_id'        => $attribution->customer?->id,
                    'plan_id'            => $attribution->plan?->id,
                    'workflow_name'      => $attribution->workflow,
                    'prompt_tokens'      => $promptTokens,
                    'completion_tokens'  => $completionTokens,
                    'estimated_cost'     => $actualCost,
                    'enforcement_action' => $enforcement['action'],
                    'enforcement_reason' => $enforcement['reason'],
                    'attribution_status' => $attribution->status,
                    'attribution_score'  => $attribution->score,
                    'attribution_issues' => $attribution->issues ?: null,
                    'routing_outcome'    => $routingDecision->outcome,
                    'routing_tier'       => $routingDecision->routedTier->value,
                    'routing_savings'    => $routingDecision->estimatedSavings,
                    'created_at'         => now(),
                ]);

                if ($enforcement['triggered_policies'] !== [] || $observedPolicies !== []) {
                    $this->policyService->logTriggers(
                        $enforcement['triggered_policies'], $aiRequest, $ctx,
                        $enforcement['action'], Str::uuid()->toString(), $observedPolicies
                    );
                }
            } catch (\Throwable $e) {
                Log::error('LLMProxy: Failed to log streamed ai_request', ['error' => $e->getMessage()]);
            }
        };

        return [
            'success'      => true,
            'streamer'     => $streamer,
            'attempt_uuid' => $attemptUuid,
        ];
    }

    /**
     * Stream from OpenAI and pipe SSE chunks verbatim to the client.
     * Returns [promptTokens, completionTokens] for post-stream logging.
     */
    private function streamOpenAI(array $requestBody, string $apiKey): array
    {
        $requestBody['stream'] = true;
        // Request usage in the final stream chunk (supported since 2024)
        $requestBody['stream_options'] = ['include_usage' => true];

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type'  => 'application/json',
        ])
        ->withOptions(['stream' => true])
        ->timeout(120)
        ->post('https://api.openai.com/v1/chat/completions', $requestBody);

        $body = $response->toPsrResponse()->getBody();

        $promptTokens     = 0;
        $completionTokens = 0;
        $buffer           = '';
        $done             = false;

        while (! $body->eof() && ! $done) {
            $buffer .= $body->read(4096);

            while (($pos = strpos($buffer, "\n")) !== false) {
                $line   = rtrim(substr($buffer, 0, $pos));
                $buffer = substr($buffer, $pos + 1);

                if (empty($line) || ! str_starts_with($line, 'data: ')) continue;

                $data = substr($line, 6);

                if ($data === '[DONE]') {
                    echo "data: [DONE]\n\n";
                    if (ob_get_level()) ob_flush();
                    flush();
                    $done = true;
                    break;
                }

                $parsed = json_decode($data, true);
                if (is_array($parsed) && isset($parsed['usage'])) {
                    $promptTokens     = $parsed['usage']['prompt_tokens']     ?? $promptTokens;
                    $completionTokens = $parsed['usage']['completion_tokens'] ?? $completionTokens;
                }

                echo "data: {$data}\n\n";
                if (ob_get_level()) ob_flush();
                flush();
            }
        }

        return [$promptTokens, $completionTokens];
    }

    /**
     * Stream from Anthropic, convert to OpenAI SSE format, and pipe to client.
     * Returns [promptTokens, completionTokens] for post-stream logging.
     *
     * Anthropic SSE events → OpenAI chat.completion.chunk mapping:
     *   message_start       → capture input_tokens
     *   content_block_delta → choices[0].delta.content
     *   message_delta       → finish_reason + output_tokens
     *   message_stop        → data: [DONE]
     */
    private function streamAnthropic(array $requestBody, string $apiKey, string $effectiveModel, string $requestedModel): array
    {
        // Convert OpenAI message format to Anthropic
        $messages = $requestBody['messages'] ?? [];
        $systemMessage     = null;
        $anthropicMessages = [];

        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $systemMessage = $message['content'];
            } else {
                $anthropicMessages[] = [
                    'role'    => $message['role'] === 'assistant' ? 'assistant' : 'user',
                    'content' => $message['content'],
                ];
            }
        }

        $anthropicBody = [
            'model'      => $this->mapToAnthropicModel($effectiveModel),
            'max_tokens' => $requestBody['max_tokens'] ?? 1024,
            'messages'   => $anthropicMessages,
            'stream'     => true,
        ];
        if ($systemMessage) {
            $anthropicBody['system'] = $systemMessage;
        }

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
            'Content-Type'      => 'application/json',
        ])
        ->withOptions(['stream' => true])
        ->timeout(120)
        ->post('https://api.anthropic.com/v1/messages', $anthropicBody);

        $body = $response->toPsrResponse()->getBody();

        $promptTokens     = 0;
        $completionTokens = 0;
        $buffer           = '';
        $completionId     = 'chatcmpl-' . Str::random(29);
        $created          = time();
        $done             = false;

        // Emit the initial role delta (OpenAI clients expect this first)
        $roleChunk = json_encode([
            'id'      => $completionId,
            'object'  => 'chat.completion.chunk',
            'created' => $created,
            'model'   => $requestedModel,
            'choices' => [['index' => 0, 'delta' => ['role' => 'assistant', 'content' => ''], 'finish_reason' => null]],
        ]);
        echo "data: {$roleChunk}\n\n";
        if (ob_get_level()) ob_flush();
        flush();

        while (! $body->eof() && ! $done) {
            $buffer .= $body->read(4096);

            while (($pos = strpos($buffer, "\n")) !== false) {
                $line   = rtrim(substr($buffer, 0, $pos));
                $buffer = substr($buffer, $pos + 1);

                // Skip event: lines and empty lines — only process data: lines
                if (empty($line) || ! str_starts_with($line, 'data: ')) continue;

                $parsed = json_decode(substr($line, 6), true);
                if (! is_array($parsed)) continue;

                switch ($parsed['type'] ?? '') {
                    case 'message_start':
                        $promptTokens = $parsed['message']['usage']['input_tokens'] ?? 0;
                        break;

                    case 'content_block_delta':
                        if (($parsed['delta']['type'] ?? '') === 'text_delta') {
                            $oaiChunk = json_encode([
                                'id'      => $completionId,
                                'object'  => 'chat.completion.chunk',
                                'created' => $created,
                                'model'   => $requestedModel,
                                'choices' => [['index' => 0, 'delta' => ['content' => $parsed['delta']['text'] ?? ''], 'finish_reason' => null]],
                            ]);
                            echo "data: {$oaiChunk}\n\n";
                            if (ob_get_level()) ob_flush();
                            flush();
                        }
                        break;

                    case 'message_delta':
                        $completionTokens = $parsed['usage']['output_tokens'] ?? $completionTokens;
                        $stopReason       = $this->mapAnthropicStopReason($parsed['delta']['stop_reason'] ?? 'end_turn');
                        $finishChunk      = json_encode([
                            'id'      => $completionId,
                            'object'  => 'chat.completion.chunk',
                            'created' => $created,
                            'model'   => $requestedModel,
                            'choices' => [['index' => 0, 'delta' => [], 'finish_reason' => $stopReason]],
                            'usage'   => [
                                'prompt_tokens'     => $promptTokens,
                                'completion_tokens' => $completionTokens,
                                'total_tokens'      => $promptTokens + $completionTokens,
                            ],
                        ]);
                        echo "data: {$finishChunk}\n\n";
                        if (ob_get_level()) ob_flush();
                        flush();
                        break;

                    case 'message_stop':
                        echo "data: [DONE]\n\n";
                        if (ob_get_level()) ob_flush();
                        flush();
                        $done = true;
                        break 2; // break out of inner while($buffer) — outer while(!eof) exits via $done
                }
            }
        }

        return [$promptTokens, $completionTokens];
    }
}
