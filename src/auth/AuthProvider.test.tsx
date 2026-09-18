import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthProvider'

const { authMock, firebaseMock, signInWithPopup, signOut, onAuthStateChanged } = vi.hoisted(() => {
  const auth = { name: 'auth' }
  return {
    authMock: auth,
    firebaseMock: vi.fn(() => ({ auth, app: {}, db: {} })),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  }
})

vi.mock('../config/firebase', () => ({ firebase: firebaseMock }))
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  onAuthStateChanged,
  signInWithPopup,
  signOut,
}))

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

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  firebaseMock.mockReturnValue({ auth: authMock, app: {}, db: {} })
  onAuthStateChanged.mockImplementation(() => () => {})
})

describe('AuthProvider', () => {
  it('waits for Firebase before deciding', () => {
    renderProbe()
    expect(screen.getByTestId('status')).toHaveTextContent('loading')
  })

  it('treats no session as a guest, not an error', async () => {
    onAuthStateChanged.mockImplementation((_auth: unknown, next: (user: unknown) => void) => {
      next(null)
      return () => {}
    })

    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'))
  })

  it('reports a signed-in operator', async () => {
    onAuthStateChanged.mockImplementation((_auth: unknown, next: (user: unknown) => void) => {
      next({ displayName: 'Test Operator' })
      return () => {}
    })

    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed-in'))
    expect(screen.getByTestId('user')).toHaveTextContent('Test Operator')
  })

  // Guest mode has to work with no Firebase project at all, for a contributor
  // with no config and for anyone running the app offline.
  it('stays usable when Firebase is not configured', async () => {
    firebaseMock.mockReturnValue(undefined as never)

    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unavailable'))
    expect(onAuthStateChanged).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'in' }))
    expect(signInWithPopup).not.toHaveBeenCalled()
  })

  it('signs in and out', async () => {
    onAuthStateChanged.mockImplementation((_auth: unknown, next: (user: unknown) => void) => {
      next(null)
      return () => {}
    })

    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'in' }))
    expect(signInWithPopup).toHaveBeenCalledOnce()

    await userEvent.click(screen.getByRole('button', { name: 'out' }))
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('reports a failed sign-in and stays a guest', async () => {
    onAuthStateChanged.mockImplementation((_auth: unknown, next: (user: unknown) => void) => {
      next(null)
      return () => {}
    })
    signInWithPopup.mockRejectedValue(new Error('popup closed'))

    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'in' }))

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('sign-in-failed'))
    expect(screen.getByTestId('status')).toHaveTextContent('guest')
  })

  it('unsubscribes on unmount', async () => {
    const unsubscribe = vi.fn()
    onAuthStateChanged.mockImplementation(() => unsubscribe)

    const { unmount } = renderProbe()
    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
