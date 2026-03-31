import { View, Text, StyleSheet, Platform } from 'react-native'
import { useSettingsStore } from '@/store/useSettingsStore'
import { palette, spacing, radius } from '@/theme'

/**
 * Shows an ad banner for free users.
 * Returns null for subscribers — no banner at all.
 * On web, shows a placeholder (swap for AdSense script in index.html).
 * On native, uses react-native-google-mobile-ads BannerAd.
 */
export function AdBanner({ isDark }: { isDark: boolean }) {
  const isSubscribed = useSettingsStore((s) => s.isSubscribed)
  if (isSubscribed) return null

  // On web: placeholder div (wire up AdSense separately in web/index.html)
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, isDark ? styles.wrapDark : styles.wrapLight]}>
        <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
          📢 Advertisement
        </Text>
      </View>
    )
  }

  // On native: real AdMob banner
  // Uncomment once react-native-google-mobile-ads is installed:
  //
  // import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'
  // import appConfig from '@/config/app.config'
  //
  // const adUnitId = Platform.OS === 'ios'
  //   ? appConfig.adConfig.bannerIdIOS
  //   : appConfig.adConfig.bannerIdAndroid
  //
  // return (
  //   <BannerAd
  //     unitId={adUnitId}
  //     size={BannerAdSize.BANNER}
  //     requestOptions={{ requestNonPersonalizedAdsOnly: true }}
  //   />
  // )

  return (
    <View style={[styles.wrap, isDark ? styles.wrapDark : styles.wrapLight]}>
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
        📢 Advertisement
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  wrapLight: { backgroundColor: '#f8fafc', borderColor: palette.light.border },
  wrapDark:  { backgroundColor: palette.dark.bg,   borderColor: palette.dark.border },
  text:  { fontSize: 11, fontWeight: '600' },
  textLight: { color: palette.light.textMuted },
  textDark:  { color: palette.dark.textMuted },
})
