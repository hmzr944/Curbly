import { addDays, daysBetween } from "./dates";

export type StageId = "courtesy" | "first" | "second" | "final" | "formal-notice";

export interface Stage {
  id: StageId;
  /** Offset in days from the due date (negative = before). */
  offset: number;
  label: string;
  tone: string;
  /** Formal notices always wait for the user's explicit approval before being sent. */
  requiresApproval: boolean;
}

export const STAGES: Stage[] = [
  { id: "courtesy", offset: -3, label: "Rappel avant échéance", tone: "Courtois", requiresApproval: false },
  { id: "first", offset: 1, label: "Première relance", tone: "Cordial", requiresApproval: false },
  { id: "second", offset: 8, label: "Deuxième relance", tone: "Direct", requiresApproval: false },
  { id: "final", offset: 15, label: "Dernière relance", tone: "Ferme", requiresApproval: false },
  { id: "formal-notice", offset: 30, label: "Mise en demeure", tone: "Formel", requiresApproval: true },
];

export function stage(id: StageId): Stage {
  return STAGES.find((s) => s.id === id)!;
}

export interface Invoice {
  dueDate: string;
  paid: boolean;
  /** Stages already sent for this invoice. */
  sent: StageId[];
}

export type NextAction =
  | { kind: "none"; reason: "paid" | "done" }
  | { kind: "wait"; stage: Stage; on: string }
  | { kind: "send"; stage: Stage; overdueDays: number }
  | { kind: "approve"; stage: Stage; overdueDays: number };

export function schedule(dueDate: string) {
  return STAGES.map((s) => ({ stage: s, on: addDays(dueDate, s.offset) }));
}

/**
 * What to do with an invoice today. Only the most advanced stage that is due is returned, so an invoice
 * imported late never receives a burst of reminders: it starts at the stage matching its delay.
 */
export function nextAction(invoice: Invoice, today: string): NextAction {
  if (invoice.paid) return { kind: "none", reason: "paid" };
  const overdueDays = daysBetween(invoice.dueDate, today);
  const lastSent = Math.max(-1, ...invoice.sent.map((id) => STAGES.findIndex((s) => s.id === id)));
  const pending = STAGES.slice(lastSent + 1);
  if (pending.length === 0) return { kind: "none", reason: "done" };

  const due = pending.filter((s) => s.offset <= overdueDays);
  if (due.length === 0) return { kind: "wait", stage: pending[0], on: addDays(invoice.dueDate, pending[0].offset) };

  let current = due[due.length - 1];
  // A formal notice is never the first message a client receives: send the final reminder first.
  if (current.requiresApproval && invoice.sent.length === 0 && due.length > 1) current = due[due.length - 2];
  return current.requiresApproval ? { kind: "approve", stage: current, overdueDays } : { kind: "send", stage: current, overdueDays };
}
