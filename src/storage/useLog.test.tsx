import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AuthState } from '../auth/AuthProvider'
import type { Qso } from '../domain/qso'
import type { LogStore } from './logStore'
import { useLog, useLogStore } from './useLog'

const { useAuth, firebase, createLocalLogStore, createFirestoreLogStore } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  firebase: vi.fn(),
  createLocalLogStore: vi.fn(),
  createFirestoreLogStore: vi.fn(),
}))

vi.mock('../auth/AuthProvider', () => ({ useAuth }))
vi.mock('../config/firebase', () => ({ firebase }))
vi.mock('./localLogStore', () => ({ createLocalLogStore }))
vi.mock('./firestoreLogStore', () => ({ createFirestoreLogStore }))

function setAuth(state: Partial<AuthState>) {
  useAuth.mockReturnValue({ status: 'guest', user: null, error: null, ...state })
}

function stubStore(qsos: Qso[] = []): LogStore {
  return {
    list: vi.fn().mockResolvedValue(qsos),
    put: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    subscribe: vi.fn((listener: (next: Qso[]) => void) => {
      listener(qsos)
      return () => {}
    }),
  }
}

function Probe() {
  const store = useLogStore()
  const { qsos, loading, unavailable } = useLog()
  return (
    <div>
      <span data-testid="store">{store ? 'ready' : 'none'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="unavailable">{String(unavailable)}</span>
      <span data-testid="count">{qsos.length}</span>
    </div>
  )
}

describe('useLogStore', () => {
  it('gives a guest the local store', () => {
    setAuth({ status: 'guest' })
    createLocalLogStore.mockReturnValue(stubStore())

    render(<Probe />)
    expect(createLocalLogStore).toHaveBeenCalled()
    expect(createFirestoreLogStore).not.toHaveBeenCalled()
  })

  it('gives a signed-in operator their own cloud log', () => {
    setAuth({ status: 'signed-in', user: { uid: 'w1aw' } as never })
    firebase.mockReturnValue({ db: 'db', auth: {}, app: {} })
    createFirestoreLogStore.mockReturnValue(stubStore())

    render(<Probe />)
    expect(createFirestoreLogStore).toHaveBeenCalledWith('db', 'w1aw')
    expect(createLocalLogStore).not.toHaveBeenCalled()
  })

  // Nothing may write to the local log in the instant before a cloud log
  // appears, or a signed-in operator's contact lands on the wrong side.
  it('has no store while auth is still deciding', () => {
    setAuth({ status: 'loading' })

    render(<Probe />)
    expect(screen.getByTestId('store')).toHaveTextContent('none')
    expect(createLocalLogStore).not.toHaveBeenCalled()
    expect(createFirestoreLogStore).not.toHaveBeenCalled()
  })

  it('falls back to the local store when Firebase is not configured', () => {
    setAuth({ status: 'signed-in', user: { uid: 'w1aw' } as never })
    firebase.mockReturnValue(undefined)
    createLocalLogStore.mockReturnValue(stubStore())

    render(<Probe />)
    expect(createLocalLogStore).toHaveBeenCalled()
  })
})

describe('useLog', () => {
  it('reports the log once the store answers', async () => {
    setAuth({ status: 'guest' })
    createLocalLogStore.mockReturnValue(
      stubStore([{ id: '1', call: '2E0XXX', qsoDate: '20260918', timeOn: '1432', band: '20m', mode: 'FT8' }]),
    )

    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('stays loading with no store', () => {
    setAuth({ status: 'loading' })
    render(<Probe />)
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
  })
})

describe('when the store cannot be read', () => {
  it('stops loading and says so instead of hanging', async () => {
    setAuth({ status: 'guest' })
    createLocalLogStore.mockReturnValue({
      ...stubStore(),
      // IndexedDB blocked, as in a private window.
      list: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
      subscribe: vi.fn(() => () => {}),
    })

    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('unavailable')).toHaveTextContent('true')
  })
})
