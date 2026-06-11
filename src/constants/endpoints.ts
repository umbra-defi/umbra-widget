import type { WidgetEndpoints, WidgetNetwork } from '@/types'

/**
 * Fully-resolved endpoint set the services consume. Build-time env vars provide
 * the defaults; the `endpoints` prop overrides per-instance at runtime.
 */
export interface ResolvedEndpoints {
  indexer: string
  nullifierIndexer: string
  relayer: string
  zkCdnUrl: string
  zkManifestUrl: string
  /**
   * DAS-capable RPC for token metadata (`getAssetBatch`). This is a DAS method
   * only Helius-class providers implement, so it ALWAYS points at a Helius
   * endpoint — independent of `rpcUrl` (which may be any provider). Override via
   * `endpoints.das`.
   */
  das: string
}

const env =
  (import.meta as { env?: Record<string, string | undefined> }).env ?? {}

const ZK_CDN = env.VITE_ZK_CDN_URL ?? 'https://zk.api.umbraprivacy.com'

/**
 * Default Helius RPC per network. Used as the default `rpcUrl` when the host
 * doesn't pass one, and as the DAS endpoint for token metadata regardless of
 * `rpcUrl`.
 */
export const HELIUS_RPC: Record<WidgetNetwork, string> = {
  mainnet:
    env.VITE_HELIUS_MAINNET_URL ??
    'https://jacklin-n6jvhy-fast-mainnet.helius-rpc.com',
  devnet:
    env.VITE_HELIUS_DEVNET_URL ??
    'https://carlene-7qyr7t-fast-devnet.helius-rpc.com'
}

/** Default RPC when the host doesn't pass `rpcUrl` (Helius, by network). */
export function defaultRpcUrl(network: WidgetNetwork): string {
  return HELIUS_RPC[network]
}

/**
 * Merge the `endpoints` prop over the defaults. `network` selects the default
 * Helius DAS endpoint.
 */
export function resolveEndpoints(
  network: WidgetNetwork,
  e?: WidgetEndpoints
): ResolvedEndpoints {
  const zkCdnUrl = e?.zkCdnUrl ?? ZK_CDN
  return {
    indexer:
      e?.indexer ??
      env.VITE_INDEXER_URL ??
      'https://utxo-indexer.api.umbraprivacy.com',
    nullifierIndexer:
      e?.nullifierIndexer ??
      env.VITE_NULLIFIER_INDEXER_URL ??
      'https://nullifier-indexer.api.umbraprivacy.com',
    relayer:
      e?.relayer ??
      env.VITE_UMBRA_RELAYER_URL ??
      'https://relayer.api.umbraprivacy.com',
    zkCdnUrl,
    zkManifestUrl: e?.zkManifestUrl ?? `${zkCdnUrl}/v5/manifest.json`,
    // DAS always resolves to a Helius endpoint (token metadata needs DAS).
    das: e?.das ?? HELIUS_RPC[network]
  }
}
