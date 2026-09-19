import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { queryLog, usedBands, usedModes, type LogSort, type SortField } from '../domain/logQuery'
import type { Qso } from '../domain/qso'
import { useLog, useLogStore } from '../storage/useLog'
import AdifButtons from '../components/AdifButtons'
import LogTable from '../components/LogTable'
import MigrationPrompt from '../components/MigrationPrompt'
import QsoForm from '../components/QsoForm'

export default function LogbookPage() {
  const { t } = useTranslation()
  const { status } = useAuth()
  const store = useLogStore()
  const { qsos, loading, unavailable } = useLog()

  const [editing, setEditing] = useState<Qso | null>(null)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [band, setBand] = useState('')
  const [mode, setMode] = useState('')
  const [sort, setSort] = useState<LogSort>({ field: 'date', direction: 'desc' })

  const visible = useMemo(
    () => queryLog(qsos, { search, band: band || undefined, mode: mode || undefined }, sort),
    [qsos, search, band, mode, sort],
  )

  function toggleSort(field: SortField) {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'date' ? 'desc' : 'asc' },
    )
  }

  async function save(qso: Qso) {
    await store?.put(qso)
    setEditing(null)
    setAdding(false)
  }

  async function remove(qso: Qso) {
    if (!window.confirm(t('logbook.confirmDelete'))) return
    await store?.remove(qso.id)
  }

  if (loading) return null

  if (adding || editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <QsoForm
          qso={editing ?? undefined}
          onSave={(qso) => void save(qso)}
          onCancel={() => {
            setEditing(null)
            setAdding(false)
          }}
        />
      </div>
    )
  }

  const filtering = search !== '' || band !== '' || mode !== ''

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <MigrationPrompt cloud={status === 'signed-in' ? store : undefined} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-brand-600 px-4 py-2 font-medium"
        >
          {t('action.add')}
        </button>
        <AdifButtons
          qsos={qsos}
          onImport={async (imported) => {
            for (const qso of imported) await store?.put(qso)
          }}
        />
      </div>

      {qsos.length === 0 ? (
        <section className="py-10 text-center">
          <h2 className="text-xl font-semibold">{t('logbook.empty.title')}</h2>
          <p className="mt-2 text-slate-400">{t('logbook.empty.body')}</p>
          {unavailable ? (
            <p className="mt-4 text-sm text-amber-300">{t('logbook.storageUnavailable')}</p>
          ) : status === 'guest' ? (
            <p className="mt-4 text-sm text-slate-500">{t('auth.guestHint')}</p>
          ) : null}
        </section>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('logbook.searchPlaceholder')}
              aria-label={t('logbook.search')}
              className="min-w-48 flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            />
            <select
              value={band}
              onChange={(event) => setBand(event.target.value)}
              aria-label={t('field.band')}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            >
              <option value="">{t('logbook.allBands')}</option>
              {usedBands(qsos).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              aria-label={t('field.mode')}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            >
              <option value="">{t('logbook.allModes')}</option>
              {usedModes(qsos).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-slate-400">{t('logbook.count', { count: visible.length })}</p>

          {visible.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-400">{t('logbook.noResults')}</p>
              {filtering ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setBand('')
                    setMode('')
                  }}
                  className="mt-2 underline"
                >
                  {t('logbook.clearFilters')}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <LogTable
                qsos={visible}
                sort={sort}
                onSort={toggleSort}
                onEdit={setEditing}
                onDelete={(qso) => void remove(qso)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
