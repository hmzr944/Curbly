<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouveau message de contact — Margexa</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
        .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; padding: 32px; }
        .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { font-size: 13px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; }
        h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 8px 0 0; }
        .row { display: flex; gap: 16px; margin-bottom: 12px; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
        .value { font-size: 14px; color: #1e293b; }
        .field { flex: 1; background: #f8fafc; border-radius: 8px; padding: 12px 16px; }
        .message-box { background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 16px; }
        .message-text { font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-line; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="brand">Margexa</div>
            <h1>Nouveau message de contact</h1>
        </div>

        <div class="row">
            <div class="field">
                <div class="label">Nom</div>
                <div class="value">{{ $contactMessage->first_name }} {{ $contactMessage->last_name }}</div>
            </div>
            <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:{{ $contactMessage->email }}">{{ $contactMessage->email }}</a></div>
            </div>
        </div>

        <div class="row">
            <div class="field">
                <div class="label">Entreprise</div>
                <div class="value">{{ $contactMessage->company }}</div>
            </div>
            <div class="field">
                <div class="label">Rôle</div>
                <div class="value">{{ $contactMessage->role ?: '—' }}</div>
            </div>
        </div>

        @if($contactMessage->team_size || $contactMessage->ai_volume)
        <div class="row">
            @if($contactMessage->team_size)
            <div class="field">
                <div class="label">Taille équipe</div>
                <div class="value">{{ $contactMessage->team_size }}</div>
            </div>
            @endif
            @if($contactMessage->ai_volume)
            <div class="field">
                <div class="label">Volume IA estimé</div>
                <div class="value">{{ $contactMessage->ai_volume }}</div>
            </div>
            @endif
        </div>
        @endif

        <div style="margin-bottom: 12px;">
            <div class="label">Sujet</div>
            <div class="value" style="font-weight: 600;">{{ $contactMessage->subject }}</div>
        </div>

        <div>
            <div class="label">Message</div>
            <div class="message-box">
                <div class="message-text">{{ $contactMessage->message }}</div>
            </div>
        </div>

        <div class="footer">
            Reçu le {{ $contactMessage->created_at->format('d/m/Y à H:i') }} · IP : {{ $contactMessage->ip_address }}
        </div>
    </div>
</body>
</html>
