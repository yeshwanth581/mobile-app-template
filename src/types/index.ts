// ─── Question ────────────────────────────────────────────────────────────────

export interface QuestionTranslation {
  question: string
  options: string[]
  explanation: string
}

export interface Question {
  id: string
  question: string         // always in the original language (e.g. German)
  options: string[]        // always in the original language
  correct: number          // index into options[]
  explanation: string      // always in the original language
  image?: string
  category: string         // 'general' or a region code (e.g. 'be', 'bw') — scope filtering
  tags: string[]           // topic tags matching IDs from app.config.ts categories
  difficulty: 'easy' | 'medium' | 'hard'
  source: string           // law/regulation section this tests
  translations: Partial<Record<TranslationLocale, QuestionTranslation>>
}

// ─── Progress (stored locally per question) ───────────────────────────────────

export type AttemptResult = 'correct' | 'wrong'
export type SessionMode = 'practice' | 'exam'

export interface Attempt {
  result: AttemptResult
  chosenIndex: number      // which option the user tapped
  mode: SessionMode
  timestamp: number        // Date.now()
}

export interface QuestionProgress {
  questionId: string
  attempts: Attempt[]
  bookmarked: boolean
}

// ─── Session ─────────────────────────────────────────────────────────────────

export type QuestionFilter = 'all' | 'category' | 'weak' | 'bookmarked'
export type SessionPresentation = 'study' | 'practice' | 'exam' | 'review'

export interface SessionConfig {
  filter: QuestionFilter
  category: string | null   // used when filter === 'category'
  count: number             // 10 | 20 | 50 | total
  shuffle: boolean
  showTranslation: boolean
  timed: boolean
  mode: SessionMode
  presentation?: SessionPresentation
  _questionIds?: string[]   // override: practice specific question IDs directly
  _reviewMode?: 'wrongAnswers'
  _reviewAnswers?: Array<{ questionId: string; chosenIndex: number }>
  _returnParams?: Record<string, string>
}

export interface SessionResult {
  config: SessionConfig
  answers: { questionId: string; correct: boolean; chosenIndex: number }[]
  durationSeconds: number
  completedAt: number
}

// ─── Locales ─────────────────────────────────────────────────────────────────

export type SupportedLocale = 'de' | 'en' | 'tr' | 'pl' | 'ru' | 'ar' | 'fr' | 'ro'
export type TranslationLocale = 'de' | 'en'

// Generic region code — can represent German states, cities, etc.
// Use `string` so any app can define its own region codes in app.config.ts.
export type RegionCode = string

// Backward compat alias
export type GermanStateCode = RegionCode

export interface LocaleInfo {
  code: SupportedLocale
  label: string        // name in that language
  labelEn: string      // name in English
  flag: string         // emoji flag
  rtl: boolean
}

// ─── App Config (swap per app) ───────────────────────────────────────────────

export interface ExamConfig {
  totalQuestions: number    // total in question bank
  examQuestions: number     // how many in the real test
  passMark: number          // correct answers needed to pass
  timeLimitMinutes: number  // 0 = untimed
}

export interface RegionConfig {
  code: RegionCode
  label: string
}

export interface AdConfig {
  bannerIdAndroid: string
  bannerIdIOS: string
  interstitialIdAndroid: string
  interstitialIdIOS: string
  rewardedIdAndroid: string
  rewardedIdIOS: string
  rewardedInterstitialIdAndroid: string
  rewardedInterstitialIdIOS: string
}

export interface RevenueCatConfig {
  entitlementId: string   // Must match the entitlement identifier in RC dashboard
}

export interface MonetizationConfig {
  // Exam limits
  freeExamsPerDay: number          // daily exam cap for free users (0 = unlimited)
  rewardedAdExamUnlocks: number    // extra exams granted per rewarded ad
  maxRewardedExamsPerDay: number   // cap on rewarded unlocks per day

  // Interstitial cadence
  interstitialEveryNSessions: number  // show interstitial every Nth practice finish (0 = disabled)
  cooldownBetweenInterstitials: number // min seconds between interstitials

  // Banner placement flags
  showBannerOnResults: boolean     // banner ad on results screen
  showBannerOnHome: boolean        // banner on home screen (recommend false)
  showBannerOnQuestionBank: boolean // banner on question list screen

  // Upsell prompts
  softPromptAfterNSessions: number // "Go ad-free" nudge after N sessions (0 = disabled)
}

export interface FeatureFlags {
  enableAds: boolean              // master kill-switch for all ads
  enableRevenueCat: boolean       // enable/disable subscription purchases
  enableExamGating: boolean       // enforce daily exam limits
  enableHaptics: boolean          // haptic feedback on interactions
  enableTranslations: boolean     // show translation toggle UI
  devForceSubscribed: boolean     // DEV ONLY: treat user as subscribed without a real purchase
}

export interface AppConfig {
  appName: string
  appTagline: string
  flagEmoji: string
  primaryColor: string
  originalLocale: SupportedLocale
  supportedLocales: SupportedLocale[]
  categories: { id: string; label: string; emoji: string }[]
  examConfig: ExamConfig
  featureFlags: FeatureFlags
  adConfig: AdConfig
  revenueCatConfig: RevenueCatConfig
  monetizationConfig: MonetizationConfig

  // Optional regions (German states for Leben in Deutschland, nothing for driving license)
  hasRegions: boolean
  regions: RegionConfig[]
  defaultRegion: RegionCode | null

}
