<?php

namespace App\Http\Controllers;

use App\Http\Requests\PolicyRequest;
use App\Models\AuditLog;
use App\Models\Policy;
use App\Models\PolicyTrigger;
use App\Services\PolicyTemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class PolicyController extends Controller
{
    public function __construct(private readonly PolicyTemplateService $templateService)
    {
    }

    public function index(): Response|RedirectResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return redirect()->route('app.index');
        }

        $policies = Policy::query()
            ->where('organization_id', $organization->id)
            ->latest()
            ->get();

        $policyByName = $policies->keyBy('name');

        $recentTriggersCount = PolicyTrigger::query()
            ->where('organization_id', $organization->id)
            ->where('triggered_at', '>=', now()->subHours(24))
            ->count();

        return Inertia::render('Policies/Index', [
            'policies' => $policies,
            'templates' => collect($this->templateService->all())->map(function ($template) use ($policyByName) {
                $existingPolicy = $policyByName->get($template['name']);

                return [
                    ...$template,
                    'is_active' => $existingPolicy?->is_active ?? false,
                    'existing_policy_id' => $existingPolicy?->id,
                ];
            }),
            'recentTriggersCount' => $recentTriggersCount,
        ]);
    }

    public function store(PolicyRequest $request): RedirectResponse
    {
        $organization = $request->user()->organization;

        if (! $organization) {
            return redirect()->route('app.index');
        }

        $data = $request->validated();

        $policy = Policy::query()->create([
            'organization_id' => $organization->id,
            'name' => $data['name'],
            'type' => $data['type'],
            'scope' => $data['scope'],
            'description' => $data['description'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'enforcement_mode' => $data['enforcement_mode'] ?? Policy::MODE_ENFORCE,
            'conditions' => [
                'threshold' => $data['threshold'] ?? null,
            ],
            'actions' => [
                'fallback_model' => $data['fallback_model'] ?? null,
            ],
        ]);

        $this->logAudit(
            userId: (int) $request->user()->id,
            organizationId: (int) $organization->id,
            action: 'policy.created',
            entityType: 'policy',
            entityId: (int) $policy->id,
            payload: [
                'name' => $data['name'],
                'type' => $data['type'],
                'scope' => $data['scope'],
            ],
            request: $request,
        );

        return back();
    }

    public function update(PolicyRequest $request, int $policy): RedirectResponse
    {
        $policy = Policy::where('id', $policy)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();
        $data = $request->validated();

        $policy->update([
            'name' => $data['name'],
            'type' => $data['type'],
            'scope' => $data['scope'],
            'description' => $data['description'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'enforcement_mode' => $data['enforcement_mode'] ?? Policy::MODE_ENFORCE,
            'conditions' => [
                'threshold' => $data['threshold'] ?? null,
            ],
            'actions' => [
                'fallback_model' => $data['fallback_model'] ?? null,
            ],
        ]);

        $this->logAudit(
            userId: (int) $request->user()->id,
            organizationId: (int) $request->user()->organization_id,
            action: 'policy.updated',
            entityType: 'policy',
            entityId: (int) $policy->id,
            payload: [
                'name' => $data['name'],
                'type' => $data['type'],
                'scope' => $data['scope'],
                'is_active' => (bool) ($data['is_active'] ?? true),
            ],
            request: $request,
        );

        return back();
    }

    public function destroy(Request $request, int $policy): RedirectResponse
    {
        $policy = Policy::where('id', $policy)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $payload = [
            'name' => $policy->name,
            'type' => $policy->type,
            'scope' => $policy->scope,
        ];

        $policy->delete();

        $this->logAudit(
            userId: (int) $request->user()->id,
            organizationId: (int) $request->user()->organization_id,
            action: 'policy.deleted',
            entityType: 'policy',
            entityId: (int) $policy->id,
            payload: $payload,
            request: $request,
        );

        return back();
    }

    public function storeTemplate(Request $request, string $templateKey): RedirectResponse
    {
        $organization = $request->user()->organization;

        if (! $organization) {
            return redirect()->route('app.index');
        }

        $template = $this->templateService->find($templateKey);

        abort_if($template === null, 404);

        $policy = Policy::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'name' => $template['name'],
            ],
            [
                'type' => $template['type'],
                'scope' => $template['scope'],
                'description' => $template['description'],
                'is_active' => true,
                'conditions' => $template['conditions'],
                'actions' => $template['actions'],
            ]
        );

        $policyId = $policy->id;

        $this->logAudit(
            userId: (int) $request->user()->id,
            organizationId: (int) $organization->id,
            action: 'policy.template_applied',
            entityType: 'policy',
            entityId: $policyId,
            payload: [
                'template_key' => $template['key'],
                'template_name' => $template['name'],
            ],
            request: $request,
        );

        return back();
    }

    public function toggle(Request $request, int $policy): RedirectResponse
    {
        $policy = Policy::where('id', $policy)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $policy->update([
            'is_active' => ! $policy->is_active,
        ]);

        $this->logAudit(
            userId: (int) $request->user()->id,
            organizationId: (int) $request->user()->organization_id,
            action: 'policy.toggled',
            entityType: 'policy',
            entityId: (int) $policy->id,
            payload: [
                'name' => $policy->name,
                'is_active' => $policy->is_active,
            ],
            request: $request,
        );

        return back();
    }

    /**
     * Bascule le mode d'enforcement d'une policy (observe <-> enforce).
     */
    public function toggleMode(Request $request, int $policy): RedirectResponse
    {
        $policy = Policy::where('id', $policy)
            ->where('organization_id', $request->user()->organization_id)
            ->firstOrFail();

        $newMode = $policy->enforcement_mode === Policy::MODE_OBSERVE 
            ? Policy::MODE_ENFORCE 
            : Policy::MODE_OBSERVE;

        $policy->update([
            'enforcement_mode' => $newMode,
        ]);

        $this->logAudit(
            userId: (int) $request->user()->id,
            organizationId: (int) $request->user()->organization_id,
            action: 'policy.mode_changed',
            entityType: 'policy',
            entityId: (int) $policy->id,
            payload: [
                'name' => $policy->name,
                'enforcement_mode' => $newMode,
                'previous_mode' => $policy->enforcement_mode === Policy::MODE_OBSERVE 
                    ? Policy::MODE_ENFORCE 
                    : Policy::MODE_OBSERVE,
            ],
            request: $request,
        );

        return back();
    }

    private function logAudit(
        int $userId,
        int $organizationId,
        string $action,
        string $entityType,
        int $entityId,
        array $payload,
        Request $request,
    ): void {
        AuditLog::query()->create([
            'organization_id' => $organizationId,
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload' => $payload,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
