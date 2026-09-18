import { defineConfig } from 'vitest/config'

// Tests that need the Firestore emulator: the security rules, and the store
// that runs against them. Slower than the unit tests and they need Java, so
// they are a separate command: `npm run test:emulator`.
export default defineConfig({
  test: {
    include: ['firestore.rules.test.ts', 'src/**/*.emulator.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    // One emulator, one dataset: files that run in parallel see each other's
    // fixtures, and one file's clearFirestore() wipes another's data mid-test.
    fileParallelism: false,
  },
})
