import { expect, test } from '@playwright/test'

test('switches language and remembers the choice', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'No contacts logged yet' })).toBeVisible()

  await page.getByLabel('Language').selectOption('pt-PT')
  await expect(page.getByRole('heading', { name: 'Ainda não há contactos registados' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT')

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Ainda não há contactos registados' })).toBeVisible()
})

test.describe('a browser set to French', () => {
  test.use({ locale: 'fr-FR' })

  test('starts in French without being asked', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Aucun contact enregistré' })).toBeVisible()
  })
})

test.describe('a browser set to Brazilian Portuguese', () => {
  test.use({ locale: 'pt-BR' })

  // Closer than English, which is what the resolution rules are for.
  test('gets Portuguese rather than English', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ainda não há contactos registados' })).toBeVisible()
  })
})
