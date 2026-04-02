import { useColorScheme } from 'react-native'
import { useSettingsStore } from '@/store/useSettingsStore'
import { palette, surfaceThemes } from '@/theme'

/**
 * Single source of truth for theme derivation.
 * Replaces the isDark + c pattern repeated across all screens.
 */
export function useThemeColors() {
  const colorScheme = useColorScheme()
  const theme = useSettingsStore((state) => state.theme)
  const surfaceStyle = useSettingsStore((state) => state.surfaceStyle)
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark')
  const surfaces = surfaceThemes[surfaceStyle]
  return { isDark, c: isDark ? surfaces.dark : surfaces.light, palette }
}
