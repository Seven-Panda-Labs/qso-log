import { deleteApp } from 'firebase/app'
import { doc, getDoc, terminate } from 'firebase/firestore'
import { afterEach, describe, expect, it } from 'vitest'
import { createFirebase, type FirebaseEnv, type FirebaseServices } from './firebase'

const env: FirebaseEnv = {
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-qso-log.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-qso-log',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo-qso-log.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
}

/**
 * Built without persistence, and torn down after each test.
 *
 * Firestore's persistent cache starts IndexedDB work and multi tab
 * coordination. With fake-indexeddb loaded globally it gets far enough to
 * schedule callbacks that touch `self`, and when those land after the jsdom
 * environment is gone they surface as an unhandled "self is not defined" in
 * whatever file runs next. That failed CI once and passed locally twenty
 * times, which is the worst kind of test.
 */
const created: FirebaseServices[] = []

function build(env: FirebaseEnv, name: string): FirebaseServices {
  const services = createFirebase(env, name, { persistence: false })
  created.push(services)
  return services
}

afterEach(async () => {
  for (const { app, db } of created.splice(0)) {
    await terminate(db)
    await deleteApp(app)
  }
})

describe('createFirebase', () => {
  it('initializes app, firestore, and auth from the environment', () => {
    const { app, db, auth } = build(env, 'test-plain')

    expect(app.options.projectId).toBe('demo-qso-log')
    expect(db.app).toBe(app)
    expect(auth.app).toBe(app)
  })

  it('connects to the emulators when the flag is on', () => {
    const { auth } = build({ ...env, VITE_USE_FIREBASE_EMULATORS: 'true' }, 'test-emulators')

    expect(auth.emulatorConfig).toMatchObject({ host: '127.0.0.1', port: 9099 })
  })

  // The cleanup above is what keeps Firestore's background work from
  // outliving the test environment, so it is worth knowing it takes effect.
  it('stops its background work when terminated', async () => {
    const { app, db } = createFirebase(env, 'test-terminate', { persistence: false })
    await terminate(db)

    expect(() => getDoc(doc(db, 'users/w1aw'))).toThrow(/terminated/i)
    await deleteApp(app)
  })

  it('leaves the emulators alone otherwise', () => {
    const { auth } = build({ ...env, VITE_USE_FIREBASE_EMULATORS: 'false' }, 'test-no-emulators')

    expect(auth.emulatorConfig).toBeNull()
  })
})
