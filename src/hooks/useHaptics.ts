import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import appConfig from '@/config/app.config'

const enabled = Platform.OS !== 'web' && appConfig.featureFlags.enableHaptics

/** Light tap — navigation, toggles, neutral selection */
export function hapticLight() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/** Medium tap — significant actions (submit, finish) */
export function hapticMedium() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

/** Selection changed — pickers, tab switches */
export function hapticSelection() {
  if (enabled) Haptics.selectionAsync()
}

/** Wrong answer — error double-buzz */
export function hapticError() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

/** Success — e.g. exam passed on results screen */
export function hapticSuccess() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
