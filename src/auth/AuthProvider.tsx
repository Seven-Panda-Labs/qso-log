import type { User } from 'firebase/auth'
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react'
import { loadFirebase } from '../config/firebase'

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

  // Firebase and its auth module are imported here rather than at the top of
  // the file, so a guest never downloads the SDK.
  useEffect(() => {
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
      })
    })()

    return () => {
      live = false
      unsubscribe?.()
    }
  }, [])

  const signIn = useCallback(async () => {
    const services = await loadFirebase()
    if (!services) return

    setError(null)
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
