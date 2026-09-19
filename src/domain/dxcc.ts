import { parseCallsign } from './callsign'

export interface DxccData {
  /** ADIF DXCC number to name, primary prefix, continent. */
  entities: Record<number, [name: string, prefix: string, continent: string]>
  /** Callsign prefix to DXCC number. */
  prefixes: Record<string, number>
  /** Callsigns whose prefix lies, space separated per DXCC number. */
  exact: Record<number, string>
}

export interface DxccEntity {
  /** ADIF DXCC entity number, the field ADIF calls DXCC. */
  dxcc: number
  name: string
  prefix: string
  continent: string
}

export interface DxccLookup {
  (callsign: string): DxccEntity | undefined
}

/**
 * The part of a callsign that says where the station is.
 *
 * A location prefix wins: F/W1AW is in France, not the United States. A
 * suffix that is a call area digit belongs to the same entity, and an activity
 * suffix such as /P or /MM says nothing about location at all.
 */
export function locationPart(callsign: string): string {
  const parsed = parseCallsign(callsign)
  if (parsed.prefix) return parsed.prefix
  return parsed.base || parsed.callsign
}

export function createDxccLookup(data: DxccData): DxccLookup {
  const exact = new Map<string, number>()
  for (const [dxcc, calls] of Object.entries(data.exact)) {
    for (const call of calls.split(' ')) exact.set(call, Number(dxcc))
  }

  const entityFor = (dxcc: number | undefined): DxccEntity | undefined => {
    if (dxcc === undefined) return undefined
    const entity = data.entities[dxcc]
    if (!entity) return undefined
    const [name, prefix, continent] = entity
    return { dxcc, name, prefix, continent }
  }

  return (callsign) => {
    const whole = callsign.trim().toUpperCase()

    // An explicit callsign wins over its own prefix: 9M4SDX is in the Spratly
    // Islands, whatever 9M would otherwise say.
    const known = entityFor(exact.get(whole))
    if (known) return known

    const candidate = locationPart(callsign).toUpperCase()
    if (!candidate) return undefined

    // Longest match wins: GM0 is Scotland where G is England, and a shorter
    // match would file every Scottish contact under the wrong entity.
    for (let length = candidate.length; length > 0; length -= 1) {
      const entity = entityFor(data.prefixes[candidate.slice(0, length)])
      if (entity) return entity
    }

    return undefined
  }
}

/**
 * Loads the prefix table on demand. It is a hundred kilobytes of data that
 * only the statistics need, so it stays out of the first load.
 */
export async function loadDxcc(): Promise<DxccLookup> {
  const { default: data } = await import('./dxcc.generated')
  return createDxccLookup(data)
}
