import { useEffect, useCallback, useRef } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import '@/i18n'   // initialise i18next
import { useSettingsStore } from '@/store/useSettingsStore'
import { changeLanguage } from '@/i18n'
import { palette } from '@/theme'
import { initAds } from '@/services/ads'
import { initRevenueCat } from '@/services/revenuecat'
import appConfig from '@/config/app.config'

// Keep splash visible while stores hydrate
// Wrapped in try/catch — throws in Expo Go where native splash isn't registered
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = useSettingsStore((state) => state.theme)
  const uiLocale = useSettingsStore((state) => state.uiLocale)
  const hasHydrated = useSettingsStore((state) => state._hasHydrated)
  const didInit = useRef(false)

  useEffect(() => {
    changeLanguage(uiLocale)
  }, [uiLocale])

  // Initialize RevenueCat + Ads once after store hydration
  useEffect(() => {
    if (!hasHydrated || didInit.current) return
    didInit.current = true

    initRevenueCat()

    if (appConfig.featureFlags.enableAds) {
      initAds()
    }
  }, [hasHydrated])

  // Hide splash once stores are ready
  const onLayoutReady = useCallback(async () => {
    if (hasHydrated) {
      await SplashScreen.hideAsync().catch(() => {})
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
