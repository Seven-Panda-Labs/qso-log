import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { logStats } from '../domain/stats'
import { useLog } from '../storage/useLog'

function formatDate(adif: string | undefined): string {
  if (!adif || adif.length !== 8) return '—'
  return `${adif.slice(0, 4)}-${adif.slice(4, 6)}-${adif.slice(6, 8)}`
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-800 px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}

function Breakdown({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  const most = rows[0]?.count ?? 1
  return (
    <section>
      <h2 className="mb-2 font-medium">{title}</h2>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-3 text-sm">
            <span className="w-16 shrink-0">{row.name}</span>
            <span className="h-2 rounded-full bg-brand-600" style={{ width: `${(row.count / most) * 60}%` }} />
            <span className="tabular-nums text-slate-400">{row.count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function StatsPage() {
  const { t } = useTranslation()
  const { qsos, loading } = useLog()
  const stats = useMemo(() => logStats(qsos), [qsos])

  if (loading) return null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">{t('stats.title')}</h1>

      {stats.total === 0 ? (
        <p className="text-slate-400">{t('stats.empty')}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile label={t('stats.total')} value={stats.total} />
            <Tile label={t('stats.stations')} value={stats.stations} />
            <Tile label={t('stats.activeDays')} value={stats.activeDays} />
            <Tile label={t('stats.firstDate')} value={formatDate(stats.firstDate)} />
            <Tile label={t('stats.lastDate')} value={formatDate(stats.lastDate)} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Breakdown title={t('stats.bands')} rows={stats.bands} />
            <Breakdown title={t('stats.modes')} rows={stats.modes} />
          </div>
        </>
      )}
    </div>
  )
}
