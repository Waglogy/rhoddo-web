'use client';

import { MAX_COMMISSION_PERCENT, TYPICAL_COMMISSION_RANGE } from '@/lib/pricing';

/** Reads an admin-typed rate, or null when it isn't a number from 0 to 50. */
export function parseCommission(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > MAX_COMMISSION_PERCENT) return null;
  return Math.round(n * 100) / 100;
}

/** A small "8 %" box for Rhoddo's commission. */
export function CommissionInput({
  value,
  onChange,
  disabled,
  label = 'Commission',
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const { min, max } = TYPICAL_COMMISSION_RANGE;
  return (
    <label className="flex items-center gap-1.5 text-xs text-mute">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={MAX_COMMISSION_PERCENT}
        step={0.5}
        placeholder={`${min}–${max}`}
        className="input w-20 py-1.5 text-right"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <span>%</span>
    </label>
  );
}
