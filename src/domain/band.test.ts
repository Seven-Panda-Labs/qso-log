import { describe, expect, it } from 'vitest'
import { BANDS, bandForFrequency, bandRange, frequencyMatchesBand, isBand } from './band'

describe('bandForFrequency', () => {
  it.each([
    [1.845, '160m'],
    [3.573, '80m'],
    [7.074, '40m'],
    [10.136, '30m'],
    [14.074, '20m'],
    [14.35, '20m'],
    [18.1, '17m'],
    [21.074, '15m'],
    [28.074, '10m'],
    [50.313, '6m'],
    [144.174, '2m'],
    [432.2, '70cm'],
    [1296.1, '23cm'],
  ])('puts %s MHz in %s', (mhz, band) => {
    expect(bandForFrequency(mhz)).toBe(band)
  })

  it.each([
    // Between allocations, and outside every band.
    [5.0],
    [9.0],
    [30.5],
    [0.05],
    [300000],
  ])('returns undefined for %s MHz', (mhz) => {
    expect(bandForFrequency(mhz)).toBeUndefined()
  })

  it('rejects values that are not numbers', () => {
    expect(bandForFrequency(Number.NaN)).toBeUndefined()
    expect(bandForFrequency(Number.POSITIVE_INFINITY)).toBeUndefined()
  })

  it('includes both edges of a band', () => {
    expect(bandForFrequency(7.0)).toBe('40m')
    expect(bandForFrequency(7.3)).toBe('40m')
    expect(bandForFrequency(7.301)).toBeUndefined()
  })
})

describe('the band table', () => {
  it('is ordered low to high and does not overlap', () => {
    BANDS.forEach((range, index) => {
      expect(range.lower).toBeLessThan(range.upper)
      const previous = BANDS[index - 1]
      if (previous) expect(range.lower).toBeGreaterThan(previous.upper)
    })
  })

  it('names bands the way ADIF does', () => {
    expect(isBand('20m')).toBe(true)
    expect(isBand('20M')).toBe(true)
    expect(isBand('20 m')).toBe(false)
    expect(isBand('11m')).toBe(false)
  })

  it('exposes a band range', () => {
    expect(bandRange('20m')).toEqual({ band: '20m', lower: 14.0, upper: 14.35 })
    expect(bandRange('nonsense')).toBeUndefined()
  })
})

describe('frequencyMatchesBand', () => {
  it('accepts a frequency inside the band the operator chose', () => {
    expect(frequencyMatchesBand(14.074, '20m')).toBe(true)
  })

  // The regional split: 7.25 MHz is inside 40m for ADIF, though only region 2
  // may transmit there. Band naming is not a licence check.
  it('accepts a frequency legal in one region but not another', () => {
    expect(frequencyMatchesBand(7.25, '40m')).toBe(true)
  })

  it('rejects a frequency from a different band', () => {
    expect(frequencyMatchesBand(14.074, '40m')).toBe(false)
    expect(frequencyMatchesBand(14.074, 'nonsense')).toBe(false)
  })
})
