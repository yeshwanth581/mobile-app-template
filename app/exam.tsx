import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '@/store/useSettingsStore'
import { QuestionCard } from '@/components/QuestionCard'
import { OptionButton } from '@/components/OptionButton'
import { ProgressBar } from '@/components/ProgressBar'
import { useQuizSession } from '@/hooks/useQuizSession'
import { useThemeColors } from '@/hooks/useThemeColors'
import { palette, spacing, radius } from '@/theme'
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
  presentation: 'exam',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ExamScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { translationLocale } = useSettingsStore()
  const { isDark, c } = useThemeColors()

  const totalSeconds = appConfig.examConfig.timeLimitMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    current, currentIndex, total, chosenIndex,
    isFinished, score, passed, answers,
    selectAnswer, next, previous, finishSession,
  } = useQuizSession(EXAM_CONFIG)

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  // Auto-submit on timer hit 0
  useEffect(() => {
    if (secondsLeft === 0 && !isFinished) finishSession()
  }, [secondsLeft, isFinished, finishSession])

  // Navigate to results when quiz finishes
  useEffect(() => {
    if (!isFinished) return
    clearInterval(timerRef.current!)
    const wrongIds = answers.filter((a) => !a.correct).map((a) => a.questionId)
    router.replace({
      pathname: '/results',
      params: {
        score: String(score),
        total: String(total),
        passed: passed ? '1' : '0',
        config: JSON.stringify(EXAM_CONFIG),
        wrongIds: JSON.stringify(wrongIds),
        answers: JSON.stringify(answers),
        timeSeconds: String(totalSeconds - secondsLeft),
      },
    })
  }, [answers, isFinished, passed, router, score, total])

  // Android back button
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
          text: 'Quit', style: 'destructive',
          onPress: () => { clearInterval(timerRef.current!); router.replace('/') },
        },
      ],
    )
  }

  if (!current) return null

  const answered  = chosenIndex !== null
  const isLast    = currentIndex + 1 >= total

  // Timer colours
  const isCritical  = secondsLeft <= 60
  const isWarning   = secondsLeft <= 300
  const timerColor  = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : c.textPrimary
  const timerBg     = isCritical
    ? (isDark ? palette.redDim : '#fef2f2')
    : isWarning
      ? (isDark ? '#1c1204' : palette.amberLight)
      : c.card

  const btnBg   = isLast ? palette.green : isDark ? '#ffffff' : '#111111'
  const btnText = isLast ? '#ffffff' : isDark ? '#111111' : '#ffffff'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]} edges={['top', 'bottom']}>

      {/* ─── Fixed top ─── */}
      <View style={[styles.topSection, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
        <View style={styles.headerRow}>
          {/* Quit */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card }]} onPress={confirmExit}>
            <Ionicons name="close" size={16} color={c.textSecond} />
          </TouchableOpacity>

          {/* Question counter */}
          <Text style={[styles.qCounter, { color: c.textPrimary }]}>
            {String(t('exam.questionWord')).toUpperCase()} {currentIndex + 1} / {total}
          </Text>

          {/* Timer pill */}
          <View style={[styles.timerPill, { backgroundColor: timerBg }]}>
            <Ionicons name="time-outline" size={12} color={timerColor} />
            <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(secondsLeft)}</Text>
          </View>
        </View>

        <ProgressBar current={currentIndex} total={total} isDark={isDark} label={t('exam.title')} />

        <Text style={[styles.examNote, { color: c.textMuted }]}>
          {t('session.examModeNote')}
        </Text>
      </View>

      {/* ─── Scrollable body ─── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionCard
          question={current}
          translationLocale={translationLocale}
          showTranslation={false}
          isDark={isDark}
          categoryLabel={undefined}
        />

        <View style={styles.options}>
          {current.options.map((_, i) => (
            <OptionButton
              key={i}
              index={i}
              question={current}
              translationLocale={translationLocale}
              showTranslation={false}
              chosenIndex={chosenIndex}
              isDark={isDark}
              revealAnswer={false}
              onPress={selectAnswer}
            />
          ))}
        </View>
      </ScrollView>

      {/* ─── Fixed bottom nav ─── */}
      <View style={[styles.bottomBar, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[
            styles.navBtn, styles.navBtnSecondary,
            { borderColor: c.border, opacity: currentIndex === 0 ? 0.35 : 1 },
          ]}
          onPress={previous}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navBtnSecondaryText, { color: c.textPrimary }]}>
            ← {t('questionDetail.previous')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: btnBg, opacity: answered ? 1 : 0.35 }]}
          onPress={next}
          disabled={!answered}
        >
          <Text style={[styles.navBtnPrimaryText, { color: btnText }]}>
            {isLast ? t('exam.submit') : `${t('quiz.next')} →`}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topSection: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconBtn:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qCounter:   { fontSize: 13, fontWeight: '700' },
  timerPill:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  timerText:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  examNote:   { fontSize: 11, textAlign: 'center', paddingBottom: spacing.xs, fontStyle: 'italic' },

  body:        { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

  qLabel:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.md, marginTop: spacing.sm },
  options: { gap: 9 },

  bottomBar: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn:              { flex: 1, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  navBtnSecondary:     { borderWidth: 1.5 },
  navBtnSecondaryText: { fontSize: 15, fontWeight: '700' },
  navBtnPrimaryText:   { fontSize: 15, fontWeight: '700' },
})
