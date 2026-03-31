import { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
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
import { palette, spacing, radius, typography } from '@/theme'
import type { SessionConfig } from '@/types'

export default function SessionScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { config: configStr } = useLocalSearchParams<{ config: string }>()
  const config: SessionConfig = JSON.parse(configStr)

  const { isDark, c } = useThemeColors()
  const { translationLocale, selectedStateCode } = useSettingsStore()
  const { toggleBookmark, getProgress } = useProgressStore()

  const { current, currentIndex, total, chosenIndex, answerState, isFinished, score, answers, passed, selectAnswer, previous, jumpTo, next } =
    useQuizSession(config)

  useEffect(() => {
    if (!isFinished) return

    const wrongIds = answers.filter((answer) => !answer.correct).map((answer) => answer.questionId)
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

  if (isFinished) return null

  if (!current) return null

  const showTranslation = translationLocale !== 'de'
  const catLabel =
    current.category === selectedStateCode
      ? (getStateLabel(selectedStateCode) ?? t('session.yourState'))
      : current.category === 'general'
        ? t('session.germanyOnly')
        : getQuestionLabel(current.category, selectedStateCode)
  const qProgress = getProgress(current.id)
  const isBookmarked = qProgress.bookmarked
  const answered = chosenIndex !== null

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: c.textSecond }}>✕</Text>
          </TouchableOpacity>

          <QuestionJumpPicker
            currentIndex={currentIndex}
            total={total}
            onSelect={jumpTo}
            isDark={isDark}
            prefix={String(t('exam.questionWord')).toUpperCase()}
            compact
          />

          <View style={styles.topRight}>
            <TouchableOpacity onPress={() => toggleBookmark(current.id)}>
              <Text style={{ fontSize: 18, opacity: isBookmarked ? 1 : 0.3 }}>🔖</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar current={currentIndex} total={total} isDark={isDark} label="" />

        {/* Question card */}
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

        {/* In exam mode: reminder */}
        {config.mode === 'exam' && (
          <Text style={[styles.examNote, { color: c.textMuted }]}>
            {t('session.examModeNote')}
          </Text>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnSecondary,
              { borderColor: c.border, opacity: currentIndex === 0 ? 0.45 : 1 },
            ]}
            onPress={previous}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.navBtnSecondaryText, { color: c.textPrimary }]}>← {t('questionDetail.previous')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: palette.primary, opacity: answered ? 1 : 0.45 }]}
            onPress={next}
            disabled={!answered}
          >
            <Text style={styles.navBtnPrimaryText}>
              {currentIndex + 1 >= total ? `${t('quiz.finish')} →` : `${t('questionDetail.next')} →`}
            </Text>
          </TouchableOpacity>
        </View>

        <AdBanner isDark={isDark} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  options: { gap: 9 },
  examNote: { textAlign: 'center', fontSize: 11, marginTop: spacing.md, fontStyle: 'italic' },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  navBtn: { flex: 1, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  navBtnPrimary: {},
  navBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  navBtnSecondary: { borderWidth: 1.5 },
  navBtnSecondaryText: { fontSize: 15, fontWeight: '700' },
})
