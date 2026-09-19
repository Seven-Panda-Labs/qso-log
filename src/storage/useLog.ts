import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { loadFirebase } from '../config/firebase'
import type { Qso } from '../domain/qso'
import { createLocalLogStore } from './localLogStore'
import type { LogStore } from './logStore'

interface CloudStore {
  uid: string
  store: LogStore
}

/**
 * The store for the current operator: local while a guest, Firestore once
 * signed in. Undefined while either is still resolving, so nothing writes to
 * the local log a moment before a cloud log appears.
 *
 * The Firestore store is imported on demand, with the SDK, so the guest path
 * carries none of it.
 */
export function useLogStore(): LogStore | undefined {
  const { status, user } = useAuth()
  const uid = user?.uid
  const [cloud, setCloud] = useState<CloudStore | undefined>()

  useEffect(() => {
    if (status !== 'signed-in' || !uid) return

    let live = true
    void (async () => {
      const services = await loadFirebase()
      if (!services || !live) return

      const { createFirestoreLogStore } = await import('./firestoreLogStore')
      if (!live) return

      setCloud({ uid, store: createFirestoreLogStore(services.db, uid) })
    })()

    return () => {
      live = false
    }
  }, [status, uid])

  return useMemo(() => {
    if (status === 'loading') return undefined
    // A signed-in operator waits for their own cloud store. Falling back to
    // the local one here would file their contacts in the guest log.
    if (status === 'signed-in') return cloud?.uid === uid ? cloud?.store : undefined
    return createLocalLogStore()
  }, [status, uid, cloud])
}

export interface LogState {
  qsos: Qso[]
  loading: boolean
  /** The store could not be read, for example IndexedDB blocked in a private window. */
  unavailable: boolean
}

interface LogSnapshot extends LogState {
  store: LogStore | undefined
}

const EMPTY: LogState = { qsos: [], loading: true, unavailable: false }

export function useLog(): LogState {
  const store = useLogStore()
  const [snapshot, setSnapshot] = useState<LogSnapshot>({ store, ...EMPTY })

  // Switching store, for example signing in, resets the log during render
  // rather than in an effect, so no frame shows the previous operator's
  // contacts under the new one.
  if (snapshot.store !== store) setSnapshot({ store, ...EMPTY })

  useEffect(() => {
    if (!store) return

    let live = true
    const unsubscribe = store.subscribe((qsos) => {
      if (live) setSnapshot({ store, qsos, loading: false, unavailable: false })
    })

    // A store that never answers would leave a blank screen forever, which is
    // what a private window with IndexedDB blocked does.
    void store.list().catch(() => {
      if (live) setSnapshot({ store, qsos: [], loading: false, unavailable: true })
    })

    return () => {
      live = false
      unsubscribe()
    }
  }, [store])

  return { qsos: snapshot.qsos, loading: snapshot.loading, unavailable: snapshot.unavailable }
}
