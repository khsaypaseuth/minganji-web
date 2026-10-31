import { NextResponse } from "next/server";
import { TOPICS, validateContact, type ContactInput } from "@/lib/contact-schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Enquiry delivery.
 *
 * Configure ONE of:
 *   CONTACT_WEBHOOK_URL  — receives a JSON POST (Formspree, Make, Zapier,
 *                          n8n, a CRM endpoint, or your own service).
 *   CONTACT_WEBHOOK_TOKEN (optional) — sent as "Authorization: Bearer …".
 *
 * Without configuration the route responds { ok: false, error: "not_configured" }
 * and the form tells the visitor plainly that nothing was sent.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  let body: Partial<ContactInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const input: ContactInput = {
    name: str(body.name, 120), email: str(body.email, 200), company: str(body.company, 160), phone: str(body.phone, 60),
    country: str(body.country, 80), topic: TOPICS.includes(body.topic as never) ? (body.topic as ContactInput["topic"]) : "other",
    message: str(body.message, 2100), consent: body.consent === true, website: str(body.website, 200),
  };
  // Honeypot: pretend success is NOT acceptable (no false success) — just reject quietly.
  if (input.website) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const errors = validateContact(input);
  if (Object.keys(errors).length) return NextResponse.json({ error: "invalid", fields: errors }, { status: 422 });

  const url = process.env.CONTACT_WEBHOOK_URL;
  // 200 + ok:false (not 5xx): an unconfigured provider is an expected state, not a server fault.
  if (!url) return NextResponse.json({ ok: false, error: "not_configured" });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CONTACT_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify({ ...input, website: undefined, source: "minganji-web", receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
