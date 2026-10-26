import type { StageId } from "./sequence";

export interface Model {
  slug: string;
  stage: StageId;
  title: string;
  h1: string;
  description: string;
  when: string;
  intro: string;
  advice: string[];
  mistakes: string[];
  faq: { q: string; a: string }[];
}

export const MODELS: Model[] = [
  {
    slug: "relance-avant-echeance",
    stage: "courtesy",
    title: "Rappel d'échéance de facture : modèle d'email",
    h1: "Rappel avant l'échéance d'une facture",
    description:
      "Modèle gratuit de rappel courtois à envoyer quelques jours avant l'échéance d'une facture, pour éviter le retard plutôt que le courir après.",
    when: "3 jours avant l'échéance",
    intro:
      "Le meilleur impayé est celui qui n'arrive pas. Un rappel envoyé avant l'échéance fait remonter votre facture dans la pile et révèle les blocages (bon de commande manquant, mauvais destinataire, validation interne) pendant qu'il reste du temps pour les lever.",
    advice: [
      "Restez factuel et serviable : rien ne laisse penser que vous doutez du paiement.",
      "Proposez de débloquer un éventuel problème administratif : c'est la cause la plus fréquente des retards dans les grandes entreprises.",
      "Envoyez-le à la personne qui valide les paiements, pas seulement à votre contact opérationnel.",
    ],
    mistakes: [
      "Parler de pénalités à ce stade : la facture n'est pas encore en retard.",
      "Joindre une nouvelle version de la facture avec un numéro différent, ce qui crée des doublons en comptabilité.",
    ],
    faq: [
      {
        q: "Un rappel avant échéance n'est-il pas mal perçu ?",
        a: "Pas s'il est formulé comme un service. La plupart des services comptables apprécient d'être prévenus d'un blocage avant la date plutôt qu'après.",
      },
    ],
  },
  {
    slug: "premiere-relance-facture-impayee",
    stage: "first",
    title: "Première relance de facture impayée : modèle d'email gratuit",
    h1: "Première relance d'une facture impayée",
    description:
      "Modèle d'email de première relance pour facture impayée, ton cordial, à personnaliser en ligne et à envoyer depuis votre messagerie.",
    when: "Le lendemain de l'échéance",
    intro:
      "La première relance part du principe que le retard est un oubli, ce qui est vrai la plupart du temps. Le but est d'obtenir une date de paiement, pas de mettre la pression. Plus elle part tôt, plus elle est efficace : une relance envoyée le lendemain de l'échéance n'a rien d'agressif.",
    advice: [
      "Rappelez le numéro, la date et le montant de la facture, et joignez-la à nouveau.",
      "Posez une question simple qui appelle une réponse : « Pouvez-vous me confirmer la date du paiement ? »",
      "Rappelez vos coordonnées bancaires : une partie des retards vient d'un IBAN introuvable.",
    ],
    mistakes: [
      "Attendre plusieurs semaines par peur de froisser le client : chaque semaine perdue rend le paiement moins probable.",
      "S'excuser de relancer. Vous demandez le paiement d'un travail livré.",
    ],
    faq: [
      {
        q: "Combien de temps attendre avant de relancer une facture ?",
        a: "Vous pouvez relancer dès le lendemain de la date d'échéance. Les pénalités de retard courent automatiquement à partir de ce jour, sans qu'un rappel soit nécessaire.",
      },
      {
        q: "Faut-il relancer par email ou par téléphone ?",
        a: "Commencez par un email, qui laisse une trace écrite. Un appel est utile en complément à partir de la deuxième relance.",
      },
    ],
  },
  {
    slug: "deuxieme-relance-facture",
    stage: "second",
    title: "Deuxième relance de facture : modèle d'email",
    h1: "Deuxième relance d'une facture impayée",
    description:
      "Modèle de deuxième relance de facture impayée, plus directe, avec un délai de paiement clair. Gratuit et personnalisable en ligne.",
    when: "Une semaine après l'échéance",
    intro:
      "Si la première relance est restée sans réponse, la deuxième fixe un délai. Le ton reste professionnel mais ne laisse plus de place à l'interprétation : la facture est échue, vous attendez le paiement sous une date précise.",
    advice: [
      "Donnez un délai court et daté (7 jours) plutôt qu'un « rapidement » qui n'engage personne.",
      "Ouvrez la porte au dialogue : un litige non exprimé est souvent la vraie raison du silence.",
      "Doublez l'email d'un appel au service comptable si vous en avez le contact.",
    ],
    mistakes: [
      "Menacer d'une procédure que vous n'avez pas l'intention d'engager : gardez cet argument pour la dernière relance.",
      "Changer d'interlocuteur à chaque message : restez dans le même fil pour garder l'historique.",
    ],
    faq: [
      {
        q: "Que faire si le client conteste la facture ?",
        a: "Demandez-lui de préciser par écrit ce qui est contesté. La partie non contestée reste due et peut être réclamée séparément.",
      },
    ],
  },
  {
    slug: "derniere-relance-avant-mise-en-demeure",
    stage: "final",
    title: "Dernière relance avant mise en demeure : modèle avec pénalités",
    h1: "Dernière relance avant mise en demeure",
    description:
      "Modèle de dernière relance avant mise en demeure, avec le calcul automatique des pénalités de retard et de l'indemnité forfaitaire de 40 €.",
    when: "Deux semaines après l'échéance",
    intro:
      "La dernière relance annonce la suite : sans paiement, une mise en demeure partira. C'est le bon moment pour chiffrer ce que le retard coûte déjà à votre client : les pénalités prévues par l'article L441-10 du Code de commerce et l'indemnité forfaitaire de 40 € par facture.",
    advice: [
      "Chiffrez les pénalités au jour près : un montant précis pèse plus qu'une mention générale.",
      "Annoncez une étape concrète (mise en demeure, puis injonction de payer) et un délai.",
      "Vous pouvez renoncer aux pénalités en échange d'un paiement immédiat : c'est un levier de négociation.",
    ],
    mistakes: [
      "Réclamer des pénalités à un particulier comme à un professionnel : le régime de l'article L441-10 ne vaut qu'entre professionnels.",
      "Oublier l'indemnité forfaitaire de 40 € : elle est due de plein droit, sans justificatif de frais.",
    ],
    faq: [
      {
        q: "Les pénalités de retard sont-elles dues même si elles ne figurent pas sur la facture ?",
        a: "Entre professionnels, oui : elles sont dues de plein droit dès le lendemain de l'échéance. Leur mention sur la facture est obligatoire, mais son absence ne prive pas le créancier de son droit.",
      },
      {
        q: "Quel taux appliquer si mes conditions générales n'en prévoient pas ?",
        a: "Le taux de la dernière opération de refinancement de la BCE, majoré de 10 points, en vigueur au 1er janvier ou au 1er juillet selon le semestre. Notre calculateur l'applique automatiquement.",
      },
    ],
  },
  {
    slug: "mise-en-demeure-facture-impayee",
    stage: "formal-notice",
    title: "Mise en demeure de payer une facture : modèle de lettre gratuit",
    h1: "Mise en demeure de payer une facture",
    description:
      "Modèle gratuit de lettre de mise en demeure pour facture impayée, avec le détail du principal, des pénalités et de l'indemnité de recouvrement. À imprimer ou enregistrer en PDF.",
    when: "Un mois après l'échéance",
    intro:
      "La mise en demeure est la dernière démarche amiable et la première pièce d'une procédure. Elle doit être claire, chiffrée et envoyée de manière à prouver sa réception. Si elle reste sans effet, vous pourrez déposer une requête en injonction de payer.",
    advice: [
      "Envoyez-la en lettre recommandée avec accusé de réception, papier ou électronique.",
      "Détaillez le principal, les pénalités et l'indemnité forfaitaire, avec le taux appliqué.",
      "Fixez un délai précis (8 jours est l'usage) et annoncez la suite : la requête en injonction de payer.",
    ],
    mistakes: [
      "Envoyer la mise en demeure par simple email : la preuve de réception sera contestable.",
      "Y joindre des propos sur la relation commerciale ou des reproches : restez sur les faits et les montants.",
    ],
    faq: [
      {
        q: "Une mise en demeure est-elle obligatoire avant une injonction de payer ?",
        a: "Elle n'est pas toujours exigée, mais elle est vivement recommandée : elle prouve votre bonne foi, fixe le point de départ de certains intérêts et suffit souvent à obtenir le paiement.",
      },
      {
        q: "Combien coûte une injonction de payer ?",
        a: "La requête se dépose en ligne ou au greffe du tribunal compétent. Les frais de greffe sont modestes, auxquels s'ajoute la signification de l'ordonnance par un commissaire de justice.",
      },
    ],
  },
];

export function modelBySlug(slug: string) {
  return MODELS.find((m) => m.slug === slug);
}
