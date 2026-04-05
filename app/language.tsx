import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { TRANSLATION_OPTIONS } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'
import { hapticSelection } from '@/hooks/useHaptics'

export default function LanguageScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { isDark, c } = useThemeColors()
  const translationLocale = useSettingsStore((state) => state.translationLocale)
  const setTranslationLocale = useSettingsStore((state) => state.setTranslationLocale)
  const setUiLocale = useSettingsStore((state) => state.setUiLocale)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.card }]}>
            <Text style={{ color: c.textSecond }}>✕</Text>
          </TouchableOpacity>
          <Text style={[typography.h3, { color: c.textPrimary }]}>{t('language.title')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={[styles.infoNote, { backgroundColor: isDark ? palette.infoBg.dark : palette.infoBg.light, borderColor: isDark ? palette.infoBorder.dark : palette.infoBorder.light }]}>
          <Text style={{ fontSize: 16 }}>ℹ️</Text>
          <Text style={[styles.infoText, { color: isDark ? palette.infoText.dark : palette.infoText.light }]}>
            {t('language.note')}
          </Text>
        </View>

        {TRANSLATION_OPTIONS.map((option) => {
          const isSelected = translationLocale === option.code
          return (
            <TouchableOpacity
              key={option.code}
              style={[
                styles.langRow,
                {
                  backgroundColor: c.card,
                  borderColor: isSelected ? palette.primary : c.border,
                },
              ]}
              onPress={() => {
                hapticSelection()
                setTranslationLocale(option.code)
                if (option.code === 'de' || option.code === 'en') {
                  setUiLocale(option.code)
                }
                router.back()
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: c.textPrimary }]}>{option.label}</Text>
                <Text style={[typography.tiny, { color: c.textMuted }]}>
                  {option.code === 'de'
                    ? t('language.deHint')
                    : option.code === 'fr'
                      ? t('language.frHint')
                      : t('language.enHint')}
                </Text>
              </View>
              {isSelected && <Text style={{ color: palette.primary, fontSize: 16, fontWeight: '700' }}>✓</Text>}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
})
