import { describe, expect, it } from 'vitest'
import { findMode, isSubmode, primaryMode, reportStyle } from './mode'

describe('findMode', () => {
  it('is case and whitespace tolerant', () => {
    expect(findMode(' ft8 ')?.code).toBe('FT8')
  })

  it('returns undefined for a mode it does not know', () => {
    expect(findMode('OPERA')).toBeUndefined()
  })
})

describe('reportStyle', () => {
  it.each([
    ['CW', 'rst'],
    ['RTTY', 'rst'],
    ['PSK31', 'rst'],
    ['SSB', 'rs'],
    ['USB', 'rs'],
    ['FM', 'rs'],
    // Weak signal modes report dB, not RST.
    ['FT8', 'db'],
    ['FT4', 'db'],
    ['JT65', 'db'],
    ['WSPR', 'db'],
  ])('%s uses %s', (mode, style) => {
    expect(reportStyle(mode)).toBe(style)
  })

  it('falls back to RST for an unknown mode', () => {
    expect(reportStyle('SOMETHING-NEW')).toBe('rst')
  })
})

describe('primaryMode', () => {
  it.each([
    ['FT4', 'MFSK'],
    ['JS8', 'MFSK'],
    ['USB', 'SSB'],
    ['LSB', 'SSB'],
    ['PSK31', 'PSK'],
  ])('maps submode %s to %s', (submode, primary) => {
    expect(primaryMode(submode)).toBe(primary)
    expect(isSubmode(submode)).toBe(true)
  })

  it.each(['CW', 'SSB', 'FM', 'FT8'])('leaves primary mode %s alone', (mode) => {
    expect(primaryMode(mode)).toBe(mode)
    expect(isSubmode(mode)).toBe(false)
  })
})
