import type { Qso } from './qso'

/**
 * ADIF, the interchange contract.
 *
 * A field is `<NAME:LENGTH>value` or `<NAME:LENGTH:TYPE>value`, records end
 * with `<EOR>`, and an optional header ends with `<EOH>`. Lengths are counted
 * in characters, so a value may contain anything, including `<`.
 *
 * Fields this app does not model are kept in `extra` and written back on
 * export. Dropping them would make a round trip lossy, which is the one thing
 * a logbook must never do to an operator's records.
 */
export type AdifRecord = Record<string, string>

export interface AdifFile {
  header: AdifRecord
  records: AdifRecord[]
}

const TAG = /<([A-Za-z0-9_]+)(?::(\d+))?(?::([A-Za-z]))?>/g

/** ADIF fields with a home in `Qso`. Everything else travels in `extra`. */
const FIELD_TO_KEY = {
  CALL: 'call',
  QSO_DATE: 'qsoDate',
  TIME_ON: 'timeOn',
  BAND: 'band',
  FREQ: 'freq',
  MODE: 'mode',
  SUBMODE: 'submode',
  RST_SENT: 'rstSent',
  RST_RCVD: 'rstRcvd',
  GRIDSQUARE: 'gridsquare',
  COMMENT: 'comment',
} as const

const KEY_TO_FIELD = Object.fromEntries(
  Object.entries(FIELD_TO_KEY).map(([field, key]) => [key, field]),
) as Record<string, string>

export function parseAdif(text: string): AdifFile {
  const header: AdifRecord = {}
  const records: AdifRecord[] = []

  let current: AdifRecord = {}
  let inHeader = !text.trimStart().startsWith('<')
  let hasFields = false

  TAG.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TAG.exec(text)) !== null) {
    const name = (match[1] ?? '').toUpperCase()
    const declared = match[2]

    if (name === 'EOH') {
      inHeader = false
      Object.assign(header, current)
      current = {}
      hasFields = false
      continue
    }

    if (name === 'EOR') {
      if (hasFields) records.push(current)
      current = {}
      hasFields = false
      continue
    }

    if (declared === undefined) continue

    const start = match.index + match[0].length
    const value = text.slice(start, start + Number(declared))
    current[name] = value
    hasFields = true
    // Skip the value, so a `<` inside it is never read as a tag.
    TAG.lastIndex = start + Number(declared)
  }

  // A file whose last record has no <EOR> still holds a contact.
  if (hasFields) {
    if (inHeader) Object.assign(header, current)
    else records.push(current)
  }

  return { header, records }
}

export function adifToQso(record: AdifRecord, id: string): Qso {
  const extra: AdifRecord = {}
  const qso: Qso = { id, call: '', qsoDate: '', timeOn: '', band: '', mode: '' }

  for (const [field, value] of Object.entries(record)) {
    const key = FIELD_TO_KEY[field as keyof typeof FIELD_TO_KEY]
    if (key === 'freq') {
      const freq = Number(value)
      if (Number.isFinite(freq)) qso.freq = freq
      else extra[field] = value
    } else if (key) {
      qso[key] = value
    } else {
      extra[field] = value
    }
  }

  if (Object.keys(extra).length > 0) qso.extra = extra
  return qso
}

export function qsoToAdif(qso: Qso): AdifRecord {
  const record: AdifRecord = {}

  for (const [key, field] of Object.entries(KEY_TO_FIELD)) {
    const value = qso[key as keyof Qso]
    if (value === undefined || value === '') continue
    record[field] = String(value)
  }

  // Modelled fields win: `extra` is what ADIF carried that this app does not
  // model, and a stale copy there must not overwrite an edited value.
  for (const [field, value] of Object.entries(qso.extra ?? {})) {
    if (!(field in record)) record[field] = value
  }

  return record
}

function tag(field: string, value: string): string {
  return `<${field}:${value.length}>${value}`
}

export function serializeAdif(qsos: Qso[], { programId = 'QSO Log' } = {}): string {
  const header = [
    'ADIF export from QSO Log',
    '',
    tag('ADIF_VER', '3.1.4'),
    tag('PROGRAMID', programId),
    '<EOH>',
    '',
  ].join('\n')

  const records = qsos.map((qso) => {
    const fields = Object.entries(qsoToAdif(qso)).map(([field, value]) => tag(field, value))
    return `${fields.join(' ')} <EOR>`
  })

  return `${header}${records.join('\n')}\n`
}
