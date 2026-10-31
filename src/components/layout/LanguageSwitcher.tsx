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
        <Flag code={current.flag} className="!h-[18px] !w-[27px]" />
        <Icon name="chevronDown" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={listId}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+8px)] rounded-2xl bg-white p-1.5 shadow-[var(--shadow-lg)] ring-1 ring-line"
      >
        <p className="px-3 pb-1 pt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-steel">{t("language")}</p>
        <ul className="flex gap-1">
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                lang={localeMeta[l].htmlLang}
                aria-current={l === locale ? "true" : undefined}
                aria-label={localeMeta[l].name}
                title={localeMeta[l].name}
                onClick={() => setOpen(false)}
                className="flex h-10 w-12 items-center justify-center rounded-xl ring-1 ring-transparent transition-colors hover:bg-mist aria-[current=true]:bg-mist aria-[current=true]:ring-signal"
              >
                <Flag code={localeMeta[l].flag} className="!h-[18px] !w-[27px]" />
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
    <ul className="flex flex-wrap gap-2">
      {locales.map((l) => (
        <li key={l}>
          <Link
            href={pathname}
            locale={l}
            lang={localeMeta[l].htmlLang}
            aria-current={l === locale ? "true" : undefined}
            aria-label={localeMeta[l].name}
            title={localeMeta[l].name}
            onClick={onSelect}
            className="flex h-12 w-14 items-center justify-center rounded-xl ring-1 ring-line hover:bg-mist aria-[current=true]:bg-mist aria-[current=true]:ring-2 aria-[current=true]:ring-signal"
          >
            <Flag code={localeMeta[l].flag} className="!h-[20px] !w-[30px]" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
