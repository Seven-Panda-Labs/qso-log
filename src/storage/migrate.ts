import type { Qso } from '../domain/qso'
import type { LogStore } from './logStore'

export interface MigrationResult {
  /** Contacts copied up. */
  moved: number
  /** Already in the destination under the same id, left alone. */
  skipped: number
}

/**
 * Moves a guest's local log into their account on sign-in.
 *
 * Lossless by construction: every contact is written and read back before
 * anything is cleared, and ids are kept, so running it twice moves nothing the
 * second time. If any write fails, the local log is left exactly as it was and
 * the operator still has every contact.
 *
 * The caller asks the operator first. A migration that helps itself to someone
 * else's log on a borrowed device is the failure this avoids.
 */
export async function migrateLog(from: LogStore, to: LogStore): Promise<MigrationResult> {
  const local = await from.list()
  if (local.length === 0) return { moved: 0, skipped: 0 }

  const existing = new Set((await to.list()).map((qso) => qso.id))
  const pending = local.filter((qso) => !existing.has(qso.id))

  for (const qso of pending) {
    await to.put(qso)
  }

  const after = new Map((await to.list()).map((qso: Qso) => [qso.id, qso]))
  const unwritten = local.filter((qso) => !after.has(qso.id))
  if (unwritten.length > 0) {
    throw new Error(`Migration incomplete, ${unwritten.length} contacts not written`)
  }

  await from.clear()

  return { moved: pending.length, skipped: local.length - pending.length }
}
