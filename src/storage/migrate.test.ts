import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import { createLocalLogStore } from './localLogStore'
import { newQsoId, type LogStore } from './logStore'
import { migrateLog } from './migrate'

function qso(overrides: Partial<Qso> = {}): Qso {
  return {
    id: newQsoId(),
    call: '2E0XXX',
    qsoDate: '20260918',
    timeOn: '1432',
    band: '20m',
    mode: 'FT8',
    ...overrides,
  }
}

const freshStore = () => createLocalLogStore(`qso-log-test-${crypto.randomUUID()}`)

let local: LogStore
let cloud: LogStore

beforeEach(() => {
  local = freshStore()
  cloud = freshStore()
})

describe('migrateLog', () => {
  it('does nothing when the local log is empty', async () => {
    expect(await migrateLog(local, cloud)).toEqual({ moved: 0, skipped: 0 })
  })

  it('moves the local log up and clears it', async () => {
    const first = qso()
    const second = qso({ call: 'M0ABC', timeOn: '1500' })
    await local.put(first)
    await local.put(second)

    expect(await migrateLog(local, cloud)).toEqual({ moved: 2, skipped: 0 })
    expect(await cloud.list()).toHaveLength(2)
    expect(await local.list()).toEqual([])
  })

  it('keeps every field, so nothing is lost on the way up', async () => {
    const contact = qso({ freq: 14.074, gridsquare: 'IO91wm', extra: { SIG: 'POTA' } })
    await local.put(contact)
    await migrateLog(local, cloud)
    expect((await cloud.list())[0]).toEqual(contact)
  })

  it('merges rather than replacing what is already in the account', async () => {
    await cloud.put(qso({ call: 'W1AW', timeOn: '0800' }))
    await local.put(qso())

    expect(await migrateLog(local, cloud)).toEqual({ moved: 1, skipped: 0 })
    expect(await cloud.list()).toHaveLength(2)
  })

  // Ids travel with the contact, so a second run has nothing left to do.
  it('is idempotent', async () => {
    const contact = qso()
    await local.put(contact)
    await migrateLog(local, cloud)

    await local.put(contact)
    expect(await migrateLog(local, cloud)).toEqual({ moved: 0, skipped: 1 })
    expect(await cloud.list()).toHaveLength(1)
  })

  it('does not overwrite a contact the account already has under the same id', async () => {
    const contact = qso({ comment: 'from another device' })
    await cloud.put(contact)
    await local.put({ ...contact, comment: 'stale local copy' })

    expect(await migrateLog(local, cloud)).toEqual({ moved: 0, skipped: 1 })
    expect((await cloud.list())[0]?.comment).toBe('from another device')
  })

  /**
   * The operator keeps every contact when the upload fails. Clearing the local
   * log before the writes are confirmed is how a migration loses a log.
   */
  it('leaves the local log intact when a write fails', async () => {
    const contact = qso()
    await local.put(contact)

    const failing: LogStore = {
      ...cloud,
      put: vi.fn().mockRejectedValue(new Error('offline')),
    }

    await expect(migrateLog(local, failing)).rejects.toThrow('offline')
    expect(await local.list()).toEqual([contact])
  })

  it('leaves the local log intact when a write silently does not land', async () => {
    const contact = qso()
    await local.put(contact)

    const lying: LogStore = { ...cloud, put: vi.fn().mockResolvedValue(undefined) }

    await expect(migrateLog(local, lying)).rejects.toThrow('Migration incomplete')
    expect(await local.list()).toEqual([contact])
  })
})
