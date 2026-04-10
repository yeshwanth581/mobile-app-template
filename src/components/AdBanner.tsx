import { View, Text, StyleSheet, Platform, TouchableOpacity, NativeModules } from 'react-native'
import { useRouter } from 'expo-router'
import { useSettingsStore } from '@/store/useSettingsStore'
import appConfig from '@/config/app.config'
import { spacing, radius } from '@/theme'

/**
 * Shows an ad banner for free users.
 * Returns null for subscribers — no banner at all.
 */
export function AdBanner({ isDark }: { isDark: boolean }) {
  const isSubscribed = useSettingsStore((s) => s.isSubscribed)
  const router = useRouter()

  if (!appConfig.featureFlags.enableAds || isSubscribed) return null

  // On web: placeholder (wire up AdSense separately)
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, isDark ? styles.wrapDark : styles.wrapLight]}>
        <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>Ad Banner</Text>
        <TouchableOpacity onPress={() => router.push('/subscription')}>
          <Text style={[styles.link, isDark ? styles.linkDark : styles.linkLight]}>Remove ads</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // On native: real AdMob banner — guard against TurboModule crash in Expo Go
  if (!NativeModules.RNGoogleMobileAdsModule) {
    return null
  }

  try {
    const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads')
    const { getBannerAdUnitId } = require('@/services/ads')

    return (
      <View style={styles.nativeWrap}>
        <BannerAd
          unitId={getBannerAdUnitId()}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    )
  } catch {
    return null
  }
}

const styles = StyleSheet.create({
  nativeWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  wrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  wrapLight: { backgroundColor: '#f8f8f8', borderColor: '#d9d9d9' },
  wrapDark:  { backgroundColor: '#1a1a1a', borderColor: '#333333' },
  text:  { fontSize: 11, fontWeight: '600' },
  textLight: { color: '#aaaaaa' },
  textDark:  { color: '#777777' },
  link: { fontSize: 10, marginTop: 4, textDecorationLine: 'underline' },
  linkLight: { color: '#cccccc' },
  linkDark: { color: '#666666' },
})
