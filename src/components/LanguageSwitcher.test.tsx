import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import i18n, { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'

afterEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage(DEFAULT_LOCALE)
})

describe('LanguageSwitcher', () => {
  it('lists every shipped language', () => {
    render(<LanguageSwitcher />)
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'English',
      'Español',
      'Français',
      'Português',
    ])
  })

  it('switches the language and remembers the choice', async () => {
    render(<LanguageSwitcher />)
    await userEvent.selectOptions(screen.getByRole('combobox'), 'fr')

    expect(i18n.resolvedLanguage).toBe('fr')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr')
  })
})
