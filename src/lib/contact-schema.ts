// Shared validation for the enquiry form (client + server).
export const TOPICS = ["demo", "pricing", "trucks", "other"] as const;
export type Topic = (typeof TOPICS)[number];

export type ContactInput = {
  name: string; email: string; company: string; phone: string; country: string;
  topic: Topic; message: string; consent: boolean; website?: string; // website = honeypot
};

export type ContactErrors = Partial<Record<"name" | "email" | "message" | "consent", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns translation keys (contact.form.errors.*) for invalid fields. */
export function validateContact(v: ContactInput): ContactErrors {
  const e: ContactErrors = {};
  if (!v.name.trim()) e.name = "nameRequired";
  if (!v.email.trim()) e.email = "emailRequired";
  else if (!EMAIL.test(v.email.trim()) || v.email.length > 200) e.email = "emailInvalid";
  const m = v.message.trim();
  if (!m) e.message = "messageRequired";
  else if (m.length < 10) e.message = "messageShort";
  else if (m.length > 2000) e.message = "messageLong";
  if (!v.consent) e.consent = "consentRequired";
  return e;
}
