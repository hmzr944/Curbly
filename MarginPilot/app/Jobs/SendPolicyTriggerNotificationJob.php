<?php

namespace App\Jobs;

use App\Models\Organization;
use App\Models\PolicyTrigger;
use App\Models\User;
use App\Notifications\PolicyTriggerNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPolicyTriggerNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Cooldown minimum entre deux notifications pour la même organisation (minutes).
     * Évite le spam en cas de rafale de triggers.
     */
    private const COOLDOWN_MINUTES = 5;

    public function __construct(
        public readonly int $organizationId,
        public readonly int $policyTriggerId,
        public readonly string $eventType,
    ) {
    }

    public function handle(): void
    {
        $organization = Organization::query()->find($this->organizationId);
        if (! $organization) {
            Log::warning('SendPolicyTriggerNotificationJob: Organization not found', [
                'organization_id' => $this->organizationId,
            ]);
            return;
        }

        // Vérifier si les notifications sont activées
        if (! $this->isNotificationEnabled($organization)) {
            return;
        }

        // Anti-spam : vérifier le cooldown
        if (! $this->canSendNotification($organization)) {
            Log::info('SendPolicyTriggerNotificationJob: Cooldown active, skipping notification', [
                'organization_id' => $this->organizationId,
                'last_notification_at' => $organization->last_policy_notification_at,
            ]);
            return;
        }

        $trigger = PolicyTrigger::query()
            ->with(['policy', 'customer', 'feature', 'plan', 'aiRequest'])
            ->find($this->policyTriggerId);

        if (! $trigger) {
            Log::warning('SendPolicyTriggerNotificationJob: PolicyTrigger not found', [
                'policy_trigger_id' => $this->policyTriggerId,
            ]);
            return;
        }

        // Récupérer les destinataires
        $recipients = $this->getRecipients($organization);
        
        if ($recipients->isEmpty()) {
            Log::info('SendPolicyTriggerNotificationJob: No recipients found', [
                'organization_id' => $this->organizationId,
            ]);
            return;
        }

        // Construire la notification
        $metadata = $trigger->metadata ?? [];
        
        $notification = new PolicyTriggerNotification(
            organizationName: $organization->name,
            policyName: $trigger->policy?->name ?? 'Règle inconnue',
            eventType: $this->eventType,
            reason: $trigger->reason ?? 'Condition de règle remplie',
            customerName: $trigger->customer?->name,
            featureName: $trigger->feature?->name,
            planName: $trigger->plan?->name,
            requestedModel: $metadata['current_model'] ?? $trigger->aiRequest?->requested_model,
            effectiveModel: $metadata['fallback_model'] ?? $trigger->aiRequest?->model,
            estimatedCost: (float) ($metadata['estimated_cost_before'] ?? $trigger->impacted_cost ?? 0),
            costAvoided: (float) ($metadata['estimated_cost_avoided'] ?? $trigger->estimated_cost_avoided ?? 0),
            attemptUuid: $trigger->attempt_uuid ?? 'N/A',
        );

        // Envoyer aux destinataires
        foreach ($recipients as $user) {
            try {
                $user->notify($notification);
            } catch (\Throwable $e) {
                Log::error('SendPolicyTriggerNotificationJob: Failed to send notification', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Mettre à jour le timestamp anti-spam
        $organization->update([
            'last_policy_notification_at' => now(),
        ]);

        Log::info('SendPolicyTriggerNotificationJob: Notification sent', [
            'organization_id' => $this->organizationId,
            'recipients_count' => $recipients->count(),
            'event_type' => $this->eventType,
        ]);
    }

    private function isNotificationEnabled(Organization $organization): bool
    {
        $settings = $organization->notification_settings ?? [];
        $policySettings = $settings['policy_triggers'] ?? [];

        // Par défaut, notifications activées pour blocked et fallback
        if (empty($policySettings)) {
            return in_array($this->eventType, ['blocked', 'fallback_applied']);
        }

        if (! ($policySettings['email_enabled'] ?? true)) {
            return false;
        }

        return match ($this->eventType) {
            'blocked' => $policySettings['notify_on_blocked'] ?? true,
            'fallback_applied' => $policySettings['notify_on_fallback'] ?? true,
            'observed' => $policySettings['notify_on_observed'] ?? false,
            default => true,
        };
    }

    private function canSendNotification(Organization $organization): bool
    {
        $lastNotification = $organization->last_policy_notification_at;

        if (! $lastNotification) {
            return true;
        }

        return $lastNotification->diffInMinutes(now()) >= self::COOLDOWN_MINUTES;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<User>
     */
    private function getRecipients(Organization $organization): \Illuminate\Database\Eloquent\Collection
    {
        $settings = $organization->notification_settings ?? [];
        $policySettings = $settings['policy_triggers'] ?? [];
        $customRecipients = $policySettings['email_recipients'] ?? [];

        // Si des destinataires spécifiques sont configurés, les utiliser
        if (! empty($customRecipients)) {
            return User::query()
                ->where('organization_id', $organization->id)
                ->whereIn('email', $customRecipients)
                ->get();
        }

        // Sinon, notifier tous les utilisateurs de l'organisation
        // Limitation à 5 pour éviter le spam excessif
        return User::query()
            ->where('organization_id', $organization->id)
            ->limit(5)
            ->get();
    }
}
