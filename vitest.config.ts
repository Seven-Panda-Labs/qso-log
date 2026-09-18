import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // The rules tests need the Firestore emulator, so they run separately:
    // `npm run test:rules`, config in vitest.config.rules.ts.
    exclude: [...configDefaults.exclude, 'firestore.rules.test.ts'],
  },
})
