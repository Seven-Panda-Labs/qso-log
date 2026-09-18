import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AuthState } from '../auth/AuthProvider'
import AccountButton from './AccountButton'

const useAuth = vi.hoisted(() => vi.fn())
vi.mock('../auth/AuthProvider', () => ({ useAuth }))

function setAuth(state: Partial<AuthState>) {
  useAuth.mockReturnValue({
    status: 'guest',
    user: null,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...state,
  })
}

describe('AccountButton', () => {
  it('offers sign-in to a guest', async () => {
    const signIn = vi.fn()
    setAuth({ status: 'guest', signIn })

    render(<AccountButton />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signIn).toHaveBeenCalledOnce()
  })

  it('shows the operator and offers sign-out', async () => {
    const signOut = vi.fn()
    setAuth({ status: 'signed-in', user: { displayName: 'Test Operator' } as never, signOut })

    render(<AccountButton />)
    expect(screen.getByText('Test Operator')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('falls back to the email when there is no display name', () => {
    setAuth({ status: 'signed-in', user: { email: 'operator@example.com' } as never })

    render(<AccountButton />)
    expect(screen.getByText('operator@example.com')).toBeInTheDocument()
  })

  it('renders nothing while auth is loading', () => {
    setAuth({ status: 'loading' })
    const { container } = render(<AccountButton />)
    expect(container).toBeEmptyDOMElement()
  })

  it('says so when there is no project to sign in to', () => {
    setAuth({ status: 'unavailable' })
    render(<AccountButton />)
    expect(screen.getByText('Sign-in unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows a failed sign-in without hiding the button', () => {
    setAuth({ status: 'guest', error: 'sign-in-failed' })
    render(<AccountButton />)
    expect(screen.getByText('Sign-in failed, try again')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
})
