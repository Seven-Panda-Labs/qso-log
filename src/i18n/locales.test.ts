import { describe, expect, it } from 'vitest'
import { resources } from './index'

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

const source = keyPaths(resources.en.translation).sort()

describe('locales', () => {
  it('has translations for the source keys', () => {
    expect(source.length).toBeGreaterThan(0)
  })

  // Guards the invariant that keeps a new locale honest: same keys, no extras,
  // none missing. It is trivial today with one locale and the point of the
  // file when there are six.
  it.each(Object.keys(resources))('%s matches the English key set', (locale) => {
    const translation = resources[locale as keyof typeof resources].translation
    expect(keyPaths(translation).sort()).toEqual(source)
  })

  it('has no empty strings', () => {
    const empty = Object.entries(resources).flatMap(([locale, bundle]) =>
      JSON.stringify(bundle.translation).includes('""') ? [locale] : [],
    )
    expect(empty).toEqual([])
  })
})
