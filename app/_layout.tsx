import { useEffect, useCallback, useRef } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, useColorScheme } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
// Lazy — not available in Expo Go
let Purchases: typeof import('react-native-purchases').default | null = null
let LOG_LEVEL: typeof import('react-native-purchases').LOG_LEVEL | undefined
try {
  const rc = require('react-native-purchases')
  Purchases = rc.default
  LOG_LEVEL = rc.LOG_LEVEL
} catch {
  // Expo Go — module not available
}
import '@/i18n'   // initialise i18next
import { useSettingsStore } from '@/store/useSettingsStore'
import { changeLanguage } from '@/i18n'
import { palette } from '@/theme'
import { initAds } from '@/services/ads'
import appConfig from '@/config/app.config'

// Keep splash visible while stores hydrate
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = useSettingsStore((state) => state.theme)
  const uiLocale = useSettingsStore((state) => state.uiLocale)
  const hasHydrated = useSettingsStore((state) => state._hasHydrated)
  const didInit = useRef(false)

  useEffect(() => {
    changeLanguage(uiLocale)
  }, [uiLocale])

  // Initialize RevenueCat + Ads once
  useEffect(() => {
    if (!hasHydrated || didInit.current || Platform.OS === 'web') return
    didInit.current = true

    const { featureFlags } = appConfig

    // RevenueCat — skip when keys are placeholders or module unavailable
    const rc = appConfig.revenueCatConfig
    const rcApiKey = Platform.OS === 'ios' ? rc.apiKeyIOS : rc.apiKeyAndroid
    const rcReady = featureFlags.enableRevenueCat
      && Purchases
      && !rcApiKey.startsWith('REVENUECAT_')  // skip placeholder keys

    if (rcReady) {
      try {
        if (__DEV__ && LOG_LEVEL) Purchases!.setLogLevel(LOG_LEVEL.DEBUG)
        Purchases!.configure({ apiKey: rcApiKey })

        Purchases!.addCustomerInfoUpdateListener((info) => {
          const entitled = !!info.entitlements.active[rc.entitlementId]
          useSettingsStore.getState().setSubscribed(entitled)
        })
      } catch (e) {
        if (__DEV__) console.log('[rc] RevenueCat init failed:', e)
      }
    } else if (__DEV__ && featureFlags.enableRevenueCat) {
      console.log('[rc] Skipped — placeholder keys or module unavailable')
    }

    // Ads
    if (featureFlags.enableAds) {
      initAds()
    }
  }, [hasHydrated])

  // Hide splash once stores are ready
  const onLayoutReady = useCallback(async () => {
    if (hasHydrated) {
      await SplashScreen.hideAsync()
    }
  }, [hasHydrated])

  useEffect(() => {
    onLayoutReady()
  }, [onLayoutReady])

  const isDark =
    theme === 'dark' ? true :
    theme === 'light' ? false :
    colorScheme === 'dark'

  const bg = isDark ? palette.dark.bg : palette.light.bg

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg },
          animation: 'simple_push',
          freezeOnBlur: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="study/index" />
        <Stack.Screen name="language" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="subscription" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="practice/index" />
        <Stack.Screen name="practice/session" options={{ gestureEnabled: false }} />
        <Stack.Screen name="questions/index" />
        <Stack.Screen name="questions/[id]" />
        <Stack.Screen name="exam" options={{ gestureEnabled: false }} />
        <Stack.Screen name="results" />
      </Stack>
    </>
  )
}
