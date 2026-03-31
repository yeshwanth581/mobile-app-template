/**
 * ─────────────────────────────────────────────────────────────────────────────
 * APP CONFIG — swap this file for each new app
 * Copy this file, update every value, drop in your questions.ts, done.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AppConfig } from '@/types'
import questions from '@/data/questions'

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
    { id: 'politik',      label: 'Politik & Demokratie', emoji: '🏛️' },
    { id: 'recht',        label: 'Recht & Gesetze',      emoji: '⚖️' },
    { id: 'geschichte',   label: 'Geschichte',            emoji: '🗺️' },
    { id: 'gesellschaft', label: 'Gesellschaft',          emoji: '🌍' },
    { id: 'wirtschaft',   label: 'Wirtschaft',            emoji: '💶' },
  ],

  examConfig: {
    totalQuestions: questions.length,
    examQuestions: 33,
    passMark: 17,           // need 17/33 to pass
    timeLimitMinutes: 60,   // 60 minute time limit
  },

  // Replace with your actual AdMob IDs from Google AdMob console
  // Test IDs are safe to use during development
  adConfig: {
    bannerIdAndroid:         'ca-app-pub-3940256099942544/6300978111', // test ID
    bannerIdIOS:             'ca-app-pub-3940256099942544/2934735716', // test ID
    interstitialIdAndroid:   'ca-app-pub-3940256099942544/1033173712', // test ID
    interstitialIdIOS:       'ca-app-pub-3940256099942544/4411468910', // test ID
  },

  // Replace with your actual RevenueCat API keys and product IDs
  revenueCatConfig: {
    apiKeyAndroid:    'REVENUECAT_ANDROID_KEY',
    apiKeyIOS:        'REVENUECAT_IOS_KEY',
    monthlyProductId: 'ryg_leben_monthly_199',
    yearlyProductId:  'ryg_leben_yearly_999',
  },
}

export default config
