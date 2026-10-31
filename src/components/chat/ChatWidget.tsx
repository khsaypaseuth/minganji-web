"use client";

import { Fragment, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BotAvatar } from "./BotAvatar";
import { Icon } from "@/components/icons/Icon";

type Msg = { role: "user" | "assistant"; content: string; source?: "ai" | "faq" | "notice" };
type Mode = "unknown" | "ai" | "faq";
type ErrKey = "generic" | "timeout" | "rateLimited" | "network";

const SUGGESTIONS = ["what", "drilling", "managers", "staff", "demo"] as const;
type Suggestion = (typeof SUGGESTIONS)[number];
const MAX = 800;

/** Minimal, safe renderer: **bold**, [text](/internal or allowed https), "- " bullets, paragraphs. */
function RichText({ text }: { text: string }) {
  const inline = (s: string, kp: string): ReactNode[] => {
    const out: ReactNode[] = [];
    const re = /\[([^\]]{1,80})\]\(([^)\s]{1,200})\)|\*\*([^*]{1,200})\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[1]) {
        const href = m[2];
        const internal = /^\/(en|zh|lo|th|vi)(\/[a-z/-]*)?(\?topic=[a-z]+)?$/.test(href);
        const external = /^https:\/\/(demo\.)?minganji\.ai(\/[\w/-]*)?$/.test(href);
        if (internal) out.push(<NextLink key={`${kp}-${i++}`} href={href} className="font-semibold text-signal underline underline-offset-2">{m[1]}</NextLink>);
        else if (external) out.push(<a key={`${kp}-${i++}`} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-signal underline underline-offset-2">{m[1]}</a>);
        else out.push(m[1]);
      } else if (m[3]) out.push(<strong key={`${kp}-${i++}`} className="font-semibold text-ink">{m[3]}</strong>);
      last = re.lastIndex;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  };
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={bi} className="my-1.5 list-disc space-y-1 pl-5">
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-•*]\s+/, ""), `${bi}-${li}`)}</li>)}
            </ul>
          );
        }
        return (
          <p key={bi} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((l, li) => <Fragment key={li}>{li > 0 && <br />}{inline(l, `${bi}-${li}`)}</Fragment>)}
          </p>
        );
      })}
    </>
  );
}

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("unknown");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ key: ErrKey; retry?: Msg[] } | null>(null);
  const [fieldFocus, setFieldFocus] = useState(false);
  const [closing, setClosing] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const pathname = usePathname();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Close with a short exit animation (skipped with reduced motion).
  const close = useCallback((refocus = true) => {
    const finish = () => { setOpen(false); setClosing(false); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else { setClosing(true); window.setTimeout(finish, 200); }
    if (refocus) launcherRef.current?.focus();
  }, []);

  // Step aside while the visitor types in a page form field (never cover inputs).
  useEffect(() => {
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches("input, textarea, select") && !el.closest("#mj-chat");
    const onIn = (e: FocusEvent) => setFieldFocus(isField(e.target));
    const onOut = () => setFieldFocus(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); };
  }, []);

  // On phones and tablets, step aside while a page form is on screen so the
  // launcher never covers its fields.
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll("main form"));
    const seen = new Set<Element>();
    if (!forms.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        setFormInView(seen.size > 0);
      },
      { rootMargin: "0px 0px -72px 0px" },
    );
    forms.forEach((f) => io.observe(f));
    return () => {
      io.disconnect();
      setFormInView(false);
    };
  }, [pathname]);

  // Check (once, when first opened) whether an AI provider is configured.
  useEffect(() => {
    if (!open || mode !== "unknown") return;
    fetch("/api/chat", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMode(d.configured ? "ai" : "faq"))
      .catch(() => setMode("faq"));
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [messages, loading, error]);

  const conversation = (msgs: Msg[]) => msgs.filter((m) => m.source !== "notice" && m.source !== "faq").map(({ role, content }) => ({ role, content }));

  const ask = useCallback(
    async (history: Msg[]) => {
      setLoading(true);
      setError(null);
      try {
        // Only alternate user/assistant AI turns are sent; FAQ and notices stay local.
        const payload = conversation(history).slice(-11);
        while (payload.length && payload[0].role !== "user") payload.shift();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload, locale }),
          signal: AbortSignal.timeout(35_000),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.reply) {
          setMessages((m) => [...m, { role: "assistant", content: data.reply, source: "ai" }]);
        } else if (data.error === "not_configured") {
          setMode("faq");
          setMessages((m) => [...m, { role: "assistant", content: t("faqMode.notice"), source: "notice" }]);
        } else if (res.status === 429) setError({ key: "rateLimited" });
        else if (res.status === 504 || data.error === "timeout") setError({ key: "timeout", retry: history });
        else setError({ key: "generic", retry: history });
      } catch (e) {
        const timeout = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
        setError({ key: !navigator.onLine ? "network" : timeout ? "timeout" : "generic", retry: history });
      } finally {
        setLoading(false);
      }
    },
    [locale, t],
  );

  const send = (text: string, suggestion?: Suggestion) => {
    const content = text.trim();
    if (!content || loading || content.length > MAX) return;
    const userMsg: Msg = { role: "user", content };
    // Ensure strict alternation for the AI conversation: drop a dangling user turn left by a failed request.
    const base = messages.length && messages[messages.length - 1].role === "user" ? messages.slice(0, -1) : messages;
    const next = [...base, userMsg];
    setInput("");
    if (mode === "faq") {
      setMessages([
        ...next,
        suggestion
          ? { role: "assistant", content: t(`faq.${suggestion}`), source: "faq" }
          : { role: "assistant", content: t("faqMode.notice"), source: "notice" },
      ]);
      return;
    }
    setMessages(next);
    void ask(next);
  };

  const restart = () => { setMessages([]); setError(null); setInput(""); inputRef.current?.focus(); };
  const hasUser = messages.some((m) => m.role === "user");
  const showSuggestions = mode === "faq" || !hasUser;
  const tooLong = input.length > MAX;

  return (
    <>
      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close(false) : setOpen(true))}
        aria-expanded={open}
        aria-controls="mj-chat"
        aria-label={open ? t("close") : t("launcher")}
        className={`chat-launcher group fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-full bg-surface py-1.5 pl-1.5 pr-1.5 shadow-[var(--shadow-lg)] ring-1 ring-line transition-[transform,opacity,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] active:scale-95 sm:bottom-6 sm:right-6 xl:pr-4 ${open ? "max-sm:pointer-events-none max-sm:opacity-0" : ""} ${fieldFocus && !open ? "pointer-events-none translate-y-4 opacity-0" : ""} ${formInView && !open ? "max-lg:pointer-events-none max-lg:translate-y-4 max-lg:opacity-0" : ""}`}
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-mist">
          {!open && <span className="chat-halo pointer-events-none absolute inset-0 rounded-full ring-2 ring-signal/50" aria-hidden="true" />}
          <span className={`flex transition-[transform,opacity] duration-300 ${open ? "rotate-90 scale-50 opacity-0" : "group-hover:scale-110"}`}>
            <BotAvatar size={34} />
          </span>
          <span className={`absolute inset-0 flex items-center justify-center text-ink transition-[transform,opacity] duration-300 ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`} aria-hidden="true">
            <Icon name="close" size={20} />
          </span>
        </span>
        <span className="hidden text-left leading-tight xl:block">
          <span className="block text-[14px] font-semibold text-ink">{t("launcherShort")}</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{t("subtitle")}</span>
        </span>
      </button>

      {/* Panel */}
      <div
        id="mj-chat"
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
        className={`chat-panel ${closing ? "is-closing" : ""} fixed inset-x-2 bottom-2 z-50 flex max-h-[min(640px,calc(100dvh-16px))] flex-col overflow-hidden rounded-[22px] bg-surface shadow-[var(--shadow-xl)] ring-1 ring-line sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:max-h-[min(640px,calc(100dvh-120px))]`}
      >
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <BotAvatar size={38} />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-[15.5px] font-semibold text-ink">{t("title")}</h2>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-slate">
              <Icon name="sparkle" size={13} className="text-signal" />
              {t("subtitle")}
              {mode === "faq" && <span className="whitespace-nowrap rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-graphite ring-1 ring-line">{t("faqMode.badge")}</span>}
            </p>
          </div>
          {hasUser && (
            <button type="button" onClick={restart} className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:bg-mist hover:text-ink" aria-label={t("restart")} title={t("restart")}>
              <Icon name="refresh" size={17} />
            </button>
          )}
          <button type="button" onClick={() => close()} className="flex h-9 w-9 items-center justify-center rounded-full text-slate hover:bg-mist hover:text-ink" aria-label={t("close")}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-mist/60 px-4 py-4" aria-live="polite" aria-relevant="additions">
          <p className="chat-in rounded-xl bg-surface/70 px-3 py-2 text-[11.5px] leading-snug text-slate ring-1 ring-line">{t("aiNotice")}</p>
          {mode === "faq" && <p className="chat-in rounded-xl bg-surface px-3 py-2.5 text-[12.5px] leading-snug text-graphite ring-1 ring-line-strong" style={{ "--d": 1 } as CSSProperties}>{t("faqMode.notice")}</p>}

          <div className="chat-in flex gap-2.5" style={{ "--d": 2 } as CSSProperties}>
            <BotAvatar size={28} idle={false} />
            <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-[14px] leading-relaxed text-graphite ring-1 ring-line">
              {t("welcome")}
            </div>
          </div>

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="msg-in-right flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-ink px-3.5 py-2.5 text-[14px] leading-relaxed text-paper">
                  <span className="sr-only">{t("you")}: </span>
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={i} className="msg-in-left flex gap-2.5">
                <BotAvatar size={28} idle={false} />
                <div className={`max-w-[85%] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[14px] leading-relaxed ring-1 ${m.source === "notice" ? "bg-surface text-slate ring-line-strong" : "bg-surface text-graphite ring-line"}`}>
                  <span className="sr-only">{t("assistant")}: </span>
                  {m.source === "faq" && <span className="mb-1 inline-block rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate">{t("faqMode.badge")}</span>}
                  <RichText text={m.content} />
                  {m.source !== "ai" && (
                    <NextLink href={`/${locale}/contact`} className="mt-2 block text-[12.5px] font-semibold text-signal underline underline-offset-2">{t("faqMode.contact")}</NextLink>
                  )}
                </div>
              </div>
            ),
          )}

          {loading && (
            <div className="msg-in-left flex items-center gap-2.5" role="status">
              <BotAvatar size={28} idle={false} />
              <span className="flex items-center gap-1 rounded-2xl bg-surface px-3.5 py-3 ring-1 ring-line">
                <span className="sr-only">{t("thinking")}</span>
                {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-steel" aria-hidden="true" />)}
              </span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl bg-signal-soft px-3.5 py-3 text-[13.5px] text-signal-deep ring-1 ring-signal/25">
              <p className="flex items-start gap-2"><Icon name="alert" size={16} className="mt-0.5 shrink-0" />{t(`errors.${error.key}`)}</p>
              {error.retry && (
                <button type="button" onClick={() => void ask(error.retry!)} className="mt-2 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2">
                  <Icon name="refresh" size={14} />
                  {t("send")}
                </button>
              )}
            </div>
          )}

          {showSuggestions && (
            <div>
              <p className="chat-in mb-2 mt-1 text-[12px] font-medium text-slate" style={{ "--d": 3 } as CSSProperties}>{mode === "faq" ? t("faqMode.pick") : t("suggestionsLabel")}</p>
              <ul className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <li key={s} className="chat-in" style={{ "--d": 4 + i } as CSSProperties}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => send(t(`suggestions.${s}`), s)}
                      className="rounded-full bg-surface px-3 py-1.5 text-left text-[13px] text-graphite ring-1 ring-line-strong transition hover:-translate-y-0.5 hover:text-ink hover:ring-ink/40 active:scale-95 disabled:opacity-50"
                    >
                      {t(`suggestions.${s}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form
          className="border-t border-line bg-surface p-3"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <div className="flex items-end gap-2 rounded-2xl bg-mist p-1.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
            <label htmlFor="mj-chat-input" className="sr-only">{t("inputLabel")}</label>
            <textarea
              id="mj-chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }}
              placeholder={t("placeholder")}
              aria-invalid={tooLong}
              aria-describedby={tooLong ? "mj-chat-err" : undefined}
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[14.5px] text-ink placeholder:text-steel focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || tooLong}
              className="group/send flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal text-white transition hover:bg-signal-hover active:scale-90 disabled:bg-line-strong"
              aria-label={t("send")}
            >
              <Icon name="send" size={17} className="transition-transform duration-200 group-hover/send:-translate-y-0.5 group-hover/send:translate-x-0.5" />
            </button>
          </div>
          {tooLong && <p id="mj-chat-err" className="mt-1.5 px-1 text-[12px] text-signal-deep">{t("tooLong", { max: MAX })}</p>}
        </form>
      </div>
    </>
  );
}
