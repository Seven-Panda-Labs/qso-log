import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeProvider'
import { THEMES, type Theme } from '../theme/theme'

export default function ThemeSwitcher() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <select
      aria-label={t('theme.label')}
      value={theme}
      onChange={(event) => setTheme(event.target.value as Theme)}
      className="rounded-md border border-line bg-panel px-2 py-1 text-sm"
    >
      {THEMES.map((option) => (
        <option key={option} value={option}>
          {t(`theme.${option}`)}
        </option>
      ))}
    </select>
  )
}
