import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import type { Firestore } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Qso } from '../domain/qso'
import { createFirestoreLogStore } from './firestoreLogStore'
import { newQsoId } from './logStore'

let testEnv: RulesTestEnvironment
let db: Firestore

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

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-qso-log',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(() => testEnv.cleanup())

beforeEach(async () => {
  await testEnv.clearFirestore()
  db = testEnv.authenticatedContext('w1aw').firestore() as unknown as Firestore
})

const store = () => createFirestoreLogStore(db, 'w1aw')

describe('firestoreLogStore', () => {
  it('writes and reads a contact through the security rules', async () => {
    const contact = qso()
    await store().put(contact)
    expect(await store().list()).toEqual([contact])
  })

  // Firestore rejects undefined, so absent ADIF fields must be absent, not null.
  it('stores a contact with optional fields left out', async () => {
    const contact = qso({ freq: undefined, comment: undefined })
    await store().put(contact)

    const stored = (await store().list())[0]
    expect(stored).toEqual(contact)
    expect(stored && 'freq' in stored).toBe(false)
  })

  it('keeps the ADIF fields it does not model', async () => {
    const contact = qso({ extra: { SIG: 'POTA', SIG_INFO: 'GB-0001' } })
    await store().put(contact)
    expect((await store().list())[0]?.extra).toEqual({ SIG: 'POTA', SIG_INFO: 'GB-0001' })
  })

  it('replaces on the same id', async () => {
    const contact = qso()
    await store().put(contact)
    await store().put({ ...contact, comment: 'updated' })

    const all = await store().list()
    expect(all).toHaveLength(1)
    expect(all[0]?.comment).toBe('updated')
  })

  it('removes and clears', async () => {
    const first = qso()
    await store().put(first)
    await store().put(qso({ timeOn: '1500' }))

    await store().remove(first.id)
    expect(await store().list()).toHaveLength(1)

    await store().clear()
    expect(await store().list()).toEqual([])
  })

  it('returns the newest contact first', async () => {
    const older = qso({ qsoDate: '20260917' })
    const newer = qso({ qsoDate: '20260918' })
    await store().put(older)
    await store().put(newer)
    expect((await store().list()).map((entry) => entry.id)).toEqual([newer.id, older.id])
  })

  it('pushes changes to subscribers', async () => {
    const listener = vi.fn()
    const unsubscribe = store().subscribe(listener)
    await vi.waitFor(() => expect(listener).toHaveBeenCalledWith([]))

    const contact = qso()
    await store().put(contact)
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith([contact]))

    unsubscribe()
  })

  it('cannot reach another operator log', async () => {
    const other = testEnv.authenticatedContext('m0abc').firestore() as unknown as Firestore
    await createFirestoreLogStore(other, 'm0abc').put(qso({ call: 'M0ABC' }))

    // The rules, not the store, are what stop this.
    await expect(createFirestoreLogStore(db, 'm0abc').list()).rejects.toThrow()
  })
})
