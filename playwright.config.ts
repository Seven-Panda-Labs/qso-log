import { defineConfig, devices } from '@playwright/test'

/**
 * End to end against a production build, not the dev server: the service
 * worker, the code split chunks and the real bundle only exist there, and they
 * are part of what these tests are for.
 *
 * No Firebase config is provided, so the app runs as a guest with the local
 * log. The signed-in path needs a Google popup and is covered by unit and
 * emulator tests instead.
 */
const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // The operator this app is for is on a phone, in a field.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
