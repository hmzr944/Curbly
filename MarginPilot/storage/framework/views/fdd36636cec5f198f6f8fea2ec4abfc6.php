<?php $__env->startComponent('mail::message'); ?>
# Nouvelle demande <?php echo new \Illuminate\Support\EncodedHtmlString($requestType === 'audit' ? 'd\'Audit' : 'de Démo'); ?>


## Lead Information

| Champ | Valeur |
|-------|--------|
| **Entreprise** | <?php echo new \Illuminate\Support\EncodedHtmlString($companyName); ?> |
| **Contact** | <?php echo new \Illuminate\Support\EncodedHtmlString($contactName ?? 'Non renseigné'); ?> |
| **Email** | <?php echo new \Illuminate\Support\EncodedHtmlString($contactEmail); ?> |

## Diagnostic

| Métrique | Valeur |
|----------|--------|
| **Niveau de risque** | <?php echo new \Illuminate\Support\EncodedHtmlString(ucfirst($riskLevel)); ?> |
| **Score de risque** | <?php echo new \Illuminate\Support\EncodedHtmlString($riskScore); ?>/100 |
| **Économies potentielles** | <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($potentialSavings, 0, ',', ' ')); ?> €/mois |
| **Dépense actuelle** | <?php echo new \Illuminate\Support\EncodedHtmlString($currentSpend ? number_format($currentSpend, 0, ',', ' ').' €/mois' : 'Non renseigné'); ?> |

## Contexte technique

| Champ | Valeur |
|-------|--------|
| **Provider** | <?php echo new \Illuminate\Support\EncodedHtmlString($provider); ?> |
| **Modèle principal** | <?php echo new \Illuminate\Support\EncodedHtmlString($model); ?> |
| **Volume mensuel** | <?php echo new \Illuminate\Support\EncodedHtmlString($volume); ?> |
| **Use case** | <?php echo new \Illuminate\Support\EncodedHtmlString($useCase); ?> |

---

**Action requise** : Contacter le lead sous 24h.

<?php $__env->startComponent('mail::button', ['url' => config('app.url').'/api/admin/diagnostics']); ?>
Voir tous les diagnostics
<?php echo $__env->renderComponent(); ?>

<?php echo $__env->renderComponent(); ?>
<?php /**PATH C:\Users\Admin\Desktop\MarginPilot\resources\views/emails/internal-lead-notification.blade.php ENDPATH**/ ?>