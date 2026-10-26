# Dûment : stratégie

## Le pari

Le produit trouve ses clients par son usage normal, sans publicité ni prospection.

1. **Boucle virale.** Chaque relance envoyée arrive chez une autre entreprise, qui a elle-même des clients qui paient en retard. Une ligne discrète en bas des relances (désactivable) présente l'outil. La mise en demeure n'en porte jamais.
2. **Recherche.** Les gens cherchent déjà « modèle lettre de relance facture impayée », « mise en demeure facture », « calcul pénalités de retard ». Chaque outil gratuit répond à une de ces recherches et mène à l'inscription.
3. **Parrainage.** Après l'inscription, chaque personne reçoit un lien. Les inscriptions venues de ce lien la font avancer dans la file d'accès (le champ `ref` est enregistré pour ça).

## Garde-fous

- **Logiciel, pas agence de recouvrement.** Les relances partent au nom et depuis l'adresse de l'utilisateur, l'argent va directement sur son compte. Pas de commission sur les sommes recouvrées : le recouvrement amiable pour compte d'autrui est une activité réglementée.
- **Validation humaine.** La mise en demeure n'est jamais envoyée sans l'accord explicite de l'utilisateur, et n'est jamais le premier message reçu par un client.
- **B2B uniquement** pour les pénalités de l'article L441-10. Les clients particuliers relèvent d'un autre régime.
- **Pas de contenu creux.** Chaque page modèle a son propre contenu (moment, ton, erreurs, FAQ), pas un simple texte à trous.

## Phase 1 (livrée) : valider la demande

Outils gratuits, 5 pages modèles, accès anticipé avec parrainage, sitemap et données structurées.

**Critère pour passer à la phase 2** : au moins 100 inscrits, dont une majorité déclarant 3 factures en retard ou plus par mois. Sinon, on revoit le positionnement avant de coder l'envoi.

## Phase 2 : l'envoi automatique

- Comptes et import des factures (CSV, puis connexion aux outils de facturation).
- Envoi depuis la boîte de l'utilisateur via OAuth Gmail et Outlook, pour la délivrabilité et pour que les réponses arrivent dans le bon fil.
- Planificateur quotidien basé sur `nextAction()` (`lib/sequence.ts`), avec une file de validation pour les mises en demeure.
- Arrêt automatique dès que la facture est payée, pause possible par client.
- Mise en demeure en recommandé électronique (service partenaire), préparation du dossier d'injonction de payer.

## Prix envisagés (à valider avec les inscrits)

- Gratuit : outils, et suivi automatique de quelques factures avec la ligne Dûment en bas des relances.
- Pro, autour de 12 €/mois : factures illimitées, ligne retirable.
- À l'acte : recommandé électronique, dossier d'injonction de payer.

## À faire avant la mise en ligne

- Vérifier le nom et le domaine (`dument.fr` est une hypothèse), déposer la marque si le nom est retenu.
- Mentions légales, politique de confidentialité, hébergeur.
- Renseigner `WAITLIST_WEBHOOK_URL` et `NEXT_PUBLIC_SITE_URL`.
- Déclarer le site dans Google Search Console et soumettre le sitemap.
- Mettre à jour `lib/rates.ts` au 1er janvier 2027.
