import type { Qso } from '../domain/qso'
import { byMostRecent, type LogStore } from './logStore'

/**
 * The guest log: IndexedDB, this device only, nothing leaves the browser.
 *
 * IndexedDB rather than localStorage because a log runs to thousands of
 * contacts, and localStorage is a synchronous string store with a few
 * megabytes in it.
 */
const DB_NAME = 'qso-log'
const STORE = 'qsos'
const VERSION = 1

function open(name = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable'))
  })
}

function run<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

export function createLocalLogStore(name = DB_NAME): LogStore {
  const listeners = new Set<(qsos: Qso[]) => void>()
  let db: Promise<IDBDatabase> | undefined

  const database = () => (db ??= open(name))

  async function transaction<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => Promise<T>) {
    const store = (await database()).transaction(STORE, mode).objectStore(STORE)
    return work(store)
  }

  const list = () =>
    transaction('readonly', async (store) => {
      const qsos = await run(store.getAll() as IDBRequest<Qso[]>)
      return qsos.sort(byMostRecent)
    })

  async function notify() {
    if (listeners.size === 0) return
    const qsos = await list()
    listeners.forEach((listener) => listener(qsos))
  }

  return {
    list,

    async put(qso) {
      await transaction('readwrite', (store) => run(store.put(qso)))
      await notify()
    },

    async remove(id) {
      await transaction('readwrite', (store) => run(store.delete(id)))
      await notify()
    },

    async clear() {
      await transaction('readwrite', (store) => run(store.clear()))
      await notify()
    },

    subscribe(listener) {
      listeners.add(listener)
      void list().then((qsos) => {
        if (listeners.has(listener)) listener(qsos)
      })
      return () => listeners.delete(listener)
    },
  }
}
