import type { Qso } from '../domain/qso'

/**
 * The log, wherever it lives. Guest mode writes to the local store, signing in
 * switches to the Firestore one, and everything above this interface is the
 * same code either way.
 */
export interface LogStore {
  list(): Promise<Qso[]>
  /** Insert or replace. The caller owns the id, which makes it idempotent. */
  put(qso: Qso): Promise<void>
  remove(id: string): Promise<void>
  clear(): Promise<void>
  /** Calls back with the whole log, immediately and on every change. */
  subscribe(listener: (qsos: Qso[]) => void): () => void
}

/**
 * Newest first, the order a logbook is read in.
 *
 * Tolerates a contact missing its date or time rather than throwing: sorting
 * is not the place to discover that a stored document is malformed, and a log
 * that fails to render is worse than one with an odd entry at the end.
 */
export function byMostRecent(a: Qso, b: Qso): number {
  const first = (a.qsoDate ?? '') + (a.timeOn ?? '')
  const second = (b.qsoDate ?? '') + (b.timeOn ?? '')
  if (first === second) return (a.id ?? '').localeCompare(b.id ?? '')
  return second.localeCompare(first)
}

export function newQsoId(): string {
  return crypto.randomUUID()
}
