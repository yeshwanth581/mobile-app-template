import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

const isNative = Platform.OS !== 'web'

/** Light tap — navigation, toggles, neutral selection */
export function hapticLight() {
  if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/** Medium tap — significant actions (submit, finish) */
export function hapticMedium() {
  if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

/** Selection changed — pickers, tab switches */
export function hapticSelection() {
  if (isNative) Haptics.selectionAsync()
}

/** Wrong answer — error double-buzz */
export function hapticError() {
  if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

/** Success — e.g. exam passed on results screen */
export function hapticSuccess() {
  if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
