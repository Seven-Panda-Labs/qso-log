import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
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
})
