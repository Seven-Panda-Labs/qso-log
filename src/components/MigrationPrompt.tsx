import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { createLocalLogStore } from '../storage/localLogStore'
import type { LogStore } from '../storage/logStore'
import { migrateLog } from '../storage/migrate'

/**
 * Offers to move a guest's local log into their account after they sign in.
 *
 * It asks rather than acting: someone signing in on a borrowed device must not
 * have the owner's contacts swept into their account.
 */
export default function MigrationPrompt({ cloud }: { cloud: LogStore | undefined }) {
  const { t } = useTranslation()
  const { status } = useAuth()
  const [pending, setPending] = useState(0)
  const [done, setDone] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (status !== 'signed-in') return
    let live = true
    void createLocalLogStore()
      .list()
      .then((qsos) => {
        if (live) setPending(qsos.length)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [status])

  if (status !== 'signed-in' || dismissed || !cloud) return null

  if (done !== null) {
    return (
      <p className="rounded-md bg-panel px-4 py-3 text-sm">{t('migrate.done', { count: done })}</p>
    )
  }

  if (pending === 0) return null

  async function move() {
    if (!cloud) return
    try {
      const { moved } = await migrateLog(createLocalLogStore(), cloud)
      setDone(moved)
    } catch {
      setFailed(true)
    }
  }

  return (
    <section className="rounded-md border border-line bg-panel px-4 py-3">
      <h2 className="font-medium">{t('migrate.title')}</h2>
      <p className="mt-1 text-sm text-fg-soft">{t('migrate.body', { count: pending })}</p>
      {failed ? <p className="mt-1 text-sm text-warn">{t('migrate.failed')}</p> : null}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => void move()} className="rounded-md bg-brand-600 text-on-brand px-3 py-1.5 text-sm font-medium">
          {t('migrate.confirm')}
        </button>
        <button type="button" onClick={() => setDismissed(true)} className="px-3 py-1.5 text-sm underline">
          {t('migrate.dismiss')}
        </button>
      </div>
    </section>
  )
}
