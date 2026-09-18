/**
 * QSO times are UTC, stored and compared as UTC, converted only for display.
 * Every function here goes through Date.UTC and the getUTC* accessors, so the
 * machine's timezone cannot leak into a log.
 *
 * ADIF: QSO_DATE is YYYYMMDD, TIME_ON and TIME_OFF are HHMM or HHMMSS.
 */
const DATE_PATTERN = /^(\d{4})(\d{2})(\d{2})$/
const TIME_PATTERN = /^(\d{2})(\d{2})(\d{2})?$/

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

export function toAdifDate(date: Date): string {
  return (
    pad(date.getUTCFullYear(), 4) + pad(date.getUTCMonth() + 1, 2) + pad(date.getUTCDate(), 2)
  )
}

export function toAdifTime(date: Date, { seconds = false } = {}): string {
  const hhmm = pad(date.getUTCHours(), 2) + pad(date.getUTCMinutes(), 2)
  return seconds ? hhmm + pad(date.getUTCSeconds(), 2) : hhmm
}

/**
 * Rejects a date that does not exist rather than rolling it over: 20260231
 * is a typo, and Date would silently turn it into 2 March.
 */
export function parseAdifDateTime(date: string, time = '0000'): Date | undefined {
  const dateMatch = DATE_PATTERN.exec(date.trim())
  const timeMatch = TIME_PATTERN.exec(time.trim())
  if (!dateMatch || !timeMatch) return undefined

  const [, year, month, day] = dateMatch as unknown as [string, string, string, string]
  const [, hours, minutes, secs] = timeMatch as unknown as [
    string,
    string,
    string,
    string | undefined,
  ]

  const parsed = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(secs ?? '0'),
    ),
  )

  const roundTrips =
    parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() === Number(month) - 1 &&
    parsed.getUTCDate() === Number(day) &&
    parsed.getUTCHours() === Number(hours) &&
    parsed.getUTCMinutes() === Number(minutes)

  return roundTrips ? parsed : undefined
}

export function isValidAdifDate(value: string): boolean {
  return parseAdifDateTime(value) !== undefined
}

export function isValidAdifTime(value: string): boolean {
  const match = TIME_PATTERN.exec(value.trim())
  if (!match) return false
  const [, hours, minutes, secs] = match as unknown as [string, string, string, string | undefined]
  return Number(hours) < 24 && Number(minutes) < 60 && Number(secs ?? '0') < 60
}

/**
 * The UTC day a QSO belongs to, as an ADIF date. An evening contact in Europe
 * is already tomorrow's log entry, which is what awards and contests count.
 */
export function utcDay(date: Date): string {
  return toAdifDate(date)
}
