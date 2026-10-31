"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { gsap } from "gsap";
import { playFor, prepareFor, type MotionKind } from "./chartMotion";

/** Plays chart or map-hole motion once when the wrapped content scrolls into view. */
export function MotionInView({ kinds, children, className }: { kinds: MotionKind[]; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = kinds.join(",");

  useEffect(() => {
    const el = ref.current;
    if (!el || !key || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const list = key.split(",") as MotionKind[];
    list.forEach((k) => prepareFor(k)(el));
    const running: gsap.core.Timeline[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        list.forEach((k) => running.push(playFor(k)(el)));
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      // Leave final values in place if the component re-renders mid-animation.
      if (running.length) running.forEach((tl) => tl.progress(1).kill());
      else list.forEach((k) => playFor(k)(el).progress(1).kill());
    };
  }, [key]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
