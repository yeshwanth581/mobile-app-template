import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Alert, BackHandler } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { QuestionCard } from '@/components/QuestionCard'
import { OptionButton } from '@/components/OptionButton'
import { ProgressBar } from '@/components/ProgressBar'
import { useQuizSession } from '@/hooks/useQuizSession'
import { getQuestionLabel } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import type { SessionConfig } from '@/types'

const EXAM_CONFIG: SessionConfig = {
  filter: 'all',
  category: null,
  count: appConfig.examConfig.examQuestions,
  shuffle: true,
  showTranslation: false,
  timed: true,
  mode: 'exam',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ExamScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const colorScheme = useColorScheme()
  const { theme, translationLocale, selectedStateCode } = useSettingsStore()
  const { toggleBookmark, getProgress } = useProgressStore()

  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark')
  const c = isDark ? palette.dark : palette.light

  const totalSeconds = appConfig.examConfig.timeLimitMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { current, currentIndex, total, chosenIndex, isFinished, score, passed, answers, selectAnswer, next, finishSession } =
    useQuizSession(EXAM_CONFIG)

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && !isFinished) {
      finishSession()
    }
  }, [secondsLeft, isFinished, finishSession])

  // Navigate to results when quiz finishes normally
  useEffect(() => {
    if (isFinished) {
      clearInterval(timerRef.current!)
      const wrongIds = answers.filter((answer) => !answer.correct).map((answer) => answer.questionId)
      router.replace({
        pathname: '/results',
        params: {
          score: String(score),
          total: String(total),
          passed: passed ? '1' : '0',
          config: JSON.stringify(EXAM_CONFIG),
          wrongIds: JSON.stringify(wrongIds),
        },
      })
    }
  }, [answers, isFinished, passed, router, score, total])

  // Android back button — show confirmation
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit()
      return true
    })
    return () => sub.remove()
  }, [])

  function confirmExit() {
    Alert.alert(
      'Abandon Exam?',
      'Your progress will be lost. Are you sure you want to quit?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            clearInterval(timerRef.current!)
            router.replace('/')
          },
        },
      ],
    )
  }

  if (!current) return null

  const showTranslation = translationLocale !== 'de'
  const catLabel = current.category === selectedStateCode ? (getStateLabel(selectedStateCode) ?? 'Your state') : getQuestionLabel(current.category, selectedStateCode)
  const isBookmarked = getProgress(current.id).bookmarked
  const answered = chosenIndex !== null

  // Timer warning thresholds
  const isWarning  = secondsLeft <= 300  // ≤ 5 min
  const isCritical = secondsLeft <= 60   // ≤ 1 min
  const timerColor = isCritical ? palette.red : isWarning ? palette.amber : c.textPrimary
  const timerBg    = isCritical
    ? (isDark ? '#450a0a' : '#fef2f2')
    : isWarning
      ? (isDark ? '#1c1204' : '#fffbeb')
      : c.card

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>

      {/* Fixed header */}
      <View style={[styles.header, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
        {/* Quit button */}
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card }]} onPress={confirmExit}>
          <Text style={{ color: c.textSecond }}>✕</Text>
        </TouchableOpacity>

        {/* Timer */}
        <View style={[styles.timerPill, { backgroundColor: timerBg }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {isCritical ? '⚠ ' : '⏱ '}{formatTime(secondsLeft)}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={[typography.tiny, { color: c.textMuted }]}>
            {String(t('exam.questionWord')).toUpperCase()} {currentIndex + 1} OF {total}
          </Text>
          <TouchableOpacity onPress={() => toggleBookmark(current.id)}>
            <Text style={{ fontSize: 18, opacity: isBookmarked ? 1 : 0.3 }}>🔖</Text>
          </TouchableOpacity>
        </View>

        <ProgressBar current={currentIndex} total={total} isDark={isDark} label="" />

        {/* Exam mode badge */}
        <View style={[styles.examBadge, { backgroundColor: isDark ? '#1e1b4b' : '#eef2ff' }]}>
          <Text style={[styles.examBadgeText, { color: palette.primary }]}>
            {String(t('exam.modeNote')).toUpperCase()}
          </Text>
        </View>

        {/* Question */}
        <QuestionCard
          question={current}
          translationLocale={translationLocale}
          showTranslation={showTranslation}
          isDark={isDark}
          categoryLabel={catLabel}
        />

        {/* Answer options */}
        <View style={styles.options}>
          {current.options.map((_, i) => (
            <OptionButton
              key={i}
              index={i}
              question={current}
              translationLocale={translationLocale}
              showTranslation={showTranslation}
              chosenIndex={chosenIndex}
              isDark={isDark}
              onPress={selectAnswer}
            />
          ))}
        </View>

        {/* Next button — shown once an option is selected */}
        {answered && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: palette.primary }]}
            onPress={next}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex + 1 >= total ? `${t('exam.submit')} →` : `${t('quiz.next')} →`}
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 32, height: 32 },
  timerPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
  },
  timerText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  examBadge: { borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: spacing.md },
  examBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  options: { gap: 9 },
  nextBtn: { borderRadius: radius.lg, padding: 15, alignItems: 'center', marginTop: spacing.md },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
