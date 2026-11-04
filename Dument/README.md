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
```

## Publier (site statique)

Le site est exporté en fichiers statiques (`out/`), servis par GitHub Pages sur https://hmzr944.github.io/Curbly/.

```bash
NEXT_PUBLIC_BASE_PATH=/Curbly NEXT_PUBLIC_SITE_URL=https://hmzr944.github.io/Curbly npm run build
```

Puis copier le contenu de `out/` à la racine de la branche `gh-pages`, avec un fichier `.nojekyll` (sans lui, GitHub ignore le dossier `_next`). Réglage GitHub : Settings > Pages > Source « Deploy from a branch », branche `gh-pages`, dossier `/ (root)`.

Variables : voir `.env.example`. Sans `NEXT_PUBLIC_WAITLIST_URL`, le formulaire d'accès anticipé est remplacé par des liens vers les outils gratuits.
