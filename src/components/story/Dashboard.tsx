import { useId, type CSSProperties, type ReactNode } from "react";
import type { StateKey } from "./states";

/** All values below are SAMPLE DATA for illustration only. */

export type DashLabels = {
  liveMap: string; online: string; truckId: string; drilling: string; recentHole: string; holes: string; selected: string;
  summary: string; completed: string; planned: string; remaining: string; export: string; drawing: string; exportNote: string;
  activity: string; hoursWeek: string; planning: string; progress: string; staff: string; onShift: string; business: string;
  jobs: string; utilisation: string; days: string[]; idle: string; offline: string; operator: string; crew: string; illustrative: string;
};

type StyleOf = (k: StateKey) => CSSProperties;

type T = { (key: string): string; raw(key: string): unknown };
/** Build dashboard labels from translators for home.story.dash, features.preview and common. */
export function buildDashLabels(t: T, p: T, c: T): DashLabels {
  const k = ["liveMap", "online", "truckId", "drilling", "recentHole", "holes", "selected", "summary", "completed", "planned", "remaining", "export", "drawing", "exportNote", "activity", "hoursWeek", "planning", "progress", "staff", "onShift", "business", "jobs", "utilisation"] as const;
  const out = Object.fromEntries(k.map((x) => [x, t(x)])) as Record<(typeof k)[number], string>;
  return { ...out, days: t.raw("days") as string[], idle: p("idle"), offline: p("offline"), operator: p("operator"), crew: p("crew"), illustrative: c("illustrativeInterface") };
}
const none: StyleOf = () => ({});

/** Status dot; "live" adds a soft ping, "blink" a slow fade (both hidden with reduced motion). */
function StatusDot({ className, live }: { className: string; live?: "ping" | "blink" }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      {live === "ping" && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden ${className}`} />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${className} ${live === "blink" ? "live-blink" : ""}`} />
    </span>
  );
}

/** A number that counts up when its chart animates (see chartMotion.ts). */
export function Count({ value, decimals = 0 }: { value: number; decimals?: number }) {
  return (
    <span data-count={value} data-decimals={decimals || undefined} className="tabular-nums">
      {value.toFixed(decimals)}
    </span>
  );
}

// Power-line route with 12 hole positions (map coords 746 × 436).
export const HOLES = Array.from({ length: 12 }, (_, i) => {
  const jitter = [0, 2, -1, 2, -2, 1, -1, 2, 0, 1, -2, 1][i];
  return { x: 70 + i * (600 / 11), y: 356 - i * (262 / 11) + jitter, i };
});
const DONE = 7; // holes 0–6 recorded; the truck is at hole 7

export function Window({ title, children, badge, className = "", style, k }: { title: string; children: ReactNode; badge?: ReactNode; className?: string; style?: CSSProperties; k?: StateKey }) {
  return (
    <div data-k={k} style={style} className={`overflow-hidden rounded-[18px] bg-white shadow-[var(--shadow-lg)] ring-1 ring-line ${className}`}>
      <div className="flex min-h-11 items-center gap-2 border-b border-line bg-white px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-cloud" />
          <span className="h-2.5 w-2.5 rounded-full bg-cloud" />
          <span className="h-2.5 w-2.5 rounded-full bg-cloud" />
        </span>
        <span className="ml-2 min-w-0 text-[14px] font-semibold leading-tight text-ink">{title}</span>
        <span className="ml-auto flex items-center gap-2">{badge}</span>
      </div>
      {children}
    </div>
  );
}

export function LivePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-soft px-2.5 py-1 text-[12px] font-semibold text-signal">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
      </span>
      {label}
    </span>
  );
}

// The holes follow the sidewalk of a main road: the road runs parallel to the
// drilling line, offset towards the top-left, with a pavement strip between.
const ROUTE = (() => {
  const a = { x: 70, y: 356 }, b = { x: 670, y: 94 };
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const d = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const n = { x: d.y, y: -d.x }; // normal pointing to the road side (up-left)
  const line = (off: number) => {
    const p = { x: a.x - d.x * 120 + n.x * off, y: a.y - d.y * 120 + n.y * off };
    const q = { x: b.x + d.x * 120 + n.x * off, y: b.y + d.y * 120 + n.y * off };
    return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  };
  return { road: line(26), kerb: line(14), sidewalk: line(5) };
})();

function MapBase() {
  return (
    <>
      <rect width="746" height="436" fill="#f4f5f3" />
      <g fill="#eaece7">
        <rect x="30" y="30" width="170" height="90" rx="8" transform="rotate(-8 30 30)" />
        <rect x="420" y="250" width="200" height="110" rx="8" transform="rotate(6 420 250)" />
        <rect x="610" y="-24" width="150" height="62" rx="8" transform="rotate(-6 610 -24)" />
        <rect x="250" y="322" width="140" height="66" rx="8" transform="rotate(4 250 322)" />
        <rect x="26" y="184" width="118" height="62" rx="8" transform="rotate(-6 26 184)" />
      </g>
      <path d="M-20 410 C 200 380, 380 460, 760 400" stroke="#dbe6ef" strokeWidth="22" fill="none" strokeLinecap="round" />
      <g stroke="#ffffff" strokeWidth="9" fill="none" strokeLinecap="round">
        <path d="M150 -10 L260 450" />
        <path d="M-10 170 L760 210" />
        <path d="M520 -10 L640 450" />
      </g>
      <g stroke="#e2e5e8" strokeWidth="1" fill="none">
        <path d="M150 -10 L260 450" strokeDasharray="2 10" />
      </g>
      {/* main road with the sidewalk the holes are drilled along */}
      <path d={ROUTE.sidewalk} stroke="#e6e2d9" strokeWidth="22" strokeLinecap="round" />
      <path d={ROUTE.road} stroke="#dde2e6" strokeWidth="24" strokeLinecap="round" />
      <path d={ROUTE.road} stroke="#ffffff" strokeWidth="20" strokeLinecap="round" />
      <path d={ROUTE.road} stroke="#e2e5e8" strokeWidth="1.5" strokeDasharray="10 9" />
      <path d={ROUTE.kerb} stroke="#d6d1c6" strokeWidth="1.2" />
      <path d={`M${HOLES[0].x - 30} ${HOLES[0].y + 13} L${HOLES[11].x + 40} ${HOLES[11].y - 17}`} stroke="#111417" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="7 6" />
    </>
  );
}

export function MapView({ d, styleOf = none }: { d: DashLabels; styleOf?: StyleOf }) {
  const truck = HOLES[DONE];
  const recent = HOLES[DONE - 1];
  return (
    <svg viewBox="0 0 746 436" className="block h-auto w-full" aria-hidden="true">
      <MapBase />
      {/* planned positions */}
      <g data-k="planned" style={styleOf("planned")}>
        <path d={`M${truck.x} ${truck.y} L${HOLES[DONE + 1].x} ${HOLES[DONE + 1].y}`} stroke="#d7261e" strokeWidth="2.5" className="flow-dash" />
        {HOLES.slice(DONE + 1).map((h) => (
          <circle key={h.i} className="spin-slow" cx={h.x} cy={h.y} r="8" fill="#fff" stroke="#8a929b" strokeWidth="2" strokeDasharray="3 3" />
        ))}
      </g>
      {/* recorded holes */}
      <g data-k="holesDone" style={styleOf("holesDone")}>
        {HOLES.slice(0, DONE).map((h) => (
          <g key={h.i} data-hole>
            <circle data-ripple cx={h.x} cy={h.y} r="9" fill="none" stroke="#111417" strokeWidth="2" opacity="0" />
            <circle cx={h.x} cy={h.y} r="9" fill="#111417" stroke="#fff" strokeWidth="3" />
          </g>
        ))}
      </g>
      {/* selection */}
      <g data-k="selection" style={styleOf("selection")}>
        <rect x={HOLES[1].x - 26} y={HOLES[6].y - 30} width={HOLES[6].x - HOLES[1].x + 52} height={HOLES[1].y - HOLES[6].y + 60} rx="12" fill="#d7261e" fillOpacity="0.06" stroke="#d7261e" strokeWidth="2" strokeDasharray="6 5" />
        <g transform={`translate(${HOLES[1].x - 26} ${HOLES[1].y + 40})`}>
          <rect width="150" height="30" rx="15" fill="#d7261e" />
          <text x="75" y="20" textAnchor="middle" fontSize="14" fontWeight="600" fill="#fff">{d.selected} · 6</text>
        </g>
      </g>
      {/* recent activity pulse */}
      <g data-k="recent" style={styleOf("recent")}>
        <g data-recent>
          <circle className="pulse-ring" cx={recent.x} cy={recent.y} r="12" fill="none" stroke="#d7261e" strokeWidth="2.5" />
          <circle cx={recent.x} cy={recent.y} r="9" fill="#d7261e" stroke="#fff" strokeWidth="3" />
          <g transform={`translate(${recent.x - 80} ${recent.y + 26})`}>
            <rect width="160" height="30" rx="8" fill="#111417" />
            <text x="80" y="20" textAnchor="middle" fontSize="13.5" fontWeight="600" fill="#fff">{d.recentHole}</text>
          </g>
        </g>
      </g>
      {/* truck marker */}
      <g data-k="truckMarker" style={styleOf("truckMarker")}>
        <g data-marker>
        <circle cx={truck.x} cy={truck.y} r="26" fill="#d7261e" opacity="0.14" />
        <circle className="pulse-ring" cx={truck.x} cy={truck.y} r="18" fill="none" stroke="#d7261e" strokeWidth="2" />
        <circle cx={truck.x} cy={truck.y} r="15" fill="#d7261e" stroke="#fff" strokeWidth="3" />
        <path d={`M${truck.x - 7} ${truck.y - 4} h8 v7 h-8z M${truck.x + 1} ${truck.y - 1} h4 l3 3 v4 h-7z`} fill="#fff" />
        <g transform={`translate(${truck.x + 24} ${truck.y - 44})`}>
          <rect width="148" height="44" rx="10" fill="#fff" stroke="#e2e5e8" />
          <text x="12" y="19" fontSize="13.5" fontWeight="700" fill="#111417">{d.truckId}</text>
          <circle cx="16" cy="32" r="3.5" fill="#d7261e" />
          <text x="25" y="36" fontSize="12" fill="#5b636c">{d.drilling}</text>
        </g>
        </g>
      </g>
    </svg>
  );
}

export function SummaryCard({ d, style, k, className = "" }: { d: DashLabels; style?: CSSProperties; k?: StateKey; className?: string }) {
  const rows = [
    { label: d.completed, value: 7, tone: "bg-ink" },
    { label: d.planned, value: 12, tone: "bg-line-strong" },
    { label: d.remaining, value: 5, tone: "bg-signal" },
  ];
  return (
    <div data-k={k} style={style} className={`rounded-[18px] bg-white p-5 shadow-[var(--shadow-lg)] ring-1 ring-line ${className}`}>
      <p className="text-[14px] font-semibold text-ink">{d.summary}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-[44px] font-semibold leading-none text-ink"><Count value={58} />%</span>
        <span className="pb-1 text-[13px] text-slate">{d.progress}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-cloud">
        <div data-grow="x" className="h-full w-[58%] rounded-full bg-signal" />
      </div>
      <dl className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-[13.5px]">
            <span className={`h-2 w-2 rounded-full ${r.tone}`} aria-hidden="true" />
            <dt className="flex-1 text-slate">{r.label}</dt>
            <dd className="font-mono font-medium text-ink"><Count value={r.value} /></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ExportCard({ d, style, k, className = "" }: { d: DashLabels; style?: CSSProperties; k?: StateKey; className?: string }) {
  const gid = `dgrid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div data-k={k} style={style} className={`rounded-[18px] bg-white p-4 shadow-[var(--shadow-lg)] ring-1 ring-line ${className}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-soft text-signal" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" /></svg>
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">{d.export}</p>
          <p className="text-[12px] leading-snug text-slate">{d.exportNote}</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-[#fbfbfa] p-2 ring-1 ring-line">
        <svg viewBox="0 0 300 150" className="block h-auto w-full" aria-hidden="true">
          <defs>
            <pattern id={gid} width="15" height="15" patternUnits="userSpaceOnUse">
              <path d="M15 0H0V15" fill="none" stroke="#e2e5e8" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="300" height="150" fill={`url(#${gid})`} />
          <path d="M20 125 L280 25" stroke="#111417" strokeWidth="1.4" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = 30 + i * 30, y = 121 - i * 11.6;
            return (
              <g key={i} data-pop>
                <path d={`M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`} stroke={i < 6 ? "#d7261e" : "#8a929b"} strokeWidth="1.6" />
                <text x={x + 6} y={y + 16} fontSize="8" fill="#5b636c" fontFamily="var(--font-code)">{`H-${String(i + 1).padStart(2, "0")}`}</text>
              </g>
            );
          })}
          <rect x="196" y="112" width="96" height="30" fill="#fff" stroke="#111417" strokeWidth="0.8" />
          <path d="M196 124 h96" stroke="#111417" strokeWidth="0.6" />
          <rect x="202" y="116" width="40" height="4" fill="#111417" />
          <rect x="202" y="130" width="70" height="3" fill="#8a929b" />
          <rect x="202" y="136" width="50" height="3" fill="#8a929b" />
        </svg>
      </div>
      <p className="mt-2 text-[12px] font-medium text-graphite">{d.drawing}</p>
    </div>
  );
}

/* ---------- management tiles ---------- */

function Tile({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div data-tile className={`flex flex-col rounded-[18px] bg-white p-5 shadow-[var(--shadow)] ring-1 ring-line ${className}`}>
      <p className="text-[16px] font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

const HOURS = [6.5, 7.2, 5.8, 7.6, 6.9, 3.1, 0];

export function ActivityTile({ d, className }: { d: DashLabels; className?: string }) {
  const trucks = [
    { id: "Truck 07", st: d.drilling, c: "bg-signal", live: "ping" as const },
    { id: "Truck 03", st: d.idle, c: "bg-[#e0a325]", live: "blink" as const },
    { id: "Truck 12", st: d.offline, c: "bg-steel", live: undefined },
  ];
  const max = 8;
  return (
    <Tile title={d.activity} className={className}>
      <ul className="mt-3 space-y-2">
        {trucks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-[14px]">
            <StatusDot className={t.c} live={t.live} />
            <span className="font-medium text-ink">{t.id}</span>
            <span className="ml-auto text-slate">{t.st}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-slate">{d.hoursWeek}</p>
      <div className="mt-2 flex h-[92px] items-end gap-2" aria-hidden="true">
        {HOURS.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div data-grow="y" className={`relative w-full rounded-md ${i === 4 ? "bg-signal bar-live" : "bg-ink/85"}`} style={{ height: `${Math.max(4, (h / max) * 70)}px` }} />
            <span className="text-[10.5px] text-steel">{d.days[i]}</span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

export function PlanningTile({ d, className }: { d: DashLabels; className?: string }) {
  const rows = [
    { n: "Site A", p: 100 },
    { n: "Site B", p: 58 },
    { n: "Site C", p: 25 },
    { n: "Site D", p: 0 },
  ];
  return (
    <Tile title={d.planning} className={className}>
      <ul className="mt-5 space-y-5">
        {rows.map((r) => (
          <li key={r.n}>
            <div className="flex justify-between text-[14px]">
              <span className="font-medium text-ink">{r.n}</span>
              <span className="font-mono text-slate"><Count value={r.p} />%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cloud">
              <div data-grow="x" className={`h-full rounded-full ${r.p === 100 ? "bg-ink" : "bg-signal"} ${r.p > 0 && r.p < 100 ? "bar-live" : ""}`} style={{ width: `${r.p}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-2 pt-4 text-[12.5px] text-slate">
        <span className="h-2 w-2 rounded-full bg-line-strong" aria-hidden="true" />
        {d.planned}: 5 {d.holes.toLowerCase()}
      </div>
    </Tile>
  );
}

export function StaffTile({ d, className }: { d: DashLabels; className?: string }) {
  const staff = [
    { i: "KV", r: d.operator, h: 7.5 },
    { i: "SP", r: d.crew, h: 7.0 },
    { i: "TL", r: d.crew, h: 6.5 },
    { i: "BK", r: d.operator, h: 6.0 },
  ];
  return (
    <Tile title={d.staff} className={className}>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-[40px] font-semibold leading-none text-ink"><Count value={6} /></span>
        <span className="flex items-center gap-1.5 pb-0.5 text-[12.5px] text-slate"><StatusDot className="bg-signal" live="ping" />{d.onShift}</span>
      </div>
      <ul className="mt-5 space-y-3">
        {staff.map((s) => (
          <li key={s.i} className="flex items-center gap-2.5 text-[14px]">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[10.5px] font-semibold text-white">
              {s.i}
              <span className="live-blink absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#1f8a5b] ring-2 ring-white" style={{ animationDelay: `${staff.indexOf(s) * 0.4}s` }} aria-hidden="true" />
            </span>
            <span className="text-slate">{s.r}</span>
            <span className="ml-auto font-mono text-ink"><Count value={s.h} decimals={1} /> h</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

export function BusinessTile({ d, className }: { d: DashLabels; className?: string }) {
  return (
    <Tile title={d.business} className={className}>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-mist p-3">
          <dt className="text-[13px] text-slate">{d.jobs}</dt>
          <dd className="font-display text-[30px] font-semibold text-ink"><Count value={3} /></dd>
        </div>
        <div className="rounded-xl bg-mist p-3">
          <dt className="text-[13px] text-slate">{d.utilisation}</dt>
          <dd className="font-display text-[30px] font-semibold text-ink"><Count value={72} />%</dd>
        </div>
      </dl>
      <svg viewBox="0 0 240 70" className="mt-auto h-auto w-full pt-4" aria-hidden="true">
        <path data-draw pathLength={1} d="M0 58 L30 50 L60 54 L90 38 L120 42 L150 28 L180 30 L210 16 L240 20" fill="none" stroke="#d7261e" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M0 58 L30 50 L60 54 L90 38 L120 42 L150 28 L180 30 L210 16 L240 20 V70 H0Z" fill="#d7261e" opacity="0.07" data-fade="0.07" />
        <circle className="pulse-ring" cx="240" cy="20" r="5" fill="none" stroke="#d7261e" strokeWidth="2" />
        <circle data-pop cx="240" cy="20" r="4" fill="#d7261e" stroke="#fff" strokeWidth="2" />
        <circle r="3" fill="#fff" stroke="#d7261e" strokeWidth="1.5" className="motion-only">
          <animateMotion dur="3s" repeatCount="indefinite" path="M0 58 L30 50 L60 54 L90 38 L120 42 L150 28 L180 30 L210 16 L240 20" />
        </circle>
      </svg>
    </Tile>
  );
}
