import type { GermanStateCode, TranslationLocale } from '@/types'

export const GERMAN_STATES: Array<{ code: GermanStateCode; label: string; apiCode: string }> = [
  { code: 'bw', label: 'Baden-Württemberg', apiCode: 'BW' },
  { code: 'by', label: 'Bayern', apiCode: 'BY' },
  { code: 'be', label: 'Berlin', apiCode: 'BE' },
  { code: 'bb', label: 'Brandenburg', apiCode: 'BB' },
  { code: 'hb', label: 'Bremen', apiCode: 'HB' },
  { code: 'hh', label: 'Hamburg', apiCode: 'HH' },
  { code: 'he', label: 'Hessen', apiCode: 'HE' },
  { code: 'mv', label: 'Mecklenburg-Vorpommern', apiCode: 'MV' },
  { code: 'ni', label: 'Niedersachsen', apiCode: 'NI' },
  { code: 'nw', label: 'Nordrhein-Westfalen', apiCode: 'NW' },
  { code: 'rp', label: 'Rheinland-Pfalz', apiCode: 'RP' },
  { code: 'sl', label: 'Saarland', apiCode: 'SL' },
  { code: 'sn', label: 'Sachsen', apiCode: 'SN' },
  { code: 'st', label: 'Sachsen-Anhalt', apiCode: 'ST' },
  { code: 'sh', label: 'Schleswig-Holstein', apiCode: 'SH' },
  { code: 'th', label: 'Thüringen', apiCode: 'TH' },
]

export const TRANSLATION_OPTIONS: Array<{ code: TranslationLocale; label: string }> = [
  { code: 'de', label: 'Deutsch (DE)' },
  { code: 'en', label: 'English (EN)' },
  { code: 'fr', label: 'Français (FR)' },
]

export function getStateLabel(code: GermanStateCode | null | undefined): string | null {
  if (!code) return null
  return GERMAN_STATES.find((state) => state.code === code)?.label ?? null
}
