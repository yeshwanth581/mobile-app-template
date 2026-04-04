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
  category: string         // 'general' or a region code (e.g. 'be', 'bw')
  topicCategory?: string   // topic ID matching a config category (e.g. 'politik', 'traffic-signs')
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
export type TranslationLocale = 'de' | 'en' | 'fr'

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
}

export interface RevenueCatConfig {
  apiKeyAndroid: string
  apiKeyIOS: string
  monthlyProductId: string
  yearlyProductId: string
}

export interface TopicClassifierRule {
  pattern: RegExp
  score: number
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
  adConfig: AdConfig
  revenueCatConfig: RevenueCatConfig

  // Optional regions (German states for Leben in Deutschland, nothing for driving license)
  hasRegions: boolean
  regions: RegionConfig[]
  defaultRegion: RegionCode | null

  // Optional regex-based topic classifier (only needed when questions lack topicCategory)
  topicClassifier?: Record<string, TopicClassifierRule[]>
}
