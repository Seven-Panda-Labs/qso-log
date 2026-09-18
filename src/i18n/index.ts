import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, languages, resources } from './languages'

export { DEFAULT_LOCALE, languages, resources }
export type { Locale } from './languages'

export const LOCALE_STORAGE_KEY = 'qso-log.locale'

/**
 * English is the source locale and the fallback: a missing translation shows
 * English, never a raw key. See docs/i18n.md.
 *
 * `supportedLngs` does the regional matching on its own: fr-CA gets fr, es-MX
 * gets es, and pt-BR gets pt-PT, which is closer than English. Do not add
 * `nonExplicitSupportedLngs`, it collapses pt-PT to pt, which has no bundle,
 * and sends every Portuguese browser to English.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: languages.map((language) => language.code),
    fallbackLng: DEFAULT_LOCALE,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

// Screen readers and search engines read this, so it follows the UI.
i18n.on('languageChanged', (locale) => {
  document.documentElement.lang = locale
})

export default i18n
