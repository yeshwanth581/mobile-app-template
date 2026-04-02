import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faShuffle } from '@fortawesome/free-solid-svg-icons'
import { BottomNav } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import type { SessionConfig } from '@/types'

export default function StudyScreen() {
  const router = useRouter()
  const { c, isDark } = useThemeColors()
  const { progress, getWeakIds, getBookmarked } = useProgressStore()
  const { selectedStateCode } = useSettingsStore()
  const [shuffle, setShuffle] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])

  const studiedCount = useMemo(
    () => Object.values(progress).filter((p) => p.attempts.length > 0).length,
    [progress]
  )

  const accuracyPct = useMemo(() => {
    const allAttempts = Object.values(progress).flatMap((p) => p.attempts)
    if (allAttempts.length === 0) return 0
    const correct = allAttempts.filter((a) => a.result === 'correct').length
    return Math.round((correct / allAttempts.length) * 100)
  }, [progress])

  const weakCount  = getWeakIds().length
  const savedCount = getBookmarked().length

  function launchSession(overrides: Partial<SessionConfig>) {
    const config: SessionConfig = {
      filter: 'all',
      category: null,
      count: relevantQuestions.length,
      shuffle,
      showTranslation: true,
      timed: false,
      mode: 'practice',
      ...overrides,
    }
    router.push({ pathname: '/practice/session', params: { config: JSON.stringify(config) } })
  }

  const categories = useMemo(() => {
    const weakIds = new Set(getWeakIds())
    const cats: { id: string; label: string; emoji: string; count: number; weakCount: number }[] = []

    if (selectedStateCode) {
      const stateQs = getStateQuestions(selectedStateCode)
      cats.push({
        id: selectedStateCode,
        label: getStateLabel(selectedStateCode) ?? selectedStateCode.toUpperCase(),
        emoji: '📍',
        count: stateQs.length,
        weakCount: stateQs.filter((q) => weakIds.has(q.id)).length,
      })
    }

    for (const cat of appConfig.categories) {
      const qs = relevantQuestions.filter((q) => q.category === cat.id)
      cats.push({
        id: cat.id,
        label: cat.label,
        emoji: cat.emoji,
        count: qs.length,
        weakCount: qs.filter((q) => weakIds.has(q.id)).length,
      })
    }
    return cats
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantQuestions, selectedStateCode, progress])

  const shuffleBg     = shuffle ? (isDark ? '#ffffff' : '#111111') : c.card
  const shuffleColor  = shuffle ? (isDark ? '#111111' : '#ffffff') : c.textMuted

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value={String(studiedCount)} label="Studied"  valueColor={c.textPrimary} c={c} />
          <StatCard value={`${accuracyPct}%`}    label="Accuracy" valueColor={palette.green}  c={c} />
          <StatCard
            value={String(weakCount)}
            label="Weak"
            valueColor={weakCount > 0 ? palette.red : c.textPrimary}
            c={c}
          />
          <StatCard value={String(savedCount)} label="Saved" valueColor={c.textPrimary} c={c} />
        </View>

        {/* Weak + Bookmarked 2-col grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => launchSession({ filter: 'weak', count: weakCount })}
            disabled={weakCount === 0}
          >
            <Text style={[styles.acTitle, { color: c.textPrimary, opacity: weakCount === 0 ? 0.4 : 1 }]}>
              Weak
            </Text>
            <Text style={[styles.acSub, { color: c.textSecond }]}>{weakCount} questions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => launchSession({ filter: 'bookmarked', count: savedCount })}
            disabled={savedCount === 0}
          >
            <Text style={[styles.acTitle, { color: c.textPrimary, opacity: savedCount === 0 ? 0.4 : 1 }]}>
              Bookmarked
            </Text>
            <Text style={[styles.acSub, { color: c.textSecond }]}>{savedCount} saved</Text>
          </TouchableOpacity>
        </View>

        {/* Category filter row + shuffle toggle */}
        <View style={styles.filterRow}>
          <Text style={[typography.smallBd, { color: c.textPrimary }]}>All Categories</Text>
          <TouchableOpacity
            style={[styles.shuffleBtn, { backgroundColor: shuffleBg, borderColor: c.border }]}
            onPress={() => setShuffle((v) => !v)}
          >
            <FontAwesomeIcon icon={faShuffle} size={13} color={shuffleColor} />
          </TouchableOpacity>
        </View>

        {/* Section label */}
        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>CATEGORIES</Text>

        {/* Category list */}
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catItem, { backgroundColor: c.card }]}
            onPress={() => launchSession({ filter: 'category', category: cat.id, count: cat.count })}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <View style={styles.catBody}>
              <Text style={[styles.catName, { color: c.textPrimary }]}>{cat.label}</Text>
              <Text style={[styles.catCount, { color: c.textMuted }]}>
                {cat.count} questions{cat.weakCount > 0 ? ` · ${cat.weakCount} weak` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Bottom spacer for sticky bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky Study All bar */}
      <View style={[styles.stickyBar, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[styles.studyAllBtn, { backgroundColor: isDark ? '#ffffff' : '#111111' }]}
          onPress={() => launchSession({ filter: 'all', count: relevantQuestions.length })}
        >
          <Text style={[styles.studyAllText, { color: isDark ? '#111111' : '#ffffff' }]}>
            Study All · {relevantQuestions.length} Questions
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNav active="study" />
    </SafeAreaView>
  )
}

function StatCard({
  value,
  label,
  valueColor,
  c,
}: {
  value: string
  label: string
  valueColor: string
  c: { card: string; textMuted: string }
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: c.card }]}>
      <Text style={[styles.statVal, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 24 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 20, fontWeight: '800' },
  statLbl:  { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: { flex: 1, borderRadius: radius.lg, padding: 16, borderWidth: 1.5 },
  acTitle:    { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  acSub:      { fontSize: 11 },

  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  shuffleBtn: {
    width: 34, height: 34, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 10,
  },

  catItem:  { borderRadius: radius.md, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  catEmoji: { fontSize: 16 },
  catBody:  { flex: 1 },
  catName:  { fontSize: 13, fontWeight: '600' },
  catCount: { fontSize: 11, marginTop: 1 },

  stickyBar: {
    paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  studyAllBtn:  { borderRadius: 14, padding: 14, alignItems: 'center' },
  studyAllText: { fontSize: 15, fontWeight: '700' },
})
