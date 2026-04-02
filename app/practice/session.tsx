import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { QuestionCard } from '@/components/QuestionCard'
import { OptionButton } from '@/components/OptionButton'
import { ProgressBar } from '@/components/ProgressBar'
import { AdBanner } from '@/components/AdBanner'
import { QuestionJumpPicker } from '@/components/QuestionJumpPicker'
import { BookmarkIcon } from '@/components/AppIcons'
import { useQuizSession } from '@/hooks/useQuizSession'
import { getQuestionLabel } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import appConfig from '@/config/app.config'
import { spacing, radius, typography } from '@/theme'
import type { SessionConfig } from '@/types'

export default function SessionScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { config: configStr } = useLocalSearchParams<{ config: string }>()
  const config: SessionConfig = JSON.parse(configStr)
  const presentation = config.presentation ?? (config._reviewMode === 'wrongAnswers' ? 'review' : config.mode === 'exam' ? 'exam' : 'practice')
  const isStudyMode = presentation === 'study'
  const isPracticeMode = presentation === 'practice'
  const isReviewMode = presentation === 'review'

  const { isDark, c } = useThemeColors()
  const { translationLocale, selectedStateCode } = useSettingsStore()
  const { toggleBookmark, getProgress } = useProgressStore()

  // Local translation toggle — starts from session config
  const [translationActive, setTranslationActive] = useState(config.showTranslation)

  const {
    current, currentIndex, total, chosenIndex,
    isFinished, score, answers, passed, selectAnswer, previous, jumpTo, next,
  } = useQuizSession(config)

  useEffect(() => {
    if (!isFinished) return

    if (isPracticeMode || isStudyMode) {
      router.replace(isStudyMode ? '/study' : '/practice')
      return
    }

    const wrongIds = answers.filter((a) => !a.correct).map((a) => a.questionId)
    router.replace({
      pathname: '/results',
      params: {
        score: String(score),
        total: String(total),
        passed: passed ? '1' : '0',
        config: configStr,
        wrongIds: JSON.stringify(wrongIds),
        answers: JSON.stringify(answers),
      },
    })
  }, [answers, configStr, isFinished, isPracticeMode, isStudyMode, passed, router, score, total])

  if (isFinished || !current) return null

  const reviewAnswer = config._reviewAnswers?.find((item) => item.questionId === current.id) ?? null
  const effectiveChosenIndex = isReviewMode
    ? (reviewAnswer?.chosenIndex ?? chosenIndex)
    : chosenIndex

  const catLabel =
    isReviewMode
      ? t('results.reviewWrong')
      : isStudyMode
        ? t('study.title')
      : current.category === selectedStateCode
        ? (getStateLabel(selectedStateCode) ?? t('session.yourState'))
        : current.category === 'general'
          ? t('session.germanyOnly')
          : getQuestionLabel(current.category, selectedStateCode)

  const qProgress   = getProgress(current.id)
  const isBookmarked = qProgress.bookmarked
  const answered    = effectiveChosenIndex !== null
  const isLast      = currentIndex + 1 >= total

  // Attempt stats for current question (below options)
  const attempts    = qProgress.attempts ?? []
  const correctCnt  = attempts.filter((a) => a.result === 'correct').length
  const wrongCnt    = attempts.filter((a) => a.result === 'wrong').length

  const btnBg   = isDark ? '#ffffff' : '#111111'
  const btnText = isDark ? '#111111' : '#ffffff'
  const translationDisabled = translationLocale === appConfig.originalLocale
  const showTranslationControl = isStudyMode || isPracticeMode || isReviewMode

  // Translate button styles
  const transActive     = translationActive && !translationDisabled
  const transBtnBg      = transActive ? btnBg : c.card
  const transBtnColor   = transActive ? btnText : c.textMuted

  const handleBack = () => {
    if (isReviewMode && config._returnParams) {
      router.replace({
        pathname: '/results',
        params: config._returnParams,
      })
      return
    }
    router.back()
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]} edges={['top', 'bottom']}>

      {/* ─── Fixed top ─── */}
      <View style={[styles.topSection, { backgroundColor: c.bg }]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={16} color={c.textSecond} />
          </TouchableOpacity>

          <QuestionJumpPicker
            currentIndex={currentIndex}
            total={total}
            onSelect={jumpTo}
            isDark={isDark}
            prefix={isReviewMode ? String(t('results.reviewWrong')).toUpperCase() : String(t('exam.questionWord')).toUpperCase()}
            compact
          />

          {showTranslationControl ? (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: transBtnBg, opacity: translationDisabled ? 0.35 : 1 }]}
              onPress={() => setTranslationActive((v) => !v)}
              disabled={translationDisabled}
            >
              <Ionicons name="language-outline" size={16} color={transBtnColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>

        {/* Progress bar */}
        <ProgressBar current={currentIndex} total={total} isDark={isDark} label={catLabel ?? t('session.screenTitle')} />
      </View>

      {/* ─── Scrollable body ─── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Q number + bookmark */}
        <View style={styles.qHeaderRow}>
          <Text style={[styles.qLabel, { color: c.textMuted }]}>
            {isReviewMode
              ? `${t('results.reviewWrong')} ${currentIndex + 1} / ${total}`
              : `${String(t('exam.questionWord'))} ${currentIndex + 1}`}
          </Text>
          <TouchableOpacity
            onPress={() => toggleBookmark(current.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BookmarkIcon color={c.textPrimary} fill={isBookmarked ? c.textPrimary : 'none'} size={16} />
          </TouchableOpacity>
        </View>

        {/* Question card */}
        <QuestionCard
          question={current}
          translationLocale={translationLocale}
          showTranslation={transActive}
          isDark={isDark}
          categoryLabel={undefined}
        />

        {/* Options */}
        <View style={styles.options}>
          {current.options.map((_, i) => (
            <OptionButton
              key={i}
              index={i}
              question={current}
              translationLocale={translationLocale}
              showTranslation={transActive}
              chosenIndex={effectiveChosenIndex}
              isDark={isDark}
              onPress={isPracticeMode ? selectAnswer : () => {}}
              revealAnswer={isStudyMode || isPracticeMode || isReviewMode}
            />
          ))}
        </View>

        {/* Attempt stats (show when question has history) */}
        {attempts.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#22c55e' }]} />
              <Text style={[styles.statText, { color: c.textMuted }]}>{correctCnt} {t('quiz.correct').toLowerCase()}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.statText, { color: c.textMuted }]}>{wrongCnt} {t('quiz.incorrect').toLowerCase()}</Text>
            </View>
            <Text style={[styles.statText, { color: c.textMuted }]}>{attempts.length} {t('quiz.attempts').toLowerCase()}</Text>
          </View>
        )}

        <AdBanner isDark={isDark} />
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

        {isReviewMode ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: btnBg, opacity: 1 }]}
            onPress={isLast ? handleBack : jumpTo.bind(null, currentIndex + 1)}
          >
            <Text style={[styles.navBtnPrimaryText, { color: btnText }]}>
              {isLast ? t('results.backHome') : `${t('questionDetail.next')} →`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: btnBg, opacity: answered ? 1 : 0.35 }]}
            onPress={next}
            disabled={!answered}
          >
            <Text style={[styles.navBtnPrimaryText, { color: btnText }]}>
              {isLast ? `${t('quiz.finish')} →` : `${t('questionDetail.next')} →`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topSection:  { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  iconBtn:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconPlaceholder: { width: 32, height: 32 },

  body:        { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

  qHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  qLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  options: { gap: 9, marginBottom: spacing.md },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, marginBottom: spacing.sm,
  },
  statItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statDot:   { width: 6, height: 6, borderRadius: 3 },
  statText:  { fontSize: 11, fontWeight: '600' },

  bottomBar: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn: { flex: 1, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  navBtnSecondary:     { borderWidth: 1.5 },
  navBtnSecondaryText: { fontSize: 15, fontWeight: '700' },
  navBtnPrimaryText:   { fontSize: 15, fontWeight: '700' },
})
