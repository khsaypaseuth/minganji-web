"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { styleFor, TRUCK_VIEW, type StateKey } from "./states";
import { TruckIllustration } from "./TruckIllustration";
import { buildDashLabels, ActivityTile, BusinessTile, ExportCard, LivePill, MapView, PlanningTile, StaffTile, SummaryCard, Window, type DashLabels } from "./Dashboard";

export const CANVAS_W = 1000;
export const CANVAS_H = 820;

/** Scales a fixed 1000 × 820 canvas to the width of its container. */
export function StageCanvas({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / CANVAS_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={`relative w-full ${className}`} style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale ?? 0.5})`, visibility: scale === null ? "hidden" : "visible" }}
      >
        {children}
      </div>
    </div>
  );
}

export function useDashLabels(): DashLabels {
  return buildDashLabels(useTranslations("home.story.dash"), useTranslations("features.preview"), useTranslations("common"));
}

/**
 * The complete visual composition. In "animated" mode it renders scene 0 and
 * the GSAP timeline (Story.tsx) takes over; in static mode it renders the
 * final state of the given scene.
 */
export function StoryStage({ scene = 0 }: { scene?: number }) {
  const t = useTranslations("home.story");
  const d = useDashLabels();
  const s = (k: StateKey) => styleFor(k, scene);
  const L = (k: string) => t(`labels.${k}`);

  return (
    <StageCanvas>
      {/* S6 connectors (map → tiles) */}
      <svg data-k="links6" style={s("links6")} className="pointer-events-none absolute inset-0" width={CANVAS_W} height={CANVAS_H} aria-hidden="true">
        {["M561 197 H609", "M150 370 V418", "M400 370 C 400 396, 505 392, 505 418", "M540 370 C 540 396, 830 392, 830 418"].map((p) => (
          <g key={p}>
            <path d={p} fill="none" stroke="#d7261e" strokeWidth="2.5" className="flow-dash" />
          </g>
        ))}
      </svg>

      {/* Map window */}
      <Window
        k="map"
        title={d.liveMap}
        badge={<LivePill label={d.online} />}
        className="absolute left-[230px] top-[270px] w-[746px] origin-top-left"
        style={s("map")}
      >
        <MapView d={d} styleOf={s} />
      </Window>

      {/* S6 tiles */}
      <div data-k="tiles" style={s("tiles")} className="absolute inset-0">
        <ActivityTile d={d} className="absolute left-[609px] top-[24px] h-[346px] w-[367px]" />
        <PlanningTile d={d} className="absolute left-[24px] top-[418px] h-[378px] w-[306px]" />
        <StaffTile d={d} className="absolute left-[354px] top-[418px] h-[378px] w-[306px]" />
        <BusinessTile d={d} className="absolute left-[684px] top-[418px] h-[378px] w-[292px]" />
      </div>

      {/* S5 cards */}
      <SummaryCard k="summary" d={d} style={s("summary")} className="absolute left-[24px] top-[500px] w-[300px]" />
      <ExportCard k="export" d={d} style={s("export")} className="absolute left-[640px] top-[520px] w-[336px]" />

      {/* Truck layer */}
      <div data-k="truck" style={s("truck")} className="absolute left-0 top-[110px] h-[583px] w-[1000px] origin-top-left">
        <div data-k="truckBg" style={s("truckBg")} className="absolute -inset-6 rounded-[56px] bg-white shadow-[0_60px_120px_-40px_rgb(17_20_23/0.35)] ring-[3px] ring-line" />
        <div className="relative h-full w-full">
        <TruckIllustration
          viewBox={TRUCK_VIEW[scene]}
          labels={{
            gnss: L("gnss"), gnssNote: L("gnssNote"), boom: L("boom"), drill: L("drill"), hours: L("hours"),
            controller: L("controller"), location: L("location"), activity: L("activity"), hoursShort: L("hoursShort"),
          }}
          styleOf={s}
          title={t("stageLabel")}
          intro={scene === 0}
        />
        </div>
      </div>

      {/* controller → map link (S4–S5) */}
      <svg data-k="link" style={s("link")} className="pointer-events-none absolute inset-0" width={CANVAS_W} height={CANVAS_H} aria-hidden="true">
        <path d="M227 151 C 420 140, 620 300, 682 495" fill="none" stroke="#d7261e" strokeOpacity="0.2" strokeWidth="8" strokeLinecap="round" />
        <path d="M227 151 C 420 140, 620 300, 682 495" fill="none" stroke="#d7261e" strokeWidth="2.5" className="flow-dash" />
        <circle r="6" fill="#d7261e" className="motion-only">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M227 151 C 420 140, 620 300, 682 495" />
        </circle>
        <circle cx="227" cy="151" r="6" fill="#d7261e" />
      </svg>
    </StageCanvas>
  );
}
