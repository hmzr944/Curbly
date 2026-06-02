<?php $__env->startComponent('mail::message'); ?>
# Bonjour <?php echo new \Illuminate\Support\EncodedHtmlString($contactName ?? 'Madame, Monsieur'); ?>,

Nous avons bien reçu votre demande <?php if($requestType === 'audit'): ?>**d'AI Margin Scan**<?php else: ?>**de démo Margexa**<?php endif; ?>.

<?php if($requestType === 'audit'): ?>
## Votre diagnostic préliminaire

D'après les informations fournies concernant **<?php echo new \Illuminate\Support\EncodedHtmlString($companyName); ?>**, notre analyse préliminaire indique :

- **Niveau de risque marge** : <?php echo new \Illuminate\Support\EncodedHtmlString(ucfirst($riskLevel)); ?>

- **Économies potentielles estimées** : <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($potentialSavings, 0, ',', ' ')); ?> €/mois

Un expert Margexa va analyser votre situation en détail et vous recontactera sous 24h avec :
- Un diagnostic complet de votre exposition IA
- Des recommandations personnalisées de policies
- Une simulation des économies réalisables

<?php else: ?>
## Prochaines étapes

Un membre de l'équipe Margexa vous contactera sous 24h pour :
- Vous présenter la plateforme en détail
- Répondre à vos questions techniques
- Discuter de votre cas d'usage spécifique

<?php endif; ?>

<?php $__env->startComponent('mail::button', ['url' => config('app.url')]); ?>
Accéder à Margexa
<?php echo $__env->renderComponent(); ?>

En attendant, n'hésitez pas à nous répondre directement si vous avez des questions.

Cordialement,<br>
L'équipe Margexa

---
*Cet email a été envoyé automatiquement suite à votre demande sur Margexa.app*
<?php echo $__env->renderComponent(); ?>
<?php /**PATH C:\Users\Admin\Desktop\MarginPilot\resources\views/emails/lead-request-confirmation.blade.php ENDPATH**/ ?>