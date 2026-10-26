# Dûment

Relance automatique des factures impayées pour freelances, artisans, agences et TPE.

Cette première version contient les outils gratuits qui attirent les visiteurs et la liste d'accès anticipé. L'envoi automatique est la phase 2 (voir `STRATEGY.md`).

| Page | Rôle |
|---|---|
| `/` | Page d'accueil, calculateur rapide, inscription à l'accès anticipé avec lien de parrainage |
| `/outils/calcul-penalites-de-retard` | Calculateur complet des pénalités (taux par semestre, plancher contractuel, acheteurs publics) |
| `/outils/lettre-de-relance` | Générateur de relance et de mise en demeure (copie, messagerie, impression PDF) |
| `/modeles` et `/modeles/[slug]` | 5 modèles, un par étape de la séquence |

## Code

- `lib/penalties.ts` : calcul des pénalités (art. L441-10 et D441-5 du Code de commerce)
- `lib/rates.ts` : taux BCE et taux d'intérêt légal, **à mettre à jour chaque semestre** (1er janvier, 1er juillet)
- `lib/sequence.ts` : séquence J-3 / J+1 / J+8 / J+15 / J+30 et action du jour pour une facture
- `lib/templates.ts` : textes des relances et de la mise en demeure
- `lib/models.ts` : contenu des pages modèles

## Lancer

```bash
npm install
npm test          # tests unitaires du moteur
npm run dev       # http://localhost:3000
npm run build
```

Variables : voir `.env.example`. Sans `WAITLIST_WEBHOOK_URL`, les inscriptions sont écrites dans `data/waitlist.jsonl`. Ce fichier ne sert qu'en développement : sur un hébergeur serverless, configurez le webhook.
