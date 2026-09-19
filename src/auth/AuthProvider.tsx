import type { User } from 'firebase/auth'
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured, loadFirebase, type FirebaseEnv } from '../config/firebase'

/**
 * Remembers that this device has signed in before, so a first time visitor
 * never downloads the SDK at all. Without it, checking whether anyone is
 * signed in means loading Firebase on every visit, including for the guest who
 * never will.
 */
const SESSION_KEY = 'qso-log.signed-in'

function hasSignedInBefore(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === 'true'
  } catch {
    // Private windows can throw. Assume not, and load on demand.
    return false
  }
}

function rememberSession(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(SESSION_KEY, 'true')
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignored, as above.
  }
}

export type AuthStatus =
  /** Waiting for Firebase to report whether a session exists. */
  | 'loading'
  /** No account, logging locally. A first class state, not a failure. */
  | 'guest'
  | 'signed-in'
  /** No Firebase project configured, so there is nothing to sign in to. */
  | 'unavailable'

export interface AuthState {
  status: AuthStatus
  user: User | null
  error: 'sign-in-failed' | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<'sign-in-failed' | null>(null)

  const [watching, setWatching] = useState(hasSignedInBefore)

  // Firebase is imported here rather than at the top of the file, and only
  // when there is a session to restore or the operator asks to sign in.
  useEffect(() => {
    if (!isFirebaseConfigured(import.meta.env as unknown as Partial<FirebaseEnv>)) {
      setStatus('unavailable')
      return
    }

    if (!watching) {
      setStatus('guest')
      return
    }

    let live = true
    let unsubscribe: (() => void) | undefined

    void (async () => {
      const services = await loadFirebase()
      if (!live) return
      if (!services) {
        setStatus('unavailable')
        return
      }

      const { onAuthStateChanged } = await import('firebase/auth')
      if (!live) return

      unsubscribe = onAuthStateChanged(services.auth, (next) => {
        setUser(next)
        setStatus(next ? 'signed-in' : 'guest')
        rememberSession(next !== null)
      })
    })()

    return () => {
      live = false
      unsubscribe?.()
    }
  }, [watching])

  const signIn = useCallback(async () => {
    const services = await loadFirebase()
    if (!services) return

    setError(null)
    // From here on this device has a session to restore, so later visits watch
    // for it from the start.
    setWatching(true)
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
      await signInWithPopup(services.auth, new GoogleAuthProvider())
    } catch {
      // Includes the operator closing the popup, which is not worth a
      // different message: the state they see is the state they are in.
      setError('sign-in-failed')
    }
  }, [])

  const leave = useCallback(async () => {
    const services = await loadFirebase()
    if (!services) return
    const { signOut } = await import('firebase/auth')
    await signOut(services.auth)
    rememberSession(false)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ status, user, error, signIn, signOut: leave }),
    [status, user, error, signIn, leave],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthState {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
