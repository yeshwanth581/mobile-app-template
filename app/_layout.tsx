import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import '@/i18n'   // initialise i18next
import { useSettingsStore } from '@/store/useSettingsStore'
import { changeLanguage } from '@/i18n'
import { palette } from '@/theme'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { theme, uiLocale } = useSettingsStore()

  useEffect(() => {
    changeLanguage(uiLocale)
  }, [uiLocale])

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
          animation: 'none',
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
