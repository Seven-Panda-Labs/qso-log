import { bandForFrequency, frequencyMatchesBand, isBand } from './band'
import { parseCallsign, sameStation } from './callsign'
import { isGridSquare } from './grid'
import { primaryMode } from './mode'
import { isValidAdifDate, isValidAdifTime, parseAdifDateTime } from './time'

/**
 * One contact. Field names follow ADIF so import and export stay close to a
 * direct mapping, and `extra` carries whatever ADIF fields this app does not
 * model yet, because dropping them would make a round trip lossy.
 */
export interface Qso {
  id: string
  /** Callsign worked, as the operator entered it. */
  call: string
  /** ADIF QSO_DATE, YYYYMMDD, UTC. */
  qsoDate: string
  /** ADIF TIME_ON, HHMM or HHMMSS, UTC. */
  timeOn: string
  band: string
  /** MHz. Kept as entered; the band is derived, never the other way round. */
  freq?: number
  mode: string
  submode?: string
  rstSent?: string
  rstRcvd?: string
  gridsquare?: string
  /**
   * ADIF DXCC, the entity the operator or their software recorded. Present
   * only when it was logged: this app never writes its own inference here,
   * because a stored value is a claim about what happened and an inference is
   * not.
   */
  dxcc?: number
  comment?: string
  extra?: Record<string, string>
}

export type QsoIssue =
  | 'call-missing'
  | 'call-unrecognised'
  | 'date-invalid'
  | 'time-invalid'
  | 'band-unknown'
  | 'band-frequency-mismatch'
  | 'mode-missing'
  | 'gridsquare-invalid'

/**
 * Reports what looks wrong. It does not refuse anything: an operator who says
 * they worked an odd callsign on an odd frequency is telling the truth about
 * their own log, and the app's job is to flag, not to overrule.
 */
export function validateQso(qso: Qso): QsoIssue[] {
  const issues: QsoIssue[] = []

  if (qso.call.trim() === '') issues.push('call-missing')
  else if (!parseCallsign(qso.call).looksValid) issues.push('call-unrecognised')

  if (!isValidAdifDate(qso.qsoDate)) issues.push('date-invalid')
  if (!isValidAdifTime(qso.timeOn)) issues.push('time-invalid')
  if (!isBand(qso.band)) issues.push('band-unknown')
  if (qso.freq !== undefined && isBand(qso.band) && !frequencyMatchesBand(qso.freq, qso.band)) {
    issues.push('band-frequency-mismatch')
  }
  if (qso.mode.trim() === '') issues.push('mode-missing')
  if (qso.gridsquare !== undefined && !isGridSquare(qso.gridsquare)) {
    issues.push('gridsquare-invalid')
  }

  return issues
}

export function qsoTimestamp(qso: Qso): Date | undefined {
  return parseAdifDateTime(qso.qsoDate, qso.timeOn)
}

/** ADIF MODE for a QSO logged under a submode, for example FT4 to MFSK. */
export function adifMode(qso: Qso): string {
  return primaryMode(qso.mode) ?? qso.mode
}

export function bandFromFrequency(qso: Qso): string | undefined {
  return qso.freq === undefined ? undefined : bandForFrequency(qso.freq)
}

/**
 * Working the same station again on another band, mode, or day is a separate
 * QSO, so this is deliberately narrow: same station, same band, same mode,
 * minutes apart. Even then it is a warning for the operator to judge, never an
 * automatic refusal.
 */
export function isLikelyDuplicate(a: Qso, b: Qso, withinMinutes = 15): boolean {
  if (a.id === b.id) return false
  if (!sameStation(a.call, b.call)) return false
  if (a.band.toLowerCase() !== b.band.toLowerCase()) return false
  if (adifMode(a) !== adifMode(b)) return false

  const first = qsoTimestamp(a)
  const second = qsoTimestamp(b)
  if (!first || !second) return false

  return Math.abs(first.getTime() - second.getTime()) <= withinMinutes * 60_000
}
