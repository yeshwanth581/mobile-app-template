import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Platform, Alert, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import {
  isRevenueCatAvailable,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/services/revenuecat'
import { CloseIcon, CheckIcon, StarIcon } from '@/components/AppIcons'
import { spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import type { PurchasesPackage } from 'react-native-purchases'

/** Convert ISO 8601 subscription period to months (0 = one-time / unknown) */
function subscriptionMonths(period: string | null | undefined): number {
  if (!period) return 0
  if (period === 'P1W')  return 0.25
  if (period === 'P1M')  return 1
  if (period === 'P3M')  return 3
  if (period === 'P6M')  return 6
  if (period === 'P1Y')  return 12
  return 0
}

const FEATURES = [
  'subscription.feature1',
  'subscription.feature2',
  'subscription.feature3',
  'subscription.feature4',
  'subscription.feature5',
] as const

export default function SubscriptionScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { isDark, c } = useThemeColors()
  const _isSubscribed    = useSettingsStore((s) => s.isSubscribed)
  const subscriptionType = useSettingsStore((s) => s.subscriptionType)
  const isSubscribed     = _isSubscribed || appConfig.featureFlags.devForceSubscribed
  const isLifetime       = subscriptionType === 'lifetime'

  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [offeringsLoading, setOfferingsLoading] = useState(true)

  // Fetch offerings from RevenueCat on mount
  useEffect(() => {
    if (isSubscribed || Platform.OS === 'web' || !isRevenueCatAvailable()) {
      setOfferingsLoading(false)
      return
    }
    getOfferings().then((offerings) => {
      const pkgs = offerings?.current?.availablePackages ?? []
      setPackages(pkgs)
      // Pre-select the longest subscription period (yearly), else first package
      const bestPkg = pkgs.reduce<PurchasesPackage | null>((best, pkg) => {
        if (!best) return pkg
        const bestMonths = subscriptionMonths(best.product.subscriptionPeriod)
        const pkgMonths  = subscriptionMonths(pkg.product.subscriptionPeriod)
        return pkgMonths > bestMonths ? pkg : best
      }, null)
      setSelectedPkg(bestPkg ?? pkgs[0] ?? null)
      setOfferingsLoading(false)
    })
  }, [isSubscribed])

  const handlePurchase = useCallback(async () => {
    if (!selectedPkg) return
    setLoading(true)
    try {
      const result = await purchasePackage(selectedPkg)
      if (result.success) {
        router.back()
      } else if (!result.cancelled && result.error) {
        Alert.alert(t('common.error', { defaultValue: 'Error' }), result.error)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedPkg, router, t])

  const handleRestore = useCallback(async () => {
    if (!isRevenueCatAvailable()) return
    setLoading(true)
    try {
      const result = await restorePurchases()
      if (result.success) {
        Alert.alert(
          t('subscription.restoreSuccessTitle', { defaultValue: 'Restored' }),
          t('subscription.restoreSuccessBody', { defaultValue: 'Your subscription has been restored.' }),
        )
        router.back()
      } else {
        Alert.alert(
          t('subscription.restoreNoneTitle', { defaultValue: 'Nothing to restore' }),
          t('subscription.restoreNoneBody', { defaultValue: 'No previous purchase found for this account.' }),
        )
      }
    } finally {
      setLoading(false)
    }
  }, [router, t])

  const btnBg   = c.btnPrimaryBg
  const btnText = c.btnPrimaryText

  // ─── Subscribed view ─────────────────────────────────────────────────────────
  if (isSubscribed) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: c.card }]} onPress={() => router.back()}>
              <CloseIcon color={c.textSecond} size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.hero}>
            <View style={[styles.heroBadge, { backgroundColor: '#22c55e' }]}>
              <CheckIcon color="#fff" size={36} />
            </View>
            <Text style={[typography.h2, { color: c.textPrimary, marginTop: 16 }]}>
              {t('subscription.activeTitle', { defaultValue: "You're subscribed" })}
            </Text>
            <Text style={[typography.small, { color: c.textMuted, textAlign: 'center', marginTop: 6 }]}>
              {t('subscription.activeBody', { defaultValue: 'All premium features are unlocked.' })}
            </Text>
          </View>

          <View style={[styles.featuresCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {FEATURES.map((key) => (
              <View key={key} style={styles.featureRow}>
                <CheckIcon color="#22c55e" size={16} />
                <Text style={[typography.small, { color: c.textPrimary }]}>{t(key)}</Text>
              </View>
            ))}
          </View>

          {!isLifetime && (
            <TouchableOpacity
              style={[styles.manageBtn, { borderColor: c.border }]}
              onPress={() => {
                const url = Platform.OS === 'ios'
                  ? 'https://apps.apple.com/account/subscriptions'
                  : 'https://play.google.com/store/account/subscriptions'
                Linking.openURL(url)
              }}
            >
              <Text style={[styles.manageBtnText, { color: c.textPrimary }]}>
                {t('subscription.manageBtn', { defaultValue: 'Manage / Cancel Subscription' })}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.hint, { color: c.textMuted }]}>
            {t('subscription.manageHint', { defaultValue: 'Manage your subscription in your platform account settings.' })}
          </Text>

        </ScrollView>
      </SafeAreaView>
    )
  }

  // ─── Non-subscriber view ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: c.card }]} onPress={() => router.back()}>
            <CloseIcon color={c.textSecond} size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: '#f59e0b' }]}>
            <StarIcon color="#fff" size={32} />
          </View>
          <Text style={[typography.h2, { color: c.textPrimary, marginTop: 16 }]}>
            {t('subscription.title', { defaultValue: 'Leben in Deutschland Pro' })}
          </Text>
          <Text style={[typography.small, { color: c.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 }]}>
            {t('subscription.description')}
          </Text>
        </View>

        <View style={[styles.featuresCard, { backgroundColor: c.card, borderColor: c.border }]}>
          {FEATURES.map((key) => (
            <View key={key} style={styles.featureRow}>
              <CheckIcon color="#22c55e" size={16} />
              <Text style={[typography.small, { color: c.textPrimary }]}>{t(key)}</Text>
            </View>
          ))}
        </View>

        {/* Package picker — populated from RC offerings */}
        {offeringsLoading ? (
          <ActivityIndicator color={c.textMuted} style={styles.offersLoader} />
        ) : packages.length > 0 ? (
          <View style={styles.plans}>
            {packages.map((pkg) => {
              const isSelected  = selectedPkg?.identifier === pkg.identifier
              const period      = pkg.product.subscriptionPeriod   // 'P1W' | 'P1M' | 'P1Y' | null
              const months      = subscriptionMonths(period)
              const isRecurring = months > 0
              const isBestValue = isRecurring && months === Math.max(...packages.map((p) => subscriptionMonths(p.product.subscriptionPeriod)))

              const perMonth = isBestValue && months > 1
                ? (pkg.product.price / months).toFixed(2)
                : null

              const subLabel = perMonth
                ? t('subscription.perMonthEq', { defaultValue: '≈ {{price}}/mo', price: `${pkg.product.currencyCode ?? ''}${perMonth}` })
                : !isRecurring
                  ? t('subscription.oneTime', { defaultValue: 'one-time' })
                  : null

              // Title pulled directly from RC / store — no hardcoding
              const planLabel = pkg.product.title || pkg.identifier

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.plan,
                    {
                      backgroundColor: c.card,
                      borderColor: isSelected ? c.btnPrimaryBg : c.border,
                      borderWidth: isSelected ? 2.5 : 1.5,
                    },
                  ]}
                  onPress={() => setSelectedPkg(pkg)}
                >
                  {isBestValue && (
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>
                        {t('subscription.bestValue', { defaultValue: 'BEST VALUE' })}
                      </Text>
                    </View>
                  )}
                  <Text style={[typography.tiny, { color: c.textMuted, marginTop: isBestValue ? 4 : 0 }]}>
                    {planLabel}
                  </Text>
                  <Text style={[styles.planPrice, { color: c.textPrimary }]}>
                    {pkg.product.priceString}
                  </Text>
                  {subLabel && (
                    <Text style={[typography.tiny, { color: isBestValue ? '#22c55e' : c.textMuted }]}>
                      {subLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        ) : null}

        {/* Purchase CTA */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: btnBg, opacity: (loading || !selectedPkg) ? 0.6 : 1 }]}
          onPress={handlePurchase}
          disabled={loading || !selectedPkg}
        >
          {loading
            ? <ActivityIndicator color={btnText} />
            : <Text style={[styles.btnText, { color: btnText }]}>
                {selectedPkg
                  ? `${t('subscription.ctaPrefix', { defaultValue: 'Subscribe' })} · ${selectedPkg.product.priceString}`
                  : t('subscription.viewPlans', { defaultValue: 'View Plans' })}
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={loading}>
          <Text style={[styles.restoreText, { color: c.textMuted }]}>
            {t('subscription.restore', { defaultValue: 'Restore purchase' })}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.fine, { color: c.textMuted }]}>
          {t('subscription.fine')}
        </Text>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 48, alignItems: 'center' },

  headerRow: { width: '100%', alignItems: 'flex-end', marginBottom: spacing.md },
  closeBtn: {
    width: 32, height: 32, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  hero: { alignItems: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
  heroBadge: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },

  featuresCard: {
    width: '100%', borderRadius: radius.lg, borderWidth: 1.5,
    padding: spacing.md, gap: 12, marginBottom: spacing.xl,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  offersLoader: { marginVertical: spacing.xl },

  plans: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    width: '100%', marginBottom: spacing.xl,
  },
  plan: {
    flex: 1, minWidth: 80, borderRadius: radius.lg, borderWidth: 1.5,
    padding: spacing.md, alignItems: 'center', gap: 4,
  },
  planPrice: { fontSize: 20, fontWeight: '900' },
  bestValueBadge: {
    backgroundColor: '#22c55e', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  bestValueText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  btn: {
    width: '100%', borderRadius: radius.lg, padding: 16,
    alignItems: 'center', marginBottom: spacing.sm,
  },
  btnText: { fontSize: 16, fontWeight: '700' },

  restoreBtn:  { paddingVertical: spacing.sm },
  restoreText: { fontSize: 13, textDecorationLine: 'underline' },
  hint:        { fontSize: 12, textAlign: 'center', lineHeight: 18, color: '#888' },
  fine:        { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: spacing.sm },
  manageBtn: {
    width: '100%', borderRadius: radius.lg, borderWidth: 1.5,
    padding: 14, alignItems: 'center', marginBottom: spacing.sm,
  },
  manageBtnText: { fontSize: 14, fontWeight: '600' },
})
