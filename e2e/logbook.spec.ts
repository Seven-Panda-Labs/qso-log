import { expect, test, type Page } from '@playwright/test'

async function addContact(page: Page, call: string, { mode = 'FT8', freq = '' } = {}) {
  await page.getByRole('button', { name: 'Add contact' }).click()
  await page.getByLabel('Callsign').fill(call)
  await page.getByLabel('Mode').fill(mode)
  if (freq) await page.getByLabel('Frequency (MHz)').fill(freq)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(call, { exact: true })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'No contacts logged yet' })).toBeVisible()
})

test('logs a contact and keeps it across a reload', async ({ page }) => {
  await addContact(page, '2E0XXX')

  await page.reload()
  await expect(page.getByText('2E0XXX', { exact: true })).toBeVisible()
  await expect(page.getByText('1 contact')).toBeVisible()
})

/**
 * The one jsdom could not catch: a controlled numeric input that reparsed on
 * every keystroke swallowed the decimal point, and 14.074 was untypeable.
 */
test('accepts a decimal frequency and fills the band in', async ({ page }) => {
  await page.getByRole('button', { name: 'Add contact' }).click()
  await page.getByLabel('Callsign').fill('W1AW')
  await page.getByLabel('Mode').fill('CW')
  await page.getByLabel('Frequency (MHz)').pressSequentially('14.074', { delay: 30 })

  await expect(page.getByLabel('Frequency (MHz)')).toHaveValue('14.074')
  await expect(page.getByText('Band 20m from the frequency')).toBeVisible()

  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('row').nth(1).getByText('20m')).toBeVisible()
})

test('edits and deletes a contact', async ({ page }) => {
  await addContact(page, '2E0XXX')

  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Callsign').fill('M0ABC')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('M0ABC', { exact: true })).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete M0ABC' }).click()
  await expect(page.getByRole('heading', { name: 'No contacts logged yet' })).toBeVisible()
})

test('searches and sorts the log', async ({ page }) => {
  await addContact(page, '2E0XXX')
  await addContact(page, 'W1AW', { mode: 'SSB' })

  await page.getByLabel('Search').fill('w1aw')
  await expect(page.getByText('W1AW', { exact: true })).toBeVisible()
  await expect(page.getByText('2E0XXX', { exact: true })).toBeHidden()

  await page.getByLabel('Search').fill('')
  await page.getByRole('button', { name: /Callsign/ }).click()
  await expect(page.getByRole('row').nth(1)).toContainText('2E0XXX')
})

test('exports the log and reads it back in', async ({ page }) => {
  await addContact(page, '2E0XXX', { freq: '14.074' })

  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export ADIF' }).click(),
  ]).then(([event]) => event)

  const path = await download.path()
  expect(download.suggestedFilename()).toMatch(/\.adi$/)

  await page.getByLabel('Import ADIF').setInputFiles(path)
  await expect(page.getByText('1 contact imported')).toBeVisible()
  await expect(page.getByText('2 contacts')).toBeVisible()
})

test('counts the log on the statistics page', async ({ page }) => {
  await addContact(page, '2E0XXX')
  await addContact(page, 'W1AW', { mode: 'SSB' })

  await page.getByRole('link', { name: 'Statistics' }).click()
  await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible()
  await expect(page.getByText('Contacts')).toBeVisible()
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible()
})
