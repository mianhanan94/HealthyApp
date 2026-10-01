/**
 * Placeholder design tokens. The real design is still to come: when it arrives, change the
 * values here. Screens and components must read colours, spacing and type from this file,
 * never hardcode them.
 */
export const colors = {
  background: '#FFFFFF',
  surface: '#F4F4F5',
  border: '#D4D4D8',
  text: '#18181B',
  textMuted: '#71717A',
  primary: '#18181B',
  onPrimary: '#FFFFFF',
  danger: '#B91C1C',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;

/** Minimum touch target for anything tappable. */
export const MIN_TOUCH_SIZE = 44;
