import type { BuildChange } from '@healthyapp/shared';
import type { TFunction } from 'i18next';

const MINUS = '−';

export function formatMoney(rupees: number): string {
  const sign = rupees < 0 ? MINUS : '';
  return `${sign}Rs ${Math.abs(rupees).toLocaleString('en-PK')}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-PK');
}

/** "+40" / "−275" with a real minus sign; 0 stays "0". */
export function formatSigned(value: number): string {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `${MINUS}${formatNumber(Math.abs(value))}`;
  return '0';
}

/** "21 Jan 2027". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Whole grams for display; nutrition is stored to 0.1 g. */
export function grams(value: number): number {
  return Math.round(value);
}

/** "+40 kcal · +Rs 40", "−60 kcal" or "—" for an option's cost, shown before tapping. */
export function formatOptionCost(kcal: number, price: number, none: string): string {
  const parts: string[] = [];
  if (Math.round(kcal) !== 0) parts.push(`${formatSigned(Math.round(kcal))} kcal`);
  if (price !== 0) parts.push(`${price > 0 ? '+' : MINUS}Rs ${formatNumber(Math.abs(price))}`);
  return parts.length ? parts.join(' · ') : none;
}

/** "almond milk · 3 × Whey · no sauce" for cart lines and labels. */
export function describeChanges(t: TFunction, changes: BuildChange[]): string {
  return changes
    .map((c) =>
      c.kind === 'count'
        ? t('meal.change.count', { count: c.count, name: c.name })
        : t(`meal.change.${c.kind}`, { name: c.name }),
    )
    .join(' · ');
}
