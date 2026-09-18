import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { firebase } from '../config/firebase'
import type { Qso } from '../domain/qso'
import { createFirestoreLogStore } from './firestoreLogStore'
import { createLocalLogStore } from './localLogStore'
import type { LogStore } from './logStore'

/**
 * The store for the current operator: local while a guest, Firestore once
 * signed in. Undefined only while auth is still deciding, so nothing writes to
 * the local log a moment before a cloud log appears.
 */
export function useLogStore(): LogStore | undefined {
  const { status, user } = useAuth()

  return useMemo(() => {
    if (status === 'loading') return undefined

    if (status === 'signed-in' && user) {
      const services = firebase()
      if (services) return createFirestoreLogStore(services.db, user.uid)
    }

    return createLocalLogStore()
  }, [status, user])
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
