import { describe, expect, it } from 'vitest'
import { adifMode, bandFromFrequency, isLikelyDuplicate, qsoTimestamp, validateQso } from './qso'
import type { Qso } from './qso'

function qso(overrides: Partial<Qso> = {}): Qso {
  return {
    id: '1',
    call: '2E0XXX',
    qsoDate: '20260918',
    timeOn: '1432',
    band: '20m',
    freq: 14.074,
    mode: 'FT8',
    ...overrides,
  }
}

describe('validateQso', () => {
  it('passes a complete contact', () => {
    expect(validateQso(qso())).toEqual([])
  })

  it.each([
    [{ call: '' }, 'call-missing'],
    [{ call: 'NOTACALL' }, 'call-unrecognised'],
    [{ qsoDate: '20260231' }, 'date-invalid'],
    [{ timeOn: '2465' }, 'time-invalid'],
    [{ band: '11m' }, 'band-unknown'],
    [{ band: '40m', freq: 14.074 }, 'band-frequency-mismatch'],
    [{ mode: '' }, 'mode-missing'],
    [{ gridsquare: 'ZZ99' }, 'gridsquare-invalid'],
  ])('reports %o', (overrides, issue) => {
    expect(validateQso(qso(overrides))).toContain(issue)
  })

  it('accepts a contact with no frequency', () => {
    expect(validateQso(qso({ freq: undefined }))).toEqual([])
  })

  it('accepts a valid grid square', () => {
    expect(validateQso(qso({ gridsquare: 'IO91wm' }))).toEqual([])
  })

  // Flagging is not refusing: an odd call on an odd band is still the
  // operator's record of what happened.
  it('collects every issue rather than stopping at the first', () => {
    expect(validateQso(qso({ call: 'NOTACALL', band: '11m', mode: '' }))).toEqual([
      'call-unrecognised',
      'band-unknown',
      'mode-missing',
    ])
  })
})

describe('qsoTimestamp', () => {
  it('reads date and time as UTC', () => {
    expect(qsoTimestamp(qso())?.toISOString()).toBe('2026-09-18T14:32:00.000Z')
  })

  it('returns undefined when the date does not parse', () => {
    expect(qsoTimestamp(qso({ qsoDate: 'nonsense' }))).toBeUndefined()
  })
})

describe('adifMode', () => {
  it('reports a submode under its ADIF primary mode', () => {
    expect(adifMode(qso({ mode: 'FT4' }))).toBe('MFSK')
    expect(adifMode(qso({ mode: 'USB' }))).toBe('SSB')
  })

  it('leaves an unknown mode alone rather than dropping it', () => {
    expect(adifMode(qso({ mode: 'SOMETHING-NEW' }))).toBe('SOMETHING-NEW')
  })
})

describe('bandFromFrequency', () => {
  it('derives the band without touching what was logged', () => {
    const contact = qso({ band: '20m', freq: 14.074 })
    expect(bandFromFrequency(contact)).toBe('20m')
    expect(contact.freq).toBe(14.074)
  })

  it('is undefined with no frequency', () => {
    expect(bandFromFrequency(qso({ freq: undefined }))).toBeUndefined()
  })
})

describe('isLikelyDuplicate', () => {
  const first = qso({ id: '1', timeOn: '1432' })

  it('flags the same station again on the same band and mode minutes later', () => {
    expect(isLikelyDuplicate(first, qso({ id: '2', timeOn: '1435' }))).toBe(true)
  })

  it('sees through a portable suffix', () => {
    expect(isLikelyDuplicate(first, qso({ id: '2', call: '2E0XXX/P', timeOn: '1435' }))).toBe(true)
  })

  // Working a station again on another band, mode, or day is a separate QSO.
  it.each([
    [{ id: '2', band: '40m', freq: 7.074 }],
    [{ id: '2', mode: 'CW' }],
    [{ id: '2', qsoDate: '20260919' }],
    [{ id: '2', call: 'M0ABC' }],
    [{ id: '2', timeOn: '1500' }],
  ])('does not flag %o', (overrides) => {
    expect(isLikelyDuplicate(first, qso(overrides))).toBe(false)
  })

  it('does not flag a contact against itself', () => {
    expect(isLikelyDuplicate(first, first)).toBe(false)
  })

  it('treats a submode and its primary mode as the same mode', () => {
    const ssb = qso({ id: '1', mode: 'SSB', freq: 14.2 })
    const usb = qso({ id: '2', mode: 'USB', freq: 14.2, timeOn: '1433' })
    expect(isLikelyDuplicate(ssb, usb)).toBe(true)
  })

  it('takes the window from the caller', () => {
    const later = qso({ id: '2', timeOn: '1500' })
    expect(isLikelyDuplicate(first, later, 60)).toBe(true)
  })
})
