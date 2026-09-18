import { useTranslation } from 'react-i18next'
import { languages } from '../i18n'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <select
      aria-label={t('language.label')}
      value={i18n.resolvedLanguage}
      onChange={(event) => void i18n.changeLanguage(event.target.value)}
      className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
    >
      {languages.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  )
}
