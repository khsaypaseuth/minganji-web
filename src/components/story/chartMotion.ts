import { gsap } from "gsap";
import { HOLES } from "./Dashboard";

/**
 * Time-based "data arriving" animations for the sample dashboards.
 *
 * Markup opts in with data attributes (see Dashboard.tsx):
 *   data-grow="x" | "y"   bar or progress fill that grows from zero
 *   data-count="58"       number that counts up (data-decimals for 7.5)
 *   data-draw             SVG path (pathLength=1) that draws itself
 *   data-fade="0.07"      element that fades in to that opacity
 *   data-pop              element that pops in
 *   data-hole / data-ripple / data-marker / data-recent   map hole sequence
 *
 * The server-rendered HTML always shows final values, so content is complete
 * without JavaScript or with reduced motion. `prepare*` resets to the start
 * state; `play*` resets and returns the running timeline.
 */

const all = (root: Element, sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));

function fmt(v: number, el: HTMLElement) {
  return v.toFixed(Number(el.dataset.decimals ?? 0));
}

export function prepareCharts(root: Element) {
  gsap.set(all(root, '[data-grow="y"]'), { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(all(root, '[data-grow="x"]'), { scaleX: 0, transformOrigin: "0% 50%" });
  gsap.set(all(root, "[data-draw]"), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(all(root, "[data-fade]"), { opacity: 0 });
  gsap.set(all(root, "[data-pop]"), { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
  for (const el of all(root, "[data-count]")) el.textContent = fmt(0, el);
}

export function playCharts(root: Element) {
  prepareCharts(root);
  const tl = gsap.timeline();
  tl.to(all(root, '[data-grow="y"]'), { scaleY: 1, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.1);
  tl.to(all(root, '[data-grow="x"]'), { scaleX: 1, duration: 1.1, ease: "power3.out", stagger: 0.1 }, 0.1);
  tl.to(all(root, "[data-draw]"), { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 0.2);
  for (const el of all(root, "[data-fade]")) tl.to(el, { opacity: Number(el.dataset.fade ?? 1), duration: 0.8 }, 0.9);
  tl.to(all(root, "[data-pop]"), { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(3)", stagger: 0.09 }, 0.1);
  for (const el of all(root, "[data-count]")) {
    const n = { v: 0 };
    tl.to(n, { v: Number(el.dataset.count), duration: 1.3, ease: "power2.out", onUpdate: () => { el.textContent = fmt(n.v, el); } }, 0.1);
  }
  return tl;
}

// The truck marker is drawn at the hole after the last recorded one.
const END = HOLES[7];

export function prepareHoles(root: Element) {
  gsap.set(all(root, "[data-hole]"), { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set(all(root, "[data-ripple]"), { opacity: 0 });
  gsap.set(all(root, "[data-recent]"), { opacity: 0 });
  gsap.set(all(root, "[data-marker]"), { x: HOLES[0].x - END.x, y: HOLES[0].y - END.y });
}

/** The truck moves along the line; each hole is spotted on the map as it is drilled. */
export function playHoles(root: Element) {
  prepareHoles(root);
  const marker = all(root, "[data-marker]");
  const tl = gsap.timeline({ delay: 0.2 });
  const step = 0.48; // one hole every ~half second
  const holes = all(root, "[data-hole]");
  holes.forEach((hole, i) => {
    const t = i * step;
    if (i > 0) tl.to(marker, { x: HOLES[i].x - END.x, y: HOLES[i].y - END.y, duration: 0.3, ease: "power1.inOut" }, t - 0.3);
    tl.to(hole, { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(3)" }, t);
    const ripple = hole.querySelector("[data-ripple]");
    if (ripple) tl.fromTo(ripple, { opacity: 0.7, scale: 1, transformOrigin: "50% 50%" }, { opacity: 0, scale: 3.4, duration: 0.7, ease: "power2.out" }, t);
  });
  const end = (holes.length - 1) * step + 0.2;
  tl.to(marker, { x: 0, y: 0, duration: 0.35, ease: "power1.inOut" }, end);
  tl.to(all(root, "[data-recent]"), { opacity: 1, duration: 0.4 }, end + 0.2);
  return tl;
}

export type MotionKind = "charts" | "holes";
export const prepareFor = (k: MotionKind) => (k === "holes" ? prepareHoles : prepareCharts);
export const playFor = (k: MotionKind) => (k === "holes" ? playHoles : playCharts);
