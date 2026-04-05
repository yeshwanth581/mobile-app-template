import { View, Text, StyleSheet } from 'react-native'
import { semanticLight, semanticDark, spacing, radius } from '@/theme'

interface Props {
  current: number   // 0-based index
  total: number
  isDark: boolean
  label?: string    // optional left label override
}

export function ProgressBar({ current, total, isDark, label }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0
  const s = isDark ? semanticDark : semanticLight

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: s.textSecond }]}>
          {label ?? `Question ${current + 1} / ${total}`}
        </Text>
        <Text style={[styles.pct, { color: s.btnPrimaryBg }]}>
          {Math.round(pct)}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: s.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: s.btnPrimaryBg }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { fontSize: 12, fontWeight: '600' },
  pct:   { fontSize: 11, fontWeight: '700' },
  track: { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: radius.full },
})
