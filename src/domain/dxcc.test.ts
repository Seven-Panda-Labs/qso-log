import { describe, expect, it } from 'vitest'
import { createDxccLookup, locationPart, type DxccData } from './dxcc'
import generated from './dxcc.generated'

const fixture: DxccData = {
  entities: {
    1: ['Canada', 'VE', 'NA'],
    223: ['England', 'G', 'EU'],
    279: ['Scotland', 'GM', 'EU'],
    247: ['Spratly Islands', '1S', 'AS'],
    299: ['West Malaysia', '9M2', 'AS'],
  },
  prefixes: { G: 223, GM: 279, VE: 1, '9M2': 299 },
  exact: { 247: '9M4SDX 9M2/PG5M' },
}

const lookup = createDxccLookup(fixture)

describe('createDxccLookup', () => {
  it('matches the longest prefix, not the first', () => {
    expect(lookup('G0ABC')?.name).toBe('England')
    // A shorter match would file every Scottish contact under England.
    expect(lookup('GM0ABC')?.name).toBe('Scotland')
  })

  it('is case and whitespace tolerant', () => {
    expect(lookup(' gm0abc ')?.name).toBe('Scotland')
  })

  /** An explicit callsign wins over what its own prefix would say. */
  it('prefers an exact callsign to its prefix', () => {
    expect(lookup('9M2/PG5M')?.name).toBe('Spratly Islands')
    expect(lookup('9M4SDX')?.name).toBe('Spratly Islands')
    expect(lookup('9M2ABC')?.name).toBe('West Malaysia')
  })

  it('returns the ADIF entity number, so a log can carry it', () => {
    expect(lookup('G0ABC')).toEqual({ dxcc: 223, name: 'England', prefix: 'G', continent: 'EU' })
  })

  it('returns undefined for a callsign it cannot place', () => {
    expect(lookup('QQ9ZZZ')).toBeUndefined()
    expect(lookup('')).toBeUndefined()
  })
})

describe('locationPart', () => {
  it.each([
    ['W1AW', 'W1AW'],
    // A location prefix wins: this station is in France.
    ['F/W1AW', 'F'],
    ['F/W1AW/P', 'F'],
    // A call area digit and an activity suffix say nothing new about where.
    ['W1AW/4', 'W1AW'],
    ['W1AW/P', 'W1AW'],
    ['W1AW/MM', 'W1AW'],
  ])('reads %s as %s', (callsign, expected) => {
    expect(locationPart(callsign)).toBe(expected)
  })
})

/**
 * Against the real table. Anchors were checked by hand against the DXCC list,
 * and they are the cases an operator would notice immediately.
 */
describe('the generated table', () => {
  const real = createDxccLookup(generated)

  it.each([
    ['W1AW', 'United States'],
    ['K1ABC', 'United States'],
    ['VE3ABC', 'Canada'],
    ['G0ABC', 'England'],
    ['GM0ABC', 'Scotland'],
    ['GW0ABC', 'Wales'],
    ['2E0XXX', 'England'],
    ['CT1ABC', 'Portugal'],
    ['CT3ABC', 'Madeira Islands'],
    ['EA8ABC', 'Canary Islands'],
    ['EA1ABC', 'Spain'],
    ['F5ABC', 'France'],
    ['DL1ABC', 'Fed. Rep. of Germany'],
    ['JA1XYZ', 'Japan'],
    ['PY2XYZ', 'Brazil'],
    ['VK3ABC', 'Australia'],
    ['ZL1ABC', 'New Zealand'],
    ['9A1A', 'Croatia'],
    ['KH6ABC', 'Hawaii'],
    ['KL7ABC', 'Alaska'],
  ])('places %s in %s', (callsign, entity) => {
    expect(real(callsign)?.name).toBe(entity)
  })

  // Sicily and African Italy are WAE entities that carry Italy's DXCC number,
  // and DXCC counts them as Italy.
  it.each(['I1ABC', 'IT9ABC', 'IG9ABC'])('counts %s as Italy', (callsign) => {
    expect(real(callsign)).toMatchObject({ name: 'Italy', dxcc: 248 })
  })

  it('follows a portable prefix to the right entity', () => {
    expect(real('F/W1AW')?.name).toBe('France')
    expect(real('VP2E/W1AW')?.name).toBe('Anguilla')
    expect(real('W1AW/4')?.name).toBe('United States')
  })

  it('knows the callsigns whose prefix lies', () => {
    expect(real('9M4SDX')?.name).toBe('Spratly Islands')
  })

  it('covers the whole DXCC list', () => {
    expect(Object.keys(generated.entities).length).toBeGreaterThan(330)
    expect(Object.keys(generated.prefixes).length).toBeGreaterThan(6000)
  })
})
