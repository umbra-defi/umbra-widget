import type { WidgetStorage } from '@/types'

/**
 * Minimal IndexedDB-backed {@link WidgetStorage} (one object store, string
 * values). Default persistence for the widget — survives reloads and holds far
 * more than localStorage, which matters for the sharded UTXO/nullifier data and
 * the claim-sync cache. No external dep.
 */
export function createIndexedDbStorage(
  dbName = 'umbra-widget',
  storeName = 'kv'
): WidgetStorage {
  let dbp: Promise<IDBDatabase> | undefined

  const openDb = () => {
    if (!dbp) {
      dbp = new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(dbName, 1)
        req.onupgradeneeded = () => req.result.createObjectStore(storeName)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
    }
    return dbp
  }

  const run = <T>(
    mode: IDBTransactionMode,
    op: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> =>
    openDb().then(
      (db) =>
        new Promise<T>((resolve, reject) => {
          const req = op(db.transaction(storeName, mode).objectStore(storeName))
          req.onsuccess = () => resolve(req.result as T)
          req.onerror = () => reject(req.error)
        })
    )

  return {
    getItem: (key) =>
      run<unknown>('readonly', (s) => s.get(key)).then((v) =>
        v == null ? null : String(v)
      ),
    setItem: (key, value) =>
      run('readwrite', (s) => s.put(value, key)).then(() => undefined),
    removeItem: (key) =>
      run('readwrite', (s) => s.delete(key)).then(() => undefined)
  }
}
