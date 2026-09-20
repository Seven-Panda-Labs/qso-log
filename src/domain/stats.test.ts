import { describe, expect, it } from 'vitest'
import { createDxccLookup, type DxccData } from './dxcc'
import type { Qso } from './qso'
import { entitiesWorked, logStats } from './stats'

function qso(overrides: Partial<Qso> = {}): Qso {
  return {
    id: crypto.randomUUID(),
    call: '2E0XXX',
    qsoDate: '20260918',
    timeOn: '1432',
    band: '20m',
    mode: 'FT8',
    ...overrides,
  }
}

describe('logStats', () => {
  it('reports zeroes for an empty log', () => {
    expect(logStats([])).toEqual({
      total: 0,
      stations: 0,
      bands: [],
      modes: [],
      firstDate: undefined,
      lastDate: undefined,
      activeDays: 0,
    })
  })

  it('counts contacts, bands, and modes', () => {
    const stats = logStats([
      qso({ band: '20m', mode: 'FT8' }),
      qso({ band: '20m', mode: 'CW' }),
      qso({ band: '40m', mode: 'FT8' }),
    ])

    expect(stats.total).toBe(3)
    expect(stats.bands).toEqual([
      { name: '20m', count: 2 },
      { name: '40m', count: 1 },
    ])
    expect(stats.modes[0]).toEqual({ name: 'FT8', count: 2 })
  })

  // Working W1AW again from a different location is the same station.
  it('counts a station once across its portable calls', () => {
    const stats = logStats([qso({ call: 'W1AW' }), qso({ call: 'W1AW/P' }), qso({ call: 'M0ABC' })])
    expect(stats.stations).toBe(2)
  })

  it('reports the first and last day worked', () => {
    const stats = logStats([
      qso({ qsoDate: '20260918' }),
      qso({ qsoDate: '20260101' }),
      qso({ qsoDate: '20261231' }),
    ])
    expect(stats.firstDate).toBe('20260101')
    expect(stats.lastDate).toBe('20261231')
    expect(stats.activeDays).toBe(3)
  })

  it('counts a day once however many contacts it holds', () => {
    const stats = logStats([qso({ timeOn: '0900' }), qso({ timeOn: '1700' })])
    expect(stats.activeDays).toBe(1)
  })

  it('orders ties alphabetically so the display is stable', () => {
    const stats = logStats([qso({ band: '40m' }), qso({ band: '20m' })])
    expect(stats.bands.map((band) => band.name)).toEqual(['20m', '40m'])
  })
})

describe('entitiesWorked', () => {
  const data: DxccData = {
    entities: {
      223: ['England', 'G', 'EU'],
      272: ['Portugal', 'CT', 'EU'],
      291: ['United States', 'K', 'NA'],
    },
    prefixes: { G: 223, M: 223, CT: 272, K: 291, W: 291 },
    exact: {},
  }
  const lookup = createDxccLookup(data)

  it('counts nothing for an empty log', () => {
    expect(entitiesWorked([], lookup)).toEqual([])
  })

  it('counts each entity once, with its contacts', () => {
    const worked = entitiesWorked(
      [qso({ call: 'W1AW' }), qso({ call: 'K1ABC' }), qso({ call: 'CT1ABC' })],
      lookup,
    )

    expect(worked).toEqual([
      { dxcc: 291, name: 'United States', count: 2 },
      { dxcc: 272, name: 'Portugal', count: 1 },
    ])
  })

  it('follows a portable prefix to where the station actually is', () => {
    const worked = entitiesWorked([qso({ call: 'CT/W1AW' })], lookup)
    expect(worked).toEqual([{ dxcc: 272, name: 'Portugal', count: 1 }])
  })

  /**
   * A count of countries with an entry called unknown is not a count of
   * countries, so unplaceable callsigns are left out.
   */
  it('leaves out a callsign it cannot place', () => {
    const worked = entitiesWorked([qso({ call: 'W1AW' }), qso({ call: 'QQ9ZZZ' })], lookup)
    expect(worked).toEqual([{ dxcc: 291, name: 'United States', count: 1 }])
  })

  /**
   * The operator was there and a prefix table was not. An imported log may
   * carry an entity its own program knew about and ours cannot derive.
   */
  it('prefers an entity the log recorded over the callsign', () => {
    const worked = entitiesWorked([qso({ call: 'W1AW', dxcc: 272 })], lookup)
    expect(worked).toEqual([{ dxcc: 272, name: 'Portugal', count: 1 }])
  })

  it('places a callsign it could not otherwise, when the log recorded one', () => {
    const worked = entitiesWorked([qso({ call: 'QQ9ZZZ', dxcc: 223 })], lookup)
    expect(worked).toEqual([{ dxcc: 223, name: 'England', count: 1 }])
  })

  it('falls back to the callsign when the recorded entity is unknown here', () => {
    const worked = entitiesWorked([qso({ call: 'W1AW', dxcc: 9999 })], lookup)
    expect(worked).toEqual([{ dxcc: 291, name: 'United States', count: 1 }])
  })
})
