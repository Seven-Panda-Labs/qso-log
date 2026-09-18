import { describe, expect, it } from 'vitest'
import {
  bearing,
  distanceKm,
  isGridSquare,
  normaliseGridSquare,
  parseGridSquare,
  toGridSquare,
} from './grid'

describe('toGridSquare', () => {
  it.each([
    // W1AW in Newington, the locator every operator can check.
    [41.7148, -72.7272, 'FN31pr'],
    [51.5074, -0.1278, 'IO91wm'],
    [35.6895, 139.6917, 'PM95uq'],
    [38.7223, -9.1393, 'IM58kr'],
    [-33.8688, 151.2093, 'QF56od'],
  ])('encodes %s, %s as %s', (latitude, longitude, locator) => {
    expect(toGridSquare(latitude, longitude)).toBe(locator)
  })

  it('honours the requested length', () => {
    expect(toGridSquare(41.7148, -72.7272, 4)).toBe('FN31')
    expect(toGridSquare(41.7148, -72.7272, 6)).toBe('FN31pr')
    expect(toGridSquare(41.7148, -72.7272, 8)).toHaveLength(8)
  })

  it('rejects a length that is not a locator length', () => {
    expect(toGridSquare(0, 0, 5)).toBeUndefined()
    expect(toGridSquare(0, 0, 10)).toBeUndefined()
  })

  it('handles the edges of the world', () => {
    expect(toGridSquare(0, 0, 4)).toBe('JJ00')
    expect(toGridSquare(-90, -180, 4)).toBe('AA00')
    expect(toGridSquare(90, 180, 4)).toBe('RR99')
  })

  it('rejects coordinates off the globe', () => {
    expect(toGridSquare(91, 0)).toBeUndefined()
    expect(toGridSquare(0, 181)).toBeUndefined()
    expect(toGridSquare(Number.NaN, 0)).toBeUndefined()
  })
})

describe('parseGridSquare', () => {
  it('returns the centre of the square', () => {
    const square = parseGridSquare('FN31pr')
    expect(square?.latitude).toBeCloseTo(41.729167, 6)
    expect(square?.longitude).toBeCloseTo(-72.708333, 6)
  })

  it('reports the span, so a caller knows the precision it has', () => {
    expect(parseGridSquare('JN18')).toMatchObject({ latitudeSpan: 1, longitudeSpan: 2 })
    expect(parseGridSquare('JN18eu')?.latitudeSpan).toBeCloseTo(1 / 24, 10)
    expect(parseGridSquare('JN18eu55')?.latitudeSpan).toBeCloseTo(1 / 240, 10)
  })

  it('round trips through the encoder', () => {
    for (const locator of ['FN31pr', 'IO91wm', 'IM58kr', 'QF56od', 'JJ00aa']) {
      const square = parseGridSquare(locator)
      expect(square && toGridSquare(square.latitude, square.longitude)).toBe(locator)
    }
  })

  it.each(['fn31PR', 'FN31PR', ' fn31pr '])('accepts %s', (input) => {
    expect(parseGridSquare(input)?.locator).toBe('FN31pr')
  })

  it.each(['', 'FN', 'FN3', 'SN31', 'FN31zz', 'FN31pr1', '31FNpr'])('rejects %s', (input) => {
    expect(parseGridSquare(input)).toBeUndefined()
    expect(isGridSquare(input)).toBe(false)
  })

  it('writes a locator the conventional way', () => {
    expect(normaliseGridSquare('fn31PR')).toBe('FN31pr')
    expect(normaliseGridSquare('nonsense')).toBeUndefined()
  })
})

/**
 * Expected values come from an independent implementation of the Maidenhead
 * definition and the haversine formula, not from this module.
 */
describe('distanceKm', () => {
  it.each([
    ['FN31pr', 'IO91wm', 5414.73],
    ['IO91wm', 'PM95tq', 9555.131],
    ['IM58jq', 'JN18eu', 1460.517],
  ])('measures %s to %s', (from, to, expected) => {
    expect(distanceKm(from, to)).toBeCloseTo(expected, 2)
  })

  it('is zero for the same square and symmetric between two', () => {
    expect(distanceKm('IM58kr', 'IM58kr')).toBe(0)
    expect(distanceKm('FN31pr', 'IO91wm')).toBeCloseTo(distanceKm('IO91wm', 'FN31pr') ?? 0, 9)
  })

  it('returns undefined when either locator is not one', () => {
    expect(distanceKm('FN31pr', 'nonsense')).toBeUndefined()
    expect(distanceKm('nonsense', 'FN31pr')).toBeUndefined()
  })
})

describe('bearing', () => {
  it('points from one square to another', () => {
    expect(bearing('FN31pr', 'IO91wm')).toBeCloseTo(52.216, 2)
    expect(bearing('IO91wm', 'FN31pr')).toBeCloseTo(288.575, 2)
  })

  it('stays between 0 and 360', () => {
    for (const [from, to] of [
      ['IM58kr', 'JN18eu'],
      ['JN18eu', 'IM58kr'],
      ['QF56od', 'FN31pr'],
    ] as const) {
      const value = bearing(from, to)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(360)
    }
  })

  it('returns undefined for a locator that is not one', () => {
    expect(bearing('FN31pr', '')).toBeUndefined()
  })
})
