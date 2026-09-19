import { describe, expect, it } from 'vitest'
import type { Qso } from './qso'
import { logStats } from './stats'

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
