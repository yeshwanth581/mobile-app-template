/**
 * RevenueCat service
 *
 * Single source of truth for all RevenueCat operations.
 * Lazy-loaded so the app doesn't crash in Expo Go or on web.
 *
 * Usage:
 *   initRevenueCat()        ← call once in _layout.tsx after store hydration
 *   getOfferings()          ← fetch available packages for the subscription screen
 *   purchasePackage(pkg)    ← execute a purchase
 *   restorePurchases()      ← restore previous purchases
 *   getCustomerInfo()       ← read current entitlement/subscriber state
 */

import { Platform } from 'react-native'
import Constants from 'expo-constants'
import type {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOfferings,
} from 'react-native-purchases'
import { useSettingsStore } from '@/store/useSettingsStore'
import appConfig from '@/config/app.config'

// ─── Lazy module loading (safe for Expo Go / web) ────────────────────────────

let Purchases: typeof import('react-native-purchases').default | null = null
let PURCHASES_ERROR_CODE: typeof import('react-native-purchases').PURCHASES_ERROR_CODE | undefined
let LOG_LEVEL: typeof import('react-native-purchases').LOG_LEVEL | undefined
let STOREKIT_VERSION: typeof import('react-native-purchases').STOREKIT_VERSION | undefined

try {
  const rc = require('react-native-purchases')
  Purchases = rc.default
  PURCHASES_ERROR_CODE = rc.PURCHASES_ERROR_CODE
  LOG_LEVEL = rc.LOG_LEVEL
  STOREKIT_VERSION = rc.STOREKIT_VERSION
} catch {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const { revenueCatConfig: rc, featureFlags } = appConfig

function getApiKey(): string {
  return Platform.OS === 'ios'
    ? (process.env.EXPO_PUBLIC_RC_API_KEY_IOS ?? '')
    : (process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID ?? '')
}

/** True when RC can actually run in this build + environment */
export function isRevenueCatAvailable(): boolean {
  const isExpoGo = Constants.appOwnership === 'expo'
  const apiKey = getApiKey()
  const isTestKey = apiKey.startsWith('test_')
  // Test keys use RC's own Test Store — works in Expo Go
  // Real keys (goog_/appl_) need native billing — blocked in Expo Go
  if (isExpoGo && !isTestKey) return false
  return (
    Platform.OS !== 'web' &&
    featureFlags.enableRevenueCat &&
    Purchases !== null &&
    apiKey.length > 0
  )
}

/** Sync entitlement status into the Zustand settings store */
function syncCustomerInfo(info: CustomerInfo): void {
  const entitlement = info.entitlements.active[rc.entitlementId]
  if (!entitlement) {
    useSettingsStore.getState().setSubscribed(false)
    return
  }
  // Lifetime purchases have no expiration date
  const type = entitlement.expirationDate === null ? 'lifetime' : 'recurring'
  useSettingsStore.getState().setSubscribed(true, type)
}

// ─── Initialisation ──────────────────────────────────────────────────────────

let _initialised = false

/**
 * Call once at app startup (inside _layout.tsx, after store hydration).
 * No-ops on subsequent calls.
 */
export function initRevenueCat(): void {
  if (_initialised || !isRevenueCatAvailable()) {
    if (__DEV__ && !_initialised) {
      console.log('[rc] Skipped — web, placeholder keys, or module unavailable')
    }
    return
  }
  _initialised = true

  try {
    if (__DEV__ && LOG_LEVEL) {
      Purchases!.setLogLevel(LOG_LEVEL.DEBUG)
    }

    Purchases!.configure({
      apiKey: getApiKey(),
      appUserID: null,
      ...(Platform.OS === 'ios' && STOREKIT_VERSION
        ? { storeKitVersion: STOREKIT_VERSION.STOREKIT_2 }
        : {}),
    })

    // Push entitlement changes into the store automatically
    Purchases!.addCustomerInfoUpdateListener(syncCustomerInfo)

    // Sync current state immediately on launch
    void getCustomerInfo().then((info) => {
      if (info) syncCustomerInfo(info)
    })

    if (__DEV__) console.log('[rc] Initialised')
  } catch (e) {
    if (__DEV__) console.warn('[rc] Init failed:', e)
  }
}

// ─── Customer info ───────────────────────────────────────────────────────────

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable()) return null
  try {
    return await Purchases!.getCustomerInfo()
  } catch (e) {
    if (__DEV__) console.warn('[rc] getCustomerInfo failed:', e)
    return null
  }
}

export function isEntitled(info: CustomerInfo): boolean {
  return !!info.entitlements.active[rc.entitlementId]
}

// ─── Offerings ───────────────────────────────────────────────────────────────

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!isRevenueCatAvailable()) return null
  try {
    return await Purchases!.getOfferings()
  } catch (e) {
    if (__DEV__) console.warn('[rc] getOfferings failed:', e)
    return null
  }
}

// ─── Purchasing ──────────────────────────────────────────────────────────────

export interface PurchaseResult {
  success: boolean
  cancelled: boolean
  error?: string
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!isRevenueCatAvailable()) {
    return { success: false, cancelled: false, error: 'Purchases not available' }
  }
  try {
    const { customerInfo } = await Purchases!.purchasePackage(pkg)
    syncCustomerInfo(customerInfo)
    return { success: isEntitled(customerInfo), cancelled: false }
  } catch (e: any) {
    const cancelled =
      e.userCancelled === true ||
      (PURCHASES_ERROR_CODE && e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)
    return {
      success: false,
      cancelled,
      error: cancelled ? undefined : (e.message ?? 'Purchase failed'),
    }
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isRevenueCatAvailable()) {
    return { success: false, cancelled: false, error: 'Purchases not available' }
  }
  try {
    const info = await Purchases!.restorePurchases()
    syncCustomerInfo(info)
    return { success: isEntitled(info), cancelled: false }
  } catch (e: any) {
    return { success: false, cancelled: false, error: e.message ?? 'Restore failed' }
  }
}
