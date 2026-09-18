import { parseCallsign } from './callsign'
import type { Qso } from './qso'

export interface LogStats {
  total: number
  /** Distinct stations, counting W1AW and W1AW/P once. */
  stations: number
  bands: { name: string; count: number }[]
  modes: { name: string; count: number }[]
  /** ADIF dates, UTC. Undefined for an empty log. */
  firstDate?: string
  lastDate?: string
  /** Distinct UTC days with at least one contact. */
  activeDays: number
}

function tally(values: string[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/**
 * Counting is deliberately plain. Countries worked is the number every logger
 * shows and it needs a DXCC prefix table, which is a data problem of its own;
 * it arrives when that table does, not as a guess from the callsign prefix.
 */
export function logStats(qsos: Qso[]): LogStats {
  const dates = qsos.map((qso) => qso.qsoDate).filter(Boolean).sort()
  const stations = new Set(qsos.map((qso) => parseCallsign(qso.call).base || qso.call))
  stations.delete('')

  return {
    total: qsos.length,
    stations: stations.size,
    bands: tally(qsos.map((qso) => qso.band)),
    modes: tally(qsos.map((qso) => qso.mode)),
    firstDate: dates[0],
    lastDate: dates.at(-1),
    activeDays: new Set(dates).size,
  }
}
