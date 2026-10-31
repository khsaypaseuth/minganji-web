import { useId, type CSSProperties } from "react";
import type { StateKey } from "./states";

/**
 * Original, generic illustration of a white truck-mounted drilling rig
 * (digger-derrick style). It represents the product category only — it is
 * not a specific Tian'An model and implies no specifications.
 *
 * World coordinates: 1200 × 700, ground at y = 585.
 */

export type TruckLabels = {
  gnss: string;
  gnssNote: string;
  boom: string;
  drill: string;
  hours: string;
  controller: string;
  location: string;
  activity: string;
  hoursShort: string;
};

// Sensor anchor points (shared with flow paths).
export const SENSORS = {
  gnss: { x: 812, y: 280 },
  boom: { x: 470, y: 372 },
  drill: { x: 250, y: 192 },
  hours: { x: 800, y: 440 },
} as const;
export const CONTROLLER = { x: 676, y: 368 };

const FLOWS = {
  gnss: "M812 280 C 770 270, 712 290, 690 336",
  boom: "M470 372 C 540 334, 600 330, 650 356",
  drill: "M250 192 C 330 214, 420 300, 520 322 S 620 330, 652 350",
  hours: "M800 440 C 760 444, 716 424, 700 398",
} as const;

const halo: CSSProperties = { paintOrder: "stroke", stroke: "#fff", strokeWidth: 7, strokeLinejoin: "round" };

function Sensor({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g>
      <circle className="pulse-ring" cx={x} cy={y} r="14" fill="none" stroke="#d7261e" strokeWidth="2" style={{ animationDelay: `${delay}s` }} />
      <circle cx={x} cy={y} r="9" fill="#fff" stroke="#d7261e" strokeWidth="2.5" />
      <circle cx={x} cy={y} r="4" fill="#d7261e" />
    </g>
  );
}

function Callout({ from, to, title, note, anchor = "start" }: { from: { x: number; y: number }; to: { x: number; y: number }; title: string; note?: string; anchor?: "start" | "end" }) {
  const dx = anchor === "start" ? 10 : -10;
  return (
    <g>
      <path d={`M${from.x} ${from.y} L${to.x} ${to.y} h${anchor === "start" ? 14 : -14}`} fill="none" stroke="#111417" strokeWidth="1.5" />
      <circle cx={to.x} cy={to.y} r="2.5" fill="#111417" />
      <text x={to.x + dx + (anchor === "start" ? 14 : -14)} y={to.y + 6} textAnchor={anchor} fontSize="19" fontWeight="600" fill="#111417" style={halo}>
        {title}
      </text>
      {note && (
        <text x={to.x + dx + (anchor === "start" ? 14 : -14)} y={to.y + 30} textAnchor={anchor} fontSize="14" fill="#5b636c" fontStyle="italic" style={halo}>
          {note}
        </text>
      )}
    </g>
  );
}

function FlowChip({ x, y, label, anchor = "middle" }: { x: number; y: number; label: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <g>
      <text x={x} y={y} textAnchor={anchor} fontSize="24" fontWeight="600" fill="#d7261e" style={{ ...halo, strokeWidth: 9 }}>
        {label}
      </text>
    </g>
  );
}

// Background power line: poles recede towards a vanishing point behind the cab.
// Pole i sits at scale 0.72^i; index -1 is an off-frame pole nearer the viewer,
// used only so the nearest cables run out of the picture.
const VP = { x: 1180, y: 300 };
const NEAR = { x: 120, y: 596, h: 430 };
const POLES = Array.from({ length: 9 }, (_, k) => {
  const i = k - 1;
  const sc = 0.72 ** i;
  const x = VP.x + (NEAR.x - VP.x) * sc;
  const base = VP.y + (NEAR.y - VP.y) * sc;
  const top = base - NEAR.h * sc;
  return { i, sc, x, base, top };
});
type Pole = (typeof POLES)[number];

// Cable anchors: ends of the upper and lower crossarms.
const anchors = (p: Pole) => [
  { x: p.x - 40 * p.sc, y: p.top + 20 * p.sc },
  { x: p.x + 40 * p.sc, y: p.top + 20 * p.sc },
  { x: p.x - 28 * p.sc, y: p.top + 52 * p.sc },
  { x: p.x + 28 * p.sc, y: p.top + 52 * p.sc },
];
const span = (a: Pole, b: Pole, w: number) => {
  const A = anchors(a)[w], B = anchors(b)[w];
  const sag = 30 * (a.sc + b.sc) * 0.5;
  return `M${A.x.toFixed(1)} ${A.y.toFixed(1)} Q${((A.x + B.x) / 2).toFixed(1)} ${((A.y + B.y) / 2 + sag * 2).toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
};
// One continuous path along the upper-left cable, for the travelling pulse.
const PULSE_PATH = POLES.slice(2).reduce((d, p, k) => d + " " + span(POLES[k + 1], p, 0).replace(/^M[^Q]+/, ""), `M${anchors(POLES[1])[0].x} ${anchors(POLES[1])[0].y}`);

function PowerLine({ intro }: { intro: boolean }) {
  const visible = POLES.slice(1);
  return (
    // Kept faint: background context only, the truck is the subject.
    <g className={intro ? "poles-intro" : undefined} opacity="0.4" aria-hidden="true">
      {/* pole route on the ground */}
      <path d={`M${POLES[0].x} ${POLES[0].base} ${visible.map((p) => `L${p.x.toFixed(1)} ${p.base.toFixed(1)}`).join(" ")}`} fill="none" stroke="#c9d0d6" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
      {/* cables (far spans first) */}
      {POLES.slice(0, -1).map((a, k) => {
        const b = POLES[k + 1];
        const fade = Math.max(0.3, Math.min(1, b.sc + 0.25));
        return (
          <g key={a.i} opacity={fade}>
            {[0, 1, 2, 3].map((w) => (
              <path key={w} className="wire" pathLength={1} d={span(a, b, w)} fill="none" stroke="#9aa3ab" strokeWidth={Math.max(0.6, 1.6 * b.sc)} style={{ "--i": POLES.length - k } as CSSProperties} />
            ))}
          </g>
        );
      })}
      {/* poles, far to near */}
      {[...visible].reverse().map((p) => {
        const w = 10 * p.sc;
        return (
          <g key={p.i} className="pole" opacity={Math.max(0.35, Math.min(1, p.sc + 0.3))} style={{ "--i": POLES.length - p.i } as CSSProperties}>
            <path d={`M${p.x - w * 0.5} ${p.base} L${p.x - w * 0.32} ${p.top} H${p.x + w * 0.32} L${p.x + w * 0.5} ${p.base} Z`} fill="#b7bfc6" />
            <rect x={p.x - 46 * p.sc} y={p.top + 16 * p.sc} width={92 * p.sc} height={6 * p.sc} rx={2 * p.sc} fill="#a3acb4" />
            <rect x={p.x - 33 * p.sc} y={p.top + 48 * p.sc} width={66 * p.sc} height={5 * p.sc} rx={2 * p.sc} fill="#a3acb4" />
            {anchors(p).map((a, j) => (
              <rect key={j} x={a.x - 3 * p.sc} y={a.y - 7 * p.sc} width={6 * p.sc} height={9 * p.sc} rx={2 * p.sc} fill="#8a929b" />
            ))}
            <ellipse cx={p.x} cy={p.base} rx={16 * p.sc} ry={3 * p.sc} fill="#111417" opacity="0.08" />
          </g>
        );
      })}
      {/* current travelling along the line */}
      <circle r="3.5" fill="#d7261e" className="motion-only line-pulse">
        <animateMotion dur="5s" repeatCount="indefinite" path={PULSE_PATH} />
      </circle>
    </g>
  );
}

export function TruckIllustration({
  viewBox,
  labels,
  styleOf,
  title,
  intro = false,
}: {
  viewBox: string;
  labels: TruckLabels;
  styleOf: (k: StateKey) => CSSProperties;
  title: string;
  /** Play the drive-in entrance (opening scene only). */
  intro?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${uid}-${n}`;
  return (
    <svg data-truck-svg viewBox={viewBox} className="h-full w-full" role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9eff4" />
          <stop offset="1" stopColor="#c9d4dd" />
        </linearGradient>
        <linearGradient id={id("bodyShade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef0f2" />
        </linearGradient>
        <clipPath id={id("auger")}>
          <rect x="226" y="440" width="48" height="132" rx="4" />
        </clipPath>
        <linearGradient id={id("scan")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d7261e" stopOpacity="0" />
          <stop offset="0.85" stopColor="#d7261e" stopOpacity="0.14" />
          <stop offset="1" stopColor="#d7261e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ground */}
      <path d="M-200 586 H1400" stroke="#cfd4d9" strokeWidth="2" />
      <ellipse cx="590" cy="598" rx="470" ry="14" fill="#111417" opacity="0.07" />
      <path d="M210 586 q 18 -16 40 -16 q 22 0 40 16 z" fill="#d9d3c7" />
      <g className="motion-only" aria-hidden="true">
        {[[-34, -26, 5], [-18, -40, 4], [22, -36, 5], [38, -22, 4], [6, -48, 3]].map(([dx, dy, r], i) => (
          <circle key={i} className="dirt" cx="250" cy="580" r={r} fill="#b9ae9c" style={{ "--dx": `${dx}px`, "--dy": `${dy}px` } as CSSProperties} />
        ))}
      </g>

      <g className={intro ? "truck-drive" : undefined}>
      <PowerLine intro={intro} />

      {/* outriggers */}
      {[196, 706].map((x) => (
        <g key={x} className="outrigger">
          <rect x={x - 6} y="470" width="12" height="104" fill="#5b636c" />
          <rect x={x - 22} y="572" width="44" height="10" rx="3" fill="#2b3036" />
        </g>
      ))}

      {/* wheels (drawn first so the chassis overlaps their tops) */}
      {[335, 450, 862].map((x) => (
        <g key={x} className="wheel">
          <circle cx={x} cy="540" r="46" fill="#1d2126" />
          <circle cx={x} cy="540" r="24" fill="#cfd4d9" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={x + 16 * Math.cos((a * Math.PI) / 180)} cy={540 + 16 * Math.sin((a * Math.PI) / 180)} r="3" fill="#8a929b" />
          ))}
          <circle cx={x} cy="540" r="9" fill="#5b636c" />
        </g>
      ))}

      {/* chassis */}
      <rect x="150" y="470" width="812" height="30" rx="4" fill="#2b3036" />

      {/* rear body */}
      <rect x="160" y="398" width="560" height="74" rx="6" fill={`url(#${id("bodyShade")})`} stroke="#cfd4d9" strokeWidth="2" />
      {[300, 440, 580].map((x) => (
        <path key={x} d={`M${x} 404 V466`} stroke="#dfe3e7" strokeWidth="2" />
      ))}
      {[230, 370, 510, 650].map((x) => (
        <rect key={x} x={x - 12} y="430" width="24" height="5" rx="2.5" fill="#cfd4d9" />
      ))}
      <rect x="160" y="452" width="560" height="5" fill="#d7261e" />

      {/* controller cabinet behind the cab */}
      <g>
        <rect x="642" y="336" width="68" height="62" rx="7" fill="#2b3036" />
        <rect x="652" y="346" width="48" height="20" rx="3" fill="#111417" />
        <path d="M656 360 l8 -6 6 4 8 -8 6 5 8 -3" fill="none" stroke="#d7261e" strokeWidth="2" />
        <circle cx="660" cy="384" r="3.5" fill="#1f8a5b" />
        <circle cx="673" cy="384" r="3.5" fill="#d7261e" />
        <rect x="684" y="381" width="18" height="6" rx="2" fill="#5b636c" />
      </g>

      {/* cab */}
      <path d="M742 472 V304 Q742 292 754 292 H872 Q884 292 892 302 L952 380 Q962 392 962 404 V472 Z" fill={`url(#${id("bodyShade")})`} stroke="#cfd4d9" strokeWidth="2" />
      <path d="M760 312 H866 Q872 312 876 318 L924 378 H760 Z" fill={`url(#${id("glass")})`} />
      <path d="M786 312 L770 378" stroke="#ffffff" strokeWidth="6" opacity="0.55" />
      <path d="M846 388 V466" stroke="#dfe3e7" strokeWidth="2" />
      <rect x="826" y="404" width="14" height="4" rx="2" fill="#8a929b" />
      <rect x="742" y="440" width="220" height="6" fill="#d7261e" />
      <rect x="944" y="410" width="18" height="12" rx="3" fill="#f6d77a" stroke="#cfd4d9" />
      <rect x="930" y="472" width="44" height="18" rx="4" fill="#2b3036" />
      {/* GNSS antenna puck (illustrative placement) */}
      <rect x="796" y="282" width="32" height="10" rx="5" fill="#2b3036" />
      {/* roof beacon */}
      <circle className="beacon-glow motion-only" cx="858" cy="282" r="18" fill="#f5a524" />
      <rect x="849" y="276" width="18" height="16" rx="8" fill="#f5a524" stroke="#d98a0b" strokeWidth="1.5" />

      {/* turntable + boom */}
      <ellipse cx="470" cy="398" rx="56" ry="12" fill="#2b3036" />
      <rect x="440" y="358" width="60" height="40" rx="6" fill="#ffffff" stroke="#cfd4d9" strokeWidth="2" />
      <path d="M432 394 L384 300" stroke="#8a929b" strokeWidth="10" strokeLinecap="round" />
      <path d="M430 392 L400 334" stroke="#cfd4d9" strokeWidth="5" strokeLinecap="round" />
      <path d="M480 360 L260 166 L240 188 L460 382 Z" fill="#ffffff" stroke="#cfd4d9" strokeWidth="2" strokeLinejoin="round" />
      <path d="M470 371 L250 177" stroke="#d7261e" strokeWidth="3" />
      <path d="M330 248 L290 212" stroke="#dfe3e7" strokeWidth="14" />

      {/* kelly bar + auger (digs in a loop), then the drill head on top */}
      <g className="auger-bob">
        <rect x="245" y="190" width="10" height="254" fill="#5b636c" />
        <rect x="226" y="440" width="48" height="132" rx="4" fill="#8a929b" />
        <g clipPath={`url(#${id("auger")})`}>
          <g className="auger-spin">
            {Array.from({ length: 11 }, (_, i) => (
              <path key={i} d={`M220 ${424 + i * 16} L280 ${396 + i * 16} V${402 + i * 16} L220 ${430 + i * 16} Z`} fill="#5b636c" />
            ))}
          </g>
        </g>
        <path d="M226 572 L250 592 L274 572 Z" fill="#5b636c" />
      </g>
      <rect x="226" y="168" width="48" height="50" rx="7" fill="#ffffff" stroke="#cfd4d9" strokeWidth="2" />
      <rect x="236" y="180" width="28" height="8" rx="3" fill="#dfe3e7" />

      </g>

      {/* data flows: sensors → controller */}
      <g data-k="flows" style={styleOf("flows")}>
        {Object.entries(FLOWS).map(([k, d]) => (
          <g key={k}>
            <path d={d} fill="none" stroke="#d7261e" strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#d7261e" strokeWidth="2.5" strokeLinecap="round" className="flow-dash" />
            <circle r="5" fill="#d7261e" className="motion-only">
              <animateMotion dur="2.2s" repeatCount="indefinite" path={d} />
            </circle>
          </g>
        ))}
        <circle cx={CONTROLLER.x} cy={CONTROLLER.y} r="46" fill="none" stroke="#d7261e" strokeWidth="2" strokeDasharray="3 6" />
      </g>

      {/* sensors */}
      <g className={intro ? "truck-drive" : undefined}>
        <Sensor {...SENSORS.gnss} />
        <Sensor {...SENSORS.boom} delay={0.6} />
        <Sensor {...SENSORS.drill} delay={1.2} />
        <Sensor {...SENSORS.hours} delay={1.8} />
      </g>

      {/* uplink: controller sends data on to MingAnji.ai (scenes 4–5) */}
      <g data-k="uplink" style={styleOf("uplink")} className="motion-only">
        {[0, 0.8, 1.6].map((delay) => (
          <path key={delay} className="uplink" d={`M${CONTROLLER.x - 60} 330 A 60 60 0 0 1 ${CONTROLLER.x + 60} 330`} fill="none" stroke="#d7261e" strokeWidth="5" strokeLinecap="round" style={{ animationDelay: `${delay}s` }} />
        ))}
      </g>

      {/* scene 2: sensor callouts */}
      <g data-k="callouts" style={styleOf("callouts")}>
        <g className="scan-sweep motion-only" aria-hidden="true">
          <rect x="-70" y="120" width="70" height="500" fill={`url(#${id("scan")})`} />
          <rect x="-1.5" y="120" width="3" height="500" fill="#d7261e" opacity="0.55" />
        </g>
        <Callout from={SENSORS.drill} to={{ x: 330, y: 136 }} title={labels.drill} />
        <Callout from={SENSORS.boom} to={{ x: 552, y: 300 }} title={labels.boom} />
        <Callout from={SENSORS.gnss} to={{ x: 760, y: 196 }} title={labels.gnss} note={labels.gnssNote} anchor="end" />
        <Callout from={SENSORS.hours} to={{ x: 760, y: 618 }} title={labels.hours} anchor="end" />
      </g>

      {/* scene 3: data chips along the flows */}
      <g data-k="flowChips" style={styleOf("flowChips")}>
        <FlowChip x={846} y={246} label={labels.location} anchor="start" />
        <FlowChip x={372} y={226} label={labels.activity} />
        <FlowChip x={846} y={420} label={labels.hoursShort} anchor="start" />
      </g>
      <g data-k="ctrlLabel" style={styleOf("ctrlLabel")}>
        <path d="M676 336 V250" stroke="#111417" strokeWidth="1.5" />
        <rect x="580" y="176" width="192" height="74" rx="12" fill="#111417" />
        <text x="676" y="210" textAnchor="middle" fontSize="19" fontWeight="600" fill="#fff">{labels.controller}</text>
        <text x="676" y="236" textAnchor="middle" fontSize="13" fill="#cfd4d9" fontFamily="var(--font-code)">● ● ●</text>
      </g>
    </svg>
  );
}
