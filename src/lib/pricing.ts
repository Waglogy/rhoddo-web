// Display helpers for Rhoddo's host pricing. The backend's lib/fees.ts decides what's charged:
// each booking costs the host a percentage of what the buyer paid, set by an admin.
export const TYPICAL_COMMISSION_RANGE = { min: 5, max: 10 };
export const MAX_COMMISSION_PERCENT = 50;

/** 7.5 -> "7.5%", 8 -> "8%". */
export function formatPercent(percent: number): string {
  return `${Number(percent.toFixed(2))}%`;
}
