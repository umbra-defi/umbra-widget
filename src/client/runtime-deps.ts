import { createSolanaRpc, Rpc, SolanaRpcApi } from '@solana/kit'
import type {
  NetworkType,
  RuntimeDeps,
  WalletSigner
} from '@umbra-privacy/client/lib'
import type { IUmbraClient } from '@umbra-privacy/client/sdk'
import type { WidgetNetwork } from '@/types'

export interface RuntimeDepsHandle extends RuntimeDeps {
  setClient: (client: IUmbraClient | null) => void
  /**
   * Single-flight client init. Concurrent callers (the registration mutation
   * and the auto-ensure query both call this) await the SAME `factory()`
   * promise, so the master seed is derived — and signed — exactly once.
   *
   * Without this, two `initPrivateMode` calls race: each reads the seed from
   * (async) IndexedDB before the other has written it, both miss, and both
   * sign. (Sync localStorage hid the race — the first write was visible
   * immediately — which is why this only surfaced after the IDB migration.)
   */
  ensureClient: (factory: () => Promise<IUmbraClient>) => Promise<IUmbraClient>
}

export function createRuntimeDeps(opts: {
  rpcUrl: string
  network: WidgetNetwork
  walletSigner: WalletSigner
  walletAddress: string
}): RuntimeDepsHandle {
  const rpc = createSolanaRpc(opts.rpcUrl) as Rpc<SolanaRpcApi>
  const wsUrl = opts.rpcUrl
    .replace('https://', 'wss://')
    .replace('http://', 'ws://')
  let client: IUmbraClient | null = null
  let initPromise: Promise<IUmbraClient> | null = null

  return {
    getRpc: () => rpc,
    getNetwork: () => opts.network as NetworkType,
    getRpcUrl: () => opts.rpcUrl,
    getRpcWsUrl: () => wsUrl,
    getClient: () => client,
    getCurrentAddress: () => opts.walletAddress,
    getSigner: () => opts.walletSigner,
    setClient: (c) => {
      client = c
      if (!c) initPromise = null
    },
    ensureClient: (factory) => {
      if (client) return Promise.resolve(client)
      if (!initPromise) {
        initPromise = factory()
          .then((c) => {
            client = c
            return c
          })
          .finally(() => {
            // Allow a retry if init rejected; on success `client` is set so
            // later callers short-circuit above.
            initPromise = null
          })
      }
      return initPromise
    }
  }
}
