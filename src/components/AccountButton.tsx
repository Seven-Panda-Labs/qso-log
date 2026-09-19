import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'

export default function AccountButton() {
  const { t } = useTranslation()
  const { status, user, error, signIn, signOut } = useAuth()

  if (status === 'loading') return null

  if (status === 'unavailable') {
    return <span className="text-xs text-muted">{t('auth.unavailable')}</span>
  }

  if (status === 'signed-in') {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-32 truncate text-sm text-fg-soft">
          {user?.displayName ?? user?.email}
        </span>
        <button type="button" onClick={() => void signOut()} className="text-sm underline">
          {t('auth.signOut')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-warn">{t('auth.error')}</span> : null}
      <button
        type="button"
        onClick={() => void signIn()}
        className="rounded-md bg-brand-600 text-on-brand px-3 py-1 text-sm font-medium"
      >
        {t('auth.signIn')}
      </button>
    </div>
  )
}
