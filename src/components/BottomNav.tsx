import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useThemeColors } from '@/hooks/useThemeColors'
import { palette, spacing } from '@/theme'

type NavKey = 'home' | 'practice' | 'exam' | 'questions'

interface BottomNavProps {
  active: NavKey
}

const ITEMS: { key: NavKey; label: string; icon: string; route: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠', route: '/' },
  { key: 'questions', label: 'Questions', icon: '🗂', route: '/questions' },
  { key: 'practice', label: 'Practice', icon: '📚', route: '/practice' },
  { key: 'exam', label: 'Exam', icon: '📋', route: '/exam' },
]

export function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()
  const { c } = useThemeColors()

  return (
    <View style={[styles.nav, { backgroundColor: c.card, borderTopColor: c.border }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active
        return (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navItem,
              {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
              },
            ]}
            onPress={() => {
              if (!isActive) router.replace(item.route as never)
            }}
          >
            <Text style={[styles.navIcon, { opacity: isActive ? 1 : 0.9 }]}>{item.icon}</Text>
            <Text style={[styles.navLabel, { color: isActive ? '#111111' : c.textMuted }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 14,
  },
  navIcon: {
    fontSize: 19,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
