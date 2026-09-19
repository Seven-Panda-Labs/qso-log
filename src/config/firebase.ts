import type { FirebaseEnv, FirebaseServices } from './firebaseTypes'

export type { FirebaseEnv, FirebaseServices } from './firebaseTypes'

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

let services: Promise<FirebaseServices> | undefined

/**
 * Loads Firebase on demand, and only once.
 *
 * The SDK is most of the bundle and a guest never needs it: nothing here is
 * imported statically, so the first load of the app carries no Firebase at
 * all. It arrives when someone signs in.
 */
export async function loadFirebase(): Promise<FirebaseServices | undefined> {
  const env = import.meta.env as unknown as Partial<FirebaseEnv>
  if (!isFirebaseConfigured(env)) return undefined

  services ??= import('./createFirebase').then(({ createFirebase }) =>
    createFirebase(env as FirebaseEnv),
  )
  return services
}
