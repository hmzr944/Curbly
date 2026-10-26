import { appendFile, mkdir } from "node:fs/promises";
import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VOLUMES = ["0", "1-2", "3-10", "10+"];

function code() {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  // Honeypot: real visitors never fill the hidden "website" field.
  if (body.website) return NextResponse.json({ code: code() });

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Cette adresse email ne semble pas valide." }, { status: 400 });
  }
  const entry = {
    email,
    volume: VOLUMES.includes(body.volume) ? body.volume : null,
    ref: typeof body.ref === "string" ? body.ref.slice(0, 12) : null,
    code: code(),
    at: new Date().toISOString(),
  };

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  try {
    if (webhook) {
      const res = await fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(entry) });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else {
      await mkdir("data", { recursive: true });
      await appendFile("data/waitlist.jsonl", JSON.stringify(entry) + "\n");
    }
  } catch (err) {
    console.error("waitlist", err);
    return NextResponse.json({ error: "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant." }, { status: 502 });
  }
  return NextResponse.json({ code: entry.code });
}
