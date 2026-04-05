import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, BackHandler, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { CloseIcon, ClockIcon } from '@/components/AppIcons'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useMonetizationStore } from '@/store/useMonetizationStore'
import { QuestionCard } from '@/components/QuestionCard'
import { OptionButton } from '@/components/OptionButton'
import { ProgressBar } from '@/components/ProgressBar'
import { useQuizSession } from '@/hooks/useQuizSession'
import { useThemeColors } from '@/hooks/useThemeColors'
import { palette, spacing, radius } from '@/theme'
import appConfig from '@/config/app.config'
import { hapticLight, hapticMedium } from '@/hooks/useHaptics'
import { showRewarded, isRewardedReady } from '@/services/ads'
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
  const translationLocale = useSettingsStore((state) => state.translationLocale)
  const { isDark, c } = useThemeColors()

  // ─── Exam gate ─────────────────────────────────────────────────────────────
  const { canTakeExam, canWatchRewardedAd, recordExam, examsRemaining } = useMonetizationStore()
  const [gated, setGated] = useState(!canTakeExam())

  // ─── All hooks must be above any early return ──────────────────────────────
  const totalSeconds = appConfig.examConfig.timeLimitMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    current, currentIndex, total, chosenIndex,
    isFinished, score, passed, answers,
    selectAnswer, next, previous, finishSession,
  } = useQuizSession(EXAM_CONFIG)

  // Record exam start once gate passes
  const didRecord = useRef(false)
  useEffect(() => {
    if (!gated && !didRecord.current) {
      didRecord.current = true
      recordExam()
    }
  }, [gated, recordExam])

  // Countdown timer — only runs when not gated
  useEffect(() => {
    if (gated) return
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [gated])

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
      t('exam.abandonTitle', { defaultValue: 'Abandon Exam?' }),
      t('exam.abandonMessage', { defaultValue: 'Your progress will be lost. Are you sure you want to quit?' }),
      [
        { text: t('exam.keepGoing', { defaultValue: 'Keep Going' }), style: 'cancel' },
        {
          text: t('exam.quit', { defaultValue: 'Quit' }), style: 'destructive',
          onPress: () => { clearInterval(timerRef.current!); router.replace('/') },
        },
      ],
    )
  }

  async function handleWatchAd() {
    const earned = await showRewarded()
    if (earned) setGated(false)
  }

  // ─── Gate screen ───────────────────────────────────────────────────────────
  if (gated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <View style={styles.gateWrap}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🔒</Text>
          <Text style={[styles.gateTitle, { color: c.textPrimary }]}>
            {t('exam.dailyLimitTitle', { defaultValue: 'Daily Limit Reached' })}
          </Text>
          <Text style={[styles.gateSub, { color: c.textMuted }]}>
            {t('exam.dailyLimitSub', {
              defaultValue: 'You\'ve used your {{count}} free exams today. Watch an ad or go premium for unlimited.',
              count: appConfig.monetizationConfig.freeExamsPerDay,
            })}
          </Text>

          {canWatchRewardedAd() && (
            <TouchableOpacity
              style={[styles.gateBtn, { backgroundColor: c.btnPrimaryBg }]}
              onPress={handleWatchAd}
            >
              <Text style={[styles.gateBtnText, { color: c.btnPrimaryText }]}>
                {t('exam.watchAd', { defaultValue: 'Watch Ad for 1 Free Exam' })}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.gateBtn, { backgroundColor: palette.amber }]}
            onPress={() => router.push('/subscription')}
          >
            <Text style={[styles.gateBtnText, { color: '#ffffff' }]}>
              {t('exam.goPremium', { defaultValue: 'Go Premium — Unlimited Exams' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gateBackBtn} onPress={() => router.back()}>
            <Text style={[styles.gateBackText, { color: c.textMuted }]}>
              {t('results.backHome', { defaultValue: 'Back to Home' })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ─── Exam session ──────────────────────────────────────────────────────────
  if (!current) return null

  const answered  = chosenIndex !== null
  const isLast    = currentIndex + 1 >= total

  // Timer colours
  const isCritical  = secondsLeft <= 60
  const isWarning   = secondsLeft <= 300
  const timerColor  = isCritical ? palette.red : isWarning ? palette.amber : c.textPrimary
  const timerBg     = isCritical
    ? (isDark ? palette.redDim : palette.redLight)
    : isWarning
      ? (isDark ? palette.amberDim : palette.amberLight)
      : c.card

  const btnBg   = isLast ? palette.green : c.btnPrimaryBg
  const btnText = isLast ? '#ffffff' : c.btnPrimaryText

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]} edges={['top', 'bottom']}>

      {/* ─── Fixed top ─── */}
      <View style={[styles.topSection, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
        <View style={styles.headerRow}>
          {/* Quit */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card }]} onPress={confirmExit}>
            <CloseIcon size={16} color={c.textSecond} />
          </TouchableOpacity>

          {/* Question counter */}
          <Text style={[styles.qCounter, { color: c.textPrimary }]}>
            {String(t('exam.questionWord')).toUpperCase()} {currentIndex + 1} / {total}
          </Text>

          {/* Timer pill */}
          <View style={[styles.timerPill, { backgroundColor: timerBg }]}>
            <ClockIcon size={12} color={timerColor} />
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
          onPress={() => { hapticLight(); previous() }}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navBtnSecondaryText, { color: c.textPrimary }]}>
            ← {t('questionDetail.previous')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: btnBg, opacity: answered ? 1 : 0.35 }]}
          onPress={() => { isLast ? hapticMedium() : hapticLight(); next() }}
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

  // Gate screen
  gateWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  gateTitle:    { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  gateSub:      { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  gateBtn:      { width: '100%', borderRadius: radius.lg, padding: 15, alignItems: 'center', marginBottom: 10 },
  gateBtnText:  { fontSize: 15, fontWeight: '700' },
  gateBackBtn:  { padding: 12 },
  gateBackText: { fontSize: 13 },
})
