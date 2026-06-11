import type { SecureKeyValueStore } from '@umbra-privacy/client/ports'
import type { WidgetStorage } from '@/types'

/**
 * Byte-oriented persistence the SDK's sharded utxo/nullifier stores consume.
 * Declared locally (structurally identical to the SDK's `StorageBackend`) to
 * avoid a deep `@umbra-privacy/sdk` subpath import.
 */
export interface StorageBackend {
  read: (key: string) => Promise<Uint8Array | null>
  write: (key: string, data: Uint8Array) => Promise<void>
  delete: (key: string) => Promise<void>
}

/**
 * The host passes a single IndexedDB-backed key/value store. Different SDK
 * subsystems (secure seed/registration store, sharded utxo/nullifier backend)
 * must not collide, so each consumer gets a prefixed view of that one store.
 */
export function prefixedStore(
  kv: WidgetStorage,
  prefix: string
): WidgetStorage {
  const k = (key: string) => `${prefix}${key}`
  return {
    getItem: (key) => kv.getItem(k(key)),
    setItem: (key, value) => kv.setItem(k(key), value),
    removeItem: (key) => kv.removeItem(k(key))
  }
}

/**
 * A WidgetStorage already satisfies `SecureKeyValueStore` structurally (the SDK
 * treats the host store as the secure boundary; write `opts` are ignored). Wrap
 * with `createSecureKvStore` from client-platform/web for encryption-at-rest.
 */
export function toSecureStorage(kv: WidgetStorage): SecureKeyValueStore {
  return {
    getItem: (key) => Promise.resolve(kv.getItem(key)),
    setItem: (key, value) =>
      Promise.resolve(kv.setItem(key, value)).then(() => undefined),
    removeItem: (key) =>
      Promise.resolve(kv.removeItem(key)).then(() => undefined)
  }
}

/**
 * Adapt the string key/value store to the SDK's byte-oriented `StorageBackend`.
 * Values are base64-encoded in transit.
 */
export function toStorageBackend(kv: WidgetStorage): StorageBackend {
  return {
    read: async (key: string) => {
      const raw = await kv.getItem(key)
      return raw == null ? null : base64ToBytes(raw)
    },
    write: async (key: string, data: Uint8Array) => {
      await kv.setItem(key, bytesToBase64(data))
    },
    delete: async (key: string) => {
      await kv.removeItem(key)
    }
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}
