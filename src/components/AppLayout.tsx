import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import AccountButton from './AccountButton'
import ConnectionStatus from './ConnectionStatus'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2 py-1 text-sm ${isActive ? 'bg-panel text-fg' : 'text-muted'}`

export default function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold tracking-tight">{t('app.name')}</h1>
          <nav className="flex gap-1">
            <NavLink to="/" end className={linkClass}>
              {t('nav.logbook')}
            </NavLink>
            <NavLink to="/stats" className={linkClass}>
              {t('nav.stats')}
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <AccountButton />
        </div>
      </header>
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
