/**
 * ─────────────────────────────────────────────────────────────────────────────
 * APP CONFIG — swap this file for each new app
 * Copy this file, update every value, drop in your questions.ts, done.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AppConfig } from '@/types'

const config: AppConfig = {
  appName: 'Leben in Deutschland',
  appTagline: 'Prepare for the Leben in Deutschland test',
  flagEmoji: '🇩🇪',
  primaryColor: '#1f7a4d',

  // The language the questions are written in
  originalLocale: 'de',

  // Languages this app supports for translations
  // First entry is shown as default UI language
  supportedLocales: ['en', 'de'],

  categories: [
    { id: 'politik', label: 'Politik & Demokratie', emoji: '🏛️' },
    { id: 'recht', label: 'Recht & Gesetze', emoji: '⚖️' },
    { id: 'geschichte', label: 'Geschichte', emoji: '🗺️' },
    { id: 'gesellschaft', label: 'Gesellschaft', emoji: '🌍' },
    { id: 'wirtschaft', label: 'Wirtschaft', emoji: '💶' },
  ],

  examConfig: {
    totalQuestions: 310, // Updated when question bank changes
    examQuestions: 33,
    passMark: 17,           // need 17/33 to pass
    timeLimitMinutes: 60,   // 60 minute time limit
  },

  // ─── Feature flags (flip to false to disable entire features) ───────────────
  featureFlags: {
    enableAds: true,               // set false to disable all ads globally
    enableRevenueCat: false,        // set false to skip subscription init
    enableExamGating: true,        // set false for unlimited free exams
    enableHaptics: true,           // set false to silence all haptics
    enableTranslations: true,      // set false to hide translation toggle
  },

  // ─── Regions (set hasRegions: false for apps without regional questions) ───
  hasRegions: true,
  defaultRegion: 'be',
  regions: [
    { code: 'bw', label: 'Baden-Württemberg' },
    { code: 'by', label: 'Bayern' },
    { code: 'be', label: 'Berlin' },
    { code: 'bb', label: 'Brandenburg' },
    { code: 'hb', label: 'Bremen' },
    { code: 'hh', label: 'Hamburg' },
    { code: 'he', label: 'Hessen' },
    { code: 'mv', label: 'Mecklenburg-Vorpommern' },
    { code: 'ni', label: 'Niedersachsen' },
    { code: 'nw', label: 'Nordrhein-Westfalen' },
    { code: 'rp', label: 'Rheinland-Pfalz' },
    { code: 'sl', label: 'Saarland' },
    { code: 'sn', label: 'Sachsen' },
    { code: 'st', label: 'Sachsen-Anhalt' },
    { code: 'sh', label: 'Schleswig-Holstein' },
    { code: 'th', label: 'Thüringen' },
  ],

  // Replace with your actual AdMob IDs from Google AdMob console
  // Test IDs are safe to use during development
  // ─── Ad unit IDs (Google AdMob) ─────────────────────────────────────────────
  // Replace with your real IDs before release. Test IDs are safe during dev.
  adConfig: {
    // Android — real ad unit IDs
    bannerIdAndroid:                  'ca-app-pub-3293228392983133/1485156455',
    rewardedIdAndroid:                'ca-app-pub-3293228392983133/8529076955',
    rewardedInterstitialIdAndroid:    'ca-app-pub-3293228392983133/5876556558',
    interstitialIdAndroid:            'ca-app-pub-3293228392983133/5629144547',

    // iOS — replace with real IDs from AdMob console when ready
    bannerIdIOS:                      'ca-app-pub-3293228392983133/4815695671', // TODO: real ID
    interstitialIdIOS:                'ca-app-pub-3293228392983133/7713321756', // TODO: real ID
    rewardedIdIOS:                    'ca-app-pub-3293228392983133/2189532336', // TODO: real ID
    rewardedInterstitialIdIOS:        'ca-app-pub-3293228392983133/9353706482', // TODO: real ID
  },

  // ─── RevenueCat ────────────────────────────────────────────────────────────
  // entitlementId MUST match the identifier set in the RevenueCat dashboard.
  // Product IDs must match the identifiers configured in your RC offering.
  // apiKey: use separate platform keys (appl_xxx / goog_xxx) in production.
  revenueCatConfig: {
    apiKeyAndroid:      'test_rKOXQrvuWsEIJlOKbXEWFWnHaYW',
    apiKeyIOS:          'test_rKOXQrvuWsEIJlOKbXEWFWnHaYW',
    entitlementId:      'Lieben in Deutschland Pro',
    monthlyProductId:   'monthly',
    threeMonthProductId:'three_month',
    yearlyProductId:    'yearly',
    lifetimeProductId:  'lifetime',
  },

  // ─── Monetization tuning ──────────────────────────────────────────────────
  // All values can be adjusted without code changes.
  monetizationConfig: {
    // Exam gating
    freeExamsPerDay: 2,              // free users get 2 exams/day
    rewardedAdExamUnlocks: 1,        // each rewarded ad grants 1 extra exam
    maxRewardedExamsPerDay: 3,        // max 3 rewarded unlocks/day

    // Interstitial pacing
    interstitialEveryNSessions: 3,    // show after every 3rd practice finish
    cooldownBetweenInterstitials: 120, // at least 2 min between interstitials

    // Banner placement
    showBannerOnResults: true,        // natural pause point
    showBannerOnHome: false,          // keep home clean
    showBannerOnQuestionBank: false,   // don't clutter browsing

    // Upsell nudge
    softPromptAfterNSessions: 5,      // suggest premium after 5th session
  },

}

export default config
