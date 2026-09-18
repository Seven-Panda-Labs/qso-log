import { defineConfig } from 'vitest/config'

// Firestore rules run against the emulator, not jsdom, and are slower than the
// unit tests. Separate config, separate command: `npm run test:rules`.
export default defineConfig({
  test: {
    include: ['firestore.rules.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
  },
})
