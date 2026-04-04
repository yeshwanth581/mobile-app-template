import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useSettingsStore } from '@/store/useSettingsStore'
import { palette, semanticLight, semanticDark } from '@/theme'

/**
 * Single source of truth for theme derivation.
 * Returns semantic color tokens (c.btnPrimaryBg, c.optionBg, etc.)
 * so screens never hardcode hex values.
 */
export function useThemeColors() {
  const colorScheme = useColorScheme()
  const theme = useSettingsStore((state) => state.theme)

  return useMemo(() => {
    const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark')
    return { isDark, c: isDark ? semanticDark : semanticLight, palette }
  }, [theme, colorScheme])
}
