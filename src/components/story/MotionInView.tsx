"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { gsap } from "gsap";
import { playFor, prepareFor, type MotionKind } from "./chartMotion";

/** Plays chart or map-hole motion when the wrapped content scrolls into view, and replays it on return. */
export function MotionInView({ kinds, children, className }: { kinds: MotionKind[]; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = kinds.join(",");

  useEffect(() => {
    const el = ref.current;
    if (!el || !key || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const list = key.split(",") as MotionKind[];
    list.forEach((k) => prepareFor(k)(el));
    let running: gsap.core.Timeline[] = [];
    let played = false;
    // Play once properly on screen; once fully out of view, reset so it replays next time.
    const io = new IntersectionObserver(
      ([entry]) => {
        // Tall diagrams (stacked on phones) count as "in view" once they fill half the screen.
        const shown = entry.intersectionRatio >= 0.45 || entry.intersectionRect.height >= (entry.rootBounds?.height ?? innerHeight) * 0.5;
        if (shown && !played) {
          played = true;
          running.forEach((tl) => tl.kill());
          running = list.map((k) => playFor(k)(el));
        } else if (!entry.isIntersecting && played) {
          played = false;
          running.forEach((tl) => tl.kill());
          running = [];
          list.forEach((k) => prepareFor(k)(el));
        }
      },
      { threshold: [0, 0.2, 0.3, 0.45] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      // Leave final values in place on unmount or re-render.
      running.forEach((tl) => tl.kill());
      list.forEach((k) => playFor(k)(el).progress(1).kill());
    };
  }, [key]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
