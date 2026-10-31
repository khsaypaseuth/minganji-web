"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { THEME_STORAGE_KEY, applyTheme, readChoice, resolve, saveChoice, type ResolvedTheme, type ThemeChoice } from "./theme";

type Ctx = {
  /** What the visitor picked (default "system"). */
  choice: ThemeChoice;
  /** What is shown: the choice, or the OS setting for "system". */
  resolved: ResolvedTheme;
  setChoice: (c: ThemeChoice) => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const CHANGE = "mj-theme-change";

// Choice store: localStorage, kept in sync across components, tabs and OS changes.
function subscribe(cb: () => void) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (e: StorageEvent) => { if (e.key === THEME_STORAGE_KEY || e.key === null) cb(); };
  window.addEventListener(CHANGE, cb);
  window.addEventListener("storage", onStorage);
  mq.addEventListener("change", cb);
  return () => {
    window.removeEventListener(CHANGE, cb);
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", cb);
  };
}
const getChoice = () => readChoice();
const getResolved = () => resolve(readChoice());

/** Briefly cross-fade colours while the theme changes (skipped with reduced motion). */
function withTransition(change: () => void) {
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return change();
  root.classList.add("theme-transition");
  change();
  window.setTimeout(() => root.classList.remove("theme-transition"), 320);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server and hydration render "system"/"light"; the real values follow
  // immediately. Colours never depend on this: ThemeScript set them already.
  const choice = useSyncExternalStore(subscribe, getChoice, () => "system" as ThemeChoice);
  const resolved = useSyncExternalStore(subscribe, getResolved, () => "light" as ResolvedTheme);

  // Keep <html> in sync with the store: on mount (including the client
  // re-render of <html> after a language switch), on OS changes and on
  // changes from other tabs. Layout effect, so it lands before paint.
  // Reads the store directly: during hydration `choice` is still the server value.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const stored = readChoice();
    const current = root.getAttribute("data-theme");
    if (current && current !== resolve(stored)) withTransition(() => applyTheme(stored));
    else applyTheme(stored);
    // Safety net: if anything strips the attributes from <html>, restore them.
    const mo = new MutationObserver(() => {
      if (!root.hasAttribute("data-theme") || !root.hasAttribute("data-theme-choice")) applyTheme(readChoice());
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-theme-choice"] });
    return () => mo.disconnect();
  }, [choice, resolved]);

  const setChoice = useCallback((c: ThemeChoice) => {
    saveChoice(c);
    withTransition(() => applyTheme(c));
    window.dispatchEvent(new Event(CHANGE));
  }, []);

  const value = useMemo(() => ({ choice, resolved, setChoice }), [choice, resolved, setChoice]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
