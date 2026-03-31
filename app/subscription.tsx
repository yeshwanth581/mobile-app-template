import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'

const FEATURES = [
  'All questions — always free',
  'Zero ads — anywhere in app',
  'Offline mode',
  'Detailed progress stats',
  'Cancel anytime',
]

export default function SubscriptionScreen() {
  const router = useRouter()
  const { isDark, c } = useThemeColors()
  const { setSubscribed } = useSettingsStore()

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  async function subscribe() {
    setLoading(true)
    try {
      /**
       * RevenueCat integration:
       *
       * import Purchases from 'react-native-purchases'
       *
       * const offerings = await Purchases.getOfferings()
       * const pkg = selectedPlan === 'yearly'
       *   ? offerings.current?.annual
       *   : offerings.current?.monthly
       * if (pkg) {
       *   const { customerInfo } = await Purchases.purchasePackage(pkg)
       *   if (customerInfo.entitlements.active['ad_free']) {
       *     setSubscribed(true)
       *     router.back()
       *   }
       * }
       */

      // Placeholder until RevenueCat is wired up
      Alert.alert('Coming soon', 'Payment integration will be added before release.')
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Error', 'Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function restore() {
    /**
     * const { customerInfo } = await Purchases.restorePurchases()
     * if (customerInfo.entitlements.active['ad_free']) {
     *   setSubscribed(true)
     *   router.back()
     * }
     */
    Alert.alert('Restore', 'No previous purchase found.')
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
          <Text style={[typography.h2, { color: c.textPrimary }]}>Go Ad-Free</Text>
          <Text style={[typography.small, { color: c.textMuted, textAlign: 'center', lineHeight: 20 }]}>
            All questions stay free. Remove ads for{'\n'}a distraction-free experience.
          </Text>
        </View>

        {/* Price options */}
        <View style={styles.plans}>
          <PlanCard
            label="Monthly"
            price="€1.99"
            sub="per month"
            selected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
            isDark={isDark}
          />
          <PlanCard
            label="Yearly"
            price="€9.99"
            sub="€0.83/month · Save 58%"
            selected={selectedPlan === 'yearly'}
            onPress={() => setSelectedPlan('yearly')}
            isDark={isDark}
            badge="BEST VALUE"
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
          style={[styles.cta, { backgroundColor: palette.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={subscribe}
          disabled={loading}
        >
          <Text style={styles.ctaText}>
            {loading ? 'Processing…' : `Subscribe · ${selectedPlan === 'yearly' ? '€9.99/year' : '€1.99/month'}`}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.fine, { color: c.textMuted }]}>
          Billed {selectedPlan === 'yearly' ? 'annually' : 'monthly'} · Cancel anytime
        </Text>

        <TouchableOpacity onPress={restore}>
          <Text style={[styles.restore, { color: c.textSecond }]}>Restore purchase</Text>
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
  const c = isDark ? palette.dark : palette.light
  return (
    <TouchableOpacity
      style={[
        styles.plan,
        { backgroundColor: c.card, borderColor: selected ? palette.primary : c.border },
      ]}
      onPress={onPress}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Text style={[typography.tiny, { color: c.textMuted }]}>{label}</Text>
      <Text style={{ fontSize: 24, fontWeight: '900', color: palette.primary }}>{price}</Text>
      <Text style={[typography.tiny, { color: c.textMuted }]}>{sub}</Text>
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
    backgroundColor: palette.primary, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  features: { width: '100%', gap: 10, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cta: { width: '100%', borderRadius: radius.lg, padding: 15, alignItems: 'center', marginBottom: spacing.sm },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fine: { fontSize: 11, marginBottom: spacing.sm },
  restore: { fontSize: 12, textDecorationLine: 'underline' },
})
