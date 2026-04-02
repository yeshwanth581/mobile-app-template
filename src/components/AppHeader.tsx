import { startTransition } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { palette, radius, spacing, typography } from '@/theme'

interface AppHeaderProps {
  title?: string
  canGoBack?: boolean
}

export function AppHeader({ title, canGoBack }: AppHeaderProps) {
  const router = useRouter()
  const { isDark, c } = useThemeColors()
  const translationLocale = useSettingsStore((state) => state.translationLocale)
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  const themeLabel = theme === 'system' ? (isDark ? 'Dark' : 'Light') : theme === 'dark' ? 'Dark' : 'Light'

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {canGoBack ? (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.iconText, { color: c.textSecond }]}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      <View style={styles.center}>
        {!!title && (
          <Text numberOfLines={1} style={[typography.h3, styles.title, { color: c.textPrimary }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => router.navigate('/language')}
          >
            <Text style={[typography.tiny, { color: c.textSecond }]}>
              🌐 {translationLocale.toUpperCase()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => startTransition(() => setTheme(isDark ? 'light' : 'dark'))}
          >
            <Text style={[typography.tiny, { color: c.textSecond }]}>
              {isDark ? '☀️' : '🌙'} {themeLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  left: {
    minWidth: 72,
    alignItems: 'flex-start',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    minWidth: 72,
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
  },
})
