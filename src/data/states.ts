import type { RegionCode, TranslationLocale } from '@/types'
import appConfig from '@/config/app.config'

// Regions are now driven by app.config.ts
// For backward compatibility, GERMAN_STATES still works if hasRegions is true

export const REGIONS = appConfig.regions

export function getRegionLabel(code: RegionCode | null | undefined): string | null {
  if (!code) return null
  return REGIONS.find((r) => r.code === code)?.label ?? null
}

// Backward compat aliases — used by questions/index.tsx and practice/session.tsx
export const GERMAN_STATES = REGIONS
export const getStateLabel = getRegionLabel

export const TRANSLATION_OPTIONS: Array<{ code: TranslationLocale; label: string }> = [
  { code: 'de', label: 'Deutsch (DE)' },
  { code: 'en', label: 'English (EN)' },
]
