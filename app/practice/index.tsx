import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'
import type { QuestionFilter, SessionConfig } from '@/types'

export default function PracticeConfigScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ filter?: string; category?: string }>()
  const { isDark, c } = useThemeColors()
  const { selectedStateCode, translationLocale } = useSettingsStore()
  const { getWeakIds, getBookmarked } = useProgressStore()

  const [filter, setFilter] = useState<QuestionFilter>((params.filter as QuestionFilter) ?? 'all')
  const [category, setCategory] = useState<string | null>(params.category ?? null)
  const [shuffle, setShuffle] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const stateQuestions = useMemo(() => getStateQuestions(selectedStateCode), [selectedStateCode])
  const weakCount = getWeakIds().length
  const bookmarkCount = getBookmarked().length

  const filteredCount = (() => {
    switch (filter) {
      case 'category':
        return relevantQuestions.filter((question) => question.category === category).length
      case 'weak':
        return weakCount
      case 'bookmarked':
        return bookmarkCount
      default:
        return relevantQuestions.length
    }
  })()

  const showTranslation = translationLocale !== 'de'

  function start() {
    const config: SessionConfig = {
      filter,
      category: filter === 'category' ? category : null,
      count: filteredCount,
      shuffle,
      showTranslation,
      timed: false,
      mode: 'practice',
    }
    router.push({ pathname: '/practice/session', params: { config: JSON.stringify(config) } })
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader title={t('session.screenTitle')} />

        <Text style={[typography.label, styles.sectionLabel, { color: c.textMuted }]}>{String(t('session.questionSet')).toUpperCase()}</Text>

        <FilterOption selected={filter === 'all'} label={t('session.allActive')} sub={t('common.questionCount', { count: relevantQuestions.length })} onPress={() => setFilter('all')} isDark={isDark} />
        <FilterOption
          selected={filter === 'category' && category === 'general'}
          label={t('session.germanyOnly')}
          sub={t('common.questionCount', { count: relevantQuestions.filter((question) => question.category === 'general').length })}
          onPress={() => {
            setFilter('category')
            setCategory('general')
          }}
          isDark={isDark}
        />
        {!!selectedStateCode && (
          <FilterOption
            selected={filter === 'category' && category === selectedStateCode}
            label={getStateLabel(selectedStateCode) ?? t('session.yourState')}
            sub={t('common.questionCount', { count: stateQuestions.length })}
            onPress={() => {
              setFilter('category')
              setCategory(selectedStateCode)
            }}
            isDark={isDark}
          />
        )}
        <FilterOption
          selected={filter === 'weak'}
          label={`⚠️ ${t('session.weakTitle')}`}
          sub={t('common.questionCount', { count: weakCount })}
          subColor={palette.red}
          onPress={() => setFilter('weak')}
          isDark={isDark}
          disabled={weakCount === 0}
        />
        <FilterOption
          selected={filter === 'bookmarked'}
          label={`🔖 ${t('session.bookmarkedTitle')}`}
          sub={t('common.questionCount', { count: bookmarkCount })}
          onPress={() => setFilter('bookmarked')}
          isDark={isDark}
          disabled={bookmarkCount === 0}
        />

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.shuffleIconBtn,
              {
                backgroundColor: shuffle ? (isDark ? '#14532d' : '#dcfce7') : c.card,
                borderColor: shuffle ? palette.green : c.border,
              },
            ]}
            onPress={() => setShuffle((value) => !value)}
          >
            <Text style={[styles.shuffleIcon, { color: shuffle ? palette.green : c.textPrimary }]}>🔀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.startBtn, { backgroundColor: palette.primary }]} onPress={start} disabled={filteredCount === 0}>
            <Text style={styles.startBtnText}>▶ {t('session.start', { count: filteredCount })}</Text>
          </TouchableOpacity>
        </View>
        <BottomNav active="practice" />
      </View>
    </SafeAreaView>
  )
}

function FilterOption({
  selected,
  label,
  sub,
  subColor,
  onPress,
  isDark,
  disabled,
}: {
  selected: boolean
  label: string
  sub: string
  subColor?: string
  onPress: () => void
  isDark: boolean
  disabled?: boolean
}) {
  const c = isDark ? palette.dark : palette.light
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.filterRow,
        {
          backgroundColor: c.card,
          borderColor: selected ? palette.primary : c.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? palette.primary : c.textMuted,
            backgroundColor: selected ? palette.primary : 'transparent',
          },
        ]}
      >
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.smallBd, { color: c.textPrimary }]}>{label}</Text>
        <Text style={[typography.tiny, { color: subColor ?? c.textMuted }]}>{sub}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 24 },
  sectionLabel: { marginBottom: spacing.sm },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#fff',
  },
  footer: { borderTopWidth: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shuffleIconBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffleIcon: { fontSize: 17 },
  startBtn: { borderRadius: radius.lg, padding: 15, alignItems: 'center', flex: 1 },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
