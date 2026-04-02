import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeColors } from '@/hooks/useThemeColors'
import { spacing } from '@/theme'

export type NavKey = 'home' | 'study' | 'practice' | 'exam'

interface BottomNavProps {
  active: NavKey
}

const ITEMS: {
  key: NavKey
  label: string
  route: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
}[] = [
  { key: 'home',     label: 'Home',     route: '/',          icon: 'home-outline',      iconActive: 'home' },
  { key: 'study',    label: 'Study',    route: '/study',     icon: 'book-outline',      iconActive: 'book' },
  { key: 'practice', label: 'Practice', route: '/practice',  icon: 'clipboard-outline', iconActive: 'clipboard' },
  { key: 'exam',     label: 'Exam',     route: '/exam',      icon: 'timer-outline',     iconActive: 'timer' },
]

export function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()
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
            onPress={() => { if (!isActive) router.replace(item.route as never) }}
          >
            <Ionicons
              name={isActive ? item.iconActive : item.icon}
              size={22}
              color={color}
            />
            <Text style={[styles.navLabel, { color }]}>{item.label}</Text>
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
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
