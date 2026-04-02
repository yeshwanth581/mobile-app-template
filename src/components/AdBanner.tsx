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
        <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>Ad Banner</Text>
        <Text style={[styles.link, isDark ? styles.linkDark : styles.linkLight]}>Remove ads</Text>
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
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>Ad Banner</Text>
      <Text style={[styles.link, isDark ? styles.linkDark : styles.linkLight]}>Remove ads</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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
