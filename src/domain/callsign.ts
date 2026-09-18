/**
 * Callsign structure, not callsign validation.
 *
 * A callsign the parser does not recognise is still logged: special event
 * calls, temporary prefixes, and one-off allocations all exist, and refusing
 * the entry loses a real contact. `looksValid` is a hint for the UI, never a
 * gate on saving.
 */
export interface ParsedCallsign {
  /** The input, trimmed and uppercased. */
  callsign: string
  /** The call without any prefix or suffix, for example W1AW in F/W1AW/P. */
  base: string
  /** Location prefix ahead of the call, for example F in F/W1AW. */
  prefix?: string
  /** Everything after the call, for example P in W1AW/P. */
  suffix?: string
  /** Operating away from the licensed location or in a different area. */
  portable: boolean
  looksValid: boolean
}

/** One to two letters or digits, a digit, then up to four letters. */
const BASE_PATTERN = /^[A-Z0-9]{1,2}\d{1,2}[A-Z]{1,4}$/

/** Suffixes that say how the station is operating rather than where. */
const ACTIVITY_SUFFIXES = new Set(['P', 'M', 'MM', 'AM', 'QRP', 'A', 'R', 'B'])

export function parseCallsign(input: string): ParsedCallsign {
  const callsign = input.trim().toUpperCase()
  const parts = callsign.split('/').filter((part) => part.length > 0)

  if (parts.length === 0) {
    return { callsign, base: '', portable: false, looksValid: false }
  }

  // The base call is the longest part that parses as one. F/W1AW/P has two
  // candidates, W1AW is the call and F is a prefix.
  let base = parts[0] as string
  let baseIndex = 0
  parts.forEach((part, index) => {
    if (BASE_PATTERN.test(part) && part.length > (BASE_PATTERN.test(base) ? base.length : 0)) {
      base = part
      baseIndex = index
    }
  })

  const prefix = baseIndex > 0 ? parts.slice(0, baseIndex).join('/') : undefined
  const suffix = parts.length > baseIndex + 1 ? parts.slice(baseIndex + 1).join('/') : undefined

  return {
    callsign,
    base,
    prefix,
    suffix,
    portable: prefix !== undefined || suffix !== undefined,
    looksValid: BASE_PATTERN.test(base),
  }
}

/**
 * Whether the suffix describes how the station operates (portable, mobile,
 * maritime mobile) rather than where it is (a call area digit, a country).
 */
export function isActivitySuffix(suffix: string): boolean {
  return ACTIVITY_SUFFIXES.has(suffix.trim().toUpperCase())
}

/** Two calls are the same station when their base calls match. */
export function sameStation(a: string, b: string): boolean {
  const first = parseCallsign(a)
  const second = parseCallsign(b)
  return first.base !== '' && first.base === second.base
}
