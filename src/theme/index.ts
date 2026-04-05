import appConfig from '@/config/app.config'

// Surface colors — the base layer that semantic tokens extend
const surface = {
  light: {
    bg: '#f5f5f5',
    card: '#ffffff',
    border: '#d9d9d9',
    textPrimary: '#111111',
    textSecond: '#3a3a3a',
    textMuted: '#7a7a7a',
  },
  dark: {
    bg: '#050505',
    card: '#111111',
    border: '#272727',
    textPrimary: '#ffffff',
    textSecond: '#d0d0d0',
    textMuted: '#8d8d8d',
  },
}

export const palette = {
  primary:     appConfig.primaryColor,
  primaryDim:  appConfig.primaryColor + '22',   // primary at 13% opacity
  primaryLight: appConfig.primaryColor + '15',

  green:       '#22c55e',
  greenLight:  '#dcfce7',
  greenDim:    '#052e16',

  red:         '#ef4444',
  redLight:    '#fee2e2',
  redDim:      '#1f0707',

  amber:       '#f59e0b',
  amberLight:  '#fef3c7',
  amberDim:    '#1c1204',

  amberBadgeBg:  { light: '#fef3c7', dark: '#1c1204' },
  redBadgeBg:    { light: '#fee2e2', dark: '#450a0a' },
  accentBg:      { light: '#eef2ff', dark: '#1e1b4b' },
  accentBgAlt:   { light: '#ede9fe', dark: '#1e1b4b' },
  infoBg:        { light: '#eff6ff', dark: '#1e3a5f' },
  infoBorder:    { light: '#bfdbfe', dark: '#1e40af' },
  infoText:      { light: '#1d4ed8', dark: '#93c5fd' },
  dropdownBg:    { light: '#ffffff', dark: '#0f172a' },
  dropdownText:  { light: '#334155', dark: '#e2e8f0' },
  dropdownBorder:{ light: '#e2e8f0', dark: '#1e293b' },
  imageBg:       { light: '#f8fafc', dark: '#0f172a' },

  light: surface.light,
  dark: surface.dark,
}

// ─── Semantic tokens (light / dark) ──────────────────────────────────────────
// Use these via `useThemeColors().c` — never hardcode the raw hex in screens.

export const semanticLight = {
  ...surface.light,

  // Primary button (dark bg on light)
  btnPrimaryBg:   '#111111',
  btnPrimaryText: '#ffffff',

  // Modal selected item
  selectedBg:     '#111111',
  selectedText:   '#ffffff',

  // Subtle chip/chevron backgrounds
  chipBg:         '#dddddd',
  chipText:       '#666666',

  // Option button colors
  optionBg:           '#f8f8f8',
  optionLetterBg:     '#f1f5f9',
  optionLetterText:   '#475569',
  optionText:         '#1e293b',
  optionCorrectText:  '#15803d',
  optionWrongText:    '#b91c1c',
  translationText:    '#64748b',
}

export const semanticDark = {
  ...surface.dark,

  btnPrimaryBg:   '#ffffff',
  btnPrimaryText: '#111111',

  selectedBg:     '#ffffff',
  selectedText:   '#111111',

  chipBg:         '#333333',
  chipText:       '#aaaaaa',

  optionBg:           '#1a1a1a',
  optionLetterBg:     '#222222',
  optionLetterText:   '#777777',
  optionText:         '#e2e8f0',
  optionCorrectText:  '#4ade80',
  optionWrongText:    '#f87171',
  translationText:    '#94a3b8',
}

// Widened type so light/dark are interchangeable
export type SemanticColors = { [K in keyof typeof semanticLight]: string }

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
}

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
}

export const typography = {
  h1:      { fontSize: 24, fontWeight: '800' as const, lineHeight: 30 },
  h2:      { fontSize: 20, fontWeight: '800' as const, lineHeight: 26 },
  h3:      { fontSize: 17, fontWeight: '700' as const, lineHeight: 22 },
  body:    { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodyLg:  { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  small:   { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  smallBd: { fontSize: 13, fontWeight: '700' as const, lineHeight: 18 },
  tiny:    { fontSize: 11, fontWeight: '600' as const, lineHeight: 16 },
  label:   { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8, lineHeight: 14 },
}
