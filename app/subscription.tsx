import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
// Lazy — not available in Expo Go
let Purchases: typeof import('react-native-purchases').default | null = null
try { Purchases = require('react-native-purchases').default } catch {}
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useTranslation } from 'react-i18next'
import { palette, semanticLight, semanticDark, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'

export default function SubscriptionScreen() {
  const router = useRouter()
  const { isDark, c } = useThemeColors()
  const { setSubscribed } = useSettingsStore()

  const { t } = useTranslation()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const primaryBtnBg = c.btnPrimaryBg
  const primaryBtnText = c.btnPrimaryText

  const FEATURES = [
    t('subscription.feature1'),
    t('subscription.feature2'),
    t('subscription.feature3'),
    t('subscription.feature4'),
    t('subscription.feature5'),
  ]

  const { entitlementId } = appConfig.revenueCatConfig

  async function subscribe() {
    if (Platform.OS === 'web' || !appConfig.featureFlags.enableRevenueCat || !Purchases) {
      Alert.alert('Coming soon', 'Subscriptions are not available yet.')
      return
    }

    setLoading(true)
    try {
      const offerings = await Purchases!.getOfferings()
      const pkg = selectedPlan === 'yearly'
        ? offerings.current?.annual
        : offerings.current?.monthly

      if (!pkg) {
        Alert.alert('Error', 'No packages available. Please try again later.')
        return
      }

      const { customerInfo } = await Purchases!.purchasePackage(pkg)
      if (customerInfo.entitlements.active[entitlementId]) {
        setSubscribed(true)
        router.back()
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', 'Purchase failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function restore() {
    if (Platform.OS === 'web' || !appConfig.featureFlags.enableRevenueCat || !Purchases) return

    setLoading(true)
    try {
      const customerInfo = await Purchases!.restorePurchases()
      if (customerInfo.entitlements.active[entitlementId]) {
        setSubscribed(true)
        Alert.alert('Restored', 'Your subscription has been restored.')
        router.back()
      } else {
        Alert.alert('Restore', 'No previous purchase found.')
      }
    } catch {
      Alert.alert('Error', 'Could not restore purchases. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Close */}
        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: c.card }]} onPress={() => router.back()}>
          <Text style={{ color: c.textSecond }}>✕</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.icon}><Text style={{ fontSize: 30 }}>⭐</Text></View>
          <Text style={[typography.h2, { color: c.textPrimary }]}>{t('subscription.title')}</Text>
          <Text style={[typography.small, { color: c.textMuted, textAlign: 'center', lineHeight: 20 }]}>
            {t('subscription.description')}
          </Text>
        </View>

        {/* Price options */}
        <View style={styles.plans}>
          <PlanCard
            label={t('subscription.monthly')}
            price="€1.99"
            sub={t('subscription.perMonth')}
            selected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
            isDark={isDark}
          />
          <PlanCard
            label={t('subscription.yearly')}
            price="€9.99"
            sub={t('subscription.savePercent', { pct: 58 })}
            selected={selectedPlan === 'yearly'}
            onPress={() => setSelectedPlan('yearly')}
            isDark={isDark}
            badge={t('subscription.bestValue')}
          />
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={{ color: palette.green, fontSize: 16 }}>✓</Text>
              <Text style={[typography.small, { color: c.textPrimary }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Subscribe CTA */}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: primaryBtnBg, opacity: loading ? 0.7 : 1 }]}
          onPress={subscribe}
          disabled={loading}
        >
          <Text style={[styles.ctaText, { color: primaryBtnText }]}>
            {loading ? t('common.processing', { defaultValue: 'Processing...' }) : t('subscription.cta', { price: selectedPlan === 'yearly' ? '€9.99' : '€1.99' })}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.fine, { color: c.textMuted }]}>
          {t('subscription.fine')}
        </Text>

        <TouchableOpacity onPress={restore}>
          <Text style={[styles.restore, { color: c.textSecond }]}>{t('subscription.restore', { defaultValue: 'Restore purchase' })}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

function PlanCard({
  label, price, sub, selected, onPress, isDark, badge,
}: {
  label: string; price: string; sub: string; selected: boolean
  onPress: () => void; isDark: boolean; badge?: string
}) {
  const sc = isDark ? semanticDark : semanticLight
  return (
    <TouchableOpacity
      style={[
        styles.plan,
        { backgroundColor: sc.card, borderColor: selected ? sc.textPrimary : sc.border },
      ]}
      onPress={onPress}
    >
      {badge && (
        <View style={[styles.badge, { backgroundColor: sc.btnPrimaryBg }]}>
          <Text style={[styles.badgeText, { color: sc.btnPrimaryText }]}>{badge}</Text>
        </View>
      )}
      <Text style={[typography.tiny, { color: sc.textMuted }]}>{label}</Text>
      <Text style={{ fontSize: 24, fontWeight: '900', color: sc.textPrimary }}>{price}</Text>
      <Text style={[typography.tiny, { color: sc.textMuted }]}>{sub}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40, alignItems: 'center' },
  closeBtn: { alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  hero:   { alignItems: 'center', gap: 8, marginBottom: spacing.lg },
  icon:   { width: 64, height: 64, borderRadius: 18, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  plans:  { flexDirection: 'row', gap: 10, marginBottom: spacing.lg, width: '100%' },
  plan: {
    flex: 1, borderRadius: radius.lg, padding: 14, borderWidth: 2,
    alignItems: 'center', gap: 3, position: 'relative', overflow: 'visible',
  },
  badge: {
    position: 'absolute', top: -10, left: '50%', transform: [{ translateX: -30 }],
    borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  features: { width: '100%', gap: 10, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cta: { width: '100%', borderRadius: radius.lg, padding: 15, alignItems: 'center', marginBottom: spacing.sm },
  ctaText: { fontSize: 15, fontWeight: '700' },
  fine: { fontSize: 11, marginBottom: spacing.sm },
  restore: { fontSize: 12, textDecorationLine: 'underline' },
})
