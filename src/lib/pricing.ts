// Placeholder prices from the PRD; they are pending client approval.
export const homeTypes = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa"] as const;
export type HomeType = (typeof homeTypes)[number];

export const basePrices: Record<HomeType, number> = {
  "1 BHK": 380000,
  "2 BHK": 620000,
  "3 BHK": 900000,
  "4 BHK": 1250000,
  Villa: 2000000,
};

export const finishLevels = [
  { id: "essential", label: "Essential", multiplier: 1.0, note: "Practical laminate-led finishes" },
  { id: "premium", label: "Premium", multiplier: 1.5, note: "Richer veneers, matte and PU finishes" },
  { id: "luxe", label: "Luxe", multiplier: 2.2, note: "Premium veneers and detailed fluting" },
] as const;
export type FinishLevelId = (typeof finishLevels)[number]["id"];

export const addOns = [
  { id: "ceiling", label: "Full false ceiling", price: 120000 },
  { id: "panelling", label: "Wall panelling and wallpaper", price: 90000 },
  { id: "painting", label: "Full-home painting", price: 60000 },
] as const;
export type AddOnId = (typeof addOns)[number]["id"];

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function formatLakh(value: number) {
  return `₹${(value / 100000).toFixed(1)}L`;
}

export function formatRange(low: number, high: number) {
  return `${formatLakh(low)} – ${(high / 100000).toFixed(1)}L`;
}

export function formatRupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export type Estimate = {
  base: number;
  finishCost: number;
  addOnTotal: number;
  mid: number;
  low: number;
  high: number;
  discountLow: number;
  discountHigh: number;
  emi: number;
};

export function calculateEstimate(
  home: HomeType,
  finish: FinishLevelId,
  selectedAddOns: readonly AddOnId[],
): Estimate {
  const base = basePrices[home];
  const multiplier = finishLevels.find((level) => level.id === finish)?.multiplier ?? 1;
  const finishCost = base * multiplier;
  const addOnTotal = addOns
    .filter((addOn) => selectedAddOns.includes(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);
  const mid = finishCost + addOnTotal;
  const low = roundTo(mid * 0.92, 10000);
  const high = roundTo(mid * 1.08, 10000);

  const monthlyRate = 0.12 / 12;
  const months = 36;
  const emi = roundTo(
    (mid * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1),
    100,
  );

  return {
    base,
    finishCost,
    addOnTotal,
    mid,
    low,
    high,
    discountLow: roundTo(mid * 0.92 * 0.9, 10000),
    discountHigh: roundTo(mid * 1.08 * 0.9, 10000),
    emi,
  };
}

export const isValidIndianMobile = (value: string) => /^[6-9][0-9]{9}$/.test(value);
