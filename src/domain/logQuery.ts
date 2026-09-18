import { parseCallsign } from './callsign'
import type { Qso } from './qso'

export interface LogFilter {
  /** Matched against callsign, band, mode, grid square, and comment. */
  search?: string
  band?: string
  mode?: string
}

export type SortField = 'date' | 'call' | 'band' | 'mode'
export type SortDirection = 'asc' | 'desc'

export interface LogSort {
  field: SortField
  direction: SortDirection
}

function haystack(qso: Qso): string {
  return [qso.call, qso.band, qso.mode, qso.submode, qso.gridsquare, qso.comment]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase()
}

/**
 * Substring search over the fields an operator would look in. Deliberately not
 * fuzzy: someone searching for W1AW wants W1AW, and a logbook that answers
 * with something close is worse than one that answers with nothing.
 */
export function matchesFilter(qso: Qso, filter: LogFilter): boolean {
  const search = filter.search?.trim().toLowerCase()
  if (search && !haystack(qso).includes(search)) return false
  if (filter.band && qso.band.toLowerCase() !== filter.band.toLowerCase()) return false
  if (filter.mode && qso.mode.toLowerCase() !== filter.mode.toLowerCase()) return false
  return true
}

function sortKey(qso: Qso, field: SortField): string {
  switch (field) {
    case 'date':
      return (qso.qsoDate ?? '') + (qso.timeOn ?? '')
    case 'call':
      return parseCallsign(qso.call).base || qso.call
    case 'band':
      return qso.band
    case 'mode':
      return qso.mode
  }
}

export function sortLog(qsos: Qso[], { field, direction }: LogSort): Qso[] {
  const order = direction === 'asc' ? 1 : -1
  return [...qsos].sort((a, b) => {
    const compared = sortKey(a, field).localeCompare(sortKey(b, field))
    // Contacts that tie keep a stable order, newest first, so the table does
    // not reshuffle under the operator on an unrelated change.
    if (compared !== 0) return compared * order
    return ((b.qsoDate ?? '') + (b.timeOn ?? '')).localeCompare((a.qsoDate ?? '') + (a.timeOn ?? ''))
  })
}

export function queryLog(qsos: Qso[], filter: LogFilter, sort: LogSort): Qso[] {
  return sortLog(
    qsos.filter((qso) => matchesFilter(qso, filter)),
    sort,
  )
}

/** The bands and modes actually present, for the filter dropdowns. */
export function usedBands(qsos: Qso[]): string[] {
  return [...new Set(qsos.map((qso) => qso.band).filter(Boolean))].sort()
}

export function usedModes(qsos: Qso[]): string[] {
  return [...new Set(qsos.map((qso) => qso.mode).filter(Boolean))].sort()
}
