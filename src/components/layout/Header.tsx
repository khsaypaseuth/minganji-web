"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { nav, site } from "@/lib/site";
import { Logo } from "./Logo";
import { LanguageSwitcher, LanguageList } from "./LanguageSwitcher";
import { Icon } from "@/components/icons/Icon";
import { buttonClass } from "@/components/ui/Button";
import { ThemeMenu, ThemeRadios } from "@/components/theme/ThemeToggle";

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
      if (e.key === "Tab" && panelRef.current) {
        // Radios: only the checked one of a group is a tab stop.
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a,button,input[type=radio]:checked"));
        const all = [toggleRef.current!, ...items];
        const i = all.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); all[all.length - 1].focus(); }
        else if (!e.shiftKey && i === all.length - 1) { e.preventDefault(); all[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Close the mobile menu after navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 h-[var(--header-h)] transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        // No backdrop-filter while the menu is open: it would become the containing block for the fixed panel.
        open ? "bg-paper shadow-[0_1px_0_var(--line)]" : scrolled ? "bg-paper/88 shadow-[0_1px_0_var(--line)] backdrop-blur-xl backdrop-saturate-150" : "bg-paper/0"
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        {t("common.skipToContent")}
      </a>
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center rounded-lg" aria-label={`${site.name} — ${t("nav.home")}`}>
          <Logo />
        </Link>

        <nav aria-label={t("nav.primary")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative rounded-full px-3.5 py-2 text-[14.5px] font-medium text-slate transition-colors hover:text-ink aria-[current=page]:text-ink"
                >
                  {t(`nav.${item.key}`)}
                  {isActive(item.href) && <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-signal" aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <LanguageSwitcher />
          <ThemeMenu />
          <a href={site.signInUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium text-graphite hover:bg-mist">
            <Icon name="login" size={16} />
            {t("common.signIn")}
            <span className="sr-only"> {t("common.opensInNewTab")}</span>
          </a>
          <Link href={{ pathname: "/contact", query: { topic: "demo" } }} className={buttonClass("primary", "sm", "ml-1.5")}>
            {t("common.requestDemo")}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href={{ pathname: "/contact", query: { topic: "demo" } }} className={buttonClass("primary", "sm", "max-[380px]:hidden")}>
            {t("common.requestDemo")}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("common.closeMenu") : t("common.openMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink ring-1 ring-line hover:bg-mist"
          >
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-paper px-5 pb-10 pt-4 lg:hidden"
      >
        <nav aria-label={t("nav.primary")}>
          <ul className="divide-y divide-line border-y border-line">
            {nav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-center justify-between py-4 font-display text-[22px] font-semibold text-ink aria-[current=page]:text-signal"
                >
                  {t(`nav.${item.key}`)}
                  <Icon name="arrowRight" size={18} className="text-steel" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 grid gap-3">
          <Link href={{ pathname: "/contact", query: { topic: "demo" } }} className={buttonClass("primary", "lg", "w-full")}>
            {t("common.requestDemo")}
          </Link>
          <a href={site.signInUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "lg", "w-full")}>
            <Icon name="login" size={17} />
            {t("common.signIn")}
            <span className="sr-only"> {t("common.opensInNewTab")}</span>
          </a>
        </div>
        <div className="mt-8">
          <ThemeRadios />
        </div>
        <section className="mt-8" aria-labelledby="mobile-lang">
          <h2 id="mobile-lang" className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-steel">
            <Icon name="globe" size={14} />
            {t("common.language")}
          </h2>
          <LanguageList onSelect={() => setOpen(false)} />
        </section>
      </div>
    </header>
  );
}
