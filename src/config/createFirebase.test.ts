import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFirebase, EMULATOR_PORTS } from './createFirebase'
import type { FirebaseEnv } from './firebaseTypes'

/**
 * The SDK is mocked here on purpose.
 *
 * A real instance starts background work, Firestore's cache and Auth's
 * IndexedDB persistence, that keeps running after the test ends. Under jsdom
 * those callbacks land once the environment is gone and surface as an
 * unhandled "self is not defined" in whatever file runs next: green locally,
 * red on a slower CI runner. What is ours to test is the wiring, which config
 * goes in and which emulators get connected. The SDK working is Google's test,
 * and the real integration is covered against the emulator in
 * src/storage/firestoreLogStore.emulator.test.ts.
 */
const mocks = vi.hoisted(() => ({
  initializeApp: vi.fn((options: unknown, name?: string) => ({ options, name })),
  getAuth: vi.fn((app: unknown) => ({ app })),
  initializeFirestore: vi.fn((app: unknown, settings: unknown) => ({ app, settings })),
  connectAuthEmulator: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  persistentLocalCache: vi.fn((options: unknown) => ({ kind: 'persistent', ...(options as object) })),
  persistentMultipleTabManager: vi.fn(() => ({ kind: 'multi-tab' })),
}))

vi.mock('firebase/app', () => ({ initializeApp: mocks.initializeApp }))
vi.mock('firebase/auth', () => ({
  getAuth: mocks.getAuth,
  connectAuthEmulator: mocks.connectAuthEmulator,
}))
vi.mock('firebase/firestore', () => ({
  initializeFirestore: mocks.initializeFirestore,
  connectFirestoreEmulator: mocks.connectFirestoreEmulator,
  persistentLocalCache: mocks.persistentLocalCache,
  persistentMultipleTabManager: mocks.persistentMultipleTabManager,
}))

const env: FirebaseEnv = {
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-qso-log.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-qso-log',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo-qso-log.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createFirebase', () => {
  it('passes the environment through as the app config', () => {
    createFirebase(env)

    expect(mocks.initializeApp).toHaveBeenCalledWith(
      {
        apiKey: 'demo-api-key',
        authDomain: 'demo-qso-log.firebaseapp.com',
        projectId: 'demo-qso-log',
        storageBucket: 'demo-qso-log.firebasestorage.app',
        messagingSenderId: '000000000000',
        appId: '1:000000000000:web:0000000000000000000000',
      },
      undefined,
    )
  })

  it('returns app, firestore, and auth built from the same app', () => {
    const { app, db, auth } = createFirebase(env, 'named')

    expect(mocks.initializeApp).toHaveBeenCalledWith(expect.anything(), 'named')
    expect((db as unknown as { app: unknown }).app).toBe(app)
    expect((auth as unknown as { app: unknown }).app).toBe(app)
  })

  // The log has to survive a reload with no connectivity, and a tab is not a
  // session: operators leave the log open in several.
  it('uses a persistent, multi tab cache', () => {
    createFirebase(env)

    expect(mocks.persistentMultipleTabManager).toHaveBeenCalled()
    expect(mocks.initializeFirestore).toHaveBeenCalledWith(expect.anything(), {
      localCache: expect.objectContaining({ kind: 'persistent' }),
    })
  })

  it('connects both emulators when the flag is on', () => {
    createFirebase({ ...env, VITE_USE_FIREBASE_EMULATORS: 'true' })

    expect(mocks.connectFirestoreEmulator).toHaveBeenCalledWith(
      expect.anything(),
      '127.0.0.1',
      EMULATOR_PORTS.firestore,
    )
    expect(mocks.connectAuthEmulator).toHaveBeenCalledWith(
      expect.anything(),
      `http://127.0.0.1:${EMULATOR_PORTS.auth}`,
      { disableWarnings: true },
    )
  })

  it.each(['false', undefined])('leaves the emulators alone when the flag is %s', (flag) => {
    createFirebase({ ...env, VITE_USE_FIREBASE_EMULATORS: flag })

    expect(mocks.connectFirestoreEmulator).not.toHaveBeenCalled()
    expect(mocks.connectAuthEmulator).not.toHaveBeenCalled()
  })
})
