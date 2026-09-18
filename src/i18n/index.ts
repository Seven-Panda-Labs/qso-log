import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'

/**
 * English is the source locale and the fallback: a missing translation shows
 * English, never a raw key. Locale files hold the only non-English text in the
 * repo, see docs/i18n.md.
 */
export const resources = { en: { translation: en } } as const

export type Locale = keyof typeof resources

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
