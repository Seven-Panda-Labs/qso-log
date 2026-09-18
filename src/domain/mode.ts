/**
 * Modes an operator is likely to log, with the ADIF primary mode a submode
 * reports as, and the kind of signal report the mode uses.
 *
 * Not the full ADIF enumeration. A mode missing here is still loggable, it
 * just gets no help from the UI, which is the right failure: the list grows
 * when someone uses the mode, not before.
 */
export type ReportStyle = 'rst' | 'rs' | 'db'

export interface Mode {
  /** What goes in the ADIF MODE or SUBMODE field. */
  code: string
  /** ADIF primary mode. Equal to `code` when the mode is itself primary. */
  primary: string
  report: ReportStyle
}

export const MODES: readonly Mode[] = [
  { code: 'CW', primary: 'CW', report: 'rst' },
  { code: 'SSB', primary: 'SSB', report: 'rs' },
  { code: 'USB', primary: 'SSB', report: 'rs' },
  { code: 'LSB', primary: 'SSB', report: 'rs' },
  { code: 'AM', primary: 'AM', report: 'rs' },
  { code: 'FM', primary: 'FM', report: 'rs' },
  { code: 'RTTY', primary: 'RTTY', report: 'rst' },
  { code: 'PSK31', primary: 'PSK', report: 'rst' },
  { code: 'PSK63', primary: 'PSK', report: 'rst' },
  { code: 'OLIVIA', primary: 'OLIVIA', report: 'rst' },
  { code: 'HELL', primary: 'HELL', report: 'rst' },
  { code: 'SSTV', primary: 'SSTV', report: 'rst' },
  // Weak signal modes report signal to noise in dB, not RST. A form that
  // demands 599 from an FT8 operator is asking for a number they do not have.
  { code: 'FT8', primary: 'FT8', report: 'db' },
  { code: 'FT4', primary: 'MFSK', report: 'db' },
  { code: 'JS8', primary: 'MFSK', report: 'db' },
  { code: 'Q65', primary: 'MFSK', report: 'db' },
  { code: 'JT65', primary: 'JT65', report: 'db' },
  { code: 'JT9', primary: 'JT9', report: 'db' },
  { code: 'MSK144', primary: 'MSK144', report: 'db' },
  { code: 'WSPR', primary: 'WSPR', report: 'db' },
]

const byCode = new Map(MODES.map((mode) => [mode.code, mode]))

export function findMode(code: string): Mode | undefined {
  return byCode.get(code.trim().toUpperCase())
}

/** Defaults to RST, the convention when nothing else is known. */
export function reportStyle(code: string): ReportStyle {
  return findMode(code)?.report ?? 'rst'
}

/** The ADIF MODE for a code that may be a submode, for example FT4 to MFSK. */
export function primaryMode(code: string): string | undefined {
  return findMode(code)?.primary
}

export function isSubmode(code: string): boolean {
  const mode = findMode(code)
  return mode !== undefined && mode.primary !== mode.code
}
