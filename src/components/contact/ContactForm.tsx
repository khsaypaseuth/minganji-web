"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TOPICS, validateContact, type ContactErrors, type ContactInput, type Topic } from "@/lib/contact-schema";
import { site } from "@/lib/site";
import { Icon } from "@/components/icons/Icon";
import { buttonClass } from "@/components/ui/Button";

type Status = "idle" | "sending" | "success" | "unavailable" | "error" | "rate_limited";

const field =
  "mt-2 block w-full rounded-xl bg-white px-4 py-3 text-[15px] text-ink ring-1 ring-inset ring-line-strong placeholder:text-steel transition-shadow focus:outline-none focus:ring-2 focus:ring-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-signal";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const params = useSearchParams();
  const initialTopic = (TOPICS as readonly string[]).includes(params.get("topic") ?? "") ? (params.get("topic") as Topic) : "demo";
  const [v, setV] = useState<ContactInput>({ name: "", email: "", company: "", phone: "", country: "", topic: initialTopic, message: "", consent: false, website: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Follow ?topic= changes (e.g. clicking "Request a demo" while already on this page).
  const [prevTopic, setPrevTopic] = useState(initialTopic);
  if (prevTopic !== initialTopic) {
    setPrevTopic(initialTopic);
    setV((x) => ({ ...x, topic: initialTopic }));
  }

  const set = <K extends keyof ContactInput>(k: K, val: ContactInput[K]) => {
    setV((x) => ({ ...x, [k]: val }));
    if (errors[k as keyof ContactErrors]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const mailBody = `${v.message}\n\n— ${v.name}\n${v.email}${v.company ? `\n${v.company}` : ""}${v.phone ? `\n${v.phone}` : ""}${v.country ? `\n${v.country}` : ""}`;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`MingAnji.ai — ${t(`topics.${v.topic}`)}`)}&body=${encodeURIComponent(mailBody)}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateContact(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v), signal: AbortSignal.timeout(15_000) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setStatus("success");
      else if (data.error === "not_configured") setStatus("unavailable");
      else if (res.status === 429) setStatus("rate_limited");
      else if (res.status === 422 && data.fields) { setErrors(data.fields); setStatus("idle"); }
      else setStatus("error");
    } catch {
      setStatus("error");
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  const errorList = Object.entries(errors).filter(([, val]) => val) as [keyof ContactErrors, string][];
  const describe = (k: keyof ContactErrors) => (errors[k] ? `${k}-error` : undefined);

  if (status === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-[22px] bg-white p-8 ring-1 ring-line outline-none">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ok/10 text-ok"><Icon name="check" size={24} /></span>
        <h2 className="font-display mt-5 text-[24px] font-semibold text-ink">{t("success.title")}</h2>
        <p className="mt-2 text-slate">{t("success.body")}</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-[22px] bg-white p-6 ring-1 ring-line sm:p-8" aria-labelledby="form-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="form-title" className="font-display text-[22px] font-semibold text-ink">{t("title")}</h2>
        <p className="text-[12.5px] text-steel"><span className="text-signal" aria-hidden="true">*</span> {t("required")}</p>
      </div>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mt-6 rounded-xl bg-signal-soft p-4 text-[14px] text-signal-deep outline-none ring-1 ring-signal/30">
          <p className="font-semibold">{t("errors.summary")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorList.map(([k, key]) => (
              <li key={k}><a href={`#f-${k}`} className="underline underline-offset-2">{t(`errors.${key}`)}</a></li>
            ))}
          </ul>
        </div>
      )}

      {(status === "unavailable" || status === "error" || status === "rate_limited") && (
        <div ref={resultRef} tabIndex={-1} role="alert" className="mt-6 rounded-xl bg-mist p-5 text-[14.5px] outline-none ring-1 ring-line-strong">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Icon name="alert" size={18} className="text-signal" />
            {status === "unavailable" ? t("unavailable.title") : t("error.title")}
          </p>
          <p className="mt-1.5 text-slate">
            {status === "unavailable" ? t("unavailable.body") : status === "rate_limited" ? t("error.rateLimited") : t("error.body")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={mailto} className={buttonClass("dark", "sm")}><Icon name="mail" size={15} />{t("unavailable.cta")}</a>
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              onClick={async () => { try { await navigator.clipboard.writeText(`${site.email}\n\n${mailBody}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } }}
            >
              <Icon name={copied ? "check" : "copy"} size={15} />
              <span aria-live="polite">{copied ? t("unavailable.copied") : t("unavailable.copy")}</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-name" className="text-[14px] font-medium text-ink">{t("name")} <span className="text-signal" aria-hidden="true">*</span></label>
          <input id="f-name" name="name" autoComplete="name" required value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={describe("name")} className={field} />
          {errors.name && <p id="name-error" className="mt-1.5 text-[13px] text-signal-deep">{t(`errors.${errors.name}`)}</p>}
        </div>
        <div>
          <label htmlFor="f-email" className="text-[14px] font-medium text-ink">{t("email")} <span className="text-signal" aria-hidden="true">*</span></label>
          <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" required value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={describe("email")} className={field} />
          {errors.email && <p id="email-error" className="mt-1.5 text-[13px] text-signal-deep">{t(`errors.${errors.email}`)}</p>}
        </div>
        <div>
          <label htmlFor="f-company" className="text-[14px] font-medium text-ink">{t("company")} <span className="font-normal text-steel">({t("optional")})</span></label>
          <input id="f-company" name="company" autoComplete="organization" value={v.company} onChange={(e) => set("company", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="f-phone" className="text-[14px] font-medium text-ink">{t("phone")} <span className="font-normal text-steel">({t("optional")})</span></label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-country" className="text-[14px] font-medium text-ink">{t("country")} <span className="font-normal text-steel">({t("optional")})</span></label>
          <input id="f-country" name="country" autoComplete="country-name" value={v.country} onChange={(e) => set("country", e.target.value)} className={field} />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-[14px] font-medium text-ink">{t("topic")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {TOPICS.map((tp) => (
            <label key={tp} className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] text-graphite ring-1 ring-inset ring-line-strong has-[:checked]:bg-signal-soft has-[:checked]:text-ink has-[:checked]:ring-2 has-[:checked]:ring-signal has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal">
              <input type="radio" name="topic" value={tp} checked={v.topic === tp} onChange={() => set("topic", tp)} className="h-5 w-5 shrink-0 accent-[#d7261e]" />
              {t(`topics.${tp}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="f-message" className="text-[14px] font-medium text-ink">{t("message")} <span className="text-signal" aria-hidden="true">*</span></label>
        <textarea id="f-message" name="message" rows={5} required maxLength={2100} placeholder={t("messagePlaceholder")} value={v.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} aria-describedby={describe("message")} className={`${field} resize-y`} />
        <div className="mt-1.5 flex justify-between gap-4 text-[13px]">
          <span id="message-error" className="text-signal-deep">{errors.message ? t(`errors.${errors.message}`) : ""}</span>
          <span className={`font-mono ${v.message.length > 2000 ? "text-signal" : "text-steel"}`}>{v.message.length}/2000</span>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} /></label>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 text-[14px] text-graphite">
          <input id="f-consent" type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={describe("consent")} className="mt-0.5 h-5 w-5 shrink-0 accent-[#d7261e]" />
          <span>{t("consent")} <span className="text-signal" aria-hidden="true">*</span></span>
        </label>
        {errors.consent && <p id="consent-error" className="mt-1.5 pl-7 text-[13px] text-signal-deep">{t(`errors.${errors.consent}`)}</p>}
      </div>

      <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-8 w-full sm:w-auto")}>
        {status === "sending" ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />{t("sending")}</>) : (<>{t("submit")}<Icon name="send" size={16} /></>)}
      </button>
    </form>
  );
}
