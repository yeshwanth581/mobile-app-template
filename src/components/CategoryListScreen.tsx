import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { BottomNav, type NavKey } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import appConfig from '@/config/app.config'
import { getGeneralQuestions, getQuestionsForTopicCategory, getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius } from '@/theme'
import type { SessionConfig } from '@/types'

type ScreenMode = 'study' | 'practice'

interface CategoryListScreenProps {
  mode: ScreenMode
}

export function CategoryListScreen({ mode }: CategoryListScreenProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { c, isDark } = useThemeColors()
  const { progress, getWeakIds, getBookmarked } = useProgressStore()
  const selectedStateCode = useSettingsStore((state) => state.selectedStateCode)
  const translationLocale = useSettingsStore((state) => state.translationLocale)
  const [shuffle, setShuffle] = useState(mode === 'study')

  const keyPrefix = mode === 'study' ? 'study' : 'practice'
  const activeTab: NavKey = mode === 'study' ? 'study' : 'practice'
  const primaryCountLabel = mode === 'study' ? t('study.statPrimary') : t('practice.statPrimary')

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const generalQuestions = useMemo(() => getGeneralQuestions(), [])
  const stateQuestions = useMemo(() => getStateQuestions(selectedStateCode), [selectedStateCode])

  const activityCount = useMemo(
    () => Object.values(progress).filter((item) => item.attempts.length > 0).length,
    [progress]
  )

  const accuracyPct = useMemo(() => {
    const allAttempts = Object.values(progress).flatMap((item) => item.attempts)
    if (allAttempts.length === 0) return 0
    const correct = allAttempts.filter((attempt) => attempt.result === 'correct').length
    return Math.round((correct / allAttempts.length) * 100)
  }, [progress])

  const weakIds = getWeakIds()
  const bookmarkedIds = getBookmarked()
  const relevantQuestionIds = useMemo(
    () => new Set(relevantQuestions.map((question) => question.id)),
    [relevantQuestions]
  )
  const weakCount = useMemo(
    () => weakIds.filter((id) => relevantQuestionIds.has(id)).length,
    [relevantQuestionIds, weakIds]
  )
  const savedCount = useMemo(
    () => bookmarkedIds.filter((id) => relevantQuestionIds.has(id)).length,
    [bookmarkedIds, relevantQuestionIds]
  )
  const selectedStateLabel = getStateLabel(selectedStateCode)

  function launchSession(overrides: Partial<SessionConfig>) {
    const config: SessionConfig = {
      filter: 'all',
      category: null,
      count: relevantQuestions.length,
      shuffle,
      showTranslation: translationLocale !== appConfig.originalLocale,
      timed: false,
      mode: 'practice',
      presentation: mode,
      ...overrides,
    }

    router.push({
      pathname: '/practice/session',
      params: { config: JSON.stringify(config) },
    })
  }

  const groups = useMemo(() => {
    const weakIdSet = new Set(weakIds)
    const items: Array<{ id: string; label: string; emoji: string; count: number; weakCount: number }> = []

    if (selectedStateCode && selectedStateLabel) {
      items.push({
        id: selectedStateCode,
        label: selectedStateLabel,
        emoji: '📍',
        count: stateQuestions.length,
        weakCount: stateQuestions.filter((question) => weakIdSet.has(question.id)).length,
      })
    }

    for (const topic of [
      {
        id: 'politik',
        emoji: '🏛️',
      },
      {
        id: 'recht',
        emoji: '⚖️',
      },
      {
        id: 'geschichte',
        emoji: '🗺️',
      },
      {
        id: 'gesellschaft',
        emoji: '🌍',
      },
      {
        id: 'wirtschaft',
        emoji: '💶',
      },
    ] as const) {
      const topicQuestions = getQuestionsForTopicCategory(topic.id, selectedStateCode)
      items.push({
        id: topic.id,
        label: t(`categories.${topic.id}`),
        emoji: topic.emoji,
        count: topicQuestions.length,
        weakCount: topicQuestions.filter((question) => weakIdSet.has(question.id)).length,
      })
    }

    return items
  }, [selectedStateCode, selectedStateLabel, stateQuestions, t, weakIds])

  const primaryButtonBg = isDark ? '#ffffff' : '#111111'
  const primaryButtonText = isDark ? '#111111' : '#ffffff'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard value={String(activityCount)} label={primaryCountLabel} valueColor={c.textPrimary} cardColor={c.card} mutedColor={c.textMuted} />
          <StatCard value={`${accuracyPct}%`} label={t(`${keyPrefix}.statAccuracy`)} valueColor={palette.green} cardColor={c.card} mutedColor={c.textMuted} />
          <StatCard value={String(weakCount)} label={t(`${keyPrefix}.statWeak`)} valueColor={weakCount > 0 ? palette.red : c.textPrimary} cardColor={c.card} mutedColor={c.textMuted} />
          <StatCard value={String(savedCount)} label={t(`${keyPrefix}.statSaved`)} valueColor={c.textPrimary} cardColor={c.card} mutedColor={c.textMuted} />
        </View>

        <View style={styles.actionGrid}>
          <ActionCard
            title={t(`${keyPrefix}.weakCardTitle`)}
            subtitle={weakCount > 0 ? t('common.questionCount', { count: weakCount }) : t(`${keyPrefix}.weakEmpty`)}
            disabled={weakCount === 0}
            backgroundColor={c.bg}
            borderColor={c.border}
            titleColor={c.textPrimary}
            subtitleColor={c.textSecond}
            onPress={() => launchSession({ filter: 'weak', count: weakCount })}
          />
          <ActionCard
            title={t(`${keyPrefix}.savedCardTitle`)}
            subtitle={savedCount > 0 ? t('session.bookmarkSub', { n: savedCount }) : t(`${keyPrefix}.savedEmpty`)}
            disabled={savedCount === 0}
            backgroundColor={c.bg}
            borderColor={c.border}
            titleColor={c.textPrimary}
            subtitleColor={c.textSecond}
            onPress={() => launchSession({ filter: 'bookmarked', count: savedCount })}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t(`${keyPrefix}.categories`)}</Text>

        {groups.map((group) => {
          const weakSuffix = group.weakCount > 0 ? ` · ${t(`${keyPrefix}.weakSuffix`, { count: group.weakCount })}` : ''
          return (
            <TouchableOpacity
              key={group.id}
              style={[styles.catItem, { backgroundColor: c.card }]}
              onPress={() => launchSession({ filter: 'category', category: group.id, count: group.count })}
            >
              <Text style={styles.catEmoji}>{group.emoji}</Text>
              <View style={styles.catBody}>
                <Text style={[styles.catName, { color: c.textPrimary }]}>{group.label}</Text>
                <Text style={[styles.catCount, { color: c.textMuted }]}>
                  {t('common.questionCount', { count: group.count })}
                  {weakSuffix}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
            </TouchableOpacity>
          )
        })}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={[styles.stickyBar, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[styles.primaryAction, { backgroundColor: primaryButtonBg }]}
          onPress={() => launchSession({ filter: 'all', count: relevantQuestions.length })}
        >
          <Text style={[styles.primaryActionText, { color: primaryButtonText }]}>
            {t(`${keyPrefix}.launchAll`, { count: relevantQuestions.length })}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNav active={activeTab} />
    </SafeAreaView>
  )
}

function StatCard({
  value,
  label,
  valueColor,
  cardColor,
  mutedColor,
}: {
  value: string
  label: string
  valueColor: string
  cardColor: string
  mutedColor: string
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: cardColor }]}>
      <Text style={[styles.statVal, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: mutedColor }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

function ActionCard({
  title,
  subtitle,
  disabled,
  backgroundColor,
  borderColor,
  titleColor,
  subtitleColor,
  onPress,
}: {
  title: string
  subtitle: string
  disabled: boolean
  backgroundColor: string
  borderColor: string
  titleColor: string
  subtitleColor: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor, borderColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.acTitle, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.acSub, { color: subtitleColor, opacity: disabled ? 0.7 : 1 }]}>{subtitle}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: { flex: 1, borderRadius: radius.lg, padding: 16, borderWidth: 1.5, minHeight: 88 },
  acTitle: { fontSize: 14, fontWeight: '900', marginBottom: 6 },
  acSub: { fontSize: 11, lineHeight: 15 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  catItem: {
    borderRadius: radius.md,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  catEmoji: { fontSize: 16 },
  catBody: { flex: 1 },
  catName: { fontSize: 13, fontWeight: '600' },
  catCount: { fontSize: 11, marginTop: 1 },
  stickyBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryAction: { borderRadius: 14, padding: 14, alignItems: 'center' },
  primaryActionText: { fontSize: 15, fontWeight: '700' },
})
