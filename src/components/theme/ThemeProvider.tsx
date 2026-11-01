"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { THEME_STORAGE_KEY, applyTheme, readChoice, saveChoice, type ThemeChoice } from "./theme";

type Ctx = {
  /** The theme shown: the visitor's choice, light until they pick one. */
  choice: ThemeChoice;
  setChoice: (c: ThemeChoice) => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const CHANGE = "mj-theme-change";

// Choice store: localStorage, kept in sync across components and tabs.
function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === THEME_STORAGE_KEY || e.key === null) cb(); };
  window.addEventListener(CHANGE, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, cb);
    window.removeEventListener("storage", onStorage);
  };
}
const getChoice = () => readChoice();

/** Briefly cross-fade colours while the theme changes (skipped with reduced motion). */
function withTransition(change: () => void) {
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return change();
  root.classList.add("theme-transition");
  change();
  window.setTimeout(() => root.classList.remove("theme-transition"), 320);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server and hydration render "light"; the real value follows immediately.
  // Colours never depend on this: ThemeScript set them already.
  const choice = useSyncExternalStore(subscribe, getChoice, () => "light" as ThemeChoice);

  // Keep <html> in sync with the store: on mount (including the client
  // re-render of <html> after a language switch), on OS changes and on
  // changes from other tabs. Layout effect, so it lands before paint.
  // Reads the store directly: during hydration `choice` is still the server value.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const stored = readChoice();
    const current = root.getAttribute("data-theme");
    if (current && current !== stored) withTransition(() => applyTheme(stored));
    else applyTheme(stored);
    // Safety net: if anything strips the attribute from <html>, restore it.
    const mo = new MutationObserver(() => {
      if (!root.hasAttribute("data-theme")) applyTheme(readChoice());
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [choice]);

  const setChoice = useCallback((c: ThemeChoice) => {
    saveChoice(c);
    withTransition(() => applyTheme(c));
    window.dispatchEvent(new Event(CHANGE));
  }, []);

  const value = useMemo(() => ({ choice, setChoice }), [choice, setChoice]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
