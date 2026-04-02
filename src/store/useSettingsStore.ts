import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GermanStateCode, SupportedLocale, TranslationLocale } from '@/types'
import appConfig from '@/config/app.config'

interface SettingsState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void
  surfaceStyle: 'cream' | 'bluegray'
  setSurfaceStyle: (s: 'cream' | 'bluegray') => void

  // Language for UI chrome (labels, buttons, etc.)
  uiLocale: SupportedLocale
  setUiLocale: (l: SupportedLocale) => void

  // Translation locale shown below original-language questions
  translationLocale: TranslationLocale
  setTranslationLocale: (l: TranslationLocale) => void

  selectedStateCode: GermanStateCode | null
  setSelectedStateCode: (code: GermanStateCode | null) => void

  // Subscription
  isSubscribed: boolean
  setSubscribed: (v: boolean) => void

  // Onboarding
  hasCompletedOnboarding: boolean
  setOnboardingComplete: () => void
}

const SETTINGS_STORAGE_DEBOUNCE_MS = 180

let pendingValue: string | null = null
let pendingTimer: ReturnType<typeof setTimeout> | null = null

const debouncedSettingsStorage = {
  getItem: (name: string) => AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => {
    pendingValue = value

    if (pendingTimer) clearTimeout(pendingTimer)

    pendingTimer = setTimeout(() => {
      const nextValue = pendingValue
      pendingTimer = null
      pendingValue = null
      if (nextValue !== null) {
        void AsyncStorage.setItem(name, nextValue)
      }
    }, SETTINGS_STORAGE_DEBOUNCE_MS)
  },
  removeItem: async (name: string) => {
    if (pendingTimer) {
      clearTimeout(pendingTimer)
      pendingTimer = null
      pendingValue = null
    }
    await AsyncStorage.removeItem(name)
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      surfaceStyle: 'cream',
      setSurfaceStyle: (surfaceStyle) => set({ surfaceStyle }),

      uiLocale: 'en',
      setUiLocale: (uiLocale) => set({ uiLocale }),

      translationLocale: 'en',
      setTranslationLocale: (translationLocale) => set({ translationLocale }),

      selectedStateCode: 'be',
      setSelectedStateCode: (selectedStateCode) => set({ selectedStateCode }),

      isSubscribed: false,
      setSubscribed: (isSubscribed) => set({ isSubscribed }),

      hasCompletedOnboarding: false,
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'ryg-settings',
      storage: createJSONStorage(() => debouncedSettingsStorage),
    }
  )
)
