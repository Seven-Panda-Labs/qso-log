import { describe, expect, it } from 'vitest'
import { isFirebaseConfigured } from './firebase'

const complete = {
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-qso-log.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-qso-log',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
}

describe('isFirebaseConfigured', () => {
  it('accepts a complete config', () => {
    expect(isFirebaseConfigured(complete)).toBe(true)
  })

  it.each(Object.keys(complete))('rejects a config missing %s', (key) => {
    expect(isFirebaseConfigured({ ...complete, [key]: undefined })).toBe(false)
    expect(isFirebaseConfigured({ ...complete, [key]: '  ' })).toBe(false)
  })

  // .env.example ships placeholders. A contributor who copies it and forgets
  // to fill it in gets guest mode, not a broken app.
  it('rejects the placeholder from .env.example', () => {
    expect(isFirebaseConfigured({ ...complete, VITE_FIREBASE_API_KEY: 'your-api-key' })).toBe(false)
  })

  it('rejects an empty config', () => {
    expect(isFirebaseConfigured({})).toBe(false)
  })
})
