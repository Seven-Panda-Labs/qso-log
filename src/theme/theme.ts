export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'qso-log.theme'
export const THEMES: Theme[] = ['system', 'light', 'dark']

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as string[]).includes(value)
}

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light'
  return theme
}

/**
 * Sets the class the CSS keys off, and `color-scheme` so form controls,
 * scrollbars and the browser's own chrome follow the app instead of sitting in
 * the opposite theme.
 */
export function applyTheme(resolved: ResolvedTheme, root: HTMLElement = document.documentElement) {
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : 'system'
  } catch {
    // Private windows can throw on access. A theme is not worth an error.
    return 'system'
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignored, as above.
  }
}
