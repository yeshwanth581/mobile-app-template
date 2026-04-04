import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { LanguageIcon } from '@/components/AppIcons'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { QuestionCard } from '@/components/QuestionCard'
import { OptionButton } from '@/components/OptionButton'
import { QuestionJumpPicker } from '@/components/QuestionJumpPicker'
import { palette, spacing, radius, typography } from '@/theme'
import { hapticLight } from '@/hooks/useHaptics'
import { getQuestionById } from '@/data/questionBank'
import appConfig from '@/config/app.config'

export default function QuestionDetailScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ id: string; ids?: string; index?: string }>()
  const { isDark, c } = useThemeColors()
  const translationLocale = useSettingsStore((state) => state.translationLocale)
  const { toggleBookmark, getProgress } = useProgressStore()

  const questionIds = useMemo(() => {
    if (!params.ids) return [params.id]
    try {
      return JSON.parse(params.ids) as string[]
    } catch {
      return [params.id]
    }
  }, [params.id, params.ids])

  const initialIndex = Number.isFinite(Number(params.index)) ? Number(params.index) : 0
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [translationActive, setTranslationActive] = useState(false)
  const currentId = questionIds[currentIndex] ?? params.id
  const question = getQuestionById(currentId)

  if (!question) return null

  const translationDisabled = translationLocale === appConfig.originalLocale
  const showTranslation = translationActive && !translationDisabled
  const transBtnBg = showTranslation ? c.btnPrimaryBg : c.card
  const transBtnColor = showTranslation ? c.btnPrimaryText : c.textMuted
  const bookmarked = getProgress(question.id).bookmarked

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: c.textSecond }}>✕</Text>
          </TouchableOpacity>

          <QuestionJumpPicker
            currentIndex={currentIndex}
            total={questionIds.length}
            onSelect={setCurrentIndex}
            isDark={isDark}
            compact
          />

          <View style={styles.topRight}>
            <TouchableOpacity
              style={[styles.localePill, { backgroundColor: transBtnBg, opacity: translationDisabled ? 0.35 : 1 }]}
              onPress={() => { hapticLight(); setTranslationActive((value) => !value) }}
              disabled={translationDisabled}
            >
              <LanguageIcon size={14} color={transBtnColor} />
              <Text style={[styles.localeText, { color: transBtnColor }]}>{translationLocale.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { hapticLight(); toggleBookmark(question.id) }}>
              <Text style={{ fontSize: 18, opacity: bookmarked ? 1 : 0.3 }}>🔖</Text>
            </TouchableOpacity>
          </View>
        </View>

        <QuestionCard
          question={question}
          translationLocale={translationLocale}
          showTranslation={showTranslation}
          isDark={isDark}
        />

        <Text style={[styles.highlightText, { color: palette.green }]}>
          {t('questionDetail.highlighted')}
        </Text>

        <View style={styles.options}>
          {question.options.map((_, index) => (
            <OptionButton
              key={index}
              index={index}
              question={question}
              translationLocale={translationLocale}
              showTranslation={showTranslation}
              chosenIndex={question.correct}
              isDark={isDark}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnSecondary,
              { borderColor: c.border, opacity: currentIndex === 0 ? 0.45 : 1 },
            ]}
            onPress={() => { hapticLight(); setCurrentIndex((index) => Math.max(index - 1, 0)) }}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.navBtnSecondaryText, { color: c.textPrimary }]}>← {t('questionDetail.previous')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnPrimary,
              { backgroundColor: palette.primary, opacity: currentIndex === questionIds.length - 1 ? 0.45 : 1 },
            ]}
            onPress={() => { hapticLight(); setCurrentIndex((index) => Math.min(index + 1, questionIds.length - 1)) }}
            disabled={currentIndex === questionIds.length - 1}
          >
            <Text style={styles.navBtnPrimaryText}>{t('questionDetail.next')} →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  localePill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, borderRadius: 10, paddingHorizontal: 10 },
  localeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  highlightText: { fontSize: 11, marginTop: -2, marginBottom: spacing.md, textAlign: 'right' },
  options: { gap: 9 },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  navBtn: { flex: 1, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  navBtnPrimary: {},
  navBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  navBtnSecondary: { borderWidth: 1.5 },
  navBtnSecondaryText: { fontSize: 15, fontWeight: '700' },
})
