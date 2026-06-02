<?php

namespace App\Mail;

use App\Models\DiagnosticRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Notification interne à l'équipe commerciale pour nouvelle demande audit/démo.
 */
class InternalLeadNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly DiagnosticRequest $diagnostic,
        public readonly string $requestType,
    ) {}

    public function envelope(): Envelope
    {
        $emoji = $this->requestType === 'audit' ? '' : '';
        $type = $this->requestType === 'audit' ? 'Audit' : 'Demo';

        return new Envelope(
            subject: "[Margexa] Nouvelle demande {$type} - {$this->diagnostic->company_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.internal-lead-notification',
            with: [
                'diagnostic' => $this->diagnostic,
                'requestType' => $this->requestType,
                'companyName' => $this->diagnostic->company_name,
                'contactName' => $this->diagnostic->contact_name,
                'contactEmail' => $this->diagnostic->email,
                'riskLevel' => $this->diagnostic->risk_level,
                'riskScore' => $this->diagnostic->risk_score,
                'potentialSavings' => $this->diagnostic->potential_savings,
                'currentSpend' => $this->diagnostic->current_monthly_spend,
                'provider' => $this->diagnostic->provider,
                'model' => $this->diagnostic->primary_model,
                'volume' => $this->diagnostic->monthly_volume,
                'useCase' => $this->diagnostic->use_case,
            ],
        );
    }
}
