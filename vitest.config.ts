import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Vite loads .env.local in tests too, so without this a developer with a
    // real project configured would run different tests than CI, against
    // their own Firebase. Tests that need a config build one themselves.
    env: {
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_AUTH_DOMAIN: '',
      VITE_FIREBASE_PROJECT_ID: '',
      VITE_FIREBASE_STORAGE_BUCKET: '',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '',
      VITE_FIREBASE_APP_ID: '',
      VITE_USE_FIREBASE_EMULATORS: '',
    },
    // The rules tests need the Firestore emulator, so they run separately:
    // `npm run test:rules`, config in vitest.config.rules.ts.
    exclude: [...configDefaults.exclude, 'firestore.rules.test.ts'],
  },
})
