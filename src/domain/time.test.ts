import { describe, expect, it } from 'vitest'
import {
  isValidAdifDate,
  isValidAdifTime,
  parseAdifDateTime,
  toAdifDate,
  toAdifTime,
  utcDay,
} from './time'

describe('toAdifDate and toAdifTime', () => {
  it('formats UTC', () => {
    const date = new Date(Date.UTC(2026, 8, 18, 7, 5, 9))
    expect(toAdifDate(date)).toBe('20260918')
    expect(toAdifTime(date)).toBe('0705')
    expect(toAdifTime(date, { seconds: true })).toBe('070509')
  })

  it('pads a year before 1000', () => {
    expect(toAdifDate(new Date(Date.UTC(999, 0, 1)))).toBe('09990101')
  })

  /**
   * The rollover an operator lives with: 23:30 local in Lisbon during summer
   * time is already the next day in UTC, and the log follows UTC.
   */
  it('logs an evening contact on the next UTC day when it crosses midnight', () => {
    const local = new Date('2026-06-18T23:30:00+01:00')
    expect(toAdifDate(local)).toBe('20260618')
    expect(toAdifTime(local)).toBe('2230')

    const afterMidnightUtc = new Date('2026-06-19T01:30:00+03:00')
    expect(toAdifDate(afterMidnightUtc)).toBe('20260618')

    const past = new Date('2026-06-19T00:30:00+01:00')
    expect(utcDay(past)).toBe('20260618')
  })

  it('does not depend on the machine timezone', () => {
    const fromIso = new Date('2026-01-01T00:30:00Z')
    expect(toAdifDate(fromIso)).toBe('20260101')
    expect(toAdifTime(fromIso)).toBe('0030')
  })
})

describe('parseAdifDateTime', () => {
  it('reads a date and time as UTC', () => {
    const parsed = parseAdifDateTime('20260918', '0705')
    expect(parsed?.toISOString()).toBe('2026-09-18T07:05:00.000Z')
  })

  it('accepts seconds', () => {
    expect(parseAdifDateTime('20260918', '070509')?.toISOString()).toBe('2026-09-18T07:05:09.000Z')
  })

  it('defaults to midnight when no time is given', () => {
    expect(parseAdifDateTime('20260918')?.toISOString()).toBe('2026-09-18T00:00:00.000Z')
  })

  it('round trips', () => {
    const parsed = parseAdifDateTime('20261231', '2359')
    expect(parsed && toAdifDate(parsed)).toBe('20261231')
    expect(parsed && toAdifTime(parsed)).toBe('2359')
  })

  it('handles a leap day', () => {
    expect(parseAdifDateTime('20280229')?.toISOString()).toBe('2028-02-29T00:00:00.000Z')
  })

  // A typo must not become a different, valid date.
  it.each(['20260231', '20270229', '20261301', '20260000', '2026091', 'nonsense', ''])(
    'rejects %s',
    (date) => {
      expect(parseAdifDateTime(date)).toBeUndefined()
      expect(isValidAdifDate(date)).toBe(false)
    },
  )

  it.each(['2460', '0060', '12345', 'ab00', ''])('rejects time %s', (time) => {
    expect(parseAdifDateTime('20260918', time)).toBeUndefined()
    expect(isValidAdifTime(time)).toBe(false)
  })

  it('accepts the edges of a day', () => {
    expect(isValidAdifTime('0000')).toBe(true)
    expect(isValidAdifTime('2359')).toBe(true)
    expect(isValidAdifTime('235959')).toBe(true)
  })
})
