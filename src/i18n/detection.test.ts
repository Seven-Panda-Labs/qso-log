import { describe, expect, it } from 'vitest'
import i18n, { DEFAULT_LOCALE } from './index'

describe('locale resolution', () => {
  it.each([
    ['fr', 'fr'],
    ['fr-CA', 'fr'],
    ['es-MX', 'es'],
    ['pt-PT', 'pt-PT'],
    // A Brazilian browser gets Portuguese, not English, until pt-BR exists.
    ['pt-BR', 'pt-PT'],
    ['pt', 'pt-PT'],
    ['is', DEFAULT_LOCALE],
  ])('resolves %s to %s', async (requested, expected) => {
    await i18n.changeLanguage(requested)
    expect(i18n.resolvedLanguage).toBe(expected)
  })

  it('translates through the resolved locale', async () => {
    await i18n.changeLanguage('fr')
    expect(i18n.t('status.offline')).toBe('Hors ligne')

    await i18n.changeLanguage('pt-BR')
    expect(i18n.t('status.offline')).toBe('Sem ligação')

    await i18n.changeLanguage(DEFAULT_LOCALE)
  })

  it('sets the document language', async () => {
    await i18n.changeLanguage('es')
    expect(document.documentElement.lang).toBe('es')

    await i18n.changeLanguage(DEFAULT_LOCALE)
  })
})
