/**
 * One state table drives the whole truck → dashboard story.
 *
 * - The desktop GSAP timeline tweens each keyed element to STATES[i] when the
 *   visitor scrolls to step i.
 * - Static frames (mobile, tablet, reduced motion) render the cumulative state
 *   for a given scene directly as inline styles.
 *
 * Because both read the same table, the animated and static stories always
 * show the same composition at every step.
 *
 * Canvas coordinates: the stage is a 1000 × 820 px canvas scaled to fit.
 */

export const SCENES = ["truck", "sensors", "controller", "platform", "plan", "manage"] as const;
export type SceneId = (typeof SCENES)[number];

export type Vars = {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
};

export type StateKey =
  | "truck"
  | "truckBg"
  | "callouts"
  | "flows"
  | "flowChips"
  | "ctrlLabel"
  | "map"
  | "holesDone"
  | "truckMarker"
  | "recent"
  | "planned"
  | "selection"
  | "summary"
  | "export"
  | "link"
  | "tiles"
  | "links6";

/** Truck SVG world viewBox per scene (world is 1200 × 700). */
export const TRUCK_VIEW: string[] = [
  "0 0 1200 700",
  "100 120 880 513",
  "0 0 1200 700",
  "0 0 1200 700",
  "0 0 1200 700",
  "0 0 1200 700",
];

export const STATES: Partial<Record<StateKey, Vars>>[] = [
  // 0 · truck (initial)
  {
    truck: { x: 0, y: 0, scale: 1, opacity: 1 },
    truckBg: { opacity: 0 },
    callouts: { opacity: 0 },
    flows: { opacity: 0 },
    flowChips: { opacity: 0 },
    ctrlLabel: { opacity: 0 },
    map: { opacity: 0, x: 0, y: 40, scale: 1 },
    holesDone: { opacity: 0 },
    truckMarker: { opacity: 0 },
    recent: { opacity: 0 },
    planned: { opacity: 0 },
    selection: { opacity: 0 },
    summary: { opacity: 0, y: 30 },
    export: { opacity: 0, y: 30 },
    link: { opacity: 0 },
    tiles: { opacity: 0, y: 30 },
    links6: { opacity: 0 },
  },
  // 1 · sensors (zoom handled by TRUCK_VIEW)
  { callouts: { opacity: 1 } },
  // 2 · controller
  { callouts: { opacity: 0 }, flows: { opacity: 1 }, flowChips: { opacity: 1 }, ctrlLabel: { opacity: 1 } },
  // 3 · MingAnji.ai
  {
    truck: { x: 24, y: -70, scale: 0.36 },
    truckBg: { opacity: 1 },
    flowChips: { opacity: 0 },
    ctrlLabel: { opacity: 0 },
    map: { opacity: 1, y: 0 },
    holesDone: { opacity: 1 },
    truckMarker: { opacity: 1 },
    recent: { opacity: 1 },
    link: { opacity: 1 },
  },
  // 4 · plan & export
  {
    recent: { opacity: 0 },
    planned: { opacity: 1 },
    selection: { opacity: 1 },
    summary: { opacity: 1, y: 0 },
    export: { opacity: 1, y: 0 },
  },
  // 5 · management overview
  {
    truck: { opacity: 0, y: -110 },
    link: { opacity: 0 },
    selection: { opacity: 0 },
    summary: { opacity: 0, y: 20 },
    export: { opacity: 0, y: 20 },
    map: { x: -206, y: -246, scale: 0.72 },
    tiles: { opacity: 1, y: 0 },
    links6: { opacity: 1 },
  },
];

/** Cumulative state of one key at a given scene. */
export function stateAt(key: StateKey, scene: number): Vars {
  const out: Vars = {};
  for (let i = 0; i <= scene; i++) Object.assign(out, STATES[i][key] ?? {});
  return out;
}

/** Convert a state to inline CSS (used for SSR and static frames). */
export function styleFor(key: StateKey, scene: number): React.CSSProperties {
  const v = stateAt(key, scene);
  const style: React.CSSProperties = {};
  if (v.opacity !== undefined) {
    style.opacity = v.opacity;
    if (v.opacity === 0) style.visibility = "hidden";
  }
  if (v.x !== undefined || v.y !== undefined || v.scale !== undefined) {
    style.transform = `translate(${v.x ?? 0}px, ${v.y ?? 0}px) scale(${v.scale ?? 1})`;
  }
  return style;
}
