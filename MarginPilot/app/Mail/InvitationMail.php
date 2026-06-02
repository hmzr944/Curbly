<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Invitation $invitation,
        public readonly string     $inviterName,
        public readonly string     $organizationName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->inviterName} invited you to join {$this->organizationName} on Margexa",
        );
    }

    public function content(): Content
    {
        $acceptUrl = url('/invite/' . $this->invitation->token);

        return new Content(
            view: 'emails.invitation',
            with: [
                'inviterName'      => $this->inviterName,
                'organizationName' => $this->organizationName,
                'role'             => ucfirst($this->invitation->role),
                'acceptUrl'        => $acceptUrl,
                'expiresAt'        => $this->invitation->expires_at?->format('d M Y'),
            ],
        );
    }
}
