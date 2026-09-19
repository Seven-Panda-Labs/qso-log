import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyTheme,
  isTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  THEME_STORAGE_KEY,
} from './theme'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
})

describe('resolveTheme', () => {
  it.each([
    ['light', false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['dark', true, 'dark'],
    ['system', false, 'light'],
    ['system', true, 'dark'],
  ] as const)('resolves %s with prefersDark %s to %s', (theme, prefersDark, expected) => {
    expect(resolveTheme(theme, prefersDark)).toBe(expected)
  })
})

describe('applyTheme', () => {
  it('sets the class the CSS keys off', () => {
    applyTheme('dark')
    expect(document.documentElement).toHaveClass('dark')

    applyTheme('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  // Without this the browser's own controls and scrollbars stay in the other
  // theme, which looks broken even when the app is correct.
  it('sets color-scheme so browser chrome follows', () => {
    applyTheme('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')

    applyTheme('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })
})

describe('stored theme', () => {
  it('defaults to system', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('round trips a choice', () => {
    storeTheme('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(readStoredTheme()).toBe('dark')
  })

  it('ignores a value that is not a theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon')
    expect(readStoredTheme()).toBe('system')
  })

  // Private windows throw on storage access. A theme preference is not worth
  // taking the app down for.
  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(readStoredTheme()).toBe('system')
    expect(() => storeTheme('dark')).not.toThrow()
  })
})

describe('isTheme', () => {
  it.each(['system', 'light', 'dark'])('accepts %s', (value) => {
    expect(isTheme(value)).toBe(true)
  })

  it.each(['neon', '', null, undefined, 7])('rejects %s', (value) => {
    expect(isTheme(value)).toBe(false)
  })
})
