import appConfig from '@/config/app.config'

export const surfaceThemes = {
  cream: {
    light: {
      bg: '#f5f5f5',
      card: '#ffffff',
      border: '#d9d9d9',
      textPrimary: '#111111',
      textSecond: '#3a3a3a',
      textMuted: '#7a7a7a',
      statusBar: 'dark' as const,
    },
    dark: {
      bg: '#050505',
      card: '#111111',
      border: '#272727',
      borderSub: '#3a3a3a',
      textPrimary: '#ffffff',
      textSecond: '#d0d0d0',
      textMuted: '#8d8d8d',
      statusBar: 'light' as const,
    },
  },
  bluegray: {
    light: {
      bg: '#eef1f3',
      card: '#ffffff',
      border: '#d7dde2',
      textPrimary: '#111111',
      textSecond: '#3f4a52',
      textMuted: '#7f8a92',
      statusBar: 'dark' as const,
    },
    dark: {
      bg: '#06080a',
      card: '#14181c',
      border: '#2a3137',
      borderSub: '#3c4650',
      textPrimary: '#ffffff',
      textSecond: '#d1d7dc',
      textMuted: '#89939b',
      statusBar: 'light' as const,
    },
  },
} as const

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

  light: surfaceThemes.cream.light,
  dark: surfaceThemes.cream.dark,
}

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
