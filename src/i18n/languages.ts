import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ptPT from './locales/pt-PT.json'

/** Endonyms: a language is listed the way its own speakers write it. */
export const languages = [
  { code: 'en', name: 'English', translation: en },
  { code: 'es', name: 'Español', translation: es },
  { code: 'fr', name: 'Français', translation: fr },
  { code: 'pt-PT', name: 'Português', translation: ptPT },
] as const

export type Locale = (typeof languages)[number]['code']

export const DEFAULT_LOCALE: Locale = 'en'

export const resources = Object.fromEntries(
  languages.map(({ code, translation }) => [code, { translation }]),
) as Record<Locale, { translation: typeof en }>
