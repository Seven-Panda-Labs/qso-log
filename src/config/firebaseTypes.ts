import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export interface FirebaseEnv {
  VITE_FIREBASE_API_KEY: string
  VITE_FIREBASE_AUTH_DOMAIN: string
  VITE_FIREBASE_PROJECT_ID: string
  VITE_FIREBASE_STORAGE_BUCKET: string
  VITE_FIREBASE_MESSAGING_SENDER_ID: string
  VITE_FIREBASE_APP_ID: string
  VITE_USE_FIREBASE_EMULATORS?: string
}

export interface FirebaseServices {
  app: FirebaseApp
  db: Firestore
  auth: Auth
}
