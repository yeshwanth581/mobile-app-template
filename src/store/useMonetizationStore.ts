import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import appConfig from '@/config/app.config'
import { useSettingsStore } from '@/store/useSettingsStore'

const { monetizationConfig: mc } = appConfig

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

// ─── Store ───────────────────────────────────────────────────────────────────

interface MonetizationState {
  // Daily counters (reset when dateKey changes)
  dateKey: string
  examsToday: number
  rewardedExamsToday: number

  // Lifetime session counter (for interstitial cadence + upsell prompt)
  practiceSessionsTotal: number

  // Cooldown
  lastInterstitialTime: number   // Date.now() of last interstitial shown

  // ─── Actions ─────────────────────────────────────────────────────────────

  /** Call when user starts an exam */
  recordExam: () => void

  /** Call when user completes a rewarded ad for an extra exam */
  recordRewardedExam: () => void

  /** Call when a practice session finishes */
  recordPracticeSession: () => void

  /** Call after an interstitial ad is shown */
  recordInterstitialShown: () => void

  // ─── Gate checks (pure derivations, no side effects) ─────────────────────

  /** Can the free user start another exam today? */
  canTakeExam: () => boolean

  /** Has the user hit the rewarded ad cap for today? */
  canWatchRewardedAd: () => boolean

  /** Should we show an interstitial after this practice session? */
  shouldShowInterstitial: () => boolean

  /** Should we show the soft "go ad-free" prompt? */
  shouldShowUpsellPrompt: () => boolean

  /** How many exams remain today (including potential rewarded)? */
  examsRemaining: () => number
}

function isSubscribed() {
  return useSettingsStore.getState().isSubscribed
    || appConfig.featureFlags.devForceSubscribed
}

function ensureToday(state: Pick<MonetizationState, 'dateKey' | 'examsToday' | 'rewardedExamsToday'>) {
  const today = todayKey()
  if (state.dateKey === today) return state
  // New day — reset daily counters
  return { dateKey: today, examsToday: 0, rewardedExamsToday: 0 }
}

export const useMonetizationStore = create<MonetizationState>()(
  persist(
    (set, get) => ({
      dateKey: todayKey(),
      examsToday: 0,
      rewardedExamsToday: 0,
      practiceSessionsTotal: 0,
      lastInterstitialTime: 0,

      // ── Actions ────────────────────────────────────────────────────────────

      recordExam() {
        set((s) => {
          const daily = ensureToday(s)
          return { ...daily, examsToday: daily.examsToday + 1 }
        })
      },

      recordRewardedExam() {
        set((s) => {
          const daily = ensureToday(s)
          return { ...daily, rewardedExamsToday: daily.rewardedExamsToday + 1 }
        })
      },

      recordPracticeSession() {
        set((s) => ({ practiceSessionsTotal: s.practiceSessionsTotal + 1 }))
      },

      recordInterstitialShown() {
        set({ lastInterstitialTime: Date.now() })
      },

      // ── Gates ──────────────────────────────────────────────────────────────

      canTakeExam() {
        if (!appConfig.featureFlags.enableExamGating) return true
        if (isSubscribed()) return true
        if (mc.freeExamsPerDay === 0) return true // 0 = unlimited

        const s = get()
        const daily = ensureToday(s)
        const totalAllowed = mc.freeExamsPerDay + daily.rewardedExamsToday
        return daily.examsToday < totalAllowed
      },

      canWatchRewardedAd() {
        if (isSubscribed()) return false // no need
        if (mc.maxRewardedExamsPerDay === 0) return false

        const s = get()
        const daily = ensureToday(s)
        return daily.rewardedExamsToday < mc.maxRewardedExamsPerDay
      },

      shouldShowInterstitial() {
        if (!appConfig.featureFlags.enableAds) return false
        if (isSubscribed()) return false
        if (mc.interstitialEveryNSessions === 0) return false

        const s = get()
        // Check cadence
        if (s.practiceSessionsTotal % mc.interstitialEveryNSessions !== 0) return false
        // Check cooldown
        const elapsed = (Date.now() - s.lastInterstitialTime) / 1000
        return elapsed >= mc.cooldownBetweenInterstitials
      },

      shouldShowUpsellPrompt() {
        if (isSubscribed()) return false
        if (mc.softPromptAfterNSessions === 0) return false

        const s = get()
        // Show once at exactly the Nth session, then every multiple of N
        return s.practiceSessionsTotal > 0
          && s.practiceSessionsTotal % mc.softPromptAfterNSessions === 0
      },

      examsRemaining() {
        if (isSubscribed()) return Infinity

        const s = get()
        const daily = ensureToday(s)
        const totalAllowed = mc.freeExamsPerDay + daily.rewardedExamsToday
        return Math.max(0, totalAllowed - daily.examsToday)
      },
    }),
    {
      name: 'ryg-monetization',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist counters, not functions
      partialize: (state) => ({
        dateKey: state.dateKey,
        examsToday: state.examsToday,
        rewardedExamsToday: state.rewardedExamsToday,
        practiceSessionsTotal: state.practiceSessionsTotal,
        lastInterstitialTime: state.lastInterstitialTime,
      }),
    }
  )
)
