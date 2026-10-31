"use client";

import { THEME_INIT_SCRIPT } from "./theme";

/**
 * Blocking inline script in <head> that sets the theme before first paint,
 * so there is no flash of the wrong theme.
 *
 * Why a client component with a changing `type`: the [locale] layout is the
 * root layout, so switching language re-renders <html> on the client. A plain
 * <script> created by React on the client logs "Encountered a script tag while
 * rendering React component" (and would never run anyway). On the server we
 * render an executable script; on the client the same element is a data block
 * (`type="text/plain"`), which React accepts silently. ThemeProvider re-applies
 * the theme after such client renders. The `type` difference during hydration
 * is expected, hence suppressHydrationWarning.
 */
export function ThemeScript() {
  const isServer = typeof window === "undefined";
  return (
    <script
      id="mj-theme-init"
      type={isServer ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
