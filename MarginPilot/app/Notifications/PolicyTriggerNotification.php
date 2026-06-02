<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PolicyTriggerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $organizationName,
        public readonly string $policyName,
        public readonly string $eventType,
        public readonly string $reason,
        public readonly ?string $customerName,
        public readonly ?string $featureName,
        public readonly ?string $planName,
        public readonly ?string $requestedModel,
        public readonly ?string $effectiveModel,
        public readonly float $estimatedCost,
        public readonly float $costAvoided,
        public readonly string $attemptUuid,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $eventLabel = match ($this->eventType) {
            'blocked' => '🛑 Blocage',
            'fallback_applied' => '↩️ Repli modèle',
            'observed' => '👁️ Observation',
            default => 'Déclenchement',
        };

        $subject = sprintf(
            '%s | Règle "%s" déclenchée — %s',
            $eventLabel,
            $this->policyName,
            $this->organizationName
        );

        $message = (new MailMessage())
            ->subject($subject)
            ->greeting('Bonjour,')
            ->line('Une règle de protection de marge s\'est déclenchée dans votre organisation.')
            ->line('');

        // Informations principales
        $message->line('**Détails de l\'événement :**');

        $details = [
            'Organisation' => $this->organizationName,
            'Type d\'événement' => $this->getEventTypeLabel(),
            'Règle déclenchée' => $this->policyName,
            'Raison' => $this->reason,
        ];

        if ($this->customerName) {
            $details['Client'] = $this->customerName;
        }

        if ($this->featureName) {
            $details['Fonctionnalité'] = $this->featureName;
        }

        if ($this->planName) {
            $details['Plan'] = $this->planName;
        }

        foreach ($details as $label => $value) {
            $message->line("• **{$label}** : {$value}");
        }

        $message->line('');

        // Informations techniques
        if ($this->requestedModel || $this->effectiveModel) {
            $message->line('**Modèle IA :**');
            
            if ($this->requestedModel) {
                $message->line("• Modèle demandé : {$this->requestedModel}");
            }
            
            if ($this->effectiveModel && $this->effectiveModel !== $this->requestedModel) {
                $message->line("• Modèle appliqué : {$this->effectiveModel}");
            }
            
            $message->line('');
        }

        // Impact financier
        $message->line('**Impact financier :**');
        $message->line(sprintf('• Coût estimé : $%.4f', $this->estimatedCost));
        
        if ($this->costAvoided > 0) {
            $message->line(sprintf('• **Coût évité : $%.4f**', $this->costAvoided));
        }

        // Appel à l'action
        $message->line('');
        
        if ($this->eventType === 'observed') {
            $message->line('ℹ️ Cette règle est en mode **observation** : aucune action n\'a été appliquée. La requête a continué normalement.');
        } elseif ($this->eventType === 'blocked') {
            $message->line('⚠️ Cette requête a été **bloquée** par la règle. Le modèle IA n\'a pas été appelé.');
        } else {
            $message->line('✅ La règle a appliqué un **repli automatique** vers un modèle plus économique.');
        }

        $message->action('Voir l\'impact dans Margexa', url('/margin-impact'));

        $message->line('');
        $message->line('Si ces déclenchements sont trop fréquents, vous pouvez ajuster vos seuils dans les paramètres de règles.');

        $message->salutation('— L\'équipe Margexa');

        return $message;
    }

    private function getEventTypeLabel(): string
    {
        return match ($this->eventType) {
            'blocked' => 'Blocage — requête refusée',
            'fallback_applied' => 'Repli — modèle économique appliqué',
            'observed' => 'Observation — aucune action réelle',
            default => 'Déclenchement de règle',
        };
    }

    public function toArray(object $notifiable): array
    {
        return [
            'organization_name' => $this->organizationName,
            'policy_name' => $this->policyName,
            'event_type' => $this->eventType,
            'reason' => $this->reason,
            'customer_name' => $this->customerName,
            'feature_name' => $this->featureName,
            'plan_name' => $this->planName,
            'requested_model' => $this->requestedModel,
            'effective_model' => $this->effectiveModel,
            'estimated_cost' => $this->estimatedCost,
            'cost_avoided' => $this->costAvoided,
            'attempt_uuid' => $this->attemptUuid,
        ];
    }
}
