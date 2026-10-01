/** Round half away from zero to `decimals` places, avoiding float drift like 1.005 → 1. */
export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return (Math.sign(value) * Math.round(Math.abs(value) * factor + Number.EPSILON)) / factor;
}

export function roundTo(value: number, step: number): number {
  return round(value / step) * step;
}
