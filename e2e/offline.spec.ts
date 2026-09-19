import { expect, test } from '@playwright/test'

/**
 * Offline is the normal case for this app, not the error case. These run
 * against the built app, so the service worker is the real one.
 */
test('logs a contact with no connectivity, and keeps it when the network returns', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'No contacts logged yet' })).toBeVisible()

  await context.setOffline(true)
  await expect(page.getByText('Offline')).toBeVisible()

  await page.getByRole('button', { name: 'Add contact' }).click()
  await page.getByLabel('Callsign').fill('2E0XXX')
  await page.getByLabel('Mode').fill('FT8')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('2E0XXX', { exact: true })).toBeVisible()

  await context.setOffline(false)
  await page.reload()
  await expect(page.getByText('2E0XXX', { exact: true })).toBeVisible()
})

test('serves the app from the service worker after a first visit', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)

  // A worker does not control the page that registered it, so the reload is
  // what a returning visitor actually experiences.
  await page.reload()
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 20_000,
  })

  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole('heading', { name: 'No contacts logged yet' })).toBeVisible()
  await expect(page.getByText('Offline')).toBeVisible()
})

test('is installable as a PWA', async ({ page, request }) => {
  await page.goto('/')

  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()

  const manifest = await (await request.get(href as string)).json()
  expect(manifest.name).toBe('QSO Log')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThan(0)

  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).status(), icon.src).toBe(200)
  }
})

/**
 * A first time visitor has no session to restore, so the SDK is never fetched,
 * even when the app is built with a Firebase project configured.
 */
test('does not download Firebase for a guest', async ({ page }) => {
  const scripts: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'No contacts logged yet' })).toBeVisible()

  expect(scripts.filter((url) => url.includes('firebase'))).toEqual([])
})
