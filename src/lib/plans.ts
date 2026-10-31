// Subscription plans shown on the Pricing page.
// Source: plan rules and LAK prices from the MingAnji portal prototype, with
// vehicle limits, tier names and per-language currencies confirmed by the owner
// on 31 Oct 2026. See HANDOFF.md.

export type PlanId = "basic" | "pro" | "premium" | "enterprise";

/** Each site language shows and bills prices in its own currency. */
export const CURRENCY = { lo: "LAK", en: "USD", th: "THB", vi: "VND", zh: "CNY" } as const;
export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];

type Prices = Record<Currency, number>;

export type Plan = {
  id: PlanId;
  /** Monthly price per currency. 0 = free, null = price on request. */
  price: Prices | 0 | null;
  featured?: boolean;
};

// Fixed price list. LAK prices were confirmed by the owner; the others are
// rounded conversions at rates of 30 Oct 2026 (US$1 ≈ 22,520 LAK, 33.7 THB,
// 25,800 VND, 6.65 CNY). Edit these directly when prices change.
export const PLANS: Plan[] = [
  { id: "basic", price: 0 },
  { id: "pro", price: { LAK: 200_000, USD: 9, THB: 299, VND: 229_000, CNY: 59 } },
  { id: "premium", price: { LAK: 500_000, USD: 22, THB: 749, VND: 575_000, CNY: 148 }, featured: true },
  { id: "enterprise", price: null },
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
