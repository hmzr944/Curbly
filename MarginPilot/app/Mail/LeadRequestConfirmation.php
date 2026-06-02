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
 * Email de confirmation envoyé au lead après demande d'audit ou démo.
 */
class LeadRequestConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly DiagnosticRequest $diagnostic,
        public readonly string $requestType,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->requestType === 'audit'
            ? 'Votre demande d\'AI Margin Scan a bien été reçue'
            : 'Votre demande de démo Margexa a bien été reçue';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.lead-request-confirmation',
            with: [
                'diagnostic' => $this->diagnostic,
                'requestType' => $this->requestType,
                'companyName' => $this->diagnostic->company_name,
                'contactName' => $this->diagnostic->contact_name,
                'riskLevel' => $this->diagnostic->risk_level,
                'potentialSavings' => $this->diagnostic->potential_savings,
            ],
        );
    }
}
