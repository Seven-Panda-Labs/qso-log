import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { useLog } from '../storage/useLog'

export default function LogbookPage() {
  const { t } = useTranslation()
  const { status } = useAuth()
  const { qsos, loading, unavailable } = useLog()

  if (loading) return null

  if (qsos.length === 0) {
    return (
      <section className="mx-auto max-w-2xl text-center">
        <h2 className="text-xl font-semibold">{t('logbook.empty.title')}</h2>
        <p className="mt-2 text-slate-400">{t('logbook.empty.body')}</p>
        {unavailable ? (
          <p className="mt-4 text-sm text-amber-300">{t('logbook.storageUnavailable')}</p>
        ) : status === 'guest' ? (
          <p className="mt-4 text-sm text-slate-500">{t('auth.guestHint')}</p>
        ) : null}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl">
      <p className="text-sm text-slate-400">{t('logbook.count', { count: qsos.length })}</p>
      <ul className="mt-3 divide-y divide-slate-800">
        {qsos.map((qso) => (
          <li key={qso.id} className="flex justify-between py-2">
            <span className="font-medium">{qso.call}</span>
            <span className="text-sm text-slate-400">
              {qso.band} {qso.mode}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
