/**
 * Design tokens, taken from the owner's Lovable design (`src/styles.css`, OKLCH converted to
 * sRGB hex). Screens and components must read colours, spacing, radii and type from this file,
 * never hardcode them.
 */
export const colors = {
  background: '#F7F7F1',
  /** Outer page colour around the app frame in the design. */
  neutralTrack: '#DCE4DC',
  card: '#FFFFFF',
  text: '#142219',
  textMuted: '#5D6E64',
  primary: '#165135',
  onPrimary: '#FFFFFF',
  secondary: '#EBF3EA',
  muted: '#EBF3EA',
  accent: '#9CC63A',
  accentSoft: '#EBF3D4',
  accentLight: '#E4C878',
  inkPanel: '#083A23',
  /** Prices and money. */
  commerce: '#ED990E',
  commerceSoft: '#FFE9C7',
  success: '#9CC63A',
  successSoft: '#DEF0C1',
  danger: '#C93029',
  border: '#DCE4DC',
} as const;

export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 38 },
  title: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 33 },
  number: { fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 44 },
  heading: { fontFamily: fonts.displayBold, fontSize: 20, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  /** Checkbox / selection squares. */
  sm: 7,
  /** Inputs and buttons. */
  md: 14,
  lg: 16,
  /** Cards. */
  xl: 24,
} as const;

export const shadows = {
  card: '0 8px 24px rgba(22, 81, 53, 0.07)',
  sheet: '0 18px 45px rgba(22, 81, 53, 0.18)',
} as const;

/** Height of text inputs and primary buttons. */
export const CONTROL_HEIGHT = 52;

/** Minimum touch target for anything tappable. */
export const MIN_TOUCH_SIZE = 44;
