"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll reveal: content blocks rise and fade in as they enter the
 * viewport, staggered within each group.
 *
 * Targets are found automatically (REVEAL_SELECTOR), keeping only the
 * outermost match so a card animates as one piece. Opt out with
 * data-no-reveal. The desktop story (.story-anim) has its own motion.
 *
 * Until this component marks <html> with `reveal-ready`, globals.css hides the
 * same elements so nothing flashes before hydration (with a 3 s CSS fallback,
 * and a <noscript> override in the layout). With reduced motion, nothing is hidden.
 */
export const REVEAL_SELECTOR = ":is(main, footer) :is(h1, h2, h3, p, li, details, table, form, dl, figure, [data-reveal])";
/** CSS form of the targets, matching the pre-hydration rule in globals.css. */
export const REVEAL_TARGETS = `${REVEAL_SELECTOR}:not(.story-anim *, [data-no-reveal], [data-no-reveal] *, .no-scrollbar *)`;
const EXCLUDE = ".story-anim, [data-no-reveal], .no-scrollbar, header, #mj-chat";

const FRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(26px)" },
  { opacity: 1, transform: "none" },
];

export function ScrollReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const done = () => root.classList.add("reveal-ready");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return done();

    const picked = new Set<Element>();
    for (const el of document.querySelectorAll(REVEAL_SELECTOR)) {
      if (el.closest(EXCLUDE)) continue;
      let a = el.parentElement, nested = false;
      while (a) { if (picked.has(a)) { nested = true; break; } a = a.parentElement; }
      if (!nested) picked.add(el);
    }

    // Each target holds a paused animation at its first frame (hidden). The Web
    // Animations API leaves attributes untouched, so content that hydrates later
    // (e.g. inside Suspense) never sees a mismatch. Siblings are staggered.
    const anims = new Map<Element, Animation>();
    const order = new Map<Element, number>();
    for (const el of picked) {
      const p = el.parentElement!;
      const i = order.get(p) ?? 0;
      order.set(p, i + 1);
      const a = el.animate(FRAMES, { duration: 850, delay: Math.min(i, 6) * 70, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "both" });
      a.pause();
      anims.set(el, a);
    }
    done();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const a = anims.get(e.target);
          if (a) {
            a.onfinish = () => a.cancel();
            a.play();
          }
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    picked.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, [pathname]);

  return null;
}
