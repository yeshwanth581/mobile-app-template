import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'react'
import { ExamIcon, HomeIcon, PracticeIcon, StudyIcon } from '@/components/AppIcons'
import { useThemeColors } from '@/hooks/useThemeColors'
import { hapticSelection } from '@/hooks/useHaptics'
import { spacing } from '@/theme'

export type NavKey = 'home' | 'study' | 'practice' | 'exam'

interface BottomNavProps {
  active: NavKey
}

const ITEMS: {
  key: NavKey
  labelKey: 'nav.home' | 'nav.study' | 'nav.practice' | 'nav.exam'
  route: string
  Icon: ({ color, size }: { color: string; size?: number }) => ReactElement
}[] = [
  { key: 'home',     labelKey: 'nav.home',     route: '/',         Icon: HomeIcon },
  { key: 'study',    labelKey: 'nav.study',    route: '/study',    Icon: StudyIcon },
  { key: 'practice', labelKey: 'nav.practice', route: '/practice', Icon: PracticeIcon },
  { key: 'exam',     labelKey: 'nav.exam',     route: '/exam',     Icon: ExamIcon },
]

export function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { c } = useThemeColors()

  return (
    <View style={[styles.nav, { backgroundColor: c.bg, borderTopColor: c.border }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active
        const color = isActive ? c.textPrimary : c.textMuted
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => { if (!isActive) { hapticSelection(); router.navigate(item.route as never) } }}
            activeOpacity={0.85}
          >
            <item.Icon color={color} size={24} />
            <Text style={[styles.navLabel, { color }]}>{t(item.labelKey)}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingBottom: 26,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 44,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
})
