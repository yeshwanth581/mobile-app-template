import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import '@formatjs/intl-pluralrules/polyfill-force.js'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-pluralrules/locale-data/de'

import en from './locales/en'
import de from './locales/de'
import appConfig from '@/config/app.config'

// Add more locales here as you translate them
const resources = {
  en: { translation: en },
  de: { translation: de },
}

// App default locale should win on first launch; persisted settings can override later.
const defaultLang = appConfig.supportedLocales[0]

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

// Helper to switch UI language at runtime (called from language picker)
export const changeLanguage = (locale: string) => i18n.changeLanguage(locale)
