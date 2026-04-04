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
    { id: 'politik',      label: 'Politik & Demokratie', emoji: '🏛️' },
    { id: 'recht',        label: 'Recht & Gesetze',      emoji: '⚖️' },
    { id: 'geschichte',   label: 'Geschichte',            emoji: '🗺️' },
    { id: 'gesellschaft', label: 'Gesellschaft',          emoji: '🌍' },
    { id: 'wirtschaft',   label: 'Wirtschaft',            emoji: '💶' },
  ],

  examConfig: {
    totalQuestions: 310, // Updated when question bank changes
    examQuestions: 33,
    passMark: 17,           // need 17/33 to pass
    timeLimitMinutes: 60,   // 60 minute time limit
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

  // ─── Topic classifier (only used when questions lack topicCategory field) ──
  // For new apps, add topicCategory directly to each question and skip this.
  topicClassifier: {
    politik: [
      { pattern: /\bdemokratie/i, score: 4 },
      { pattern: /\bbundestag/i, score: 4 },
      { pattern: /\bbundesrat/i, score: 4 },
      { pattern: /\bbundeskanzler/i, score: 4 },
      { pattern: /\bregierung/i, score: 4 },
      { pattern: /\bpartei/i, score: 3 },
      { pattern: /\bwahl/i, score: 4 },
      { pattern: /\bminister/i, score: 3 },
      { pattern: /\bpräsident/i, score: 3 },
      { pattern: /\bparlament/i, score: 3 },
      { pattern: /\bopposition/i, score: 3 },
      { pattern: /\beuropäische union/i, score: 3 },
    ],
    recht: [
      { pattern: /\brechtsstaat/i, score: 5 },
      { pattern: /\bgesetz/i, score: 4 },
      { pattern: /\bgrundgesetz/i, score: 5 },
      { pattern: /\bverfassung/i, score: 4 },
      { pattern: /\bgrundrecht/i, score: 5 },
      { pattern: /\bgericht/i, score: 4 },
      { pattern: /\brecht\b/i, score: 4 },
      { pattern: /\bpolizei/i, score: 3 },
    ],
    geschichte: [
      { pattern: /\bddr\b/i, score: 5 },
      { pattern: /\bnationalsozial/i, score: 5 },
      { pattern: /\bholocaust/i, score: 5 },
      { pattern: /\bweltkrieg/i, score: 5 },
      { pattern: /\bwiedervereinigung/i, score: 5 },
      { pattern: /\bberliner mauer/i, score: 5 },
      { pattern: /\bgeschichte/i, score: 3 },
    ],
    gesellschaft: [
      { pattern: /\bfamilie/i, score: 4 },
      { pattern: /\bschule/i, score: 4 },
      { pattern: /\breligion/i, score: 4 },
      { pattern: /\bgleichberecht/i, score: 4 },
      { pattern: /\bintegration/i, score: 4 },
      { pattern: /\bkultur/i, score: 2 },
    ],
    wirtschaft: [
      { pattern: /\bwirtschaft/i, score: 5 },
      { pattern: /\bmarktwirtschaft/i, score: 5 },
      { pattern: /\bsteuer/i, score: 4 },
      { pattern: /\bsozialversicherung/i, score: 4 },
      { pattern: /\brente/i, score: 4 },
      { pattern: /\barbeit/i, score: 4 },
    ],
  },
}

export default config
