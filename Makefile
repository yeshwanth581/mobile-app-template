# ─── Leben in Deutschland — Build Commands ────────────────────────────────────
# Usage:
#   make start          → start Expo dev server (uses .env.local)
#   make preview        → EAS preview APK build (test keys, internal)
#   make release        → EAS production build (real keys, Play Store)
#   make release-ios    → EAS production iOS build
#   make submit         → submit latest production build to Play Store
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: start preview release release-ios submit clean

# Load .env.local for local dev commands
ifneq (,$(wildcard .env.local))
  include .env.local
  export
endif

# ─── Local dev ────────────────────────────────────────────────────────────────

start:
	npx expo start --clear

start-android:
	npx expo start --android --clear

# ─── EAS Builds ───────────────────────────────────────────────────────────────

# ─── EAS Cloud Builds (queued on EAS servers) ─────────────────────────────────

# Preview build — test keys, internal APK
preview:
	eas build --profile preview --platform android --non-interactive

# Preview iOS
preview-ios:
	eas build --profile preview --platform ios --non-interactive

# Preview APK with production keys — test real RC/ads before submitting to store
release-preview:
	eas build --profile preview-prod --platform android --non-interactive

# Production Android
release:
	eas build --profile production --platform android --non-interactive

# Production iOS
release-ios:
	eas build --profile production --platform ios --non-interactive

# Both platforms at once
release-all:
	eas build --profile production --platform all --non-interactive

# ─── Local Builds (runs on your machine — no queue, much faster) ──────────────

# Local preview APK — test keys, builds directly to ./build folder
local-preview:
	eas build --profile preview --platform android --local --non-interactive

# Local preview APK with production keys
local-release-preview:
	eas build --profile preview-prod --platform android --local --non-interactive

# Local production AAB
local-release:
	eas build --profile production --platform android --local --non-interactive

# ─── Submit to stores ─────────────────────────────────────────────────────────

submit:
	eas submit --profile production --platform android --latest

submit-ios:
	eas submit --profile production --platform ios --latest

# ─── Utilities ────────────────────────────────────────────────────────────────

# Update OTA (no rebuild needed for JS-only changes)
update:
	eas update --branch production --message "OTA update"

update-preview:
	eas update --branch preview --message "Preview update"

# Install dependencies
install:
	npm install

# Clear caches
clean:
	npx expo start --clear
	rm -rf .expo node_modules/.cache
