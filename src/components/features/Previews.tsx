import type { DashLabels } from "@/components/story/Dashboard";
import { ActivityTile, BusinessTile, Count, ExportCard, LivePill, MapView, PlanningTile, SummaryCard, Window } from "@/components/story/Dashboard";
import { MotionInView } from "@/components/story/MotionInView";
import { Icon, type IconName } from "@/components/icons/Icon";

type P = { d: DashLabels; p: (k: string) => string; diagram?: string };

/** Interface previews for the Features page. All values are sample data. */

export function MonitoringPreview({ d, p, diagram }: P) {
  const chain: { icon: IconName; label: string }[] = (diagram ?? "").split("→").map((x, i) => ({ icon: (["signal", "cpu", "chart"] as IconName[])[i], label: x.trim() }));
  const rows = [
    { id: "Truck 07", st: d.online, dot: "bg-signal", h: 6.5, seen: p("now") },
    { id: "Truck 03", st: p("idle"), dot: "bg-amber", h: 4.2, seen: p("now") },
    { id: "Truck 12", st: p("offline"), dot: "bg-steel", h: 0, seen: "11:52" },
  ];
  return (
    <MotionInView kinds={["charts"]} className="space-y-4">
      <ol className="flex items-center justify-between gap-2 rounded-[18px] bg-surface p-4 ring-1 ring-line sm:p-5" aria-label={diagram}>
        {chain.map((c, i) => (
          <li key={c.label} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${i === 2 ? "bg-signal text-white" : "bg-mist text-ink"}`}>
              <Icon name={c.icon} size={20} />
            </span>
            <span className="min-w-0 break-words text-[13px] font-semibold text-ink sm:text-[13.5px]">{c.label}</span>
            {i < chain.length - 1 && <span className="flow-line mx-1 hidden h-0.5 flex-1 sm:block" style={{ animationDelay: `${i * 0.4}s` }} aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <div className="overflow-hidden rounded-[18px] bg-surface ring-1 ring-line">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-mist text-[12px] text-slate">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">{d.truckId.replace(/\s*\d+$/, "")}</th>
              <th scope="col" className="px-4 py-2.5 font-medium">{p("status")}</th>
              <th scope="col" className="px-4 py-2.5 font-medium">{p("hours")}</th>
              <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">{p("lastSeen")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-ink">{r.id}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-2 text-graphite"><span className={`h-2 w-2 rounded-full ${r.dot}`} aria-hidden="true" />{r.st}</span></td>
                <td className="px-4 py-3 font-mono text-ink">
                  <span className="flex items-center gap-3">
                    <span className="w-12 shrink-0"><Count value={r.h} decimals={1} /> h</span>
                    <span className="hidden h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-cloud sm:block" aria-hidden="true">
                      <span data-grow="x" className={`block h-full rounded-full ${r.dot}`} style={{ width: `${(r.h / 8) * 100}%` }} />
                    </span>
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-slate sm:table-cell">{r.seen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MotionInView>
  );
}

export function MappingPreview({ d, p }: P) {
  return (
    <Window title={d.liveMap} badge={<LivePill label={d.online} />}>
      <MotionInView kinds={["holes"]}>
        <MapView d={d} styleOf={(k) => (k === "selection" ? { display: "none" } : {})} />
      </MotionInView>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-4 py-3 text-[12.5px] text-slate">
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-ink" aria-hidden="true" />{p("drilled")}</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-steel" aria-hidden="true" />{p("plannedPositions")}</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />{d.truckId}</li>
      </ul>
    </Window>
  );
}

export function PlanningPreview({ d }: P) {
  return (
    <MotionInView kinds={["charts"]} className="grid gap-4 sm:grid-cols-2">
      <SummaryCard d={d} />
      <ExportCard d={d} />
      <PlanningTile d={d} className="sm:col-span-2" />
    </MotionInView>
  );
}

export function StaffPreview({ d, p }: P) {
  const rows = [
    { i: "KV", role: p("operator"), a: "Site B", h: 7.5 },
    { i: "SP", role: p("crew"), a: "Site B", h: 7.0 },
    { i: "TL", role: p("crew"), a: "Site C", h: 6.5 },
    { i: "BK", role: p("operator"), a: "Site A", h: 6.0 },
  ];
  return (
    <MotionInView kinds={["charts"]} className="overflow-hidden rounded-[18px] bg-surface ring-1 ring-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-[15px] font-semibold text-ink">{d.staff}</p>
        <span className="rounded-full bg-mist px-2.5 py-1 text-[12px] text-slate"><Count value={6} /> {d.onShift}</span>
      </div>
      <table className="w-full text-left text-[13.5px]">
        <thead className="text-[12px] text-slate">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">{p("name")}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{p("role")}</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">{p("hoursToday")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.i}>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">{r.i}</span>
                  <span className="text-graphite">{r.role}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-slate">{r.a}</td>
              <td className="px-4 py-3 font-mono text-ink">
                <span className="flex items-center justify-end gap-3">
                  <span className="hidden h-1.5 w-full max-w-[110px] overflow-hidden rounded-full bg-cloud sm:block" aria-hidden="true">
                    <span data-grow="x" className="block h-full rounded-full bg-[var(--chart-neutral)]" style={{ width: `${(r.h / 8) * 100}%` }} />
                  </span>
                  <span className="w-12 shrink-0 text-right"><Count value={r.h} decimals={1} /> h</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MotionInView>
  );
}

export function BusinessPreview({ d }: P) {
  return (
    <MotionInView kinds={["charts"]} className="grid gap-4 sm:grid-cols-2">
      <BusinessTile d={d} />
      <ActivityTile d={d} />
    </MotionInView>
  );
}
