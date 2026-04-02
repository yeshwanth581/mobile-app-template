import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AdBanner } from '@/components/AdBanner'
import { palette, spacing, radius } from '@/theme'
import appConfig from '@/config/app.config'
import type { SessionConfig } from '@/types'

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ResultsScreen() {
  const router = useRouter()
  const { score, total, passed, config: configStr, wrongIds: wrongIdsStr, timeSeconds } =
    useLocalSearchParams<{
      score: string; total: string; passed: string; config: string
      wrongIds?: string; timeSeconds?: string
    }>()
  const { isDark, c } = useThemeColors()

  const scoreNum  = parseInt(score ?? '0')
  const totalNum  = parseInt(total ?? '1')
  const isPassed  = passed === '1'
  const pct       = Math.round((scoreNum / totalNum) * 100)
  const passMark  = appConfig.examConfig.passMark
  const wrongIds  = wrongIdsStr ? (JSON.parse(wrongIdsStr) as string[]) : []
  const elapsed   = timeSeconds ? parseInt(timeSeconds) : null
  const config    = configStr ? (JSON.parse(configStr) as SessionConfig) : null

  const badgeColor = isPassed ? palette.green : palette.red
  const btnBg      = isDark ? '#ffffff' : '#111111'
  const btnText    = isDark ? '#111111' : '#ffffff'

  function reviewWrongAnswers() {
    if (wrongIds.length === 0) {
      router.push('/questions')
      return
    }
    const reviewConfig: SessionConfig = {
      filter: 'all', category: null, count: wrongIds.length,
      shuffle: false, showTranslation: true, timed: false,
      mode: 'practice', _questionIds: wrongIds,
    }
    router.replace({ pathname: '/practice/session', params: { config: JSON.stringify(reviewConfig) } })
  }

  function retrySession() {
    if (config?.mode === 'exam') {
      router.replace('/exam')
    } else {
      router.replace({ pathname: '/practice/session', params: { config: configStr } })
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge circle */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          {isPassed ? (
            <Ionicons name="checkmark" size={44} color="#fff" />
          ) : (
            <Ionicons name="close" size={44} color="#fff" />
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {isPassed ? 'Congratulations!' : 'Keep Practising'}
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecond }]}>
          {isPassed
            ? 'You passed the mock exam'
            : `You need ${passMark} correct to pass`}
        </Text>

        {/* Score */}
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreNum, { color: c.textPrimary }]}>{scoreNum}</Text>
          <Text style={[styles.scoreDenom, { color: c.textMuted }]}> / {totalNum}</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: c.textMuted }]}>CORRECT ANSWERS</Text>

        {/* Pass threshold */}
        <Text style={[styles.threshold, { color: badgeColor }]}>
          Pass threshold: {passMark} / {totalNum}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={`${pct}%`} label="Score" c={c} />
          {elapsed !== null && (
            <StatCard value={formatTime(elapsed)} label="Time" c={c} />
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: btnBg }]}
            onPress={reviewWrongAnswers}
          >
            <Text style={[styles.btnPrimaryText, { color: btnText }]}>
              {wrongIds.length > 0 ? 'Review Wrong Answers' : 'Browse Questions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: c.border }]}
            onPress={retrySession}
          >
            <Text style={[styles.btnSecondaryText, { color: c.textPrimary }]}>
              {config?.mode === 'exam' ? 'Retry Exam' : 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnText} onPress={() => router.replace('/')}>
            <Text style={[styles.btnTextLabel, { color: c.textMuted }]}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        <AdBanner isDark={isDark} />
      </ScrollView>
    </SafeAreaView>
  )
}

function StatCard({ value, label, c }: { value: string; label: string; c: { card: string; textPrimary: string; textMuted: string } }) {
  return (
    <View style={[styles.statCard, { backgroundColor: c.card }]}>
      <Text style={[styles.statVal, { color: c.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { alignItems: 'center', padding: spacing.lg, paddingBottom: 40 },

  badge: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 32, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },

  title:     { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle:  { fontSize: 14, marginBottom: 28 },

  scoreRow:  { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  scoreNum:  { fontSize: 56, fontWeight: '800', letterSpacing: -2 },
  scoreDenom:{ fontSize: 28, fontWeight: '600' },
  scoreLabel:{ fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },

  threshold: { fontSize: 13, fontWeight: '600', marginBottom: 28 },

  statsRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 28 },
  statCard: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 20, fontWeight: '800' },
  statLbl:  { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  btnGroup:          { width: '100%', gap: spacing.sm },
  btnPrimary:        { borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  btnPrimaryText:    { fontSize: 15, fontWeight: '700' },
  btnSecondary:      { borderRadius: radius.lg, padding: 14, borderWidth: 1.5, alignItems: 'center' },
  btnSecondaryText:  { fontSize: 14, fontWeight: '700' },
  btnText:           { padding: 8, alignItems: 'center' },
  btnTextLabel:      { fontSize: 13 },
})
