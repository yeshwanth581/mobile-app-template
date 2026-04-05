import { memo, useDeferredValue, useMemo, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { getQuestionContent, getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'

type QuestionListItem = {
  id: string
  question: string
  translationQuestion?: string
  scopeLabel: string
  bookmarked: boolean
  weak: boolean
  neverAnswered: boolean
  correctCount: number
  attemptCount: number
  accuracyPercent: number
  recentResults: Array<'correct' | 'wrong'>
}

export default function QuestionBankScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { isDark, c } = useThemeColors()
  const { progress, toggleBookmark } = useProgressStore()
  const selectedStateCode = useSettingsStore((state) => state.selectedStateCode)
  const translationLocale = useSettingsStore((state) => state.translationLocale)

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const stateQuestions = useMemo(() => getStateQuestions(selectedStateCode), [selectedStateCode])
  const generalCount = useMemo(
    () => relevantQuestions.filter((question) => question.category === 'general').length,
    [relevantQuestions]
  )

  const listData = useMemo<QuestionListItem[]>(() => {
    const pool = activeCategory ? relevantQuestions.filter((question) => question.category === activeCategory) : relevantQuestions

    const localizedPool: QuestionListItem[] = pool.map((question) => {
      const localized = getQuestionContent(question, translationLocale)
      const showEnglishUnderGerman = translationLocale === 'en' && localized.translated
      const attempts = progress[question.id]?.attempts ?? []
      const bookmarked = progress[question.id]?.bookmarked ?? false
      const correctCount = attempts.filter((attempt) => attempt.result === 'correct').length
      const attemptCount = attempts.length
      const accuracy = attemptCount === 0 ? 0 : correctCount / attemptCount
      const weak = attemptCount >= 2 && accuracy < 0.5

      return {
        id: question.id,
        category: question.category,
        question: showEnglishUnderGerman ? question.question : localized.question,
        translationQuestion: showEnglishUnderGerman ? localized.question : undefined,
        scopeLabel:
          question.category === 'general'
            ? t('questions.generalOnly')
            : getStateLabel(question.category as typeof selectedStateCode) ?? question.category.toUpperCase(),
        bookmarked,
        weak,
        neverAnswered: attemptCount === 0,
        correctCount,
        attemptCount,
        accuracyPercent: Math.round(accuracy * 100),
        recentResults: attempts.slice(-5).map((attempt) => attempt.result),
      }
    })

    if (deferredSearch) {
      const searchedPool = localizedPool.filter((question) => question.question.toLowerCase().includes(deferredSearch))
      if (shuffle) {
        return [...searchedPool].sort(() => Math.random() - 0.5)
      }
      return searchedPool
    }

    if (shuffle) {
      return [...localizedPool].sort(() => Math.random() - 0.5)
    }

    return localizedPool
  }, [activeCategory, deferredSearch, progress, relevantQuestions, selectedStateCode, shuffle, t, translationLocale])

  const filterLabel =
    activeCategory === 'general'
      ? t('questions.generalOnly')
      : activeCategory && selectedStateCode
        ? getStateLabel(selectedStateCode) ?? t('questions.yourRegion')
        : t('questions.allActive')
  const visibleIds = useMemo(() => listData.map((item) => item.id), [listData])
  const visibleIdsParam = useMemo(() => JSON.stringify(visibleIds), [visibleIds])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <View style={[styles.headerWrap, { backgroundColor: c.bg }]}>
        <AppHeader title={t('questions.screenTitle')} />

        <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={{ color: c.textMuted }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: c.textPrimary }]}
            placeholder={t('questions.searchHint')}
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.dropdownCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setIsFilterOpen((open) => !open)}>
            <Text style={[typography.smallBd, { color: c.textPrimary }]}>{filterLabel}</Text>
            <Text style={[typography.tiny, { color: c.textMuted }]}>{isFilterOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isFilterOpen && (
            <View style={[styles.dropdownOptions, { borderTopColor: c.border }]}>
              <DropdownOption label={`${t('session.all')} (${relevantQuestions.length})`} active={activeCategory === null} onPress={() => { setActiveCategory(null); setIsFilterOpen(false) }} isDark={isDark} />
              <DropdownOption label={`${t('questions.generalOnly')} (${generalCount})`} active={activeCategory === 'general'} onPress={() => { setActiveCategory('general'); setIsFilterOpen(false) }} isDark={isDark} />
              {!!selectedStateCode && (
                <DropdownOption
                  label={`${getStateLabel(selectedStateCode)} (${stateQuestions.length})`}
                  active={activeCategory === selectedStateCode}
                  onPress={() => {
                    setActiveCategory(selectedStateCode)
                    setIsFilterOpen(false)
                  }}
                  isDark={isDark}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.controlsRow}>
          <Text style={[typography.tiny, { color: c.textMuted }]}>
            {t('common.questionCount', { count: listData.length })}
          </Text>
          <TouchableOpacity style={[styles.shuffleBtn, { backgroundColor: shuffle ? (isDark ? palette.accentBg.dark : palette.accentBg.light) : c.card }]} onPress={() => setShuffle(!shuffle)}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: shuffle ? palette.primary : c.textMuted }}>
              🔀 {shuffle ? t('questions.shuffleOn') : t('questions.shuffleOff')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={16}
        maxToRenderPerBatch={24}
        windowSize={10}
        removeClippedSubviews
        renderItem={({ item, index }) => (
          <QuestionRow
            item={item}
            isDark={isDark}
            cardColor={c.card}
            textColor={c.textPrimary}
            mutedColor={c.textMuted}
            weakLabel={t('questions.weak')}
            newLabel={t('questions.new')}
            onOpen={() =>
              router.push({
                pathname: '/questions/[id]',
                params: {
                  id: item.id,
                  ids: visibleIdsParam,
                  index: String(index),
                },
              })
            }
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
      />

      <BottomNav active="study" />
    </SafeAreaView>
  )
}

const QuestionRow = memo(function QuestionRow({
  item,
  isDark,
  cardColor,
  textColor,
  mutedColor,
  weakLabel,
  newLabel,
  onOpen,
  onToggleBookmark,
}: {
  item: QuestionListItem
  isDark: boolean
  cardColor: string
  textColor: string
  mutedColor: string
  weakLabel: string
  newLabel: string
  onOpen: () => void
  onToggleBookmark: () => void
}) {
  return (
    <TouchableOpacity
      style={[
        styles.qRow,
        { backgroundColor: cardColor },
        item.weak && { borderWidth: 1.5, borderColor: palette.red },
      ]}
      onPress={onOpen}
    >
      <View style={styles.qRowContent}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.smallBd, { color: textColor, marginBottom: 6 }]} numberOfLines={2}>
            {item.question}
          </Text>
          {!!item.translationQuestion && (
            <Text style={[styles.translationPreview, { color: mutedColor }]} numberOfLines={2}>
              {item.translationQuestion}
            </Text>
          )}

          <View style={styles.qMeta}>
            {item.recentResults.length > 0 && (
              <View style={styles.dots}>
                {item.recentResults.map((result, dotIndex) => (
                  <View
                    key={`${item.id}-${dotIndex}`}
                    style={[styles.dot, { backgroundColor: result === 'correct' ? palette.green : palette.red }]}
                  />
                ))}
              </View>
            )}

            {item.neverAnswered ? (
              <View style={[styles.badge, { backgroundColor: isDark ? palette.amberBadgeBg.dark : palette.amberBadgeBg.light }]}>
                <Text style={[styles.badgeText, { color: palette.amber }]}>{newLabel}</Text>
              </View>
            ) : item.weak ? (
              <View style={[styles.badge, { backgroundColor: isDark ? palette.redBadgeBg.dark : palette.redBadgeBg.light }]}>
                <Text style={[styles.badgeText, { color: palette.red }]}>{weakLabel}</Text>
              </View>
            ) : (
              <Text style={[typography.tiny, { color: mutedColor }]}>
                {item.correctCount}/{item.attemptCount} · {item.accuracyPercent}%
              </Text>
            )}

            <View style={[styles.badge, { backgroundColor: isDark ? palette.accentBgAlt.dark : palette.accentBgAlt.light }]}>
              <Text style={[styles.badgeText, { color: palette.primary }]}>{item.scopeLabel}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={onToggleBookmark}>
          <Text style={{ fontSize: 18, opacity: item.bookmarked ? 1 : 0.3 }}>🔖</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
})

function DropdownOption({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string
  active: boolean
  onPress: () => void
  isDark: boolean
}) {
  const bg = active ? palette.primary : (isDark ? palette.dropdownBg.dark : palette.dropdownBg.light)
  const color = active ? '#ffffff' : (isDark ? palette.dropdownText.dark : palette.dropdownText.light)
  const borderColor = active ? palette.primary : (isDark ? palette.dropdownBorder.dark : palette.dropdownBorder.light)

  return (
    <TouchableOpacity style={[styles.tab, { backgroundColor: bg, borderColor }]} onPress={onPress}>
      <Text style={{ fontSize: 11, fontWeight: '700', color }}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 13 },
  dropdownCard: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownOptions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 8,
    gap: 8,
  },
  tab: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  shuffleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40, gap: 8 },
  qRow: {
    borderRadius: radius.lg,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  qRowContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  translationPreview: { fontSize: 12, lineHeight: 17, marginBottom: 6 },
  qMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 999 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
})
