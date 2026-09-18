import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import { createLocalLogStore } from './localLogStore'
import { newQsoId } from './logStore'

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

let store = createLocalLogStore()

beforeEach(async () => {
  // A fresh database per test, so nothing leaks between them.
  store = createLocalLogStore(`qso-log-test-${crypto.randomUUID()}`)
  await store.clear()
})

describe('localLogStore', () => {
  it('starts empty', async () => {
    expect(await store.list()).toEqual([])
  })

  it('stores and reads a contact', async () => {
    const contact = qso()
    await store.put(contact)
    expect(await store.list()).toEqual([contact])
  })

  it('keeps every field, including the ADIF fields it does not model', async () => {
    const contact = qso({ extra: { SIG: 'POTA', SIG_INFO: 'GB-0001' }, freq: 14.074 })
    await store.put(contact)
    expect((await store.list())[0]).toEqual(contact)
  })

  it('replaces on the same id rather than duplicating', async () => {
    const contact = qso()
    await store.put(contact)
    await store.put({ ...contact, comment: 'updated' })

    const all = await store.list()
    expect(all).toHaveLength(1)
    expect(all[0]?.comment).toBe('updated')
  })

  it('removes a contact', async () => {
    const contact = qso()
    await store.put(contact)
    await store.remove(contact.id)
    expect(await store.list()).toEqual([])
  })

  it('ignores a remove for a contact that is not there', async () => {
    await expect(store.remove('missing')).resolves.toBeUndefined()
  })

  it('returns the newest contact first', async () => {
    const older = qso({ qsoDate: '20260917', timeOn: '0900' })
    const newer = qso({ qsoDate: '20260918', timeOn: '1432' })
    await store.put(older)
    await store.put(newer)
    expect((await store.list()).map((entry) => entry.id)).toEqual([newer.id, older.id])
  })

  it('orders contacts on the same day by time', async () => {
    const morning = qso({ timeOn: '0900' })
    const evening = qso({ timeOn: '2130' })
    await store.put(morning)
    await store.put(evening)
    expect((await store.list()).map((entry) => entry.id)).toEqual([evening.id, morning.id])
  })

  it('notifies subscribers with the current log and on every change', async () => {
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    await vi.waitFor(() => expect(listener).toHaveBeenCalledWith([]))

    const contact = qso()
    await store.put(contact)
    expect(listener).toHaveBeenLastCalledWith([contact])

    await store.remove(contact.id)
    expect(listener).toHaveBeenLastCalledWith([])

    unsubscribe()
    await store.put(contact)
    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('survives a new store on the same database, which is a reload', async () => {
    const name = `qso-log-test-${crypto.randomUUID()}`
    const first = createLocalLogStore(name)
    const contact = qso()
    await first.put(contact)

    const second = createLocalLogStore(name)
    expect(await second.list()).toEqual([contact])
  })

  it('clears the log', async () => {
    await store.put(qso())
    await store.put(qso())
    await store.clear()
    expect(await store.list()).toEqual([])
  })
})
