import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { useMemo, useState, type ReactNode } from 'react'
import { createSolanaRpc, type Rpc, type SolanaRpcApi } from '@solana/kit'
import type { UmbraWidgetProps, WidgetStorage } from '@/types'
import { DEFAULT_MINTS } from '@/constants/mints'
import { createRuntimeDeps } from '@/client/runtime-deps'
import { makeSignerResolver, makeWalletSigner } from '@/client/signer'
import {
  prefixedStore,
  toSecureStorage,
  toStorageBackend,
  toKeyValueStore
} from '@/client/storage'
import { createIndexedDbStorage } from '@/client/idb-storage'
import { createClaimSyncStore } from '@umbra-privacy/client/utxo'
import { buildServices } from '@/client/services'
import { resolveEndpoints } from '@/constants/endpoints'
import { createWidgetQueryClient } from './query-client'
import { useMintMetadataMap } from '@/features/token/hooks/use-tokens'
import { WidgetContext, type WidgetContextValue } from './widget-context'

/**
 * Warm the token-metadata query as soon as the widget mounts (it's
 * wallet-independent) so symbols/icons are cached before the user reaches
 * the token list — only balances should ever show a skeleton.
 */
function MetadataWarmup() {
  useMintMetadataMap()
  return null
}

const STORAGE_KEY = 'umbra-widget:rq-metadata'

/** Persist only the (non-sensitive) token-metadata query — never balances. */
function makePersister() {
  if (typeof window === 'undefined') return undefined
  return createAsyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY
  })
}

// Default persistence: IndexedDB (survives reloads, holds the sharded UTXO /
// nullifier data + claim-sync cache). Hosts can override via the `storage` prop.
// Falls back to a localStorage shim where IndexedDB is unavailable (SSR/tests).
const localStorageShim: WidgetStorage = {
  getItem: (k) =>
    typeof localStorage === 'undefined' ? null : localStorage.getItem(k),
  setItem: (k, v) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v)
  },
  removeItem: (k) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(k)
  }
}

const defaultStorage: WidgetStorage =
  typeof indexedDB !== 'undefined' ? createIndexedDbStorage() : localStorageShim

type Props = Pick<
  UmbraWidgetProps,
  | 'signer'
  | 'rpcUrl'
  | 'network'
  | 'mints'
  | 'storage'
  | 'endpoints'
  | 'walletAddress'
> & { children: ReactNode }

/**
 * Owns the QueryClient, the SDK service graph and the signer adapters. One
 * instance per mounted widget; everything downstream reads from WidgetContext.
 */
export function WidgetProvider({
  signer,
  rpcUrl,
  network,
  mints,
  storage,
  endpoints,
  walletAddress,
  children
}: Props) {
  const [queryClient] = useState(createWidgetQueryClient)
  const [persister] = useState(makePersister)

  const value = useMemo<WidgetContextValue>(() => {
    console.log('[uw provider] REBUILD services (signer/deps changed)')
    const resolvedNetwork =
      network ?? (rpcUrl.includes('mainnet') ? 'mainnet' : 'devnet')
    const address = String(walletAddress ?? signer.address)
    const kv = storage ?? defaultStorage

    const rpc = createSolanaRpc(rpcUrl) as Rpc<SolanaRpcApi>
    const walletSigner = makeWalletSigner(signer, rpc)
    const runtimeDeps = createRuntimeDeps({
      rpcUrl,
      network: resolvedNetwork,
      walletSigner,
      walletAddress: address
    })

    const resolvedMints = mints ?? DEFAULT_MINTS
    const services = buildServices({
      runtimeDeps,
      signerResolver: makeSignerResolver(signer, rpc),
      secureStorage: toSecureStorage(prefixedStore(kv, 'umbra:secure:')),
      storageBackend: toStorageBackend(prefixedStore(kv, 'umbra:sdk:')),
      claimSyncStore: createClaimSyncStore(
        toKeyValueStore(prefixedStore(kv, 'umbra:claim-sync:'))
      ),
      mintAddresses: resolvedMints.map((m) => m.address),
      endpoints: resolveEndpoints(endpoints)
    })

    return {
      rpcUrl,
      network: resolvedNetwork,
      walletAddress: address,
      mints: mints ?? DEFAULT_MINTS,
      storage: kv,
      runtimeDeps,
      walletSigner,
      services
    }
  }, [signer, rpcUrl, network, mints, storage, endpoints, walletAddress])

  const tree = (
    <WidgetContext.Provider value={value}>
      <MetadataWarmup />
      {children}
    </WidgetContext.Provider>
  )

  // Persist only the token-metadata query (key ['privateModeMints','metadata'])
  // so the list renders instantly after the first fetch — balances never hit disk.
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: Infinity,
          dehydrateOptions: {
            shouldDehydrateQuery: (q) =>
              q.state.status === 'success' &&
              q.queryKey[0] === 'privateModeMints' &&
              q.queryKey[1] === 'metadata'
          }
        }}
      >
        {tree}
      </PersistQueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>
  )
}
