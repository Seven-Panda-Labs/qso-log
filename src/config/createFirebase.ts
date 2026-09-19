import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

import type { FirebaseEnv, FirebaseServices } from './firebaseTypes'

export const EMULATOR_HOST = '127.0.0.1'
export const EMULATOR_PORTS = { firestore: 8080, auth: 9099 } as const

export function createFirebase(env: FirebaseEnv, name?: string): FirebaseServices {
  const app = initializeApp(
    {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    },
    name,
  )

  // Persistent cache, not the default in-memory one: the log has to survive a
  // reload with no connectivity. Multi-tab manager because a tab is not a
  // session, operators leave the log open in several.
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  const auth = getAuth(app)

  if (env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore)
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
      disableWarnings: true,
    })
  }

  return { app, db, auth }
}

/**
 * Guest mode has to work with no Firebase project at all, so a missing or
 * placeholder config is a normal state, not a crash: the app runs, and only
 * sign-in is unavailable.
 */
export function isFirebaseConfigured(env: Partial<FirebaseEnv>): boolean {
  return (
    [
      env.VITE_FIREBASE_API_KEY,
      env.VITE_FIREBASE_AUTH_DOMAIN,
      env.VITE_FIREBASE_PROJECT_ID,
      env.VITE_FIREBASE_APP_ID,
    ].every((value) => typeof value === 'string' && value.trim() !== '') &&
    !env.VITE_FIREBASE_API_KEY?.startsWith('your-')
  )
}
