import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'

function renderAt(path: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('App', () => {
  it('renders the logbook at the root', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'No contacts logged yet' })).toBeInTheDocument()
  })

  it('renders the not found page for an unknown route', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('shows the connection status', () => {
    renderAt('/')
    expect(screen.getByText(/online|offline/i)).toBeInTheDocument()
  })

  // No Firebase config in the test environment, which is the state a
  // contributor is in before copying an env template. The app still runs.
  it('runs without a Firebase project', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'No contacts logged yet' })).toBeInTheDocument()
    expect(screen.getByText('Sign-in unavailable')).toBeInTheDocument()
  })
})
