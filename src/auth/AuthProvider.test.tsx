import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthProvider'

const {
  authMock,
  loadFirebase,
  isFirebaseConfigured,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} = vi.hoisted(() => {
  const auth = { name: 'auth' }
  return {
    authMock: auth,
    loadFirebase: vi.fn(async () => ({ auth, app: {}, db: {} })),
    isFirebaseConfigured: vi.fn(() => true),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  }
})

vi.mock('../config/firebase', () => ({ loadFirebase, isFirebaseConfigured }))
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  onAuthStateChanged,
  signInWithPopup,
  signOut,
}))

const SESSION_KEY = 'qso-log.signed-in'

function Probe() {
  const { status, user, error, signIn, signOut: leave } = useAuth()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.displayName ?? 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button type="button" onClick={() => void signIn()}>
        in
      </button>
      <button type="button" onClick={() => void leave()}>
        out
      </button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )

function signedInAs(displayName: string) {
  onAuthStateChanged.mockImplementation((_auth: unknown, next: (user: unknown) => void) => {
    next({ displayName })
    return () => {}
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  isFirebaseConfigured.mockReturnValue(true)
  loadFirebase.mockResolvedValue({ auth: authMock, app: {}, db: {} })
  // Firebase always reports, with null when there is no session.
  onAuthStateChanged.mockImplementation((_auth: unknown, next: (user: unknown) => void) => {
    next(null)
    return () => {}
  })
})

describe('AuthProvider', () => {
  /**
   * The point of the session flag: a visitor who has never signed in is a
   * guest immediately, and the SDK is never fetched for them.
   */
  it('is a guest without loading Firebase when no session was ever created', async () => {
    renderProbe()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'))
    expect(loadFirebase).not.toHaveBeenCalled()
  })

  it('restores a session on a device that has signed in before', async () => {
    localStorage.setItem(SESSION_KEY, 'true')
    signedInAs('Test Operator')

    renderProbe()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed-in'))
    expect(screen.getByTestId('user')).toHaveTextContent('Test Operator')
    expect(loadFirebase).toHaveBeenCalled()
  })

  it('falls back to guest when the remembered session is gone', async () => {
    localStorage.setItem(SESSION_KEY, 'true')

    renderProbe()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'))
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('says sign-in is unavailable with no Firebase project', async () => {
    isFirebaseConfigured.mockReturnValue(false)

    renderProbe()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unavailable'))
    expect(loadFirebase).not.toHaveBeenCalled()
  })

  it('loads Firebase when the operator asks to sign in, and remembers it', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'))

    signedInAs('Test Operator')
    await userEvent.click(screen.getByRole('button', { name: 'in' }))

    await waitFor(() => expect(signInWithPopup).toHaveBeenCalledOnce())
    await waitFor(() => expect(localStorage.getItem(SESSION_KEY)).toBe('true'))
  })

  it('reports a failed sign-in and stays a guest', async () => {
    signInWithPopup.mockRejectedValue(new Error('popup closed'))

    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'in' }))

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('sign-in-failed'))
    expect(screen.getByTestId('status')).toHaveTextContent('guest')
  })

  it('signs out and forgets the session', async () => {
    localStorage.setItem(SESSION_KEY, 'true')
    signedInAs('Test Operator')

    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed-in'))

    await userEvent.click(screen.getByRole('button', { name: 'out' }))

    await waitFor(() => expect(signOut).toHaveBeenCalledOnce())
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('unsubscribes on unmount', async () => {
    localStorage.setItem(SESSION_KEY, 'true')
    const unsubscribe = vi.fn()
    onAuthStateChanged.mockImplementation(() => unsubscribe)

    const { unmount } = renderProbe()
    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled())

    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  // The SDK is loaded on demand, so a component can unmount while the import
  // is still in flight. Subscribing after that would leak a listener nothing
  // can unsubscribe.
  it('does not subscribe when unmounted before the SDK arrives', async () => {
    localStorage.setItem(SESSION_KEY, 'true')
    type Services = Awaited<ReturnType<typeof loadFirebase>>
    let resolve: ((services: Services) => void) | undefined
    loadFirebase.mockReturnValue(
      new Promise<Services>((settle) => {
        resolve = settle
      }),
    )

    const { unmount } = renderProbe()
    unmount()
    resolve?.({ auth: authMock, app: {}, db: {} })

    await vi.waitFor(() => expect(loadFirebase).toHaveBeenCalled())
    expect(onAuthStateChanged).not.toHaveBeenCalled()
  })
})
