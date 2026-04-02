import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { QuestionCard } from '@/components/QuestionCard'
import { OptionButton } from '@/components/OptionButton'
import { ProgressBar } from '@/components/ProgressBar'
import { AdBanner } from '@/components/AdBanner'
import { QuestionJumpPicker } from '@/components/QuestionJumpPicker'
import { useQuizSession } from '@/hooks/useQuizSession'
import { getQuestionLabel } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { spacing, radius, typography } from '@/theme'
import type { SessionConfig } from '@/types'

export default function SessionScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { config: configStr } = useLocalSearchParams<{ config: string }>()
  const config: SessionConfig = JSON.parse(configStr)

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
    const wrongIds = answers.filter((a) => !a.correct).map((a) => a.questionId)
    router.replace({
      pathname: '/results',
      params: {
        score: String(score),
        total: String(total),
        passed: passed ? '1' : '0',
        config: configStr,
        wrongIds: JSON.stringify(wrongIds),
      },
    })
  }, [answers, configStr, isFinished, passed, router, score, total])

  if (isFinished || !current) return null

  const catLabel =
    current.category === selectedStateCode
      ? (getStateLabel(selectedStateCode) ?? t('session.yourState'))
      : current.category === 'general'
        ? t('session.germanyOnly')
        : getQuestionLabel(current.category, selectedStateCode)

  const qProgress   = getProgress(current.id)
  const isBookmarked = qProgress.bookmarked
  const answered    = chosenIndex !== null
  const isLast      = currentIndex + 1 >= total

  // Attempt stats for current question (below options)
  const attempts    = qProgress.attempts ?? []
  const correctCnt  = attempts.filter((a) => a.result === 'correct').length
  const wrongCnt    = attempts.filter((a) => a.result === 'wrong').length

  const btnBg   = isDark ? '#ffffff' : '#111111'
  const btnText = isDark ? '#111111' : '#ffffff'

  // Translate button styles
  const transActive     = translationActive && translationLocale !== 'de'
  const transBtnBg      = transActive ? btnBg : c.card
  const transBtnColor   = transActive ? btnText : c.textMuted

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]} edges={['top', 'bottom']}>

      {/* ─── Fixed top ─── */}
      <View style={[styles.topSection, { backgroundColor: c.bg }]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color={c.textSecond} />
          </TouchableOpacity>

          <QuestionJumpPicker
            currentIndex={currentIndex}
            total={total}
            onSelect={jumpTo}
            isDark={isDark}
            prefix={String(t('exam.questionWord')).toUpperCase()}
            compact
          />

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: transBtnBg }]}
            onPress={() => setTranslationActive((v) => !v)}
            disabled={translationLocale === 'de'}
          >
            <FontAwesomeIcon icon={faLanguage} size={14} color={transBtnColor} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <ProgressBar current={currentIndex} total={total} isDark={isDark} label={catLabel ?? ''} />
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
            {String(t('exam.questionWord'))} {currentIndex + 1}
          </Text>
          <TouchableOpacity
            onPress={() => toggleBookmark(current.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={c.textPrimary}
              style={{ opacity: isBookmarked ? 1 : 0.3 }}
            />
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
              chosenIndex={chosenIndex}
              isDark={isDark}
              onPress={selectAnswer}
            />
          ))}
        </View>

        {/* Attempt stats (show when question has history) */}
        {attempts.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#22c55e' }]} />
              <Text style={[styles.statText, { color: c.textMuted }]}>{correctCnt} correct</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.statText, { color: c.textMuted }]}>{wrongCnt} wrong</Text>
            </View>
            <Text style={[styles.statText, { color: c.textMuted }]}>{attempts.length} attempts</Text>
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

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: btnBg, opacity: answered ? 1 : 0.35 }]}
          onPress={next}
          disabled={!answered}
        >
          <Text style={[styles.navBtnPrimaryText, { color: btnText }]}>
            {isLast ? `${t('quiz.finish')} →` : `${t('questionDetail.next')} →`}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topSection:  { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  iconBtn:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

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
