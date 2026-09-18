import {
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-qso-log',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(() => testEnv.cleanup())
beforeEach(() => testEnv.clearFirestore())

describe('firestore rules', () => {
  it('lets an operator write and read their own log', async () => {
    const db = testEnv.authenticatedContext('w1aw').firestore()
    await assertSucceeds(setDoc(doc(db, 'users/w1aw/qsos/1'), { call: '2E0XXX' }))
    await assertSucceeds(getDoc(doc(db, 'users/w1aw/qsos/1')))
  })

  it('denies reading another operator log', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/w1aw/qsos/1'), { call: '2E0XXX' })
    })

    const db = testEnv.authenticatedContext('m0xxx').firestore()
    await assertFails(getDoc(doc(db, 'users/w1aw/qsos/1')))
    await assertFails(setDoc(doc(db, 'users/w1aw/qsos/1'), { call: 'M0XXX' }))
  })

  it('denies an unauthenticated client', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'users/w1aw/qsos/1')))
    await assertFails(setDoc(doc(db, 'users/w1aw/qsos/1'), { call: '2E0XXX' }))
  })

  it('denies collections outside the user tree', async () => {
    const db = testEnv.authenticatedContext('w1aw').firestore()
    await assertFails(getDoc(doc(db, 'qsos/1')))
    await assertFails(setDoc(doc(db, 'qsos/1'), { call: '2E0XXX' }))
  })
})
