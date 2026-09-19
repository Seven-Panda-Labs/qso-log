import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { setPrefersDark } from '../test/matchMedia'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { THEME_STORAGE_KEY } from './theme'

function Probe() {
  const { theme, resolved } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <ThemeSwitcher />
    </>
  )
}

const renderTheme = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )

beforeEach(() => {
  localStorage.clear()
  setPrefersDark(false)
})

afterEach(() => {
  document.documentElement.className = ''
})

describe('ThemeProvider', () => {
  it('follows the system preference by default', () => {
    setPrefersDark(true)
    renderTheme()

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('follows a light system preference', () => {
    renderTheme()
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('reacts when the system preference changes', async () => {
    renderTheme()
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')

    setPrefersDark(true)
    expect(await screen.findByText('dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('lets the operator override the system and remembers it', async () => {
    setPrefersDark(true)
    renderTheme()

    await userEvent.selectOptions(screen.getByLabelText('Theme'), 'light')

    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('starts from the remembered choice', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    renderTheme()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  // An explicit choice is a choice: the system changing must not undo it.
  it('ignores the system once the operator has chosen', async () => {
    renderTheme()
    await userEvent.selectOptions(screen.getByLabelText('Theme'), 'light')

    setPrefersDark(true)
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('offers all three options', () => {
    renderTheme()
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'System',
      'Light',
      'Dark',
    ])
  })
})
