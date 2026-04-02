import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { BottomNav } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useSettingsStore } from '@/store/useSettingsStore'
import { GERMAN_STATES, getStateLabel, TRANSLATION_OPTIONS } from '@/data/states'
import { getRelevantQuestions } from '@/data/questionBank'
import { changeLanguage } from '@/i18n'
import { palette, spacing, radius } from '@/theme'
import appConfig from '@/config/app.config'

export default function HomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { c, isDark } = useThemeColors()
  const { selectedStateCode, setSelectedStateCode, theme, setTheme, translationLocale, setTranslationLocale, setUiLocale } = useSettingsStore()
  const [stateModalOpen, setStateModalOpen] = useState(false)
  const [languageModalOpen, setLanguageModalOpen] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const selectedStateLabel = getStateLabel(selectedStateCode)
  const darkBtnBg   = isDark ? '#ffffff' : '#111111'
  const darkBtnText = isDark ? '#111111' : '#ffffff'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => setLanguageModalOpen(true)}
          >
            <Ionicons name="language-outline" size={16} color={c.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={15} color={c.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Centered hero */}
        <View style={styles.centerBlock}>
          <Text style={styles.flagEmoji}>{appConfig.flagEmoji}</Text>
          <Text style={[styles.appName, { color: c.textPrimary }]}>{appConfig.appName}</Text>
          <Text style={[styles.appDesc, { color: c.textSecond }]}>{t('home.tagline')}</Text>
        </View>

        {/* State dropdown pill */}
        <View style={styles.dropdownRow}>
          <TouchableOpacity
            style={[styles.stateDropdown, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => setStateModalOpen(true)}
          >
            <Text style={styles.ddPin}>📍</Text>
            <Text style={[styles.ddText, { color: c.textPrimary }]}>
              {selectedStateLabel ?? t('home.selectState')}
            </Text>
            <View style={[styles.ddChevron, { backgroundColor: isDark ? '#333333' : '#dddddd' }]}>
              <Ionicons name="chevron-down" size={10} color={isDark ? '#aaaaaa' : '#666666'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Big dark button — Practice */}
        <TouchableOpacity
          style={[styles.bigBtn, { backgroundColor: darkBtnBg }]}
          onPress={() => router.push('/practice')}
        >
          <View>
            <Text style={[styles.bigBtnTitle, { color: darkBtnText }]}>{t('home.practice')}</Text>
            <Text style={[styles.bigBtnDesc, { color: darkBtnText, opacity: 0.5 }]}>
              {t('home.activeQuestions', { count: relevantQuestions.length })}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={darkBtnText} />
        </TouchableOpacity>

        {/* Big light button — Mock Exam */}
        <TouchableOpacity
          style={[styles.bigBtn, { backgroundColor: c.card }]}
          onPress={() => router.push('/exam')}
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
          <Ionicons name="arrow-forward" size={20} color={c.textPrimary} />
        </TouchableOpacity>

        {/* Premium card */}
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push('/subscription')}
        >
          <View style={styles.premiumIcon}>
            <Ionicons name="star" size={16} color="#ffffff" />
          </View>
          <View style={styles.premiumText}>
            <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>{t('home.premiumTitle')}</Text>
            <Text style={[styles.premiumSub, { color: c.textMuted }]}>{t('home.premiumSub')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>

        {/* Stats row */}
        <View style={[styles.statsRow, { borderTopColor: c.border }]}>
          <StatCell value={String(relevantQuestions.length)} label={t('home.totalLabel')} c={c} />
          <StatCell value={String(appConfig.examConfig.examQuestions)} label={t('home.examLabel')} c={c} />
          <StatCell value={`${appConfig.examConfig.timeLimitMinutes}m`} label={t('home.durationLabel')} c={c} />
          <StatCell value={String(appConfig.examConfig.passMark)} label={t('home.toPassLabel')} c={c} />
        </View>

      </ScrollView>

      {/* State picker modal */}
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
              {t('home.yourState')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {GERMAN_STATES.map((state) => {
                const isSelected = selectedStateCode === state.code
                return (
                  <TouchableOpacity
                    key={state.code}
                    style={[
                      styles.modalOption,
                      {
                        backgroundColor: isSelected ? '#111111' : c.card,
                        borderColor: isSelected ? '#111111' : c.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedStateCode(state.code)
                      setStateModalOpen(false)
                    }}
                  >
                    <Text style={[styles.modalOptionText, { color: isSelected ? '#ffffff' : c.textPrimary }]}>
                      {state.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
                        backgroundColor: isSelected ? '#111111' : c.card,
                        borderColor: isSelected ? '#111111' : c.border,
                      },
                    ]}
                    onPress={() => {
                      setTranslationLocale(option.code)
                      if (option.code === 'de' || option.code === 'en') {
                        setUiLocale(option.code)
                        changeLanguage(option.code)
                      }
                      setLanguageModalOpen(false)
                    }}
                  >
                    <Text style={[styles.modalOptionText, { color: isSelected ? '#ffffff' : c.textPrimary }]}>
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
