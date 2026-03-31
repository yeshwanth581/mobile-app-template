import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AdBanner } from '@/components/AdBanner'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import type { SessionConfig } from '@/types'

export default function ResultsScreen() {
  const router = useRouter()
  const { score, total, passed, config: configStr, wrongIds: wrongIdsStr } = useLocalSearchParams<{
    score: string; total: string; passed: string; config: string; wrongIds?: string
  }>()
  const { isDark, c } = useThemeColors()

  const scoreNum  = parseInt(score ?? '0')
  const totalNum  = parseInt(total ?? '1')
  const isPassed  = passed === '1'
  const pct       = Math.round((scoreNum / totalNum) * 100)
  const wrongNum  = totalNum - scoreNum
  const passMark  = appConfig.examConfig.passMark
  const wrongIds = wrongIdsStr ? (JSON.parse(wrongIdsStr) as string[]) : []

  async function shareResult() {
    try {
      await Share.share({
        message: `I scored ${scoreNum}/${totalNum} (${pct}%) on the ${appConfig.appName} practice test! ${isPassed ? '✅ Passed!' : '📚 Still practising'}`,
      })
    } catch {}
  }

  const ringColor = isPassed ? palette.green : palette.red

  function reviewWrongAnswers() {
    if (wrongIds.length === 0) {
      router.push('/questions')
      return
    }

    const reviewConfig: SessionConfig = {
      filter: 'all',
      category: null,
      count: wrongIds.length,
      shuffle: false,
      showTranslation: true,
      timed: false,
      mode: 'practice',
      _questionIds: wrongIds,
    }

    router.replace({
      pathname: '/practice/session',
      params: { config: JSON.stringify(reviewConfig) },
    })
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Score circle */}
        <View style={styles.hero}>
          <View style={[styles.ring, { borderColor: ringColor }]}>
            <Text style={[styles.ringPct, { color: ringColor }]}>{pct}%</Text>
            <Text style={[styles.ringVerdict, { color: ringColor }]}>
              {isPassed ? 'PASS' : 'FAIL'}
            </Text>
          </View>
          <Text style={[typography.h2, { color: c.textPrimary }]}>
            {isPassed ? 'Congratulations! 🎉' : 'Keep Practising 💪'}
          </Text>
          <Text style={[typography.small, { color: c.textMuted }]}>
            {scoreNum} correct out of {totalNum} · {isPassed ? 'Passed' : `Need ${passMark} to pass`}
          </Text>
        </View>

        {/* Breakdown cards */}
        <View style={styles.breakdown}>
          <BreakCard label="Correct" value={scoreNum} color={palette.green} isDark={isDark} />
          <BreakCard label="Wrong"   value={wrongNum}  color={palette.red}   isDark={isDark} />
          <BreakCard label="Total"   value={totalNum}  color={palette.primary} isDark={isDark} />
        </View>

        {/* Pass mark info */}
        <View style={[styles.passInfo, { backgroundColor: c.card }]}>
          <Text style={[typography.tiny, { color: c.textMuted }]}>PASS THRESHOLD</Text>
          <View style={[styles.passBar, { backgroundColor: c.border }]}>
            <View style={[styles.passFill, { width: `${(passMark / totalNum) * 100}%` as any, backgroundColor: palette.green }]} />
            <View style={[styles.scoreFill, {
              width: `${pct}%` as any,
              backgroundColor: isPassed ? palette.primary : palette.red,
              position: 'absolute', top: 0, left: 0,
            }]} />
          </View>
          <Text style={[typography.tiny, { color: c.textMuted }]}>
            Pass: {passMark}/{totalNum} · You: {scoreNum}/{totalNum}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.btnGroup}>
          {isPassed && (
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: palette.primary }]} onPress={shareResult}>
              <Text style={styles.btnPrimaryText}>📤 Share Result</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: c.border }]}
            onPress={reviewWrongAnswers}
          >
            <Text style={[styles.btnSecondaryText, { color: c.textPrimary }]}>
              {wrongIds.length > 0 ? '🔍 Review Wrong Answers' : '📚 Browse Questions'}
            </Text>
          </TouchableOpacity>

          {!isPassed && (
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: palette.primary }]}
              onPress={() => router.replace({ pathname: '/practice/session', params: { config: configStr } })}
            >
              <Text style={styles.btnPrimaryText}>🔄 Try Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: c.border }]}
            onPress={() => router.replace('/')}
          >
            <Text style={[styles.btnSecondaryText, { color: c.textPrimary }]}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        <AdBanner isDark={isDark} />
      </ScrollView>
    </SafeAreaView>
  )
}

function BreakCard({ label, value, color, isDark }: { label: string; value: number; color: string; isDark: boolean }) {
  const c = isDark ? palette.dark : palette.light
  return (
    <View style={[styles.breakCard, { backgroundColor: c.card }]}>
      <Text style={[styles.breakNum, { color }]}>{value}</Text>
      <Text style={[typography.label, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  hero:   { alignItems: 'center', gap: 6, paddingVertical: 20 },
  ring: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  ringPct:     { fontSize: 28, fontWeight: '900' },
  ringVerdict: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  breakdown:   { flexDirection: 'row', gap: 8, marginVertical: spacing.md },
  breakCard: {
    flex: 1, borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 3,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  breakNum: { fontSize: 22, fontWeight: '900' },
  passInfo: {
    borderRadius: radius.lg, padding: spacing.md, gap: 6, marginBottom: spacing.md,
  },
  passBar: { height: 8, borderRadius: radius.full, overflow: 'hidden', position: 'relative' },
  passFill:  { height: '100%', borderRadius: radius.full },
  scoreFill: { height: '100%', borderRadius: radius.full },
  btnGroup:  { gap: spacing.sm },
  btnPrimary:      { borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  btnPrimaryText:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary:    { borderRadius: radius.lg, padding: 14, borderWidth: 2, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '700' },
})
