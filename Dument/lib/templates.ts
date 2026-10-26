import { euros, frenchDate } from "./dates";
import { computePenalties, fmtRate, FIXED_INDEMNITY, type PenaltyResult } from "./penalties";
import type { RateMode } from "./rates";
import { stage, type StageId } from "./sequence";

export interface LetterContext {
  senderName: string;
  senderCompany?: string;
  clientName: string;
  clientCompany?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  /** Date the message is written (ISO). */
  today: string;
  mode?: RateMode;
  contractRate?: number;
  paymentDetails?: string;
}

export interface Letter {
  stage: StageId;
  subject: string;
  body: string;
  penalties: PenaltyResult | null;
}

export const SIGNATURE_FOOTER = "Relance préparée avec Dûment, l'outil gratuit pour se faire payer à l'heure : dument.fr";

export function renderLetter(id: StageId, ctx: LetterContext): Letter {
  const inv = `la facture n° ${ctx.invoiceNumber} du ${frenchDate(ctx.invoiceDate)}`;
  // Until the amount is typed in, money figures stay as placeholders rather than "0,00 €".
  const money = (n: number) => (ctx.amount > 0 ? euros(n) : "[montant]");
  const amount = money(ctx.amount);
  const due = frenchDate(ctx.dueDate);
  const sign = [ctx.senderName, ctx.senderCompany].filter(Boolean).join("\n");
  const pay = ctx.paymentDetails ? `\n\nPour rappel, nos coordonnées de paiement :\n${ctx.paymentDetails}` : "";
  const hello = `Bonjour ${ctx.clientName},`;
  const showPenalties = id === "final" || id === "formal-notice";
  const penalties = showPenalties
    ? computePenalties({ amount: ctx.amount, dueDate: ctx.dueDate, until: ctx.today, mode: ctx.mode ?? "statutory", contractRate: ctx.contractRate })
    : null;

  let subject: string;
  let body: string;
  switch (id) {
    case "courtesy":
      subject = `Échéance de la facture ${ctx.invoiceNumber} le ${due}`;
      body = `${hello}

Petit rappel pratique : ${inv}, d'un montant de ${amount}, arrive à échéance le ${due}.

Si le règlement est déjà programmé, merci et ne tenez pas compte de ce message. Si quelque chose bloque de votre côté (bon de commande, validation interne, coordonnées bancaires), dites-le-moi et je vous aide à le débloquer.${pay}

Bonne journée,
${sign}`;
      break;
    case "first":
      subject = `Facture ${ctx.invoiceNumber} : règlement en attente`;
      body = `${hello}

Sauf erreur de ma part, je n'ai pas encore reçu le règlement de ${inv}, d'un montant de ${amount}, arrivée à échéance le ${due}.

Il s'agit peut-être d'un simple oubli. Pouvez-vous me confirmer la date à laquelle le paiement sera effectué ? Je joins la facture à ce message.${pay}

Merci d'avance,
${sign}`;
      break;
    case "second":
      subject = `Relance : facture ${ctx.invoiceNumber} échue depuis le ${due}`;
      body = `${hello}

Je reviens vers vous au sujet de ${inv}, d'un montant de ${amount}, échue depuis le ${due} et toujours impayée à ce jour.

Je vous remercie de procéder au règlement dans les 7 jours. Si un point vous empêche de payer, répondez simplement à ce message pour qu'on le règle ensemble.${pay}

Cordialement,
${sign}`;
      break;
    case "final": {
      const p = penalties!;
      subject = `Dernière relance avant mise en demeure : facture ${ctx.invoiceNumber}`;
      body = `${hello}

Malgré mes précédentes relances, ${inv}, d'un montant de ${amount}, reste impayée ${p.daysLate} jours après son échéance du ${due}.

Je vous rappelle qu'en application de l'article L441-10 du Code de commerce, tout retard de paiement entraîne de plein droit des pénalités de retard ainsi qu'une indemnité forfaitaire pour frais de recouvrement de ${euros(FIXED_INDEMNITY)}. À ce jour, elles s'élèvent à ${money(p.total)}.

Sans règlement sous 8 jours, je vous adresserai une mise en demeure, préalable à une procédure d'injonction de payer. Je préférerais sincèrement que nous n'en arrivions pas là.${pay}

Cordialement,
${sign}`;
      break;
    }
    case "formal-notice": {
      const p = penalties!;
      const rates = [...new Set(p.segments.map((s) => fmtRate(s.rate)))].join(" puis ");
      const recipient = [ctx.clientName, ctx.clientCompany].filter(Boolean).join(", ");
      subject = `Mise en demeure de payer : facture ${ctx.invoiceNumber}`;
      body = `${recipient}

Objet : mise en demeure de payer
Lettre recommandée avec accusé de réception

Madame, Monsieur,

Malgré nos relances, ${inv}, d'un montant de ${amount} TTC, échue le ${due}, demeure impayée.

Par la présente, je vous mets en demeure de me régler sous 8 jours à compter de la réception de ce courrier la somme de ${money(ctx.amount + p.total)}, se décomposant comme suit :
- principal : ${amount} ;
- pénalités de retard au taux de ${rates} sur ${p.daysLate} jours : ${money(p.interest)} ;
- indemnité forfaitaire pour frais de recouvrement (art. D441-5 du Code de commerce) : ${euros(p.indemnity)}.

Les pénalités continuent de courir jusqu'au complet paiement.

À défaut de règlement dans ce délai, je saisirai la juridiction compétente d'une requête en injonction de payer, sans autre avis.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${sign}`;
      break;
    }
  }
  return { stage: stage(id).id, subject, body, penalties };
}
