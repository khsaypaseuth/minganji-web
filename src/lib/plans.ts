// Subscription plans shown on the Pricing page.
// Source: plan rules and prices from the MingAnji portal prototype, with vehicle
// limits and tier names confirmed by the owner on 31 Oct 2026. See HANDOFF.md.

export type PlanId = "basic" | "pro" | "premium" | "enterprise";

export type Plan = {
  id: PlanId;
  /** Monthly price in Lao kip. 0 = free, null = price on request. */
  priceLak: number | null;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  { id: "basic", priceLak: 0 },
  { id: "pro", priceLak: 200_000 },
  { id: "premium", priceLak: 500_000, featured: true },
  { id: "enterprise", priceLak: null },
];

/** A comparison cell: true/false for included, or a translation key under pricing.compare.values. */
export type Cell = boolean | string;

export const COMPARE: { group: string; rows: { key: string; cells: [Cell, Cell, Cell, Cell] }[] }[] = [
  {
    group: "fleet",
    rows: [
      { key: "vehicles", cells: ["v1", "v3", "v10", "v10plus"] },
      { key: "history", cells: ["d7", "d90", "y1", "custom"] },
    ],
  },
  {
    group: "tracking",
    rows: [
      { key: "liveMap", cells: [true, true, true, true] },
      { key: "timeline", cells: [true, true, true, true] },
      { key: "trucks", cells: [true, true, true, true] },
    ],
  },
  {
    group: "reports",
    rows: [
      { key: "distances", cells: [false, true, true, true] },
      { key: "workTime", cells: [false, true, true, true] },
    ],
  },
  {
    group: "drilling",
    rows: [
      { key: "holes", cells: [false, false, true, true] },
      { key: "polePins", cells: [false, false, true, true] },
      { key: "cad", cells: [false, false, true, true] },
    ],
  },
];
