import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, languages, resources } from './index'

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

function values(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value !== 'object' || value === null) return []
  return Object.values(value).flatMap(values)
}

const source = keyPaths(resources[DEFAULT_LOCALE].translation).sort()
const codes = languages.map((language) => language.code)

describe('locales', () => {
  it('ships more than the source locale', () => {
    expect(source.length).toBeGreaterThan(0)
    expect(codes).toContain(DEFAULT_LOCALE)
    expect(codes.length).toBeGreaterThan(1)
  })

  // The invariant that keeps a locale honest: same keys, none missing, no
  // extras left behind when a key is renamed.
  it.each(codes)('%s matches the source key set', (code) => {
    expect(keyPaths(resources[code].translation).sort()).toEqual(source)
  })

  it.each(codes)('%s has no empty strings', (code) => {
    expect(values(resources[code].translation).filter((value) => value.trim() === '')).toEqual([])
  })

  // Terms operators expect in every language, see docs/i18n.md.
  it.each(codes)('%s keeps QSO untranslated', (code) => {
    const text = values(resources[code].translation).join(' ')
    expect(text).toContain('QSO')
  })

  it('has no duplicate language codes', () => {
    expect(new Set(codes).size).toBe(codes.length)
  })
})
