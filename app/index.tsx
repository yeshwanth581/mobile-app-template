import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useSettingsStore } from '@/store/useSettingsStore'
import { GERMAN_STATES, getStateLabel } from '@/data/states'
import { getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'

export default function HomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { c, isDark } = useThemeColors()
  const { selectedStateCode, setSelectedStateCode } = useSettingsStore()
  const [isStateOpen, setIsStateOpen] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const stateQuestions = useMemo(() => getStateQuestions(selectedStateCode), [selectedStateCode])
  const selectedStateLabel = getStateLabel(selectedStateCode)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.hero}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconEmoji}>{appConfig.flagEmoji}</Text>
          </View>
          <Text style={[typography.h2, { color: c.textPrimary, textAlign: 'center' }]}>
            {t('home.title')}
          </Text>
          <Text style={[typography.small, { color: c.textMuted, textAlign: 'center' }]}>
            {t('home.tagline')}
          </Text>
        </View>

        <View style={[styles.stateCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.stateCardHeader}>
            <View>
              <Text style={[typography.label, { color: c.textMuted }]}>{t('home.yourState')}</Text>
              <Text style={[typography.body, { color: c.textPrimary, marginTop: 4 }]}>
                {selectedStateLabel ?? t('home.selectState')}
              </Text>
              <Text style={[typography.tiny, { color: c.textMuted, marginTop: 4 }]}>
                {selectedStateCode
                  ? t('home.stateIncluded', { count: stateQuestions.length })
                  : t('home.germanyOnlyUntilState')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.stateAction, { backgroundColor: isDark ? '#20262b' : '#f1f5f9' }]}
              onPress={() => setIsStateOpen((value) => !value)}
            >
              <Text style={[typography.tiny, { color: isDark ? '#ffffff' : '#111111' }]}>
                {isStateOpen ? t('common.close') : t('common.change')}
              </Text>
            </TouchableOpacity>
          </View>

          {isStateOpen && (
            <View style={[styles.stateList, { borderTopColor: c.border }]}>
              {GERMAN_STATES.map((state) => {
                const active = selectedStateCode === state.code
                return (
                  <TouchableOpacity
                    key={state.code}
                    style={[
                      styles.stateOption,
                      {
                        backgroundColor: active ? palette.primary : (isDark ? '#0f172a' : '#ffffff'),
                        borderColor: active ? palette.primary : c.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedStateCode(state.code)
                      setIsStateOpen(false)
                    }}
                  >
                    <Text style={[typography.smallBd, { color: active ? '#fff' : c.textPrimary }]}>
                      {state.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: c.card }]}>
          <Text style={[typography.smallBd, { color: c.textPrimary }]}>
            {t('home.ready', { count: relevantQuestions.length })}
          </Text>
          <Text style={[typography.small, { color: c.textMuted }]}>
            {selectedStateCode && selectedStateLabel
              ? t('home.readyWithState', { count: stateQuestions.length, state: selectedStateLabel })
              : t('home.readyNoState')}
          </Text>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: palette.primary }]}
            onPress={() => router.push('/practice')}
          >
            <Text style={styles.btnPrimaryText}>▶ {t('home.practice')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: c.border }]}
            onPress={() => router.push('/exam')}
          >
            <Text style={[styles.btnSecondaryText, { color: c.textPrimary }]}>
              📋 {t('home.mockExam', { count: appConfig.examConfig.examQuestions })}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav active="home" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', gap: 6, paddingVertical: 20 },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appIconEmoji: { fontSize: 36 },
  stateCard: {
    borderWidth: 1.5,
    borderRadius: radius.xl,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  stateCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: 16,
  },
  stateAction: {
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateList: {
    borderTopWidth: 1,
    padding: 10,
    gap: 8,
  },
  stateOption: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryCard: {
    borderRadius: radius.xl,
    padding: 16,
    marginVertical: spacing.sm,
    gap: 4,
  },
  btnGroup: { gap: spacing.sm, marginTop: spacing.sm },
  btnPrimary: {
    borderRadius: radius.lg,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '700' },
})
