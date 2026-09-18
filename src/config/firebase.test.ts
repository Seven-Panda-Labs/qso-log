import { describe, expect, it } from 'vitest'
import { createFirebase, type FirebaseEnv } from './firebase'

const env: FirebaseEnv = {
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-qso-log.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-qso-log',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo-qso-log.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
}

describe('createFirebase', () => {
  it('initializes app, firestore, and auth from the environment', () => {
    const { app, db, auth } = createFirebase(env, 'test-plain')

    expect(app.options.projectId).toBe('demo-qso-log')
    expect(db.app).toBe(app)
    expect(auth.app).toBe(app)
  })

  it('connects to the emulators when the flag is on', () => {
    const { auth } = createFirebase(
      { ...env, VITE_USE_FIREBASE_EMULATORS: 'true' },
      'test-emulators',
    )

    expect(auth.emulatorConfig).toMatchObject({ host: '127.0.0.1', port: 9099 })
  })

  it('leaves the emulators alone otherwise', () => {
    const { auth } = createFirebase(
      { ...env, VITE_USE_FIREBASE_EMULATORS: 'false' },
      'test-no-emulators',
    )

    expect(auth.emulatorConfig).toBeNull()
  })
})
