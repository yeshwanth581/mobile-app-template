import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useSettingsStore } from '@/store/useSettingsStore'
import { palette, surfaceThemes } from '@/theme'

/**
 * Single source of truth for theme derivation.
 * Memoized so the returned object reference is stable when theme hasn't changed,
 * preventing unnecessary child re-renders.
 */
export function useThemeColors() {
  const colorScheme = useColorScheme()
  const theme = useSettingsStore((state) => state.theme)
  const surfaceStyle = useSettingsStore((state) => state.surfaceStyle)

  return useMemo(() => {
    const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark')
    const surfaces = surfaceThemes[surfaceStyle]
    return { isDark, c: isDark ? surfaces.dark : surfaces.light, palette }
  }, [theme, surfaceStyle, colorScheme])
}
