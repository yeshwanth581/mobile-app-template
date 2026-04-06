/**
 * Ad service — thin wrapper around Google Mobile Ads.
 *
 * All imports are lazy so the app doesn't crash in Expo Go
 * (which lacks native ad modules). In Expo Go, every function
 * is a safe no-op.
 */

import { Platform, NativeModules } from 'react-native'
import appConfig from '@/config/app.config'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useMonetizationStore } from '@/store/useMonetizationStore'

const isWeb = Platform.OS === 'web'
const { adConfig, featureFlags } = appConfig
const adsDisabled = () => isWeb || !featureFlags.enableAds

function isPremium(): boolean {
  return useSettingsStore.getState().isSubscribed
}

// ─── Lazy-load native module (safe in Expo Go) ──────────────────────────────

let _admob: typeof import('react-native-google-mobile-ads') | null = null
let _admobChecked = false
function getAdMob() {
  if (_admobChecked) return _admob
  _admobChecked = true

  // Guard: check NativeModules registry BEFORE requiring.
  // TurboModules throw an Invariant Violation at require() time when the native
  // binary doesn't include the module (Expo Go, missing dev build, etc.).
  // Checking NativeModules first avoids that error entirely.
  if (!NativeModules.RNGoogleMobileAdsModule) {
    if (__DEV__) console.log('[ads] RNGoogleMobileAdsModule not registered — skipping (Expo Go or no native build)')
    return null
  }

  try {
    _admob = require('react-native-google-mobile-ads')
  } catch (e) {
    if (__DEV__) console.log('[ads] require failed:', e)
    _admob = null
  }
  return _admob
}

// ─── Ad unit IDs ─────────────────────────────────────────────────────────────

function getAdUnitId(type: 'banner' | 'interstitial' | 'rewarded' | 'rewardedInterstitial'): string {
  const isIOS = Platform.OS === 'ios'
  switch (type) {
    case 'banner':               return isIOS ? adConfig.bannerIdIOS                   : adConfig.bannerIdAndroid
    case 'interstitial':         return isIOS ? adConfig.interstitialIdIOS             : adConfig.interstitialIdAndroid
    case 'rewarded':             return isIOS ? adConfig.rewardedIdIOS                 : adConfig.rewardedIdAndroid
    case 'rewardedInterstitial': return isIOS ? adConfig.rewardedInterstitialIdIOS     : adConfig.rewardedInterstitialIdAndroid
  }
}

// ─── Interstitial ────────────────────────────────────────────────────────────

let interstitialAd: any = null
let interstitialLoaded = false

function loadInterstitial() {
  if (adsDisabled() || isPremium()) return
  const admob = getAdMob()
  if (!admob) return

  interstitialAd = admob.InterstitialAd.createForAdRequest(getAdUnitId('interstitial'), {
    requestNonPersonalizedAdsOnly: true,
  })

  interstitialLoaded = false

  interstitialAd.addAdEventListener(admob.AdEventType.LOADED, () => {
    interstitialLoaded = true
  })

  interstitialAd.addAdEventListener(admob.AdEventType.CLOSED, () => {
    interstitialLoaded = false
    loadInterstitial()
  })

  interstitialAd.load()
}

export function showInterstitial(): boolean {
  if (adsDisabled() || isPremium() || !interstitialLoaded || !interstitialAd) return false

  const store = useMonetizationStore.getState()
  if (!store.shouldShowInterstitial()) return false

  interstitialAd.show()
  store.recordInterstitialShown()
  return true
}

// ─── Rewarded ────────────────────────────────────────────────────────────────

let rewardedAd: any = null
let rewardedLoaded = false

function loadRewarded() {
  if (adsDisabled() || isPremium()) return
  const admob = getAdMob()
  if (!admob) return

  rewardedAd = admob.RewardedAd.createForAdRequest(getAdUnitId('rewarded'), {
    requestNonPersonalizedAdsOnly: true,
  })

  rewardedLoaded = false

  rewardedAd.addAdEventListener(admob.RewardedAdEventType.LOADED, () => {
    rewardedLoaded = true
  })

  rewardedAd.addAdEventListener(admob.RewardedAdEventType.EARNED_REWARD, () => {
    useMonetizationStore.getState().recordRewardedExam()
  })

  rewardedAd.addAdEventListener(admob.AdEventType.CLOSED, () => {
    rewardedLoaded = false
    loadRewarded()
  })

  rewardedAd.load()
}

export function showRewarded(): Promise<boolean> {
  if (adsDisabled() || isPremium() || !rewardedLoaded || !rewardedAd) {
    return Promise.resolve(false)
  }

  const admob = getAdMob()
  if (!admob) return Promise.resolve(false)

  return new Promise((resolve) => {
    let rewarded = false

    const earnedUnsub = rewardedAd.addAdEventListener(admob.RewardedAdEventType.EARNED_REWARD, () => {
      rewarded = true
    })

    const closedUnsub = rewardedAd.addAdEventListener(admob.AdEventType.CLOSED, () => {
      earnedUnsub()
      closedUnsub()
      resolve(rewarded)
    })

    rewardedAd.show()
  })
}

export function isRewardedReady(): boolean {
  return !adsDisabled() && !isPremium() && rewardedLoaded
}

// ─── Rewarded Interstitial ────────────────────────────────────────────────────

let rewardedInterstitialAd: any = null
let rewardedInterstitialLoaded = false

function loadRewardedInterstitial() {
  if (adsDisabled() || isPremium()) return
  const admob = getAdMob()
  if (!admob) return

  rewardedInterstitialAd = admob.RewardedInterstitialAd.createForAdRequest(
    getAdUnitId('rewardedInterstitial'),
    { requestNonPersonalizedAdsOnly: true },
  )

  rewardedInterstitialLoaded = false

  rewardedInterstitialAd.addAdEventListener(admob.RewardedAdEventType.LOADED, () => {
    rewardedInterstitialLoaded = true
  })

  rewardedInterstitialAd.addAdEventListener(admob.RewardedAdEventType.EARNED_REWARD, () => {
    useMonetizationStore.getState().recordRewardedExam()
  })

  rewardedInterstitialAd.addAdEventListener(admob.AdEventType.CLOSED, () => {
    rewardedInterstitialLoaded = false
    loadRewardedInterstitial()
  })

  rewardedInterstitialAd.load()
}

export function showRewardedInterstitial(): Promise<boolean> {
  if (adsDisabled() || isPremium() || !rewardedInterstitialLoaded || !rewardedInterstitialAd) {
    return Promise.resolve(false)
  }

  const admob = getAdMob()
  if (!admob) return Promise.resolve(false)

  return new Promise((resolve) => {
    let rewarded = false

    const earnedUnsub = rewardedInterstitialAd.addAdEventListener(
      admob.RewardedAdEventType.EARNED_REWARD,
      () => { rewarded = true },
    )

    const closedUnsub = rewardedInterstitialAd.addAdEventListener(
      admob.AdEventType.CLOSED,
      () => {
        earnedUnsub()
        closedUnsub()
        resolve(rewarded)
      },
    )

    rewardedInterstitialAd.show()
  })
}

export function isRewardedInterstitialReady(): boolean {
  return !adsDisabled() && !isPremium() && rewardedInterstitialLoaded
}

// ─── Banner helpers ──────────────────────────────────────────────────────────

export function getBannerAdUnitId(): string {
  return getAdUnitId('banner')
}

// ─── Initialization ──────────────────────────────────────────────────────────

export function initAds() {
  if (adsDisabled() || isPremium()) return
  try {
    if (!getAdMob()) throw new Error('module unavailable')
    loadInterstitial()
    loadRewarded()
    loadRewardedInterstitial()
  } catch (e) {
    if (__DEV__) console.log('[ads] Ad init failed (Expo Go?), skipping:', e)
  }
}
