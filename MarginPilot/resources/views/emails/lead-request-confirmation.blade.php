@component('mail::message')
# Bonjour {{ $contactName ?? 'Madame, Monsieur' }},

Nous avons bien reçu votre demande @if($requestType === 'audit')**d'AI Margin Scan**@else**de démo Margexa**@endif.

@if($requestType === 'audit')
## Votre diagnostic préliminaire

D'après les informations fournies concernant **{{ $companyName }}**, notre analyse préliminaire indique :

- **Niveau de risque marge** : {{ ucfirst($riskLevel) }}
- **Économies potentielles estimées** : {{ number_format($potentialSavings, 0, ',', ' ') }} €/mois

Un expert Margexa va analyser votre situation en détail et vous recontactera sous 24h avec :
- Un diagnostic complet de votre exposition IA
- Des recommandations personnalisées de policies
- Une simulation des économies réalisables

@else
## Prochaines étapes

Un membre de l'équipe Margexa vous contactera sous 24h pour :
- Vous présenter la plateforme en détail
- Répondre à vos questions techniques
- Discuter de votre cas d'usage spécifique

@endif

@component('mail::button', ['url' => config('app.url')])
Accéder à Margexa
@endcomponent

En attendant, n'hésitez pas à nous répondre directement si vous avez des questions.

Cordialement,<br>
L'équipe Margexa

---
*Cet email a été envoyé automatiquement suite à votre demande sur Margexa.app*
@endcomponent
