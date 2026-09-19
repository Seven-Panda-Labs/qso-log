import { parseCallsign } from './callsign'
import type { DxccLookup } from './dxcc'
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

/** Counting is deliberately plain. */
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

export interface EntityCount {
  dxcc: number
  name: string
  count: number
}

/**
 * Entities worked, the number operators call countries.
 *
 * Contacts whose callsign resolves to nothing are left out rather than bundled
 * into an "unknown" bucket: a count of countries with an eleventh entry called
 * unknown is not a count of countries.
 */
export function entitiesWorked(qsos: Qso[], lookup: DxccLookup): EntityCount[] {
  const counts = new Map<number, EntityCount>()

  for (const qso of qsos) {
    const entity = lookup(qso.call)
    if (!entity) continue

    const existing = counts.get(entity.dxcc)
    if (existing) existing.count += 1
    else counts.set(entity.dxcc, { dxcc: entity.dxcc, name: entity.name, count: 1 })
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
