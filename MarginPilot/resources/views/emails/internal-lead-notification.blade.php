@component('mail::message')
# Nouvelle demande {{ $requestType === 'audit' ? 'd\'Audit' : 'de Démo' }}

## Lead Information

| Champ | Valeur |
|-------|--------|
| **Entreprise** | {{ $companyName }} |
| **Contact** | {{ $contactName ?? 'Non renseigné' }} |
| **Email** | {{ $contactEmail }} |

## Diagnostic

| Métrique | Valeur |
|----------|--------|
| **Niveau de risque** | {{ ucfirst($riskLevel) }} |
| **Score de risque** | {{ $riskScore }}/100 |
| **Économies potentielles** | {{ number_format($potentialSavings, 0, ',', ' ') }} €/mois |
| **Dépense actuelle** | {{ $currentSpend ? number_format($currentSpend, 0, ',', ' ').' €/mois' : 'Non renseigné' }} |

## Contexte technique

| Champ | Valeur |
|-------|--------|
| **Provider** | {{ $provider }} |
| **Modèle principal** | {{ $model }} |
| **Volume mensuel** | {{ $volume }} |
| **Use case** | {{ $useCase }} |

---

**Action requise** : Contacter le lead sous 24h.

@component('mail::button', ['url' => config('app.url').'/api/admin/diagnostics'])
Voir tous les diagnostics
@endcomponent

@endcomponent
