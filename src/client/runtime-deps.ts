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
    }
  }
}
