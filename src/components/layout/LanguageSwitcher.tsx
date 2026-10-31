"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeMeta, locales, type Locale } from "@/i18n/routing";
import { Flag } from "@/components/icons/Flag";
import { Icon } from "@/components/icons/Icon";

/** Desktop language selector: disclosure button + list of locale links. */
export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const current = localeMeta[locale];
  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t("selectLanguage")}: ${current.english}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-full px-3 text-[13.5px] font-medium text-graphite transition-colors hover:bg-mist"
      >
        <Flag code={current.flag} />
        <span>{current.name}</span>
        <Icon name="chevronDown" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={listId}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl bg-white p-1.5 shadow-[var(--shadow-lg)] ring-1 ring-line"
      >
        <p className="px-3 pb-1 pt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-steel">{t("language")}</p>
        <ul>
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                lang={localeMeta[l].htmlLang}
                aria-current={l === locale ? "true" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-graphite transition-colors hover:bg-mist aria-[current=true]:bg-mist aria-[current=true]:font-semibold aria-[current=true]:text-ink"
              >
                <Flag code={localeMeta[l].flag} />
                <span className="flex-1">{localeMeta[l].name}</span>
                {l !== "en" && <span className="text-[11.5px] text-steel" lang="en">{localeMeta[l].english}</span>}
                {l === locale && <Icon name="check" size={16} className="text-signal" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Inline list used inside the mobile menu. */
export function LanguageList({ onSelect }: { onSelect?: () => void }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  return (
    <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {locales.map((l) => (
        <li key={l}>
          <Link
            href={pathname}
            locale={l}
            lang={localeMeta[l].htmlLang}
            aria-current={l === locale ? "true" : undefined}
            onClick={onSelect}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-graphite ring-1 ring-transparent hover:bg-mist aria-[current=true]:bg-mist aria-[current=true]:font-semibold aria-[current=true]:ring-line"
          >
            <Flag code={localeMeta[l].flag} />
            <span className="flex-1">{localeMeta[l].name}</span>
            {l !== "en" && <span className="text-[12px] text-steel" lang="en">{localeMeta[l].english}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
