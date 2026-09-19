import { useTranslation } from 'react-i18next'
import type { Qso } from '../domain/qso'
import type { LogSort, SortField } from '../domain/logQuery'

const COLUMNS: { field: SortField | null; key: string; className?: string }[] = [
  { field: 'call', key: 'field.call' },
  { field: 'date', key: 'field.date' },
  { field: null, key: 'field.time', className: 'hidden sm:table-cell' },
  { field: 'band', key: 'field.band' },
  { field: 'mode', key: 'field.mode' },
  { field: null, key: 'field.rstSent', className: 'hidden md:table-cell' },
  { field: null, key: 'field.rstRcvd', className: 'hidden md:table-cell' },
  { field: null, key: 'field.comment', className: 'hidden lg:table-cell' },
]

function formatDate(adif: string): string {
  return adif.length === 8 ? `${adif.slice(0, 4)}-${adif.slice(4, 6)}-${adif.slice(6, 8)}` : adif
}

function formatTime(adif: string): string {
  return adif.length >= 4 ? `${adif.slice(0, 2)}:${adif.slice(2, 4)}` : adif
}

export default function LogTable({
  qsos,
  sort,
  onSort,
  onEdit,
  onDelete,
}: {
  qsos: Qso[]
  sort: LogSort
  onSort: (field: SortField) => void
  onEdit: (qso: Qso) => void
  onDelete: (qso: Qso) => void
}) {
  const { t } = useTranslation()

  return (
    <table className="w-full text-left text-sm">
      <thead className="text-muted">
        <tr className="border-b border-line">
          {COLUMNS.map((column) => (
            <th key={column.key} scope="col" className={`py-2 pr-3 font-medium ${column.className ?? ''}`}>
              {column.field ? (
                <button
                  type="button"
                  onClick={() => onSort(column.field as SortField)}
                  aria-sort={sort.field === column.field ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="underline-offset-2 hover:underline"
                >
                  {t(column.key)}
                  {sort.field === column.field ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              ) : (
                t(column.key)
              )}
            </th>
          ))}
          <th scope="col" className="py-2" />
        </tr>
      </thead>
      <tbody>
        {qsos.map((qso) => (
          <tr key={qso.id} className="border-b border-line-soft">
            <td className="py-2 pr-3 font-medium tracking-wide">{qso.call}</td>
            <td className="py-2 pr-3 tabular-nums">{formatDate(qso.qsoDate)}</td>
            <td className="hidden py-2 pr-3 tabular-nums sm:table-cell">{formatTime(qso.timeOn)}</td>
            <td className="py-2 pr-3">{qso.band}</td>
            <td className="py-2 pr-3">{qso.mode}</td>
            <td className="hidden py-2 pr-3 md:table-cell">{qso.rstSent}</td>
            <td className="hidden py-2 pr-3 md:table-cell">{qso.rstRcvd}</td>
            <td className="hidden max-w-48 truncate py-2 pr-3 lg:table-cell">{qso.comment}</td>
            <td className="py-2 text-right whitespace-nowrap">
              <button type="button" onClick={() => onEdit(qso)} className="underline">
                {t('action.edit')}
              </button>
              <button
                type="button"
                onClick={() => onDelete(qso)}
                className="ml-3 underline"
                aria-label={`${t('action.delete')} ${qso.call}`}
              >
                {t('action.delete')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
