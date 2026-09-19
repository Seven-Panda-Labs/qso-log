import { describe, expect, it } from 'vitest'
import { matchesFilter, queryLog, sortLog, usedBands, usedModes } from './logQuery'
import type { Qso } from './qso'

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

const log = [
  qso({ id: 'a', call: 'W1AW', band: '40m', mode: 'SSB', qsoDate: '20260917', comment: 'Nice QSO' }),
  qso({ id: 'b', call: 'M0ABC', band: '20m', mode: 'FT8', qsoDate: '20260918', gridsquare: 'IO91wm' }),
  qso({ id: 'c', call: 'W1AW/P', band: '20m', mode: 'CW', qsoDate: '20260919' }),
]

describe('matchesFilter', () => {
  it('matches everything with an empty filter', () => {
    expect(log.every((entry) => matchesFilter(entry, {}))).toBe(true)
  })

  it.each([
    ['w1aw', ['a', 'c']],
    ['W1AW', ['a', 'c']],
    ['io91', ['b']],
    ['nice', ['a']],
    ['cw', ['c']],
    ['nothing here', []],
  ])('searches %s', (search, expected) => {
    expect(log.filter((entry) => matchesFilter(entry, { search })).map((e) => e.id)).toEqual(expected)
  })

  it('ignores surrounding whitespace in the search', () => {
    expect(log.filter((entry) => matchesFilter(entry, { search: '  m0abc  ' }))).toHaveLength(1)
  })

  it('filters by band and mode', () => {
    expect(log.filter((entry) => matchesFilter(entry, { band: '20m' }))).toHaveLength(2)
    expect(log.filter((entry) => matchesFilter(entry, { mode: 'SSB' }))).toHaveLength(1)
    expect(log.filter((entry) => matchesFilter(entry, { band: '20m', mode: 'CW' }))).toHaveLength(1)
  })

  it('combines search with the dropdown filters', () => {
    expect(log.filter((entry) => matchesFilter(entry, { search: 'w1aw', band: '20m' }))).toHaveLength(1)
  })
})

describe('sortLog', () => {
  it('sorts by date, newest first by default direction', () => {
    expect(sortLog(log, { field: 'date', direction: 'desc' }).map((e) => e.id)).toEqual(['c', 'b', 'a'])
    expect(sortLog(log, { field: 'date', direction: 'asc' }).map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  // W1AW and W1AW/P are the same station, so they sort together.
  it('sorts by the base callsign', () => {
    expect(sortLog(log, { field: 'call', direction: 'asc' }).map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by band and mode', () => {
    expect(sortLog(log, { field: 'band', direction: 'asc' }).map((e) => e.band)).toEqual([
      '20m',
      '20m',
      '40m',
    ])
    expect(sortLog(log, { field: 'mode', direction: 'asc' }).map((e) => e.mode)).toEqual([
      'CW',
      'FT8',
      'SSB',
    ])
  })

  it('breaks ties by date so the table does not reshuffle', () => {
    const ties = [
      qso({ id: 'old', band: '20m', qsoDate: '20260101' }),
      qso({ id: 'new', band: '20m', qsoDate: '20260202' }),
    ]
    expect(sortLog(ties, { field: 'band', direction: 'asc' }).map((e) => e.id)).toEqual(['new', 'old'])
  })

  it('does not modify the log it was given', () => {
    const original = [...log]
    sortLog(log, { field: 'call', direction: 'asc' })
    expect(log).toEqual(original)
  })
})

describe('queryLog', () => {
  it('filters then sorts', () => {
    const result = queryLog(log, { band: '20m' }, { field: 'date', direction: 'asc' })
    expect(result.map((e) => e.id)).toEqual(['b', 'c'])
  })
})

describe('usedBands and usedModes', () => {
  it('lists what the log actually contains', () => {
    expect(usedBands(log)).toEqual(['20m', '40m'])
    expect(usedModes(log)).toEqual(['CW', 'FT8', 'SSB'])
  })

  it('is empty for an empty log', () => {
    expect(usedBands([])).toEqual([])
  })
})
