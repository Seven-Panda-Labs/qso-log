import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import ConnectionStatus from './ConnectionStatus'

export default function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">{t('app.name')}</h1>
        <ConnectionStatus />
      </header>
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
