import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // The Firebase chunk is over the default 500 kB warning threshold on
    // purpose: it is split out and loaded on demand, which is the thing the
    // warning asks for.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Named, so the service worker can tell the Firebase SDK apart from
        // the app and treat it differently.
        manualChunks: (id) =>
          id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')
            ? 'firebase'
            : undefined,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'QSO Log',
        short_name: 'QSO Log',
        description: 'A simple logbook for ham radio operators.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        lang: 'en',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The SDK is most of the download and only a signed-in operator needs
        // it. Precaching it would charge every guest, on mobile data in a
        // field, for a feature they may never open. It is cached the first
        // time it is fetched instead, so offline still works after sign-in.
        // The prefix table is only read by the statistics page, and is cached
        // the first time that page is opened.
        globIgnores: ['**/firebase-*.js', '**/dxcc.generated-*.js'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/assets\/firebase-.*\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'firebase-sdk', expiration: { maxEntries: 8 } },
          },
          {
            urlPattern: /\/assets\/dxcc\.generated-.*\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'dxcc-table', expiration: { maxEntries: 4 } },
          },
        ],
      },
    }),
  ],
})
