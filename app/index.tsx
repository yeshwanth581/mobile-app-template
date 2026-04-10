import { startTransition, useCallback, useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '@/components/BottomNav'
import { LanguageIcon, SunIcon, MoonIcon, ChevronDownIcon, ArrowForwardIcon, StarIcon, ChevronForwardIcon, CheckIcon } from '@/components/AppIcons'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useSettingsStore } from '@/store/useSettingsStore'
import { REGIONS, getRegionLabel, TRANSLATION_OPTIONS } from '@/data/states'
import { getRelevantQuestions } from '@/data/questionBank'
import { palette, spacing, radius } from '@/theme'
import { hapticLight, hapticSelection } from '@/hooks/useHaptics'
import appConfig from '@/config/app.config'

export default function HomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { c, isDark } = useThemeColors()
  // Subscribe only to state values that affect rendering
  const selectedStateCode = useSettingsStore((s) => s.selectedStateCode)
  const translationLocale = useSettingsStore((s) => s.translationLocale)
  const isSubscribed     = useSettingsStore((s) => s.isSubscribed)
  const subscriptionType = useSettingsStore((s) => s.subscriptionType)
  const effectiveSubscribed = isSubscribed || appConfig.featureFlags.devForceSubscribed

  // Setters are stable references — access without creating a subscription
  const { setTheme, setSelectedStateCode, setTranslationLocale, setUiLocale } = useSettingsStore.getState()

  const [stateModalOpen, setStateModalOpen] = useState(false)
  const [languageModalOpen, setLanguageModalOpen] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const selectedStateLabel = useMemo(() => getRegionLabel(selectedStateCode), [selectedStateCode])

  const darkBtnBg       = c.btnPrimaryBg
  const darkBtnText     = c.btnPrimaryText
  const modalSelectedBg   = c.selectedBg
  const modalSelectedText = c.selectedText

  const handleSelectState = useCallback((code: Parameters<typeof setSelectedStateCode>[0]) => {
    hapticSelection()
    setStateModalOpen(false)
    startTransition(() => setSelectedStateCode(code))
  }, [setSelectedStateCode])

  const handleSelectLanguage = useCallback((code: Parameters<typeof setTranslationLocale>[0]) => {
    hapticSelection()
    setLanguageModalOpen(false)
    startTransition(() => {
      setTranslationLocale(code)
      if (code === 'de' || code === 'en') setUiLocale(code)
    })
  }, [setTranslationLocale, setUiLocale])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.localePill, { backgroundColor: c.card }]}
            onPress={() => setLanguageModalOpen(true)}
          >
            <LanguageIcon size={14} color={c.textPrimary} />
            <Text style={[styles.localeText, { color: c.textPrimary }]}>
              {translationLocale.toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => { hapticLight(); startTransition(() => setTheme(isDark ? 'light' : 'dark')) }}
            activeOpacity={1}
          >
            {isDark ? <SunIcon size={15} color={c.textPrimary} /> : <MoonIcon size={15} color={c.textPrimary} />}
          </TouchableOpacity>
        </View>

        {/* Centered hero */}
        <View style={styles.centerBlock}>
          <Text style={styles.flagEmoji}>{appConfig.flagEmoji}</Text>
          <Text style={[styles.appName, { color: c.textPrimary }]}>{appConfig.appName}</Text>
          <Text style={[styles.appDesc, { color: c.textSecond }]}>{t('home.tagline')}</Text>
        </View>

        {/* Region dropdown pill (only when app has regions) */}
        {appConfig.hasRegions && (
          <View style={styles.dropdownRow}>
            <TouchableOpacity
              style={[styles.stateDropdown, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => setStateModalOpen(true)}
            >
              <Text style={styles.ddPin}>📍</Text>
              <Text style={[styles.ddText, { color: c.textPrimary }]}>
                {selectedStateLabel ?? t('home.selectRegion')}
              </Text>
              <View style={[styles.ddChevron, { backgroundColor: c.chipBg }]}>
                <ChevronDownIcon size={10} color={c.chipText} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Big dark button — Practice */}
        <TouchableOpacity
          style={[styles.bigBtn, { backgroundColor: darkBtnBg }]}
          onPress={() => router.navigate('/practice')}
        >
          <View>
            <Text style={[styles.bigBtnTitle, { color: darkBtnText }]}>{t('home.practice')}</Text>
            <Text style={[styles.bigBtnDesc, { color: darkBtnText, opacity: 0.5 }]}>
              {t('home.activeQuestions', { count: relevantQuestions.length })}
            </Text>
          </View>
          <ArrowForwardIcon size={20} color={darkBtnText} />
        </TouchableOpacity>

        {/* Big light button — Mock Exam */}
        <TouchableOpacity
          style={[styles.bigBtn, { backgroundColor: c.card }]}
          onPress={() => router.navigate('/exam')}
        >
          <View>
            <Text style={[styles.bigBtnTitle, { color: c.textPrimary }]}>{t('exam.title')}</Text>
            <Text style={[styles.bigBtnDesc, { color: c.textMuted }]}>
              {t('home.examQuestionsMeta', {
                count: appConfig.examConfig.examQuestions,
                minutes: appConfig.examConfig.timeLimitMinutes,
              })}
            </Text>
          </View>
          <ArrowForwardIcon size={20} color={c.textPrimary} />
        </TouchableOpacity>

        {/* Premium card */}
        {appConfig.featureFlags.enableRevenueCat && (
          effectiveSubscribed ? (
            subscriptionType === 'lifetime' ? (
              // Lifetime — active badge, no action needed
              <View style={[styles.premiumCard, { backgroundColor: c.card, borderColor: '#22c55e' }]}>
                <View style={[styles.premiumIcon, { backgroundColor: '#22c55e' }]}>
                  <CheckIcon size={16} color="#ffffff" />
                </View>
                <View style={styles.premiumText}>
                  <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>
                    {t('home.lifetimeActiveTitle', { defaultValue: 'Lifetime Member' })}
                  </Text>
                  <Text style={[styles.premiumSub, { color: c.textMuted }]}>
                    {t('home.lifetimeActiveSub', { defaultValue: 'All features unlocked forever' })}
                  </Text>
                </View>
                <Text style={{ fontSize: 16 }}>♾️</Text>
              </View>
            ) : (
              // Recurring subscription — tappable, navigates to manage screen
              <TouchableOpacity
                style={[styles.premiumCard, { backgroundColor: c.card, borderColor: '#22c55e' }]}
                onPress={() => router.navigate('/subscription')}
              >
                <View style={[styles.premiumIcon, { backgroundColor: '#22c55e' }]}>
                  <CheckIcon size={16} color="#ffffff" />
                </View>
                <View style={styles.premiumText}>
                  <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>
                    {t('home.premiumActiveTitle', { defaultValue: 'Premium Active' })}
                  </Text>
                  <Text style={[styles.premiumSub, { color: c.textMuted }]}>
                    {t('home.premiumActiveSub', { defaultValue: 'Tap to manage or cancel' })}
                  </Text>
                </View>
                <ChevronForwardIcon size={16} color={c.textMuted} />
              </TouchableOpacity>
            )
          ) : (
            // Not subscribed — upsell
            <TouchableOpacity
              style={[styles.premiumCard, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => router.navigate('/subscription')}
            >
              <View style={[styles.premiumIcon, { backgroundColor: '#f59e0b' }]}>
                <StarIcon size={16} color="#ffffff" />
              </View>
              <View style={styles.premiumText}>
                <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>{t('home.premiumTitle')}</Text>
                <Text style={[styles.premiumSub, { color: c.textMuted }]}>{t('home.premiumSub')}</Text>
              </View>
              <ChevronForwardIcon size={16} color={c.textMuted} />
            </TouchableOpacity>
          )
        )}

        {/* Stats row */}
        <View style={[styles.statsRow, { borderTopColor: c.border }]}>
          <StatCell value={String(relevantQuestions.length)} label={t('home.totalLabel')} c={c} />
          <StatCell value={String(appConfig.examConfig.examQuestions)} label={t('home.examLabel')} c={c} />
          <StatCell value={`${appConfig.examConfig.timeLimitMinutes}m`} label={t('home.durationLabel')} c={c} />
          <StatCell value={String(appConfig.examConfig.passMark)} label={t('home.toPassLabel')} c={c} />
        </View>

      </ScrollView>

      {/* Region picker modal */}
      {appConfig.hasRegions && (
        <Modal
          visible={stateModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setStateModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setStateModalOpen(false)}
          >
            <View style={[styles.modalSheet, { backgroundColor: c.bg }]}>
              <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
                {t('home.yourRegion')}
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {REGIONS.map((region) => {
                  const isSelected = selectedStateCode === region.code
                  return (
                    <TouchableOpacity
                      key={region.code}
                      style={[
                        styles.modalOption,
                        {
                          backgroundColor: isSelected ? modalSelectedBg : c.card,
                          borderColor: isSelected ? modalSelectedBg : c.border,
                        },
                      ]}
                      onPress={() => handleSelectState(region.code)}
                    >
                      <Text style={[styles.modalOptionText, { color: isSelected ? modalSelectedText : c.textPrimary }]}>
                        {region.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <Modal
        visible={languageModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setLanguageModalOpen(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: c.bg }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
              {t('language.title')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {TRANSLATION_OPTIONS.map((option) => {
                const isSelected = translationLocale === option.code
                return (
                  <TouchableOpacity
                    key={option.code}
                    style={[
                      styles.modalOption,
                      {
                        backgroundColor: isSelected ? modalSelectedBg : c.card,
                        borderColor: isSelected ? modalSelectedBg : c.border,
                      },
                    ]}
                    onPress={() => handleSelectLanguage(option.code)}
                  >
                    <Text style={[styles.modalOptionText, { color: isSelected ? modalSelectedText : c.textPrimary }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav active="home" />
    </SafeAreaView>
  )
}

function StatCell({
  value,
  label,
  c,
}: {
  value: string
  label: string
  c: { textPrimary: string; textMuted: string }
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statVal, { color: c.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 32 },

  topRow:     { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 32 },
  iconBtn:    { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  localePill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, borderRadius: radius.full, paddingHorizontal: 10 },
  localeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  centerBlock: { alignItems: 'center', marginBottom: 24 },
  flagEmoji:   { fontSize: 28, marginBottom: 10 },
  appName:     { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  appDesc:     { fontSize: 13, lineHeight: 19, textAlign: 'center' },

  dropdownRow:   { alignItems: 'center', marginBottom: 28 },
  stateDropdown: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 14,
  },
  ddPin:     { fontSize: 14 },
  ddText:    { fontSize: 14, fontWeight: '600' },
  ddChevron: { width: 16, height: 16, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },

  bigBtn: {
    borderRadius: 16, padding: 20, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bigBtnTitle: { fontSize: 17, fontWeight: '700' },
  bigBtnDesc:  { fontSize: 12, marginTop: 2 },

  premiumCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 10,
  },
  premiumIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
  },
  premiumText:  { flex: 1 },
  premiumTitle: { fontSize: 13, fontWeight: '700' },
  premiumSub:   { fontSize: 11 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 28, paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  statCell: { alignItems: 'center' },
  statVal:  { fontSize: 18, fontWeight: '800' },
  statLbl:  { fontSize: 9, fontWeight: '600', marginTop: 1 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: '70%',
  },
  modalTitle:      { fontSize: 17, fontWeight: '800', marginBottom: 16 },
  modalOption:     { borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 8 },
  modalOptionText: { fontSize: 14, fontWeight: '600' },
})
