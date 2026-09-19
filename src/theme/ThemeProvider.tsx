import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react'
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type ResolvedTheme,
  type Theme,
} from './theme'

export interface ThemeState {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeState | undefined>(undefined)

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [prefersDark, setPrefersDark] = useState(() => darkQuery().matches)

  useEffect(() => {
    const query = darkQuery()
    const listener = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  const resolved = resolveTheme(theme, prefersDark)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    storeTheme(next)
  }, [])

  const value = useMemo<ThemeState>(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeState {
  const value = use(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
