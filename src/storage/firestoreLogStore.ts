import {
  type Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import type { Qso } from '../domain/qso'
import { byMostRecent, type LogStore } from './logStore'

/**
 * The signed-in log: one collection per operator, synced by Firestore.
 *
 * Offline is handled a layer down, by the persistent cache in
 * src/config/firebase.ts. Writes here succeed with no connectivity and reach
 * the server later, which is why nothing in this file waits on the network.
 */
export function logCollection(db: Firestore, uid: string) {
  return collection(db, 'users', uid, 'qsos')
}

/** Firestore rejects undefined, and an absent ADIF field is absent, not null. */
function toDocument(qso: Qso): Record<string, unknown> {
  return Object.fromEntries(Object.entries(qso).filter(([, value]) => value !== undefined))
}

export function createFirestoreLogStore(db: Firestore, uid: string): LogStore {
  const qsos = logCollection(db, uid)

  return {
    async list() {
      const snapshot = await getDocs(qsos)
      return snapshot.docs.map((entry) => entry.data() as Qso).sort(byMostRecent)
    },

    async put(qso) {
      await setDoc(doc(qsos, qso.id), toDocument(qso))
    },

    async remove(id) {
      await deleteDoc(doc(qsos, id))
    },

    async clear() {
      const snapshot = await getDocs(qsos)
      const batch = writeBatch(db)
      snapshot.docs.forEach((entry) => batch.delete(entry.ref))
      await batch.commit()
    },

    subscribe(listener) {
      return onSnapshot(qsos, (snapshot) => {
        listener(snapshot.docs.map((entry) => entry.data() as Qso).sort(byMostRecent))
      })
    },
  }
}
