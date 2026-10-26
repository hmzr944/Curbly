import { describe, expect, it } from "vitest";
import { nextAction } from "../lib/sequence";
import { renderLetter } from "../lib/templates";

describe("nextAction", () => {
  const due = "2026-09-30";

  it("waits until the courtesy reminder date", () => {
    expect(nextAction({ dueDate: due, paid: false, sent: [] }, "2026-09-20")).toMatchObject({ kind: "wait", on: "2026-09-27" });
  });

  it("sends the most advanced due stage only", () => {
    const a = nextAction({ dueDate: due, paid: false, sent: ["courtesy"] }, "2026-10-12");
    expect(a).toMatchObject({ kind: "send", stage: { id: "second" } });
  });

  it("never opens with a formal notice", () => {
    const a = nextAction({ dueDate: due, paid: false, sent: [] }, "2026-11-15");
    expect(a).toMatchObject({ kind: "send", stage: { id: "final" } });
  });

  it("asks for approval before a formal notice", () => {
    const a = nextAction({ dueDate: due, paid: false, sent: ["first", "final"] }, "2026-11-15");
    expect(a).toMatchObject({ kind: "approve", stage: { id: "formal-notice" } });
  });

  it("stops once paid or done", () => {
    expect(nextAction({ dueDate: due, paid: true, sent: [] }, "2026-11-15")).toEqual({ kind: "none", reason: "paid" });
    expect(nextAction({ dueDate: due, paid: false, sent: ["formal-notice"] }, "2026-12-15")).toEqual({ kind: "none", reason: "done" });
  });
});

describe("renderLetter", () => {
  const ctx = {
    senderName: "Camille Martin",
    clientName: "Jean Dupont",
    clientCompany: "Atelier Nord",
    invoiceNumber: "F-2026-041",
    invoiceDate: "2026-08-31",
    dueDate: "2026-09-30",
    amount: 2400,
    today: "2026-10-30",
  };

  it("itemises principal, interest and indemnity in a formal notice", () => {
    const l = renderLetter("formal-notice", ctx);
    // 2 400 × 12.40 % × 30/365 = 24.46 € ; + 40 € ; total claimed 2 464.46 €
    expect(l.penalties?.interest).toBe(24.46);
    expect(l.body).toMatch(/2\s464,46/);
    expect(l.body).toContain("F-2026-041");
  });

  it("keeps early reminders free of legal threats", () => {
    expect(renderLetter("first", ctx).body).not.toMatch(/pénalités|mise en demeure/);
  });
});

describe("renderLetter without an amount", () => {
  it("shows placeholders instead of zero", () => {
    const l = renderLetter("formal-notice", {
      senderName: "A",
      clientName: "B",
      invoiceNumber: "1",
      invoiceDate: "2026-08-31",
      dueDate: "2026-09-30",
      amount: 0,
      today: "2026-10-30",
    });
    expect(l.body).not.toMatch(/(?<!\d)0,00/);
    expect(l.body).toContain("[montant]");
  });
});
