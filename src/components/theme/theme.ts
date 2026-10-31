/** Theme choice saved by the visitor. "system" follows the operating system. */
export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_CHOICES: ThemeChoice[] = ["light", "dark", "system"];
export const THEME_STORAGE_KEY = "mj-theme";
/** Browser UI colour (theme-color meta) per resolved theme; keep in sync with --paper in globals.css. */
export const THEME_COLOR: Record<ResolvedTheme, string> = { light: "#ffffff", dark: "#0f1114" };

/**
 * Runs before first paint (see ThemeScript). Sets data-theme (resolved
 * light/dark, read by globals.css) and data-theme-choice (what the visitor
 * picked, used to show the right toggle icon before hydration) on <html>.
 * Keep it tiny and dependency-free.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement,c="system";try{c=localStorage.getItem("${THEME_STORAGE_KEY}")||"system"}catch(e){}if(c!=="light"&&c!=="dark")c="system";var r=c==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):c;d.setAttribute("data-theme",r);d.setAttribute("data-theme-choice",c)})()`;

// Used only when storage is blocked, so the choice still holds for this page view.
let memory: ThemeChoice = "system";

export function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return memory;
  }
}

/** Persist a choice. "system" clears the stored value so the OS setting applies. */
export function saveChoice(c: ThemeChoice) {
  memory = c;
  try {
    if (c === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, c);
  } catch {
    // Storage blocked (private mode, policy): fall back to memory.
  }
}

export function systemTheme(): ResolvedTheme {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const resolve = (c: ThemeChoice): ResolvedTheme => (c === "system" ? systemTheme() : c);

/** Apply a choice to <html> (idempotent). */
export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const resolved = resolve(choice);
  if (root.getAttribute("data-theme") !== resolved) root.setAttribute("data-theme", resolved);
  if (root.getAttribute("data-theme-choice") !== choice) root.setAttribute("data-theme-choice", choice);
  for (const m of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) m.content = THEME_COLOR[resolved];
  return resolved;
}
