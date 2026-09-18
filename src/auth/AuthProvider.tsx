import { GoogleAuthProvider, type User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react'
import { firebase } from '../config/firebase'

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
  const services = useMemo(() => firebase(), [])
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(services ? 'loading' : 'unavailable')
  const [error, setError] = useState<'sign-in-failed' | null>(null)

  useEffect(() => {
    if (!services) return
    return onAuthStateChanged(services.auth, (next) => {
      setUser(next)
      setStatus(next ? 'signed-in' : 'guest')
    })
  }, [services])

  const signIn = useCallback(async () => {
    if (!services) return
    setError(null)
    try {
      await signInWithPopup(services.auth, new GoogleAuthProvider())
    } catch {
      // Includes the operator closing the popup, which is not worth a
      // different message: the state they see is the state they are in.
      setError('sign-in-failed')
    }
  }, [services])

  const leave = useCallback(async () => {
    if (!services) return
    await signOut(services.auth)
  }, [services])

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
