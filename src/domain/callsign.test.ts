import { describe, expect, it } from 'vitest'
import { isActivitySuffix, parseCallsign, sameStation } from './callsign'

describe('parseCallsign', () => {
  it('parses a plain call', () => {
    expect(parseCallsign('w1aw')).toMatchObject({
      callsign: 'W1AW',
      base: 'W1AW',
      portable: false,
      looksValid: true,
    })
  })

  it('parses a call that starts with a digit', () => {
    expect(parseCallsign('2E0XXX')).toMatchObject({ base: '2E0XXX', looksValid: true })
  })

  it('reads a location prefix', () => {
    expect(parseCallsign('F/W1AW')).toMatchObject({
      base: 'W1AW',
      prefix: 'F',
      portable: true,
      looksValid: true,
    })
  })

  it('reads an area or activity suffix', () => {
    expect(parseCallsign('W1AW/4')).toMatchObject({ base: 'W1AW', suffix: '4', portable: true })
    expect(parseCallsign('W1AW/P')).toMatchObject({ base: 'W1AW', suffix: 'P', portable: true })
    expect(parseCallsign('W1AW/MM')).toMatchObject({ base: 'W1AW', suffix: 'MM' })
  })

  it('reads a prefix and a suffix together', () => {
    expect(parseCallsign('F/W1AW/P')).toMatchObject({
      base: 'W1AW',
      prefix: 'F',
      suffix: 'P',
      portable: true,
    })
  })

  it.each(['CT1ABC', 'PY2XYZ', 'VK3ABC', 'JA1XYZ', 'M0ABC', 'DL1AB', 'G0ABCD', '9A1A'])(
    'recognises %s',
    (call) => {
      expect(parseCallsign(call).looksValid).toBe(true)
    },
  )

  /**
   * An unrecognised callsign is still logged. The flag tells the UI to ask,
   * it does not reject the contact.
   */
  it.each(['', 'NOTACALL', '12345', '/'])('flags %s without throwing', (input) => {
    const parsed = parseCallsign(input)
    expect(parsed.looksValid).toBe(false)
    expect(parsed.callsign).toBe(input.trim().toUpperCase())
  })

  // A stray separator is a typo, not a different station.
  it('ignores empty separators', () => {
    expect(parseCallsign('W1AW//')).toMatchObject({ base: 'W1AW', looksValid: true })
    expect(parseCallsign('/W1AW')).toMatchObject({ base: 'W1AW', looksValid: true })
  })

  it('keeps the original in callsign while normalising case', () => {
    expect(parseCallsign('  f/w1aw/p  ').callsign).toBe('F/W1AW/P')
  })
})

describe('isActivitySuffix', () => {
  it.each(['P', 'M', 'MM', 'AM', 'QRP'])('%s describes how the station operates', (suffix) => {
    expect(isActivitySuffix(suffix)).toBe(true)
  })

  it('does not treat a call area digit as an activity', () => {
    expect(isActivitySuffix('4')).toBe(false)
  })
})

describe('sameStation', () => {
  it('sees through prefixes and suffixes', () => {
    expect(sameStation('W1AW', 'W1AW/P')).toBe(true)
    expect(sameStation('F/W1AW/P', 'W1AW/4')).toBe(true)
  })

  it('separates different stations', () => {
    expect(sameStation('W1AW', 'M0ABC')).toBe(false)
  })

  it('does not match two unparseable inputs', () => {
    expect(sameStation('', '')).toBe(false)
  })
})
