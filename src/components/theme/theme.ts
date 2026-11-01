/** Theme the visitor can pick. Light until they pick one. */
export type ThemeChoice = "light" | "dark";

export const THEME_CHOICES: ThemeChoice[] = ["light", "dark"];
export const THEME_STORAGE_KEY = "mj-theme";
/** Browser UI colour (theme-color meta) per theme; keep in sync with --paper in globals.css. */
export const THEME_COLOR: Record<ThemeChoice, string> = { light: "#ffffff", dark: "#0f1114" };

/**
 * Runs before first paint (see ThemeScript). Sets data-theme on <html> (read
 * by globals.css and by the toggle icon): the saved choice, or light when
 * nothing is saved. Keep it tiny and dependency-free.
 */
export const THEME_INIT_SCRIPT = `(function(){var c=null;try{c=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(c!=="dark")c="light";document.documentElement.setAttribute("data-theme",c)})()`;

// Used only when storage is blocked, so the choice still holds for this page view.
let memory: ThemeChoice | null = null;

/** The saved choice, or light when the visitor has not picked one. */
export function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "dark" ? "dark" : "light";
  } catch {
    return memory ?? "light";
  }
}

export function saveChoice(c: ThemeChoice) {
  memory = c;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, c);
  } catch {
    // Storage blocked (private mode, policy): fall back to memory.
  }
}

/** Apply a theme to <html> (idempotent). */
export function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") !== theme) root.setAttribute("data-theme", theme);
  for (const m of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) m.content = THEME_COLOR[theme];
}
