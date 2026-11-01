"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/icons/Icon";
import { THEME_CHOICES, type ThemeChoice } from "./theme";
import { useTheme } from "./ThemeProvider";

const ICON: Record<ThemeChoice, IconName> = { light: "sun", dark: "moon" };
// Which icon shows is decided by CSS from <html data-theme>, which is set
// before first paint, so the button never shows the wrong icon on load.
const SHOW_WHEN: Record<ThemeChoice, string> = {
  light: "hidden [[data-theme=light]_&]:block",
  dark: "hidden [[data-theme=dark]_&]:block",
};

/** Desktop: compact icon button opening a small Light / Dark menu. */
export function ThemeMenu() {
  const t = useTranslations("common.theme");
  const { choice, setChoice } = useTheme();
  const [open, setOpen] = useState(false);
  const [announce, setAnnounce] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    // Focus the current option when the menu opens.
    itemsRef.current[THEME_CHOICES.indexOf(choice)]?.focus();
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // Only when opening; moving focus on every choice change would be jarring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) btnRef.current?.focus();
  };

  const pick = (c: ThemeChoice) => {
    setChoice(c);
    setAnnounce(t("current", { theme: t(c) }));
    close();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const items = itemsRef.current.filter(Boolean) as HTMLButtonElement[];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") close(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        data-theme-toggle
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("current", { theme: t(choice) })}
        title={t("label")}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); } }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-graphite transition-colors hover:bg-mist hover:text-ink aria-expanded:bg-mist"
      >
        {THEME_CHOICES.map((c) => (
          <Icon key={c} name={ICON[c]} size={18} className={SHOW_WHEN[c]} />
        ))}
      </button>
      <span className="sr-only" aria-live="polite">{announce}</span>
      <div
        id={menuId}
        role="menu"
        aria-label={t("label")}
        hidden={!open}
        onKeyDown={onMenuKey}
        className="absolute right-0 top-[calc(100%+8px)] z-10 w-48 rounded-2xl bg-surface p-1.5 shadow-[var(--shadow-lg)] ring-1 ring-line"
      >
        <p className="px-3 pb-1 pt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-steel" aria-hidden="true">{t("label")}</p>
        {THEME_CHOICES.map((c, i) => (
          <button
            key={c}
            ref={(el) => { itemsRef.current[i] = el; }}
            type="button"
            role="menuitemradio"
            aria-checked={choice === c}
            tabIndex={-1}
            data-theme-option={c}
            onClick={() => pick(c)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-graphite outline-none transition-colors hover:bg-mist hover:text-ink focus-visible:bg-mist focus-visible:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 aria-checked:text-ink"
          >
            <Icon name={ICON[c]} size={17} className="shrink-0 text-steel" />
            <span className="flex-1">{t(c)}</span>
            {choice === c && <Icon name="check" size={16} className="shrink-0 text-signal" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mobile menu: a labelled two-way segmented control built on native radios. */
export function ThemeRadios() {
  const t = useTranslations("common.theme");
  const { choice, setChoice } = useTheme();
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-steel">
        <Icon name="sun" size={14} />
        {t("label")}
      </legend>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1 ring-1 ring-line">
        {THEME_CHOICES.map((c) => (
          <label
            key={c}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 text-[14.5px] font-medium text-slate transition-colors has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-[var(--shadow-sm)] has-[:checked]:ring-1 has-[:checked]:ring-line has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal"
          >
            <input
              type="radio"
              name={name}
              value={c}
              data-theme-option={c}
              checked={choice === c}
              onChange={() => setChoice(c)}
              className="sr-only"
            />
            <Icon name={ICON[c]} size={17} className="shrink-0" />
            {t(c)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
