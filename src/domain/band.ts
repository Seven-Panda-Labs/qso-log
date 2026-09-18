/**
 * The ADIF band enumeration: one global table, not per ITU region.
 *
 * Regional allocations differ (40m ends at 7.2 MHz in regions 1 and 3, 7.3 in
 * region 2), but ADIF names a band by the widest range, and a log has to round
 * trip through ADIF unchanged. Region belongs to licence rules, not to naming
 * the band a QSO happened on.
 */
export interface BandRange {
  band: string
  lower: number
  upper: number
}

/** Megahertz, ordered low to high. */
export const BANDS: readonly BandRange[] = [
  { band: '2190m', lower: 0.1357, upper: 0.1378 },
  { band: '630m', lower: 0.472, upper: 0.479 },
  { band: '560m', lower: 0.501, upper: 0.504 },
  { band: '160m', lower: 1.8, upper: 2.0 },
  { band: '80m', lower: 3.5, upper: 4.0 },
  { band: '60m', lower: 5.06, upper: 5.45 },
  { band: '40m', lower: 7.0, upper: 7.3 },
  { band: '30m', lower: 10.1, upper: 10.15 },
  { band: '20m', lower: 14.0, upper: 14.35 },
  { band: '17m', lower: 18.068, upper: 18.168 },
  { band: '15m', lower: 21.0, upper: 21.45 },
  { band: '12m', lower: 24.89, upper: 24.99 },
  { band: '10m', lower: 28.0, upper: 29.7 },
  { band: '8m', lower: 40, upper: 45 },
  { band: '6m', lower: 50, upper: 54 },
  { band: '5m', lower: 54.000001, upper: 69.9 },
  { band: '4m', lower: 70, upper: 71 },
  { band: '2m', lower: 144, upper: 148 },
  { band: '1.25m', lower: 222, upper: 225 },
  { band: '70cm', lower: 420, upper: 450 },
  { band: '33cm', lower: 902, upper: 928 },
  { band: '23cm', lower: 1240, upper: 1300 },
  { band: '13cm', lower: 2300, upper: 2450 },
  { band: '9cm', lower: 3300, upper: 3500 },
  { band: '6cm', lower: 5650, upper: 5925 },
  { band: '3cm', lower: 10000, upper: 10500 },
  { band: '1.25cm', lower: 24000, upper: 24250 },
  { band: '6mm', lower: 47000, upper: 47200 },
  { band: '4mm', lower: 75500, upper: 81000 },
  { band: '2.5mm', lower: 119980, upper: 123000 },
  { band: '2mm', lower: 134000, upper: 141000 },
  { band: '1mm', lower: 241000, upper: 250000 },
]

const byName = new Map(BANDS.map((range) => [range.band, range]))

/** The band a frequency in MHz falls in, or undefined between allocations. */
export function bandForFrequency(mhz: number): string | undefined {
  if (!Number.isFinite(mhz)) return undefined
  return BANDS.find((range) => mhz >= range.lower && mhz <= range.upper)?.band
}

export function bandRange(band: string): BandRange | undefined {
  return byName.get(band.toLowerCase())
}

export function isBand(value: string): boolean {
  return byName.has(value.toLowerCase())
}

/**
 * Whether a frequency belongs to a band the operator already chose. A logger
 * derives one from the other, it never overwrites what was entered: a band
 * midpoint is not where the QSO happened.
 */
export function frequencyMatchesBand(mhz: number, band: string): boolean {
  const range = bandRange(band)
  return range !== undefined && mhz >= range.lower && mhz <= range.upper
}
